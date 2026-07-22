import prisma from "../libs/prisma.js";

/**
 * Get profile data of the currently authenticated user.
 * @param {string} userId
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
 * @param {string} userId
 * @param {{ name?: string, phoneNumber?: string, address?: string }} data
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

export default { getMe, updateMe };
