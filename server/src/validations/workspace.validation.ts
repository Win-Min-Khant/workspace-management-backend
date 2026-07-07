import { body, param } from "express-validator";

export const validateWorkspaceUpdate = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Workspace name cannot be empty.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Workspace name must be between 3 and 50 characters."),
];

export const validateWorkspaceId = [
  param("workspaceId")
    .notEmpty()
    .withMessage("Workspace ID is required.")
    .isMongoId()
    .withMessage("Invalid workspace ID format."),
];
