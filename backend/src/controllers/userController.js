import userService from "../services/userService.js";

const getMe = async (req, res) => {
  try {
    const user = await userService.getMe(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("[getMe]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateMe = async (req, res) => {
  try {
    const updated = await userService.updateMe(req.user.userId, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("[updateMe]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await userService.getUserNotifications(req.user.userId);
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("[getMyNotifications]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array required" });
    }
    await userService.markNotificationsRead(req.user.userId, ids);
    return res.status(200).json({ success: true, message: "Notifikasi ditandai sebagai dibaca" });
  } catch (error) {
    console.error("[markNotificationsRead]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default { getMe, updateMe, getMyNotifications, markNotificationsRead };
