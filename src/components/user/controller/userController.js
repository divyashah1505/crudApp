const User = require("../model/users");
const { generateTokens, success, error } = require("../../utils/commonUtils");
const strings = require("../../utils/appString");

const userController = {
  register: async (req, res) => {
    try {
      const userData = {
        ...req.body,
        file: req.body.file || null,
      };

      const user = await User.create(userData);
      const tokens = generateTokens(user._id);

      return success(res, { user, ...tokens }, strings.USER_CREATED, 201);
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return error(res, `${field} already exists`, 409);
      }
      return error(res, err.message || "Registration failed", 400);
    }
  },
  profileUpload: async (req, res) => {
    try {
      console.log(req.file);

      if (req.file) {
        success(res, req.file, strings.USER_FILE_UPLOADED);
      } else {
        error(req, res, strings.USER_FILE_INVALID, 404);
      }
    } catch (err) {
      error(req, res, err.message, 500);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return error(req, res, strings.Required_EmailPass, 400);
      }

      const user = await User.findOne({ email });

      if (!user || !(await user.matchPassword(password))) {
        return error(req, res, strings.INVALID_CREDENTIALS, 401);
      }

      const tokens = generateTokens(user._id);

      success(
        res,
        {
          username: user.username,
          email: user.email,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        strings.LOGIN_SUCCESS,
      );
    } catch (err) {
      error(res, err.message || strings.LOGIN_FAILED, 500);
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("username email");

      if (!user) {
        return error(res, "User not found", 404);
      }
      success(res, user);
    } catch (err) {
      error(res, err.message, 500);
    }
  },

  updateUser: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.user.id, req.body, {
        new: true,
      });
      success(res, user, strings.USER_UPDATED);
    } catch (err) {
      error(req, res, err.message, 400);
    }
  },

  deleteUser: async (req, res) => {
    try {
      await User.softDelete(req.user.id);
      success(req, res, {}, strings.USER_DELETED);
    } catch (err) {
      error(res, err.message, 400);
    }
  },
  imgUpload: async (req, res) => {},

  logout: (req, res) => {
    res.clearCookie("accessToken");
    res.status(200).json({
      success: true,
      message: strings.LOGOUT_SUCCESS,
    });
  },
};

module.exports = userController;
