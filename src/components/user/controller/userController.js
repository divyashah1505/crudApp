const User = require("../model/users");
const { generateTokens, success, error } = require("../../utils/commonUtils");
const strings = require("../../utils/appString");

exports.register = async (req, res) => {
  try {
    const userData = {
      ...req.body,
      file: req.file ? req.file.filename : null,
    };

    const user = await User.create(userData);

    const tokens = generateTokens(user._id);

    success(
      req,
      res,
      {
        success: false,
        message: strings.USER_CREATED,
      },
      201,
    );
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return error(res, `${field} already exists`, 409);
    }
    error(res, err.message || strings.REGISTRATION_FAILED, 400);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return error(res, strings.Required_EmailPass, 400);

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return error(res, strings.INVALID_CREDENTIALS, 401);

    const tokens = generateTokens(user._id);
    success(
      req,
      res,
      {
        success: false,
        message: strings.LOGIN_SUCCESS,
      },
      200,
    );
  } catch (err) {
    error(res, err.message || strings.LOGIN_FAILED, 500);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username email");

    if (!user) {
      return res.status(404).json({ msg: strings.NOT_FOUND });
    }

    success(res, user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
  });
  success(res, user, strings.USER_UPDATED);
};

exports.deleteUser = async (req, res) => {
  await User.softDelete(req.user.id);
  success(res, {}, strings.USER_DELETED);
};
