const Merchant = require("../../models/merchant/Merchant.js");
const cloudinary = require("../../config/cloudinary.js");

exports.saveProfile = async (req, res) => {
  try {
    let profilePhoto = "";

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: "merchant-profile"
        }
      );

      profilePhoto = uploaded.secure_url;
    }

    let data = await Merchant.findOne({
      sellerId: req.user.id
    });

    if (!data) {
      data = await Merchant.create({
        sellerId: req.user.id,
        ...req.body,
        profilePhoto
      });
    } else {
      data = await Merchant.findOneAndUpdate(
        {
          sellerId: req.user.id
        },
        {
          ...req.body,
          ...(profilePhoto && { profilePhoto })
        },
        {
          new: true
        }
      );
    }

    res.json({
      success: true,
      settings: data
    });

  } catch (error) {
    console.error("Error in controllers/merchant/merchantController.js:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.getSettings = async (req, res) => {
  const data = await Merchant.findOne({
    sellerId: req.user.id
  });

  res.json({
    success: true,
    settings: data
  });
};

exports.toggle2FA = async (req, res) => {
  const data = await Merchant.findOneAndUpdate(
    {
      sellerId: req.user.id
    },
    {
      twoFactorEnabled: req.body.enabled
    },
    {
      new: true
    }
  );

  res.json({
    success: true,
    settings: data
  });
};

exports.updatePreferences = async (req, res) => {
  const data = await Merchant.findOneAndUpdate(
    {
      sellerId: req.user.id
    },
    {
      orderAlerts: req.body.orderAlerts,
      stockUpdates: req.body.stockUpdates,
      marketingEmails: req.body.marketingEmails
    },
    {
      new: true
    }
  );

  res.json({
    success: true,
    settings: data
  });
};

exports.changePassword = async (req, res) => {
  res.json({
    success: true,
    message: "Password changed successfully"
  });
};

exports.getMerchantHealth = async (req, res) => {
  const data = await Merchant.findOne({
    sellerId: req.user.id
  });

  res.json({
    success: true,
    fulfillmentRate: data?.fulfillmentRate || 0,
    responseTime: data?.responseTime || ""
  });
};