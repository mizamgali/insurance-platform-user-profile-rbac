import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { stripSensitiveUserFields } from "../utils/safeObject.js";

function ensureNonAdminSelfSuspend(user) {
  const roleNames = (user.roles || []).map((role) => (typeof role === "string" ? role : role.name));
  if (roleNames.includes("ADMIN")) {
    throw new AppError("Admin cannot suspend their own account", 403);
  }
}

export const profileService = {
  async getOwnProfile(userId) {
    const user = await User.findById(userId).populate("roles");
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return stripSensitiveUserFields(user);
  },

  async updateOwnProfile(userId, updates) {
    const user = await User.findById(userId).populate("roles");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const allowedFields = ["firstName", "lastName", "email", "phone", "city", "country"];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        user.profile[field] = updates[field];
      }
    }

    await user.save();

    const refreshedUser = await User.findById(userId).populate("roles");
    return stripSensitiveUserFields(refreshedUser);
  },

  async suspendOwnProfile(userId) {
    const user = await User.findById(userId).populate("roles");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    ensureNonAdminSelfSuspend(user);
    user.accountStatus = "SUSPENDED";
    await user.save();

    return stripSensitiveUserFields(user);
  }
};
