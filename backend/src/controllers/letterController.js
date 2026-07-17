import letterService from "../services/letterService.js";

const getCategories = async (req, res) => {
  try {
    const categories = await letterService.getCategories();
    return res.status(200).json({
      success: true,
      message: "Letter categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    console.error("[getCategories]", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default { getCategories };
