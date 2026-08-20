const PASSWORD_RULES = {
  minLength: 8,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /\d/,
  special: /[^A-Za-z0-9]/,
};

function validatePassword(password) {
  const errors = [];

  if (!password || password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters`);
  }

  if (password && !PASSWORD_RULES.uppercase.test(password)) {
    errors.push("Password must contain at least 1 uppercase letter");
  }

  if (password && !PASSWORD_RULES.lowercase.test(password)) {
    errors.push("Password must contain at least 1 lowercase letter");
  }

  if (password && !PASSWORD_RULES.number.test(password)) {
    errors.push("Password must contain at least 1 number");
  }

  if (password && !PASSWORD_RULES.special.test(password)) {
    errors.push("Password must contain at least 1 special character");
  }

  return errors;
}

module.exports = { validatePassword, PASSWORD_RULES };
