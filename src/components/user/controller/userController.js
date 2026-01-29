const User = require("../model/users");
const { generateTokens, success, error } = require("../../utils/commonUtils");
const { appString } = require("../../utils/appString");
// const appappString = require("../../utils/appString");

const userController = {
  register: async (req, res) => {

    // console.log("bbbbbb");
    
    try {
      const {username,email,password,file}=req.body;
      

      const user = await User.create({username,email,password,file});
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
  
   insertAddress:async(req,res)=>{
    try{
      const {street,city,state,zipCode,country}=req.body;
      const user = await userAddress.create({street,city,state,zipCode,country});
      return success(res,{user},appString.ADDRESS_CREATED,201);
    }catch (err){

    }
  },
  profileUpload: async (req, res) => {
    try {

      if (req.files) {
        success(res,  appString.USER_FILE_UPLOADED);
      } else {
        error(res, appString.USER_FILE_INVALID, 404);
      }
    } catch (err) {
      error( res, err.message, 500);
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
      const user = await User.findById(req?.user?.id).select("username email");

      if (!user) {
        return error(res, appString.NOT_FOUND, 404);
      }
      success(res, user);
    } catch (err) {
      error(res, err.message, 500);
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
      await User.softDelete(req.user.id);
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
};

module.exports = userController;
