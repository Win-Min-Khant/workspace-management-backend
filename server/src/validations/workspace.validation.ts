import { body } from "express-validator";

export const validateWorkspaceUpdate = [
  // Workspace Name validation
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Workspace name cannot be empty.")
    .isLength({ min: 3 })
    .withMessage("Workspace name must be at least 3 characters long."),

  // Logo URL validation
  body("logo")
    .optional()
    .trim()
    .isURL()
    .withMessage("Invalid logo URL format.")
    .custom((value) => {
      const allowedExtensions = /\.(jpeg|jpg|png|svg|webp)$/i;
      if (!allowedExtensions.test(value)) {
        throw new Error("Only images (jpeg, jpg, png, svg, webp) are allowed.");
      }
      return true;
    }),
];
