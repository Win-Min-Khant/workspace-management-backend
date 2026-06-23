import { Router } from "express";
import {
  generateTokens,
  getProfile,
  login,
  logout,
  register,
  updateName,
  uploadAvatar,
} from "../controllers/auth.controller.js";
import {
  loginValidation,
  refreshTokenValidation,
  registerValidation,
} from "../validations/auth.validation.js";
import { validate } from "../middlewares/validation.middleware.js";
import { protect } from "../middlewares/protect.middleware.js";

const router = Router();
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/logout", protect, logout);
router.post("/refresh", refreshTokenValidation, validate, generateTokens);
router.get("/profile", protect, getProfile);
router.put("/profile/update-name", protect, updateName);
router.put("/profile/upload-avatar", protect, uploadAvatar);
export default router;
