const User = require("../model/users");
const { generateTokens, success, error } = require("../../utils/commonUtils");
const { appString } = require("../../utils/appString");
// const appappString = require("../../utils/appString");
const mongoose = require("mongoose");

const AddressModel = require("../model/Address");
const userController = {
  register: async (req, res) => {
    // console.log("bbbbbb");

    try {
      const { username, email, password, file } = req.body;

      const user = await User.create({ username, email, password, file });
      const tokens = generateTokens(user._id);
      return success(res, { user, ...tokens }, appString.USER_CREATED, 201);
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return error(res, `${field} already exists`, 409);
      }
      return error(res, err.message || appString.REGISTRATION_FAILED, 400);
    }
  },

  profileUpload: async (req, res) => {
    try {
      if (req.files) {
        success(res, appString.USER_FILE_UPLOADED);
      } else {
        error(res, appString.USER_FILE_INVALID, 404);
      }
    } catch (err) {
      error(res, err.message, 500);
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

      const tokens = generateTokens(user._id);

      success(
        res,
        {
          username: user.username,
          email: user.email,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        appString.LOGIN_SUCCESS,
      );
    } catch (err) {
      error(res, err.message || appString.LOGIN_FAILED, 500);
    }
  },

 getProfile: async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req?.user?.id);

    const profile = await User.aggregate([
      { $match: { _id: userId } },
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
                  cond: { $eq: ["$$addr.isPrimary", 1] }
                }
              },
              0
            ]
          }
        }
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
      const user = await User.findByIdAndUpdate(req?.user?.id, req.body, {
        new: true,
      });
      success(res, user, appString.USER_UPDATED);
    } catch (err) {
      error(req, res, err.message, 400);
    }
  },

  deleteUser: async (req, res) => {
    try {
      await User.softDelete(req?.user?.id);
      success(req, res, {}, appString.USER_DELETED);
    } catch (err) {
      error(res, err.message, 400);
    }
  },

  imgUpload: async (req, res) => {},

  logout: (req, res) => {
    res.clearCookie("accessToken");
    res.status(200).json({
      success: true,
      message: appString.LOGOUT_SUCCESS,
    });
  },
  insertAddress: async (req, res) => {
  try {
    const userId = req?.user?.id;
    const { Address, isPrimary } = req.body;

    // Strictly convert to boolean: only '1' or 1 becomes true
    const isPrimaryBool = Number(isPrimary) === 1;

    if (isPrimaryBool) {
      // Deactivate other primary addresses for this user
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
      const addresses = await AddressModel.find({ userId: req?.user?.id });
      return success(res, addresses);
    } catch (err) {
      return error(res, err.message, 500);
    }
  },
  changePrimaryAddress: async (req, res) => {
    try {
      const userId = req?.user?.id;
      const { addressId } = req.body;
      console.log(req.body);

      await AddressModel.updateMany(
        { userId, isPrimary: true },
        { isPrimary: false },
      );
      console.log("hi");

      const address = await AddressModel.findOneAndUpdate(
        { _id: addressId, userId },
        { isPrimary: true },
        { new: true },
      );

      console.log(address);

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
