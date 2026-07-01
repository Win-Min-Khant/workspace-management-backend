import { Router } from "express";
import {
  generateTokens,
  getProfile,
  login,
  logout,
  register,
  updateName,
} from "../controllers/auth.controller.js";
import {
  loginValidation,
  refreshTokenValidation,
  registerValidation,
} from "../validations/auth.validation.js";
import { validate } from "../middlewares/validation.middleware.js";
import { protect } from "../middlewares/protect.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  register,
);
router.post("/login", loginValidation, validate, login);
router.delete("/logout", protect, logout);
router.post("/refresh", refreshTokenValidation, validate, generateTokens);
router.get("/profile", protect, getProfile);
router.patch("/profile/update-name", protect, updateName);
// router.patch("/profile/upload-avatar", protect, uploadAvatar);
export default router;
