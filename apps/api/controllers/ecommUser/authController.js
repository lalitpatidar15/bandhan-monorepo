const User = require("../../models/shared/User.js");
const JobSeeker = require("../../models/jobSeeker/JobSeeker.js");
const Recruiter = require("../../models/jobPoster/Recruiter.js");
const Student = require("../../models/student/Student.js");
const Instructor = require("../../models/instructor/Instructor.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const SsoGrant = require("../../models/shared/SsoGrant.js");
const https = require("https");
const cloudinary = require("../../config/cloudinary.js");
const { generateOtp, hashOtp, verifyOtp } = require("../../utils/otp.js");
const { validatePassword } = require("../../utils/validatePassword.js");
const { sendOtpEmail } = require("../../utils/email.js");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashSsoCode = (code) => crypto.createHash("sha256").update(code).digest("hex");

async function createSsoCode(user) {
  const code = crypto.randomBytes(32).toString("base64url");
  await SsoGrant.create({
    codeHash: hashSsoCode(code),
    userId: user._id,
    subjectModel: user.constructor.modelName,
    role: accountRole(user),
    expiresAt: new Date(Date.now() + 2 * 60 * 1000),
  });
  return code;
}

const portalModels = { User, Student, Instructor, JobSeeker, Recruiter };

const accountRole = (account) => account.role || ({
  Student: "student", Instructor: "instructor", JobSeeker: "jobseeker", Recruiter: "recruiter",
}[account.constructor.modelName]);

const accountEmail = (account) => account.email || account.companyEmail;
const accountName = (account) => account.fullName || account.companyName || "User";

const findPortalAccounts = (email) => Promise.all([
  User.findOne({ email }).select("+password"),
  JobSeeker.findOne({ email }).select("+password"),
  Recruiter.findOne({ companyEmail: email }).select("+password"),
  Student.findOne({ email }).select("+password"),
  Instructor.findOne({ email }).select("+password"),
]);

const setAuthCookie = (res, token) => {
  res.cookie("bandhan_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch {
          console.error("Error in controllers/ecommUser/authController.js:", err);
 reject(new Error("Invalid JSON response")); }
      });
    }).on("error", reject);
  });
}

