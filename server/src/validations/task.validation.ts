import { body, query } from "express-validator";

export const createTaskValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required.")
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters."),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high."),

  body("status")
    .optional()
    .isIn(["todo", "in-progress", "done"])
    .withMessage("Status must be todo, in-progress, or done."),

  body("assigneeId")
    .optional()
    .isMongoId()
    .withMessage("Invalid assignee ID format."),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date."),
];

export const updateTaskValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty.")
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters."),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high."),

  body("assigneeId")
    .optional()
    .isMongoId()
    .withMessage("Invalid assignee ID format."),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date."),
];

export const updateTaskStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(["todo", "in-progress", "done"])
    .withMessage("Status must be todo, in-progress, or done."),
];

export const getTasksValidation = [
  query("status")
    .optional()
    .isIn(["todo", "in-progress", "done"])
    .withMessage("Status must be todo, in-progress, or done."),

  query("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high."),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search term cannot exceed 100 characters."),

  query("assigneeId")
    .optional()
    .isMongoId()
    .withMessage("Invalid assignee ID format."),
];
