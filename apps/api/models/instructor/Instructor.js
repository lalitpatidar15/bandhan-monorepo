const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    company: {
      type: String,
      required: true,
      trim: true
    },

    years: {
      type: String,
      required: true
    }
  },
  {
    _id: true
  }
);

// DOCUMENTS
const documentSchema =
  new mongoose.Schema(
    {
      aadhaar: {
        type: String,
        default: ""
      },

      pan: {
        type: String,
        default: ""
      },

      academicDegree: {
        type: String,
        default: ""
      },

      professionalCertificate: {
        type: String,
        default: ""
      }
    },
    {
      _id: false
    }
  );

const verificationStatusSchema =
  new mongoose.Schema(
    {
      aadhaar: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected"
        ],
        default: "pending"
      },

      pan: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected"
        ],
        default: "pending"
      },

      academicDegree: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected"
        ],
        default: "pending"
      },

      professionalCertificate: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected"
        ],
        default: "pending"
      },

      overall: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected"
        ],
        default: "pending"
      }
    },
    {
      _id: false
    }
  );

const instructorSchema =
  new mongoose.Schema(
    {
      role: {
        type: String,
        default: "instructor"
      },

      fullName: {
        type: String,
        required: true,
        trim: true
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
      },

      password: {
        type: String,
        required: true,
        select: false
      },

      isEmailVerified: {
        type: Boolean,
        default: false
      },

      profilePhoto: {
        type: String,
        default: ""
      },

      headline: {
        type: String,
        default: ""
      },

      bio: {
        type: String,
        default: ""
      },

      expertiseTags: [
        {
          type: String
        }
      ],

      languages: [
        {
          type: String
        }
      ],

      linkedin: {
        type: String,
        default: ""
      },

      portfolio: {
        type: String,
        default: ""
      },

      website: {
        type: String,
        default: ""
      },

      experience: [
        experienceSchema
      ],

      profileCompletion: {
        type: Number,
        default: 0
      },

      isProfileCompleted: {
        type: Boolean,
        default: false
      },

      // FIXED
      documents: {
        type: documentSchema,
        default: () => ({})
      },

      verificationStatus: {
        type: verificationStatusSchema,
        default: () => ({})
      },

      documentCompletion: {
        type: Number,
        default: 0
      },

      isDocumentSubmitted: {
        type: Boolean,
        default: false
      },

      isVerified: {
        type: Boolean,
        default: false
      },

      verificationDate: {
        type: Date,
        default: null
      },

      rejectionReason: {
        type: String,
        default: ""
      },

      accountStatus: {
        type: String,
        enum: [
          "pending",
          "active",
          "blocked"
        ],
        default: "pending"
      },

      lastLogin: {
        type: Date,
        default: null
      }
    },
    {
      timestamps: true
    }
  );

module.exports =
  mongoose.model(
    "Instructor",
    instructorSchema
  );