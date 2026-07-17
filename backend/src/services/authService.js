import bcrypt from "bcrypt";
import prisma from "../libs/prisma.js";
import jwt from "jsonwebtoken";

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

const login = async (data) => {
  const { email, password } = data;
  if (!email) throw new ClientError("Email is required");
  if (!password) throw new ClientError("Password is required");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ClientError("Invalid email or password", 401);
  if (!user.isActive) throw new ClientError("Account is inactive", 403);

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if(!isPasswordMatch) throw new ClientError("Invalid email or password", 401);

  const accessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export { ClientError };
export default { register, login };
