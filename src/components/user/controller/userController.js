const User = require("../model/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validateUser } = require("../../utills/validator");

const ACCESS_SECRET = "access_secret_123";
const REFRESH_SECRET = "refresh_secret_456";

const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id }, ACCESS_SECRET, {
    expiresIn: "30m",
  });

  const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const validation = validateUser(req.body || {});
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.message });
    }
    req.body.file = req.file?.filename;
    const user = await User.create(req.body);
    const tokens = generateTokens(user);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message || "An unknown error occurred",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json(tokens);
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

exports.refresh = async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.sendStatus(401);

  const user = await User.findOne({ refreshToken: token });
  if (!user) return res.sendStatus(403);

  jwt.verify(token, REFRESH_SECRET, (err) => {
    if (err) return res.sendStatus(403);
    const tokens = generateTokens(user);
    res.json(tokens);
  });
};

exports.getUsers = async (req, res) => {
  try {
    const id = req.headers.id;
    const users = await User.find({ _id: id });

    res.json(users);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.headers.id;

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    console.log(updatedUser);

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({
      message: "Update failed",
      error: err.message,
    });
  }
};

exports.logout = async (req, res) => {
  
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.headers.id;

    await User.softDelete(id);
    res.json({ message: "User soft-deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
};
