const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { appString } = require("../../utils/appString");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, appString.USERNAME_REQUIRED],
      trim: true,
      minlength: [4, appString.LONG],
      maxlength: [20, appString.LIMIT],
    },

    email: {
      type: String,
      unique: true,
      required: [true, appString.EMAIL_REQUIRED],
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },

    file: {
      type: String,
    },

    // 🔥 SINGLE FLAG FOR ALL USER STATES
    status: {
      type: String,
      enum: [
        "active",
        "deactivated",
        "deleted_by_user",
        "deleted_by_admin",
      ],
      default: "active",
    },
  },
  { timestamps: true }
);

// 🔐 Hash password before save
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// 🔑 Compare password
userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
