import { roleRepository } from "../repositories/roleRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { AppError } from "../utils/appError.js";
import { stripSensitiveUserFields } from "../utils/safeObject.js";

export const rbacService = {
  async listRoles() {
    return roleRepository.findAll();
  },

  async assignRoles(userId, roles) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const validRoles = await roleRepository.findByNames(roles);
    if (validRoles.length !== roles.length) {
      throw new AppError("One or more roles are invalid", 400);
    }

    const nextHasAdmin = validRoles.some((role) => role.name === "ADMIN");
    const currentHasAdmin = (user.roles || []).some((role) => role.name === "ADMIN" || role === "ADMIN");

    if (currentHasAdmin && !nextHasAdmin && user.accountStatus === "ACTIVE") {
      const otherActiveAdmins = await userRepository.countActiveAdmins(userId);
      if (otherActiveAdmins === 0) {
        throw new AppError("At least one active Admin account must always exist", 400);
      }
    }

    user.roles = validRoles.map((role) => role._id);
    await user.save();

    const refreshedUser = await userRepository.findById(userId);
    return stripSensitiveUserFields(refreshedUser);
  }
};
