import { body } from "express-validator";

export const sendInvitationValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format.")
    .normalizeEmail(),

  body("role")
    .notEmpty()
    .withMessage("Role is required.")
    .isIn(["admin", "member"])
    .withMessage("Role must be admin or member."),
];

export const acceptInvitationValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters."),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
];
