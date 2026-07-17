import prisma from "../libs/prisma.js";

/**
 * Fetch all letter categories with their nested letter types.
 */
const getCategories = async () => {
  const categories = await prisma.letterCategory.findMany({
    include: {
      letterTypes: {
        select: {
          id: true,
          name: true,
          description: true,
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories;
};

export default { getCategories };
