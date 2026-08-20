// PRODUCT PANEL - profile-setup, business details setup, document verification

const Profile = require("../../models/shared/Profile.js");
const User = require("../../models/shared/User.js");

const getProfileCompletionState = (profile, user) => {
  const fullName = typeof (profile?.fullName || user?.fullName) === "string" ? (profile?.fullName || user?.fullName).trim() : "";
  const email = typeof (profile?.email || user?.email) === "string" ? (profile?.email || user?.email).trim().toLowerCase() : "";
  const phone = typeof (profile?.contactNumber || user?.phone) === "string" ? (profile?.contactNumber || user?.phone).trim() : "";
  return Boolean(fullName && email && phone);
};

// ================= STEP 1 =================
exports.saveBasicInfo = async (req, res) => {
  try {
    const { fullName, displayName, email, contactNumber, address } = req.body;
    const profilePhoto = req.file ? req.file.path : null;

    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = await Profile.create({
        userId: req.user.id,
        profilePhoto,
        fullName,
        displayName,
        contactNumber,
        address,
        email,
        onboardingStep: 2,
        profileCompleted: Boolean(fullName && contactNumber && email),
      });
    } else {
      profile.profilePhoto = profilePhoto || profile.profilePhoto;
      profile.fullName = fullName;
      profile.displayName = displayName || profile.displayName;
      profile.contactNumber = contactNumber;
      profile.address = address;
      profile.email = email || profile.email;
      profile.onboardingStep = 2;
      profile.profileCompleted = Boolean(fullName && contactNumber && (email || profile.email));
      await profile.save();
    }

    await User.findByIdAndUpdate(req.user.id, {
      fullName: fullName || undefined,
      email: email || undefined,
      phone: contactNumber || undefined,
      profileImage: profilePhoto || undefined,
      profilePic: profilePhoto || undefined,
      isProfileComplete: Boolean(fullName && contactNumber && email),
    }, { new: true });

    res.status(200).json({
      success: true,
      message: "Basic info saved",
      data: profile
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/profileController.js:", err);

    res.status(500).json({
      success: false,
      message: "Failed to process profile request"
    });
  }
};


// ================= STEP 2 (FIXED: Auto-create Profile if missing) =================
exports.saveBusinessDetails = async (req, res) => {
  try {
    const {
      businessName,
      gstNumber,
      businessCategory,
      businessAddress,
      businessDescription,
      panNumber,
      website,
      linkedinUrl,
      githubUrl,
      twitterUrl,
      portfolioUrl,
    } = req.body;

    // Search or create profile instantly
    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      // 💡 If Step 1 was skipped or missing, create the profile doc here
      const user = await User.findById(req.user.id);
      profile = new Profile({
        userId: req.user.id,
        fullName: user?.fullName || "",
        email: user?.email || "",
        contactNumber: user?.phone || "",
      });
    }

    if (typeof businessName !== "undefined") profile.businessName = businessName;
    if (typeof gstNumber !== "undefined") profile.gstNumber = gstNumber;
    if (typeof businessCategory !== "undefined") profile.businessCategory = businessCategory;
    if (typeof businessAddress !== "undefined") profile.businessAddress = businessAddress;
    if (typeof businessDescription !== "undefined") profile.businessDescription = businessDescription;
    if (typeof panNumber !== "undefined") profile.panNumber = panNumber;
    if (typeof website !== "undefined") profile.website = website;
    if (typeof linkedinUrl !== "undefined") profile.linkedinUrl = linkedinUrl;
    if (typeof githubUrl !== "undefined") profile.githubUrl = githubUrl;
    if (typeof twitterUrl !== "undefined") profile.twitterUrl = twitterUrl;
    if (typeof portfolioUrl !== "undefined") profile.portfolioUrl = portfolioUrl;

    profile.onboardingStep = 3;
    profile.profileCompleted = Boolean(profile.fullName || profile.contactNumber || profile.email || profile.address);

    await profile.save();

    await User.findByIdAndUpdate(req.user.id, {
      gstNumber: gstNumber || undefined,
      businessDetails: {
        gstin: gstNumber || undefined,
        businessName: businessName || undefined,
        businessType: businessCategory || undefined,
      },
    }, { new: true });

    res.status(200).json({
      success: true,
      message: "Business details saved",
      data: profile
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/profileController.js:", err);

    res.status(500).json({
      success: false,
      message: "Failed to process profile request"
    });
  }
};


// ================= SETTINGS / PAYMENT INFO (FIXED) =================
exports.saveSettings = async (req, res) => {
  try {
    const {
      bankName,
      accountNumber,
      ifscCode,
      upiId,
      emailNotifications,
      smsNotifications,
      marketingEmails,
      darkMode,
      languagePreference
    } = req.body;

    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = new Profile({ userId: req.user.id });
    }

    if (typeof bankName !== "undefined") profile.bankName = bankName;
    if (typeof accountNumber !== "undefined") profile.accountNumber = accountNumber;
    if (typeof ifscCode !== "undefined") profile.ifscCode = ifscCode;
    if (typeof upiId !== "undefined") profile.upiId = upiId;
    if (typeof emailNotifications !== "undefined") profile.emailNotifications = emailNotifications === true || emailNotifications === "true";
    if (typeof smsNotifications !== "undefined") profile.smsNotifications = smsNotifications === true || smsNotifications === "true";
    if (typeof marketingEmails !== "undefined") profile.marketingEmails = marketingEmails === true || marketingEmails === "true";
    if (typeof darkMode !== "undefined") profile.darkMode = darkMode === true || darkMode === "true";
    if (typeof languagePreference !== "undefined") profile.languagePreference = languagePreference;
    if (typeof req.body.twoFactorEnabled !== "undefined") profile.twoFactorEnabled = req.body.twoFactorEnabled === true || req.body.twoFactorEnabled === "true";

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Settings saved",
      data: profile
    });
  } catch (err) {
    console.error("Error in controllers/ecommUser/profileController.js:", err);

    res.status(500).json({
      success: false,
      message: "Failed to process settings request"
    });
  }
};


