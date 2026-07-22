import userService from "../services/userService.js";

const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await userService.getMe(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("[getMe]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updated = await userService.updateMe(userId, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("[updateMe]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default { getMe, updateMe };
