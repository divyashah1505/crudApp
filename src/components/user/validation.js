// exports.validateUser = ({ username, email, password }) => {
//   if (!username || !email || !password) return "All fields are required";

//   if (password.length < 6) return "Password must be at least 6 characters";

//   return null;
// };

const val = require("../../middleware/index");

async function registerValidation(req, res, next) {
  const validationRule = {
    userName: `required|string`,

    email: `required|string|min:4|max:255`,

    password:
      "required|min:6|max:50|regex:/[A-Z]/|regex:/[0-9]/|regex:/[@$!%*#?&]/",
    adminrole: "required",
  };

  val.validatorUtilWithCallback(validationRule, {}, req, res, next);
}
async function loginValidation(req, res, next){
    const validationRule = {        
        
        email: `required|string|min:4|max:255`,
    };

    validatorUtilWithCallback(validationRule, {}, req, res, next);
}
async function AddressValidation(req, res, next){
    const validationRule = {        
        
        Address: `required|string|min:4|max:20`,
    };

    validatorUtilWithCallback(validationRule, {}, req, res, next);
}



module.export = {registerValidation,loginValidation,AddressValidation};
