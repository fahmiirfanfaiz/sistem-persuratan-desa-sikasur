import bcrypt from "bcrypt";
import prisma from "../libs/prisma.js";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

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
  if (!name) throw new ClientError("Name is required");
  if (!email) throw new ClientError("Email is required");
  if (!phoneNumber) throw new ClientError("Phone number is required");
  if (!address) throw new ClientError("Address is required");
  if (!password) throw new ClientError("Password is required");

  // --- Uniqueness checks ---
  const [existingEmail, existingPhone] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { phoneNumber } }),
  ]);

  if (existingEmail) throw new ClientError("Email sudah terdaftar", 409);
  if (existingPhone) throw new ClientError("Nomor handphone sudah terdaftar", 409);

  // Optional NIK uniqueness check
  if (nik) {
    const existingNIK = await prisma.user.findUnique({ where: { nik } });
    if (existingNIK) throw new ClientError("NIK sudah terdaftar", 409);
  }

  // --- Hash & Create ---
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      nik: nik ?? null,
      familyCardNumber: familyCardNumber ?? null,
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

export { ClientError };
export default { register, login, refreshAccessToken, revokeRefreshToken };
