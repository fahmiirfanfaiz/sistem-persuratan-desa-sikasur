import submissionService, {
  ClientError,
} from "../services/submissionService.js";

const create = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { letterTypeId, purpose } = req.body;

    const files = {
      kkFile: req.files?.kkFile?.[0] ?? null,
      ktpFile: req.files?.ktpFile?.[0] ?? null,
    };

    const submission = await submissionService.createSubmission(
      userId,
      { letterTypeId, purpose },
      files
    );

    return res.status(201).json({
      success: true,
      message: "Pengajuan berhasil dikirim",
      data: {
        submissionId: submission.id,
        status: submission.status,
        letterType: submission.letterType.name,
        createdAt: submission.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof ClientError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error("[submissionCreate]", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default { create };
