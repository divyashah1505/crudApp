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
const { sendEmail } = require("../../utils/emailUtils");
const path = require("path");
const ejs = require("ejs");
const userController = {
  register: async (req, res) => {
    try {
      const { username, email, password, file } = req.body;

      const user = await User.create({
        username,
        email,
        password,
        file,
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

      if (user.status === 0 || user.status === "0") {
        if (
          user.deletedBy &&
          user.deletedBy.toString() === user._id.toString()
        ) {
          return error(res, appString.DELETDBYUSER, 403);
        } else {
          return error(res, appString.DELETEDBYADMIN, 403);
        }
      }

      const tokens = await generateTokens(user);

      return success(
        res,
        {
          userId: user._id,
          username: user.username,
          email: user.email,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        appString.LOGIN_SUCCESS,
      );
    } catch (err) {
      return error(res, err.message || appString.LOGIN_FAILED, 500);
    }
  },
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
  updateUser: async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        {
          _id: req.user.id,
          status: 1,
        },
        req.body,
        { new: true },
      );

      if (!user) return error(req, res, "User not found or inactive", 404);
      return success(res, user, appString.USER_UPDATED);
    } catch (err) {
      return error(res, err.message, 400);
    }
  },
  deleteUser: async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        { _id: req.user.id, status: 1 },
        {
          status: 0,
          deletedBy: req?.user?.id,
        },
        { new: true },
      );

      if (!user) return error(req, res, appString.INACTIVE, 400);
      return success(res, {}, appString.USER_DELETED);
    } catch (err) {
      return error(res, err.message, 400);
    }
  },
  logout: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return error(res, "No token provided", 400);
      }

      await removeUserToken(req.user.id, token);
      return success(res, {}, appString.LOGOUT_SUCCESS);
    } catch (err) {
      return error(res, appString.LOGOUT_FAILED, 500);
    }
  },
  insertAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const { Address, isPrimary } = req.body;

      const isPrimaryBool = Number(isPrimary) === 1;

      if (isPrimaryBool) {
        await AddressModel.updateMany(
          { userId, isPrimary: true },
          { isPrimary: false },
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
        { isPrimary: false },
      );

      const address = await AddressModel.findOneAndUpdate(
        { _id: addressId, userId },
        { isPrimary: true },
        { new: true },
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
  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        return error(res, appString.DOESNOTMATCH, 400);
      }

      const user = await User.findById(req.user.id);
      if (!user || !(await user.matchPassword(oldPassword))) {
        return error(res, appString.INCORRECTPASSWORD, 401);
      }

      if (oldPassword === newPassword) {
        return error(res, appString.ALREDYUSEPASSWORD, 400);
      }

      user.password = newPassword;
      await user.save();

      return success(res, {}, appString.CHANGEPASSWORD);
    } catch (err) {
      return error(res, err.message, 400);
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return error(res, appString.NOT_FOUND, 404);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      // Set expiry (1 minute)
      user.otpExpires = Date.now() + 1 * 60 * 1000;
      await user.save();

      const templatePath = path.join(
        __dirname,
        "../../../views/otpTemplate.ejs",
      );
      const html = await ejs.renderFile(templatePath, {
        username: user.username,
        otp,
      });

      await sendEmail(user.email, appString.RESETOTP, html);
      return success(res, {}, appString.SENTOTP);
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        return error(res, appString.DOESNOTMATCH, 400);
      }

      const user = await User.findOne({ email, otp });

      if (!user) {
        return error(res, appString.INVALID_OTP, 400);
      }

      if (user.otpExpires < Date.now()) {
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        return error(res, appString.EXPIREDOTP, 400);
      }

      const isSamePassword = await user.matchPassword(newPassword);
      if (isSamePassword) {
        return error(res, appString.ALREDYUSEPASSWORD, 400);
      }

      user.password = newPassword;
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      return success(res, {}, appString.RESETOTPSUCCESS);
    } catch (err) {
      return error(res, err.message, 400);
    }
  },
};

module.exports = userController;
