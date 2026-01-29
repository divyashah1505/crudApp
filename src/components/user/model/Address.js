const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
   
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

addressSchema.index(
  { user: 1, isPrimary: 1 },
  { unique: true, partialFilterExpression: { isPrimary: true } },
);

module.exports = mongoose.model("Address", addressSchema);
