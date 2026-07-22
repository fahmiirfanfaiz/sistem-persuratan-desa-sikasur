import prisma from "../libs/prisma.js";
import bcrypt from "bcrypt";

class ClientError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "ClientError";
    this.statusCode = statusCode;
  }
}

/**
 * Get profile data of the currently authenticated user.
 */
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      nik: true,
      familyCardNumber: true,
      phoneNumber: true,
      address: true,
      role: true,
      createdAt: true,
    },
  });
  return user;
};

/**
 * Update profile data of the currently authenticated user.
 */
const updateMe = async (userId, data) => {
  const { name, phoneNumber, address } = data;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(phoneNumber ? { phoneNumber: phoneNumber.trim() } : {}),
      ...(address ? { address: address.trim() } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      nik: true,
      familyCardNumber: true,
      phoneNumber: true,
      address: true,
      role: true,
    },
  });
  return updated;
};

// ─── ADMIN FUNCTIONS ──────────────────────────────────────────────────────────

/**
 * Get all users (admin).
 */
const getAllUsers = async ({ search = "", page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { nik: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        nik: true,
        familyCardNumber: true,
        phoneNumber: true,
        address: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { submissions: true } },
      },
    }),
  ]);

  return { total, users, page, limit };
};

/**
 * Update a user (admin).
 */
const updateUser = async (userId, data) => {
  const { name, email, phoneNumber, address, role, isActive, password } = data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ClientError("Pengguna tidak ditemukan", 404);

  const updateData = {};
  if (name) updateData.name = name.trim();
  if (email) updateData.email = email.trim();
  if (phoneNumber) updateData.phoneNumber = phoneNumber.trim();
  if (address) updateData.address = address.trim();
  if (role && ["ADMIN", "USER"].includes(role)) updateData.role = role;
  if (typeof isActive === "boolean") updateData.isActive = isActive;
  if (password) updateData.password = await bcrypt.hash(password, 12);

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      nik: true,
      phoneNumber: true,
      address: true,
      role: true,
      isActive: true,
    },
  });
};

/**
 * Delete a user (admin).
 */
const deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ClientError("Pengguna tidak ditemukan", 404);

  await prisma.user.delete({ where: { id: userId } });
  return { id: userId };
};

/**
 * Get notifications for a user.
 */
const getUserNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      header: true,
      body: true,
      isRead: true,
      createdAt: true,
    },
  });
};

/**
 * Mark notifications as read.
 */
const markNotificationsRead = async (userId, notificationIds) => {
  await prisma.notification.updateMany({
    where: { userId, id: { in: notificationIds } },
    data: { isRead: true },
  });
};

export { ClientError };
export default {
  getMe,
  updateMe,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserNotifications,
  markNotificationsRead,
};
