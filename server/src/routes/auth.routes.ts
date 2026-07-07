import { Router } from "express";
import {
  generateTokens,
  getProfile,
  login,
  logout,
  register,
  updateProfile,
  uploadAvatar,
} from "../controllers/auth.controller.js";
import {
  loginValidation,
  refreshTokenValidation,
  registerValidation,
  updateProfileValidation,
} from "../validations/auth.validation.js";
import { validate } from "../middlewares/validation.middleware.js";
import { protect } from "../middlewares/protect.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post(
  "/register",
  registerValidation,
  validate,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  register,
);
router.post("/login", loginValidation, validate, login);
router.delete("/logout", protect, logout);
router.post("/refresh", refreshTokenValidation, validate, generateTokens);
router.get("/:workspaceId/profile", protect, getProfile);
router.patch(
  "/profile/update-profile",
  protect,
  updateProfileValidation,
  validate,
  updateProfile,
);
router.patch(
  "/profile/update-avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar,
);
export default router;
