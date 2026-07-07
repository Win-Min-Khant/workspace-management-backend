import { body } from "express-validator";

export const addCommentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required.")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters."),
];

export const updateCommentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required.")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters."),
];
