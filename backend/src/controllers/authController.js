import authService from "../services/authService.js";
import { ClientError } from "../services/authService.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: "/",
};

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    if (error instanceof ClientError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    // Unexpected server error
    console.error("[register]", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    // Set refresh token as HttpOnly cookie — inaccessible from JavaScript
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    if (error instanceof ClientError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error("[login]", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * POST /api/auth/refresh
 * Reads refreshToken from HttpOnly cookie, validates it, issues a new access token,
 * and rotates the refresh token cookie.
 */
const refresh = async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token tidak ditemukan",
      });
    }

    const result = await authService.refreshAccessToken(token);

    // Rotate: set new refresh token cookie
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Token diperbarui",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    // Clear invalid cookie
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });

    if (error instanceof ClientError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error("[refresh]", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * POST /api/auth/logout
 * Revokes refresh token from DB and clears the cookie.
 */
const logout = async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (token) {
      await authService.revokeRefreshToken(token);
    }

    // Clear the HttpOnly cookie
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });

    return res.status(200).json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (error) {
    console.error("[logout]", error);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default { register, login, refresh, logout };