// ================= STEP 3 (FIXED) =================
exports.verifyGovernmentId = async (req, res) => {
  try {
    const { governmentId } = req.body;

    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = new Profile({ userId: req.user.id });
    }

    profile.governmentId = governmentId;
    profile.isVerified = true;
    profile.onboardingStep = 4;
    profile.profileCompleted = true;

    await User.findByIdAndUpdate(req.user.id, {
      isProfileComplete: true,
    }, { new: true });

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Government ID verified",
      data: profile
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/profileController.js:", err);

    res.status(500).json({
      success: false,
      message: "Failed to process profile request"
    });
  }
};


// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  try {
    const [profile, user] = await Promise.all([
      Profile.findOne({ userId: req.user.id }),
      User.findById(req.user.id).select("fullName phone email profileImage profilePic gstNumber businessDetails")
    ]);

    if (!profile && !user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    const profileData = profile ? profile.toObject() : {};
    const userData = user ? user.toObject() : {};

    const merged = {
      ...userData,
      ...profileData,
      _id: profileData._id || userData._id,
      userId: profileData.userId || req.user.id,
      fullName: profileData.fullName || userData.fullName || "",
      displayName: profileData.displayName || profileData.fullName || userData.fullName || "",
      contactNumber: profileData.contactNumber || userData.phone || "",
      email: profileData.email || userData.email || req.user.email || "",
      address: profileData.address || "",
      profilePhoto: profileData.profilePhoto || userData.profileImage || userData.profilePic || "",
      businessName: profileData.businessName || userData.businessDetails?.businessName || "",
      gstNumber: profileData.gstNumber || userData.gstNumber || "",
      businessCategory: profileData.businessCategory || userData.businessDetails?.businessType || "",
      businessAddress: profileData.businessAddress || "",
      bankName: profileData.bankName || "",
      accountNumber: profileData.accountNumber || "",
      ifscCode: profileData.ifscCode || "",
      upiId: profileData.upiId || "",
      emailNotifications: Boolean(profileData.emailNotifications || false),
      smsNotifications: Boolean(profileData.smsNotifications || false),
      marketingEmails: Boolean(profileData.marketingEmails || false),
      darkMode: Boolean(profileData.darkMode || false),
      languagePreference: profileData.languagePreference || "English",
      twoFactorEnabled: Boolean(profileData.twoFactorEnabled || false),
      isVerified: Boolean(profileData.isVerified || false),
      profileCompleted: Boolean(profileData.profileCompleted || false),
      panNumber: profileData.panNumber || "",
      businessDescription: profileData.businessDescription || "",
      website: profileData.website || "",
      linkedinUrl: profileData.linkedinUrl || "",
      githubUrl: profileData.githubUrl || "",
      twitterUrl: profileData.twitterUrl || "",
      portfolioUrl: profileData.portfolioUrl || "",
    };

    res.status(200).json({
      success: true,
      data: merged
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/profileController.js:", err);

    res.status(500).json({
      success: false,
      message: "Failed to process profile request"
    });
  }
};