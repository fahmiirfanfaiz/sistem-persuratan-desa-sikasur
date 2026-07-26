import bcrypt from "bcrypt";
import prisma from "../libs/prisma.js";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { sendMail } from "../libs/mailer.js";

class ClientError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "ClientError";
    this.statusCode = statusCode;
  }
}

const register = async (data) => {
  const { name, nik, familyCardNumber, email, phoneNumber, address, password } =
    data;

  // Required fields
  if (!name) throw new ClientError("Nama lengkap diperlukan");
  if (!nik) throw new ClientError("NIK diperlukan");
  if (!familyCardNumber) throw new ClientError("Nomor Kartu Keluarga diperlukan");
  if (!email) throw new ClientError("Email diperlukan");
  if (!phoneNumber) throw new ClientError("Nomor handphone diperlukan");
  if (!address) throw new ClientError("Alamat diperlukan");
  if (!password) throw new ClientError("Password diperlukan");

  // --- Uniqueness checks ---
  const [existingEmail, existingPhone, existingNIK] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { phoneNumber } }),
    prisma.user.findUnique({ where: { nik } }),
  ]);

  if (existingEmail) throw new ClientError("Email sudah terdaftar", 409);
  if (existingPhone) throw new ClientError("Nomor handphone sudah terdaftar", 409);
  if (existingNIK) throw new ClientError("NIK sudah terdaftar", 409);

  // --- Hash & Create ---
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      nik,
      familyCardNumber,
      email,
      phoneNumber,
      address,
      // role intentionally omitted — defaults to USER per schema
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

/**
 * Generates a cryptographically secure refresh token using Node.js built-in crypto.
 * Returns a 128-character hex string (64 bytes of entropy).
 */
const generateRefreshTokenString = () => randomBytes(64).toString("hex");

const login = async (data) => {
  const { email, password } = data;
  if (!email) throw new ClientError("Email is required");
  if (!password) throw new ClientError("Password is required");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ClientError("Invalid email or password", 401);
  if (!user.isActive) throw new ClientError("Account is inactive", 403);

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) throw new ClientError("Invalid email or password", 401);

  // Issue access token (1 hour)
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Generate and persist refresh token (7 days)
  const refreshToken = generateRefreshTokenString();
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Validates a refresh token, issues a new access token, and rotates the refresh
 * token (delete old → create new) to prevent token reuse attacks.
 */
const refreshAccessToken = async (token) => {
  if (!token) throw new ClientError("Refresh token diperlukan", 401);

  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, isActive: true },
      },
    },
  });

  if (!stored) throw new ClientError("Refresh token tidak valid", 401);

  if (new Date() > stored.expiresAt) {
    // Expired — clean up and reject
    await prisma.refreshToken.delete({ where: { token } }).catch(() => {});
    throw new ClientError("Refresh token telah kadaluarsa, silakan login kembali", 401);
  }

  if (!stored.user.isActive) {
    throw new ClientError("Akun tidak aktif", 403);
  }

  // Issue new access token
  const accessToken = jwt.sign(
    { userId: stored.user.id, role: stored.user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Rotate refresh token: atomically delete old, issue new
  const newRefreshToken = generateRefreshTokenString();
  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { token } }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: stored.user.id,
      name: stored.user.name,
      email: stored.user.email,
      role: stored.user.role,
    },
  };
};

/**
 * Revokes a refresh token on logout — removes it from the database.
 */
const revokeRefreshToken = async (token) => {
  if (!token) return;
  await prisma.refreshToken.deleteMany({ where: { token } });
};

const forgotPassword = async (email) => {
  if (!email) throw new ClientError("Email diperlukan");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ClientError("Email tidak terdaftar", 404);

  // Generate stateless JWT token secured by user's current password hash
  const secret = process.env.JWT_SECRET + user.password;
  const token = jwt.sign({ id: user.id, email: user.email }, secret, {
    expiresIn: "15m", // 15 minutes expiration
  });

  const resetLink = `http://localhost:3000/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Konfirmasi Perubahan Password</h2>
      <p>Apakah Anda yang memulai proses perubahan password di Sistem Persuratan Digital Desa Sikasur? Jika Anda tidak memulai permintaan ini, Anda dapat mengabaikan email ini.</p>
      <p>Klik tautan berikut untuk mengubah password Anda:</p>
      <p style="margin: 20px 0;">
        <a href="${resetLink}" style="background-color: #007BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      </p>
      <p style="color: #666; font-size: 14px;">Jika tautan tidak dapat diklik, coba salin dan tempel ke browser Anda:</p>
      <p style="color: #666; font-size: 14px;">${resetLink}</p>
    </div>
  `;

  await sendMail({
    to: user.email,
    subject: "Reset Password - Sistem Persuratan Digital Desa Sikasur",
    html,
  });
};

const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) throw new ClientError("Token dan password baru diperlukan");

  // Decode token without verifying to get user id
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.id) throw new ClientError("Token tidak valid");

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new ClientError("Pengguna tidak ditemukan");

  // Verify token
  const secret = process.env.JWT_SECRET + user.password;
  try {
    jwt.verify(token, secret);
  } catch (err) {
    throw new ClientError("Token reset password tidak valid atau sudah kadaluarsa");
  }

  // Hash new password and update
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Send confirmation email
  const loginLink = `http://localhost:3000/login`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Konfirmasi Perubahan Password</h2>
      <p>Password Anda untuk Sistem Persuratan Digital Desa Sikasur telah diubah.</p>
      <p>Jika Anda tidak meminta perubahan kata sandi, Anda dapat mengatur ulang password Anda di sini:</p>
      <p style="margin: 20px 0;">
        <a href="${loginLink}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Masuk</a>
      </p>
      <p style="color: #666; font-size: 14px;">Jika tautan tidak dapat diklik, coba salin dan tempel ke browser Anda:</p>
      <p style="color: #666; font-size: 14px;">${loginLink}</p>
    </div>
  `;

  await sendMail({
    to: user.email,
    subject: "Konfirmasi Perubahan Password",
    html,
  });
};

export { ClientError };
export default { register, login, refreshAccessToken, revokeRefreshToken, forgotPassword, resetPassword };