async function verifyGoogleToken(idToken) {
  try {
    const payload = await fetchJson(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (payload.error || !payload.sub) return null;
    return { socialId: payload.sub, email: payload.email, fullName: payload.name, verifiedEmail: payload.email_verified === "true" };
  } catch {
    console.error("Error in controllers/ecommUser/authController.js:", err);

    return null;
  }
}

async function verifyFacebookToken(accessToken) {
  try {
    const payload = await fetchJson(`https://graph.facebook.com/me?access_token=${encodeURIComponent(accessToken)}&fields=id,email,name`);
    if (payload.error || !payload.id) return null;
    return { socialId: payload.id, email: payload.email || "", fullName: payload.name || "" };
  } catch {
    console.error("Error in controllers/ecommUser/authController.js:", err);

    return null;
  }
}

// =========== REGISTRATION ==========
exports.saveRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      const { email, role, fullName, phone, password } = req.body;
      const accountRole = role === "seller" ? "seller" : "buyer";

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      if (email && !EMAIL_REGEX.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      if (password && validatePassword(password).length > 0) {
        return res.status(400).json({ success: false, message: validatePassword(password)[0] });
      }

      const user = await User.create({
        email: email.toLowerCase(),
        role: accountRole,
        ...(fullName ? { fullName } : {}),
        ...(phone ? { phone } : {}),
        ...(password ? { password: await bcrypt.hash(password, 10), isProfileComplete: true } : { isProfileComplete: false }),
      });

      return res.status(201).json({
        success: true,
        id: user._id,
        registrationId: user._id,
        message: password ? "Registration completed" : "User registered",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      fullName,
      phone,
      password,
      confirmPassword,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !password ||
      !confirmPassword 
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: passwordErrors[0],
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password mismatch",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        fullName,
        phone,
        password: hashedPassword,    
        isProfileComplete: true,
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Registration completed",
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.fullName || "User",
        fullName: updatedUser.fullName || "",
        email: updatedUser.email,
        phone: updatedUser.phone || "",
        role: updatedUser.role
      },
    });

  } catch (error) {
    console.error("Error in controllers/ecommUser/authController.js:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};



//============= LOGIN ==========
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ success: false, message: "Account is deactivated" });
    }

    if (role && role !== user.role) {
      return res.status(403).json({ success: false, message: `This account is registered as a ${user.role}. Please select the correct role.` });
    }

    if (!user.password || typeof user.password !== "string") {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role || "buyer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    setAuthCookie(res, token);

    const ssoCode = user.role === "seller" ? await createSsoCode(user) : undefined;

    res.json({
      success: true,
      message: "Login Success",
      token,
      ssoCode,
      user: {
        id: user._id,
        _id: user._id,
        name: user.fullName || "User",
        fullName: user.fullName || "",
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        avatar: user.profileImage || user.profilePic || "",
      },
    });

  } catch (error) {
    console.error("Error in controllers/ecommUser/authController.js:", error);

    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

// Exchanges a two-minute, single-use opaque grant for a portal-local session.
exports.exchangeSsoCode = async (req, res) => {
  try {
    const code = String(req.body?.code || "");
    const role = String(req.body?.role || "");
    if (!code || !["seller", "student", "instructor", "jobseeker", "recruiter"].includes(role)) return res.status(400).json({ success: false, message: "A valid SSO request is required" });

    const grant = await SsoGrant.findOneAndUpdate(
      { codeHash: hashSsoCode(code), role, usedAt: null, expiresAt: { $gt: new Date() } },
      { $set: { usedAt: new Date() } },
      { new: true },
    );
    if (!grant) return res.status(401).json({ success: false, message: "This sign-in link is invalid, expired, or already used" });

    const Model = portalModels[grant.subjectModel];
    const user = Model ? await Model.findById(grant.userId) : null;
    if (!user || user.status === "inactive" || user.accountStatus === "blocked" || accountRole(user) !== role) return res.status(401).json({ success: false, message: "Account is not available" });

    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    setAuthCookie(res, token);
    return res.json({ success: true, token, user: { id: user._id, _id: user._id, name: accountName(user), fullName: accountName(user), email: accountEmail(user), role } });
  } catch (error) {
    console.error("SSO exchange failed:", error);
    return res.status(500).json({ success: false, message: "Unable to complete portal sign-in" });
  }
};

// Central registration endpoint. Admin accounts are intentionally excluded.
exports.portalRegister = async (req, res) => {
  try {
    const role = String(req.body?.role || "");
    const fullName = String(req.body?.fullName || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = String(req.body?.phone || "").trim();
    const password = String(req.body?.password || "");
    const allowedRoles = ["buyer", "seller", "student", "instructor", "jobseeker", "recruiter"];

    if (!allowedRoles.includes(role) || !fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Role, name, email, and password are required" });
    }
    if (!EMAIL_REGEX.test(email)) return res.status(400).json({ success: false, message: "Invalid email format" });
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length) return res.status(400).json({ success: false, message: passwordErrors[0] });

    const existingAccounts = await findPortalAccounts(email);
    if (existingAccounts.some(Boolean)) {
      return res.status(409).json({ success: false, message: "An account already exists with this email. Please sign in instead." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let account;
    if (role === "buyer" || role === "seller") {
      account = await User.create({ email, fullName, phone, password: hashedPassword, role, isProfileComplete: true });
    } else if (role === "student") {
      account = await Student.create({ email, fullName, password: hashedPassword, ...(phone ? { phone } : {}) });
    } else if (role === "instructor") {
      account = await Instructor.create({ email, fullName, password: hashedPassword, ...(phone ? { phone } : {}) });
    } else if (role === "jobseeker") {
      account = await JobSeeker.create({ email, fullName, password: hashedPassword, ...(phone ? { phone } : {}) });
    } else {
      // Recruiter hashes the password in its model hook.
      account = await Recruiter.create({ companyEmail: email, companyName: fullName, password });
    }

    return res.status(201).json({ success: true, message: "Account created. You can now sign in.", role, user: { id: account._id, email, name: accountName(account), role } });
  } catch (error) {
    console.error("Central registration failed:", error);
    return res.status(500).json({ success: false, message: "Unable to create account. Please try again." });
  }
};

// One credential endpoint for the existing role-specific login screens.
// The UI must route from this returned role, never from a caller-supplied role.
exports.portalLogin = async (req, res) => {
  try {
    const email = String(req.body?.email || req.body?.companyEmail || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password || !EMAIL_REGEX.test(email)) return res.status(400).json({ success: false, message: "Email and password are required" });

    const candidates = await findPortalAccounts(email);
    let account = null;
    for (const candidate of candidates) {
      if (candidate?.password && await bcrypt.compare(password, candidate.password)) {
        account = candidate;
        break;
      }
    }
    if (!account) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const role = accountRole(account);
    if (!["buyer", "seller", "student", "instructor", "jobseeker", "recruiter"].includes(role)) {
      return res.status(403).json({ success: false, message: "This account must use its dedicated sign-in portal." });
    }
    const token = jwt.sign({ id: account._id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    setAuthCookie(res, token);
    const fullName = account.fullName || account.companyName || "User";
    const ssoCode = role === "buyer" ? undefined : await createSsoCode(account);
    res.json({ success: true, token, ssoCode, role, user: { id: account._id, _id: account._id, fullName, name: fullName, email, role } });
  } catch (error) {
    console.error("Error in unified portal login:", error);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};
 


// ========= SOCIAL LOGIN ==========
exports.socialLogin = async (req, res) => {
  try {
    const { provider, token: socialToken, email, fullName, profileImage } = req.body;

    if (!provider || !socialToken) {
      return res.status(400).json({ success: false, message: "Provider and token are required" });
    }

    if (!["google", "facebook"].includes(provider)) {
      return res.status(400).json({ success: false, message: "Unsupported provider" });
    }

    const identity = provider === "google"
      ? await verifyGoogleToken(socialToken)
      : await verifyFacebookToken(socialToken);

    if (!identity) {
      return res.status(401).json({ success: false, message: "Invalid social authentication token" });
    }

    const { socialId, email: verifiedEmail } = identity;
    const displayName = fullName || identity.fullName || "";
    const userEmail = email || verifiedEmail || `${socialId}@${provider}.social`;

    let user = await User.findOne({
      $or: [
        { socialProvider: provider, socialId },
        { email: userEmail.toLowerCase() },
      ],
    });

    if (user) {
      if (!user.socialProvider) {
        user.socialProvider = provider;
        user.socialId = socialId;
      }
      if (displayName && !user.fullName) user.fullName = displayName;
      if (profileImage && !user.profileImage) user.profileImage = profileImage;
      await user.save();
    } else {
      user = await User.create({
        email: userEmail.toLowerCase(),
        fullName: displayName || `${provider} User`,
        profileImage: profileImage || "",
        socialProvider: provider,
        socialId,
        isProfileComplete: true,
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ success: false, message: "Account is deactivated" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role || "buyer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    setAuthCookie(res, token);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.fullName || "User",
        fullName: user.fullName || "",
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        avatar: user.profileImage || user.profilePic || ""
      }
    });
  } catch (error) {
    console.error("Error in controllers/ecommUser/authController.js:", error);

    res.status(500).json({ success: false, message: "Social login failed. Please try again." });
  }
};

// ========= SEND OTP ==========
exports.sendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (!existingUser && purpose !== "email-verification") {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    const otp = generateOtp();
    const otpCodeHash = await hashOtp(otp);

    const update = {
      otpCodeHash,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      otpPurpose: purpose || "general",
    };

    await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      update,
      { upsert: purpose === "email-verification" }
    );

    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error in controllers/ecommUser/authController.js:", error);

    res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
  }
};

// ========= VERIFY OTP ==========
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.otpCodeHash || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: "No OTP requested" });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    if (purpose && user.otpPurpose !== purpose) {
      return res.status(400).json({ success: false, message: "Invalid OTP purpose" });
    }

    const isValid = await verifyOtp(otp, user.otpCodeHash);

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const updateFields = {
      otpCodeHash: "",
      otpExpiresAt: null,
      otpPurpose: "",
    };
    if (user.otpPurpose === "email-verification") {
      updateFields.emailVerified = true;
    }
    await User.findByIdAndUpdate(user._id, updateFields);

    const resetToken = jwt.sign(
      { id: user._id, otpVerified: true, purpose },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Error in controllers/ecommUser/authController.js:", error);

    res.status(500).json({ success: false, message: "OTP verification failed. Please try again." });
  }
};

// ========= FORGOT PASSWORD (step 1: send OTP) ====
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = generateOtp();
    const otpCodeHash = await hashOtp(otp);

    await User.findByIdAndUpdate(user._id, {
      otpCodeHash,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      otpPurpose: "password-reset",
    });

    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Error in controllers/ecommUser/authController.js:", error);

    res.status(500).json({ success: false, message: "Failed to send reset OTP. Please try again." });
  }
};

// ====== RESET PASSWORD (step 2: verify OTP + update) ========
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, resetToken } = req.body;

    if (resetToken) {
      let decoded;
      try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      } catch {
        console.error("Error in controllers/ecommUser/authController.js:", err);

        return res.status(401).json({ success: false, message: "Invalid or expired reset token" });
      }

      if (decoded.otpVerified !== true) {
        return res.status(401).json({ success: false, message: "OTP not verified" });
      }

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

      return res.json({ success: true, message: "Password updated successfully" });
    }

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.otpCodeHash || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: "No OTP requested" });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    if (user.otpPurpose !== "password-reset") {
      return res.status(400).json({ success: false, message: "Invalid OTP purpose" });
    }

    const isValid = await verifyOtp(otp, user.otpCodeHash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      otpCodeHash: "",
      otpExpiresAt: null,
      otpPurpose: "",
    });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in controllers/ecommUser/authController.js:", error);

    res.status(500).json({ success: false, message: "Password reset failed. Please try again." });
  }
};
