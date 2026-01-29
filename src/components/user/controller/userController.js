const User = require("../model/users");
const Address = require("../../address/model/address");
const { generateTokens, success, error } = require("../../utils/commonUtils");
const { appString } = require("../../utils/appString");

const userController = {

  // ===================== REGISTER =====================
  register: async (req, res) => {
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
      return error(res, err.message, 400);
    }
  },

  // ===================== LOGIN =====================
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

      return success(res, {
        username: user.username,
        email: user.email,
        ...tokens,
      }, appString.LOGIN_SUCCESS);
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // ===================== INSERT ADDRESS =====================
  insertAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const { street, city, state, zipCode, country, isPrimary } = req.body;

      if (isPrimary) {
        await Address.updateMany(
          { userId, isPrimary: true },
          { isPrimary: false }
        );
      }

      const address = await Address.create({
        userId,
        street,
        city,
        state,
        zipCode,
        country,
        isPrimary: !!isPrimary,
      });

      if (isPrimary) {
        await User.findByIdAndUpdate(userId, {
          primaryAddress: address._id,
        });
      }

      return success(res, address, appString.ADDRESS_CREATED, 201);
    } catch (err) {
      return error(res, err.message, 400);
    }
  },

  // ===================== CHANGE PRIMARY ADDRESS =====================
  changePrimaryAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const { addressId } = req.body;

      await Address.updateMany(
        { userId, isPrimary: true },
        { isPrimary: false }
      );

      const address = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        { isPrimary: true },
        { new: true }
      );

      if (!address) {
        return error(res, appString.NOT_FOUND, 404);
      }

      await User.findByIdAndUpdate(userId, {
        primaryAddress: address._id,
      });

      return success(res, address, appString.PRIMARY_ADDRESS_UPDATED);
    } catch (err) {
      return error(res, err.message, 400);
    }
  },

  // ===================== LIST USER ADDRESSES =====================
  listUserAddresses: async (req, res) => {
    try {
      const addresses = await Address.find({ userId: req.user.id });
      return success(res, addresses);
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // ===================== GET PROFILE (PRIMARY ADDRESS ONLY) =====================
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const profile = await User.aggregate([
        { $match: { _id: userId } },
        {
          $lookup: {
            from: "addresses",
            let: { primaryId: "$primaryAddress" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$primaryId"] },
                },
              },
            ],
            as: "primaryAddress",
          },
        },
        {
          $unwind: {
            path: "$primaryAddress",
            preserveNullAndEmptyArrays: true,
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
        return error(res, appString.NOT_FOUND, 404);
      }

      return success(res, profile[0]);
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // ===================== UPDATE USER =====================
  updateUser: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        req.body,
        { new: true }
      );
      return success(res, user, appString.USER_UPDATED);
    } catch (err) {
      return error(res, err.message, 400);
    }
  },

  // ===================== DELETE USER =====================
  deleteUser: async (req, res) => {
    try {
      await User.softDelete(req.user.id);
      return success(res, {}, appString.USER_DELETED);
    } catch (err) {
      return error(res, err.message, 400);
    }
  },
};

module.exports = userController;
