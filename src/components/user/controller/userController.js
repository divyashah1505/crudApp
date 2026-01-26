const User = require("../model/users");
const { generateTokens, success, error } = require("../../utils/commonUtils");
const strings = require("../../utils/appString");

exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const tokens = generateTokens(user._id);

    success(res, tokens, strings.USER_CREATED, 201);
  } catch (err) {
    error(res, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.matchPassword(password)))
      return error(res, strings.INVALID_CREDENTIALS, 401);

    const tokens = generateTokens(user._id);
    success(res, tokens, strings.LOGIN_SUCCESS);
  } catch (err) {
    error(res, err.message);
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
