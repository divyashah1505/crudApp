const Admin = require("../model/admin");
const { generateTokens, success, error } = require("../../utils/commonUtils");
const { appString } = require("../../utils/appString");
const mongoose = require("mongoose");
const admin = require("../model/admin");
const user  =require("../../user/model/users")
  const adminController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;
     const adminExists = await Admin.findOne({}); 
    
    if (adminExists) {
      return error(res, appString.ADMINALREDY_REGISTER, 409);
    }
     const admin = await Admin.create({ username, email, password, });
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

      if (!email || !password) {
        return error(res, appString.Required_EmailPass, 400);
      }

      const admin = await Admin.findOne({ email });

      if (!admin || !(await admin.matchPassword(password))) {
        return error(res, appString.INVALID_CREDENTIALS, 401);
      }

      const tokens = generateTokens(admin._id);

      success(
        res,
        {
          username: admin.username,
          email: admin.email,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        appString.LOGIN_SUCCESS,
      );
    } catch (err) {
      error(res, err.message || appString.LOGIN_FAILED, 500);
    }
  },
userList: async (req, res) => {
    try {
      const { search } = req.query;
      
      const aggregate = user.aggregate();

      if (search) {
        aggregate.match({
          $or: [
            { userName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        });
      }

      aggregate.lookup({
        from: "addresses",    
        localField: "_id",
        foreignField: "userId",
        as: "addressDetails"
      });

      aggregate.project({
        userName: 1,
        email: 1,
        addressDetails: 1
      });

      const users = await aggregate.exec();

      return success(res, users, "User list retrieved successfully");
    } catch (err) {
      return error(res, err.message, 500);
    }
  }
};
  
module.exports = adminController;
