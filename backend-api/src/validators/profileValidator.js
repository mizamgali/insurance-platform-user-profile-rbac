import { body } from "express-validator";

const optionalTrimmedString = () => body().optional().trim().isString();

export const updateOwnProfileValidator = [
  body("firstName").optional().trim().isLength({ min: 1, max: 50 }),
  body("lastName").optional().trim().isLength({ min: 1, max: 50 }),
  body("email").optional().trim().isEmail(),
  body("phone").optional().trim().isLength({ max: 30 }),
  body("city").optional().trim().isLength({ max: 80 }),
  body("country").optional().trim().isLength({ max: 80 })
];

export const suspendOwnProfileValidator = [];
