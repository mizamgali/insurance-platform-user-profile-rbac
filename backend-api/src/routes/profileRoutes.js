import { Router } from "express";
import { profileController } from "../controllers/profileController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { updateOwnProfileValidator, suspendOwnProfileValidator } from "../validators/profileValidator.js";
import { handleValidation } from "../middleware/validationMiddleware.js";

const router = Router();

router.get("/me", authenticate, profileController.getOwnProfile);
router.put("/me", authenticate, updateOwnProfileValidator, handleValidation, profileController.updateOwnProfile);
router.put("/me/suspend", authenticate, suspendOwnProfileValidator, handleValidation, profileController.suspendOwnProfile);

export default router;
