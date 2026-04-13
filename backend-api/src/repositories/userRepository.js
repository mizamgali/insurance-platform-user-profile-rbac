import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { ROLES } from "../constants/roles.js";

export const userRepository = {
  findByUsername(username) {
    return User.findOne({ username }).populate("roles");
  },

  findByEmail(email) {
    return User.findOne({
      "profile.email": String(email).toLowerCase().trim()
    }).populate("roles");
  },

  findById(id) {
    return User.findById(id).populate("roles");
  },

  findAll() {
    return User.find().sort({ username: 1 }).populate("roles");
  },

  create(data) {
    return User.create(data);
  },

  updateById(id, update) {
    return User.findByIdAndUpdate(id, update, { new: true, runValidators: true }).populate("roles");
  },

  async countActiveAdmins(excludeUserId = null) {
    const adminRole = await Role.findOne({ name: ROLES.ADMIN });
    if (!adminRole) {
      return 0;
    }

    const filter = {
      roles: adminRole._id,
      accountStatus: "ACTIVE"
    };

    if (excludeUserId) {
      filter._id = { $ne: excludeUserId };
    }

    return User.countDocuments(filter);
  },

  async findCustomers() {
    return User.find()
      .populate({
        path: "roles",
        match: { name: ROLES.CUSTOMER }
      })
      .then((users) => users.filter((user) => user.roles.length > 0));
  }
};
