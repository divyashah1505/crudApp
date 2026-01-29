exports.appString = {
  USER_CREATED: "User registered successfully",
  LOGIN_SUCCESS: "Login successful",
  INVALID_CREDENTIALS: "Invalid credentials",
  LOGOUT_SUCCESS: "Logged out successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User Soft deleted successfully",
  REGISTRATION_FAILED: "Registration Failed",
  Required_EmailPass: "emailId and password are required",
  LOGIN_FAILED: "Login failed",
  NOT_FOUND: "User not found",
  SUCCESS: "SUCCESS",
  USER_LOGOUT: "user logout successfully",
  LOGIN_FIRST: "Please Login First",
  USER_FILE_UPLOADED: "File Uploaded Successfully",
  USER_FILE_INVALID: "File is Invalid",
  img_ERR:"Only image files are allowed!",
  jWTNOT_DEFINED:"JWT secrets not defined",
  TOKEN_EXPIRED:"Invalid or expired token",
  TOKEN_MISSING:"Token missing",
  ALREDY_EXIST:"Already Exists",
  ADDRESS_CREATED:"User Address Created Successfully",
  ADDRESS_FAILED:"failed to create user address"
};
// Requirements : 

// Create a new database table/collection to store user addresses.

// One user can have more than one address.

// Each user can have only one primary address.

// The Get User Profile API should return only the primary address of the user.

// Other (non-primary) addresses should not be included in the profile response.

// There should be a way to change the primary address for a user.

// When the primary address is changed, the update should be applied correctly everywhere.