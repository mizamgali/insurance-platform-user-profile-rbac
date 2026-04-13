import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/userRepository.js";
import { roleRepository } from "../repositories/roleRepository.js";
import { AppError } from "../utils/appError.js";
import { stripSensitiveUserFields } from "../utils/safeObject.js";

function buildProfilePayload(payload = {}) {
  return {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email ? String(payload.email).toLowerCase().trim() : undefined,
    phone: payload.phone || "",
    city: payload.city || "",
    country: payload.country || "",
    userType: payload.userType
  };
}

async function ensureAtLeastOneOtherActiveAdmin(userId, nextStatus) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isAdmin = (user.roles || []).some((role) => role.name === "ADMIN" || role === "ADMIN");
  if (isAdmin && nextStatus !== "ACTIVE") {
    const otherActiveAdmins = await userRepository.countActiveAdmins(userId);
    if (otherActiveAdmins === 0) {
      throw new AppError("At least one active Admin account must always exist", 400);
    }
  }

  return user;
}

export const userAdminService = {
  async listUsers() {
    const users = await userRepository.findAll();
    return users.map(stripSensitiveUserFields);
  },

  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return stripSensitiveUserFields(user);
  },

  async createUser(payload) {
    const existingUsername = await userRepository.findByUsername(payload.username);
    if (existingUsername) {
      throw new AppError("Username already exists", 400);
    }

    const existingEmail = await userRepository.findByEmail(payload.email);
    if (existingEmail) {
      throw new AppError("Email already exists", 400);
    }

    const validRoles = await roleRepository.findByNames(payload.roles);
    if (validRoles.length !== payload.roles.length) {
      throw new AppError("One or more roles are invalid", 400);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await userRepository.create({
      username: payload.username.trim(),
      passwordHash,
      roles: validRoles.map((role) => role._id),
      accountStatus: payload.accountStatus,
      profile: buildProfilePayload(payload)
    });

    const createdUser = await userRepository.findById(user._id);
    return stripSensitiveUserFields(createdUser);
  },

  async updateUser(userId, payload, currentAdminId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (String(user._id) === String(currentAdminId) && payload.accountStatus && payload.accountStatus !== "ACTIVE") {
      throw new AppError("Admin cannot suspend or deactivate their own account", 403);
    }

    if (payload.accountStatus && payload.accountStatus !== user.accountStatus) {
      await ensureAtLeastOneOtherActiveAdmin(userId, payload.accountStatus);
      user.accountStatus = payload.accountStatus;
    }

    const nextEmail = payload.email ? String(payload.email).toLowerCase().trim() : null;
    if (nextEmail && nextEmail !== user.profile.email) {
      const existingEmail = await userRepository.findByEmail(nextEmail);
      if (existingEmail && String(existingEmail._id) !== String(userId)) {
        throw new AppError("Email already exists", 400);
      }
    }

    const allowedFields = ["firstName", "lastName", "email", "phone", "city", "country", "userType"];
    for (const field of allowedFields) {
      if (payload[field] !== undefined) {
        user.profile[field] = field === "email" ? String(payload[field]).toLowerCase().trim() : payload[field];
      }
    }

    await user.save();
    const refreshedUser = await userRepository.findById(userId);
    return stripSensitiveUserFields(refreshedUser);
  },

  async listCustomers() {
    const users = await userRepository.findCustomers();
    return users.map(stripSensitiveUserFields);
  },

  async updateUserStatus(userId, accountStatus, currentAdminId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (String(user._id) === String(currentAdminId)) {
      throw new AppError("Admin cannot update their own account status", 403);
    }

    await ensureAtLeastOneOtherActiveAdmin(userId, accountStatus);
    user.accountStatus = accountStatus;
    await user.save();
    const refreshedUser = await userRepository.findById(userId);
    return stripSensitiveUserFields(refreshedUser);
  }
};
