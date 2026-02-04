const Admin = require("../model/admin");
const User = require("../../user/model/users");
const { generateTokens, success, error } = require("../../utils/commonUtils");
const { appString } = require("../../utils/appString");
const mongoose = require("mongoose");

const adminController = {
  // ================= ADMIN REGISTER =================
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const adminExists = await Admin.findOne({});
      if (adminExists) {
        return error(res, appString.ADMINALREDY_REGISTER, 409);
      }

      const admin = await Admin.create({ username, email, password });
      const tokens = generateTokens(admin);

      return success(res, { admin, ...tokens }, appString.ADMIN_CREATED, 201);
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return error(res, `${field} already exists`, 409);
      }
      return error(res, err.message || appString.REGISTRATION_FAILED, 400);
    }
  },

  // ================= ADMIN LOGIN =================
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ email });
      if (!admin || !(await admin.matchPassword(password))) {
        return error(res, appString.INVALID_CREDENTIALS, 401);
      }

      const tokens = await generateTokens(admin);

      return success(
        res,
        { username: admin.username, email: admin.email, ...tokens },
        appString.LOGIN_SUCCESS
      );
    } catch (err) {
      return error(res, err.message || appString.LOGIN_FAILED, 500);
    }
  },

  // ================= ACTIVATE / DEACTIVATE USER =================
  updateUserStatus: async (req, res) => {
    try {
      const { userId, status } = req.body;

      if (!["active", "deactivated"].includes(status)) {
        return error(res, "Invalid status", 400);
      }

      const user = await User.findOne({
        _id: userId,
        status: { $nin: ["deleted_by_user", "deleted_by_admin"] },
      });

      if (!user) {
        return error(res, "User not found or deleted", 404);
      }

      user.status = status;
      await user.save();

      return success(res, user, "User status updated successfully");
    } catch (err) {
      return error(res, err.message, 400);
    }
  },

  // ================= ADMIN DELETE USER =================
  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findOneAndUpdate(
        {
          _id: userId,
          status: { $nin: ["deleted_by_user", "deleted_by_admin"] },
        },
        { status: "deleted_by_admin" },
        { new: true }
      );

      if (!user) {
        return error(res, "User already deleted or not found", 404);
      }

      return success(res, {}, "User deleted by admin");
    } catch (err) {
      return error(res, err.message, 400);
    }
  },

  // ================= ADMIN USER LIST (AGGREGATE ONLY) =================
  userList: async (req, res) => {
    try {
      const { username, email, deletedUser } = req.query;

      const matchStage = {};

      if (username) matchStage.username = username;
      if (email) matchStage.email = email;

      // 🔥 Deleted user filter logic
      if (deletedUser) {
        if (deletedUser === "user") {
          matchStage.status = "deleted_by_user";
        } else if (deletedUser === "admin") {
          matchStage.status = "deleted_by_admin";
        } else {
          matchStage.status = {
            $in: ["deleted_by_user", "deleted_by_admin"],
          };
        }
      }

      const users = await User.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "addresses",
            localField: "_id",
            foreignField: "userId",
            as: "addressDetails",
          },
        },
        {
          $project: {
            _id: 1,
            username: 1,
            email: 1,
            status: 1,
            addressDetails: 1,
            createdAt: 1,
          },
        },
      ]);

      return success(res, users, appString.RETRIVE);
    } catch (err) {
      return error(res, err.message, 500);
    }
  },
};

module.exports = adminController;
