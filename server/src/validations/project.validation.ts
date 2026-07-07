import { body, param, query } from "express-validator";

export const createProjectValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required.")
    .isLength({ min: 1, max: 100 })
    .withMessage("Project name must be between 1 and 100 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("status")
    .optional()
    .isIn(["planning", "active", "completed"])
    .withMessage("Status must be planning, active, or completed."),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date."),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date.")
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate < req.body.startDate) {
        throw new Error("End date cannot be before start date.");
      }
      return true;
    }),
];

export const updateProjectValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Project name cannot be empty.")
    .isLength({ min: 1, max: 100 })
    .withMessage("Project name must be between 1 and 100 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("status")
    .optional()
    .isIn(["planning", "active", "completed"])
    .withMessage("Status must be planning, active, or completed."),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date."),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date.")
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate < req.body.startDate) {
        throw new Error("End date cannot be before start date.");
      }
      return true;
    }),
];

export const getProjectsValidation = [
  query("status")
    .optional()
    .isIn(["planning", "active", "completed"])
    .withMessage("Status must be planning, active, or completed."),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search term cannot exceed 100 characters."),
];
