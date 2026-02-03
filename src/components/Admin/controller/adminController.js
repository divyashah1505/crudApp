const Admin = require("../model/admin");
const { generateTokens, success, error } = require("../../utils/commonUtils");
const { appString } = require("../../utils/appString");
const mongoose = require("mongoose");
const admin = require("../model/admin");
const user = require("../../user/model/users");
const adminController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const adminExists = await Admin.findOne({});

      if (adminExists) {
        return error(res, appString.ADMINALREDY_REGISTER, 409);
      }
      const admin = await Admin.create({ username, email, password });
      const tokens = generateTokens(admin._id);
      return success(res, { admin, ...tokens }, appString.ADMIN_CREATED, 201);
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
      const admin = await Admin.findOne({ email });
      if (!admin || !(await admin.matchPassword(password))) {
        return error(res, appString.INVALID_CREDENTIALS, 401);
      }

      const tokens = await generateTokens(admin);
      success(
        res,
        { username: admin.username, email: admin.email, ...tokens },
        appString.LOGIN_SUCCESS,
      );
    } catch (err) {
      error(res, err.message || appString.LOGIN_FAILED, 500);
    }
  },
  userList: async (req, res) => {
    try {
      const { username, email } = req.query;

      const filter = {};
      if (username) filter.username = username;
      if (email) filter.email = email;

      const users = await user.aggregate([
        { $match: filter },
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
            userName: "$username",
            email: "$email",
            addressDetails: "$addressDetails",
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
