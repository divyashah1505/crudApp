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

    success(res, { user, ...tokens }, strings.USER_CREATED, 201);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return error(res, `${field} already exists`, 409);
    }
    error(res, err.message || "Registration failed", 400);
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return error(res, "Username and password are required", 400);

    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password)))
      return error(res, strings.INVALID_CREDENTIALS, 401);

    const tokens = generateTokens(user._id);
    success(res, { user, ...tokens }, strings.LOGIN_SUCCESS);
  } catch (err) {
    error(res, err.message || "Login failed", 500);
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  success(res, user);
};

exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
  success(res, user, strings.USER_UPDATED);
};

exports.deleteUser = async (req, res) => {
  await User.softDelete(req.user.id);
  success(res, {}, strings.USER_DELETED);
};
