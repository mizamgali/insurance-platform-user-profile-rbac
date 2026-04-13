import { body } from "express-validator";
import { ACCOUNT_STATUS_VALUES } from "../constants/accountStatuses.js";

const ROLE_VALUES = ["CUSTOMER", "UNDERWRITER", "AGENT", "CLAIMS_ADJUSTER", "ADMIN"];
const USER_TYPE_VALUES = ["CUSTOMER", "INTERNAL"];

export const createUserValidator = [
  body("username").trim().isLength({ min: 3, max: 50 }),
  body("password").isLength({ min: 8, max: 128 }),
  body("firstName").trim().isLength({ min: 1, max: 50 }),
  body("lastName").trim().isLength({ min: 1, max: 50 }),
  body("email").trim().isEmail(),
  body("phone").optional().trim().isLength({ max: 30 }),
  body("city").optional().trim().isLength({ max: 80 }),
  body("country").optional().trim().isLength({ max: 80 }),
  body("userType").trim().isIn(USER_TYPE_VALUES),
  body("roles").isArray({ min: 1 }),
  body("roles.*").trim().isIn(ROLE_VALUES),
  body("accountStatus").trim().isIn(ACCOUNT_STATUS_VALUES)
];

export const updateUserValidator = [
  body("firstName").optional().trim().isLength({ min: 1, max: 50 }),
  body("lastName").optional().trim().isLength({ min: 1, max: 50 }),
  body("email").optional().trim().isEmail(),
  body("phone").optional().trim().isLength({ max: 30 }),
  body("city").optional().trim().isLength({ max: 80 }),
  body("country").optional().trim().isLength({ max: 80 }),
  body("userType").optional().trim().isIn(USER_TYPE_VALUES),
  body("accountStatus").optional().trim().isIn(ACCOUNT_STATUS_VALUES)
];

export const updateUserStatusValidator = [
  body("accountStatus").trim().isIn(ACCOUNT_STATUS_VALUES)
];
