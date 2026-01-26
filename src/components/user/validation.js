const validateUser = (user = {}) => {
  const { username, email, password } = user;

  if (!username) {
    return {
      isValid: false,
      statusCode: 400,
      field: "username",
      message: "Username is required",
    };
  }

  if (username.length < 3) {
    return {
      isValid: false,
      statusCode: 400,
      field: "username",
      message: "Username must be at least 3 characters long",
    };
  }

  if (!email) {
    return {
      isValid: false,
      statusCode: 400,
      field: "email",
      message: "Email is required",
    };
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return {
      isValid: false,
      statusCode: 400,
      field: "email",
      message: "Invalid email format",
    };
  }

  if (!password) {
    return {
      isValid: false,
      statusCode: 400,
      field: "password",
      message: "Password is required",
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      statusCode: 400,
      field: "password",
      message: "Password must be at least 6 characters long",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      statusCode: 400,
      field: "password",
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      statusCode: 400,
      field: "password",
      message: "Password must contain at least one number",
    };
  }

  return { isValid: true };
};

module.exports = { validateUser };


const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      message: `${field} already exists`,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: err.message,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token expired",
    });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
