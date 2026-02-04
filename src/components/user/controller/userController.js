const User = require("../model/users");
const {
  generateTokens,
  removeUserToken,
  success,
  error,
} = require("../../utils/commonUtils");
const { appString } = require("../../utils/appString");
const mongoose = require("mongoose");
const AddressModel = require("../model/Address");

const userController = {
  // ================= REGISTER =================
  register: async (req, res) => {
    try {
      const { username, email, password, file } = req.body;

      const user = await User.create({
        username,
        email,
        password,
        file,
        status: "active",
      });

      const tokens = await generateTokens(user);
      return success(res, { user, ...tokens }, appString.USER_CREATED, 201);
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return error(res, `${field} already exists`, 409);
      }
      return error(res, err.message || appString.REGISTRATION_FAILED, 400);
    }
  },

  // ================= LOGIN =================
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return error(res, appString.Required_EmailPass, 400);
      }

      const user = await User.findOne({ email });

      if (!user || !(await user.matchPassword(password))) {
        return error(res, appString.INVALID_CREDENTIALS, 401);
      }

      // ❌ Block deleted & deactivated users
      if (
        user.status === "deleted_by_user" ||
        user.status === "deleted_by_admin"
      ) {
        return error(res, "Account is deleted. Contact admin.", 403);
      }

      if (user.status === "deactivated") {
        return error(res, "Account is deactivated by admin.", 403);
      }

      const tokens = await generateTokens(user);

      return success(
        res,
        {
          username: user.username,
          email: user.email,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        appString.LOGIN_SUCCESS
      );
    } catch (err) {
      return error(res, err.message || appString.LOGIN_FAILED, 500);
    }
  },

  // ================= GET PROFILE =================
  getProfile: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);

      const profile = await User.aggregate([
        {
          $match: {
            _id: userId,
            status: { $nin: ["deleted_by_user", "deleted_by_admin"] },
          },
        },
        {
          $lookup: {
            from: "addresses",
            localField: "_id",
            foreignField: "userId",
            as: "primaryAddress",
          },
        },
        {
          $set: {
            primaryAddress: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$primaryAddress",
                    as: "addr",
                    cond: { $eq: ["$$addr.isPrimary", 1] },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $project: {
            username: 1,
            email: 1,
            primaryAddress: 1,
          },
        },
      ]);

      if (!profile.length) {
        return error(res, "User not found", 404);
      }

      return success(res, profile[0]);
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // ================= UPDATE USER =================
  updateUser: async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        {
          _id: req.user.id,
          status: { $nin: ["deleted_by_user", "deleted_by_admin"] },
        },
        req.body,
        { new: true }
      );

      if (!user) {
        return error(res, "User not found or deleted", 404);
      }

      return success(res, user, appString.USER_UPDATED);
    } catch (err) {
      return error(res, err.message, 400);
    }
  },

  // ================= USER SELF DELETE =================
  deleteUser: async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        {
          _id: req.user.id,
          status: { $nin: ["deleted_by_admin"] },
        },
        { status: "deleted_by_user" },
        { new: true }
      );

      if (!user) {
        return error(res, "User already deleted", 400);
      }

      return success(res, {}, appString.USER_DELETED);
    } catch (err) {
      return error(res, err.message, 400);
    }
  },

  // ================= LOGOUT =================
  logout: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return error(res, "No token provided", 400);
      }

      await removeUserToken(req.user.id, token);
      return success(res, {}, "Logged out successfully");
    } catch (err) {
      return error(res, "Logout failed", 500);
    }
  },

  // ================= ADDRESS APIs (UNCHANGED) =================
  insertAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const { Address, isPrimary } = req.body;

      const isPrimaryBool = Number(isPrimary) === 1;

      if (isPrimaryBool) {
        await AddressModel.updateMany(
          { userId, isPrimary: true },
          { isPrimary: false }
        );
      }

      const address = await AddressModel.create({
        userId,
        Address,
        isPrimary: isPrimaryBool,
      });

      if (isPrimaryBool) {
        await User.findByIdAndUpdate(userId, {
          primaryAddress: address._id,
        });
      }

      return success(res, address, appString.ADDRESS_CREATED, 201);
    } catch (err) {
      return error(res, err.message, 400);
    }
  },

  listUserAddresses: async (req, res) => {
    try {
      const addresses = await AddressModel.find({ userId: req.user.id });
      return success(res, addresses);
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  changePrimaryAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const { addressId } = req.body;

      await AddressModel.updateMany(
        { userId, isPrimary: true },
        { isPrimary: false }
      );

      const address = await AddressModel.findOneAndUpdate(
        { _id: addressId, userId },
        { isPrimary: true },
        { new: true }
      );

      if (!address) {
        return error(res, appString.ANOT_FOUND, 404);
      }

      await User.findByIdAndUpdate(userId, {
        primaryAddress: address._id,
      });

      return success(res, address, appString.PRIMARY_ADDRESS_UPDATED);
    } catch (err) {
      return error(res, err.message, 400);
    }
  },
};

module.exports = userController;
