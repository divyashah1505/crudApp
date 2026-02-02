const val = require("../../middleware/index");

async function registerValidation(req, res, next) {
  const validationRule = {
    username: `required|string`,
    email: `required|string|min:4|max:255`,
    password:
      "required|min:6|max:50|regex:/[A-Z]/|regex:/[0-9]/|regex:/[@$!%*#?&]/",
    // adminrole: "required",
  };
  val.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

async function loginValidation(req, res, next) {
  const validationRule = {
    email: `required|string|min:4|max:255`,
  };
  val.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

async function AddressValidation(req, res, next) {
  const validationRule = {
    Address: "required|string|min:4|max:20",
    isPrimary: "required|numeric|in:0,1",
  };
  val.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

module.exports = { registerValidation, loginValidation, AddressValidation };
