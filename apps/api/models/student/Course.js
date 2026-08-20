
const mongoose = require("mongoose");

// ================= RESOURCE =================

const resourceSchema = new mongoose.Schema(
{
    name: String,

    fileName: String,

    fileUrl: String,

    fileType: {
        type: String,
        default: "pdf"
    },

    fileSize: Number,

    uploadedAt: {
        type: Date,
        default: Date.now
    }
},
{
    _id:true
});

// ================= QUIZ =================

const optionSchema = new mongoose.Schema(
{
    text: String,

    isCorrect: {
        type: Boolean,
        default: false
    }
},
{
    _id:true
});

const questionSchema = new mongoose.Schema(
{
    question: {
        type: String,
        required: true
    },

    options: [optionSchema],

    marks: {
        type: Number,
        default: 1
    }
},
{
    _id:true
});

const quizSchema = new mongoose.Schema(
{
    title: String,

    description: String,

    passingMarks: {
        type: Number,
        default: 50
    },

    maxAttempts: {
        type: Number,
        default: 1
    },

    questions: [questionSchema],

    status: {
        type: String,
        enum: [
            "draft",
            "published"
        ],
        default: "draft"
    }
},
{
    _id:true
});

// ================= LESSON =================

const lessonSchema = new mongoose.Schema(
{
    title: {
        type: String,
        default: ""
    },

    description: {
        type: String,
        default: ""
    },

    duration: {
        type: Number,
        default: 0
    },

    type: {
        type: String,
        enum: [
            "video",
            "quiz",
            "assignment",
            "pdf",
            "mcq"
        ],
        default: "video"
    },

    // video
    videoUrl: String,

    videoPublicId: String,

    // pdf
    pdfUrl: String,

    pdfFileName: String,

    // mcq
    mcqData: {

        questions: [],

        duration: Number,

        passingScore: Number
    },

    // upload
    uploadProgress: {
        type: Number,
        default: 0
    },

    uploadStatus: {
        type: String,
        enum: [
            "not_started",
            "uploading",
            "processing",
            "completed",
            "failed"
        ],
        default: "not_started"
    },

    // preview
    isPreview: {
        type: Boolean,
        default: false
    },

    // lesson status
    status: {
        type: String,
        enum: [
            "draft",
            "published"
        ],
        default: "draft"
    },

    // content page checklist
    completion: {

        lessonDetails: {
            type: Boolean,
            default: false
        },

        contentUploaded: {
            type: Boolean,
            default: false
        },

        resourcesAdded: {
            type: Boolean,
            default: false
        },

        readyToPublish: {
            type: Boolean,
            default: false
        }
    },

    order: {
        type: Number,
        default: 0
    },

    resources: [resourceSchema],

    quiz: {
        type: quizSchema,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

},
{
    _id:true
});

// ================= MODULE =================

const moduleSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    order: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: [
            "draft",
            "completed"
        ],
        default: "draft"
    },

    lessons: [lessonSchema]

},
{
    _id:true
});

// ================= COURSE =================

const courseSchema = new mongoose.Schema(
{
    // instructor
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor"
    },

    instructor: String,

    // stepper
    currentStep: {
        type: Number,
        default: 1
    },

    // basic info
    title: {
        type: String,
        required: true,
        trim: true
    },

    subtitle: {
        type: String,
        default: ""
    },

    category: {
        type: String,
        required: true
    },

    topic: String,

    description: String,

    level: {
        type: String,
        enum: [
            "Beginner",
            "Intermediate",
            "Advanced"
        ]
    },

    language: {
        type: String,
        default: "English"
    },

    // media
    image: String,

    thumbnail: {
        type: String,
        default: ""
    },

    trailerVideo: String,

    // duration
    duration: String,

    estimatedDuration: {
        type: Number,
        default: 0
    },

    // pricing
    price: {
        type: Number,
        default: 0
    },

    discountPrice: Number,

    oldPrice: Number,

    pricing: {

        basePrice: Number,

        enableDiscount: Boolean,

        discountPercentage: Number,

        finalPrice: Number
    },

    emi: {
    enabled: {
        type: Boolean,
        default: false
    },

    plans: [
        {
            months: {
                type: Number,
                required: true
            },

            monthlyAmount: {
                type: Number,
                required: true
            }
        }
    ]
},

    // stats
    rating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    },

    totalStudents: {
        type: Number,
        default: 0
    },

    // curriculum summary
    curriculumSummary: {

        totalModules: {
            type: Number,
            default: 0
        },

        totalLessons: {
            type: Number,
            default: 0
        },

        totalQuizzes: {
            type: Number,
            default: 0
        },

        totalDuration: {
            type: Number,
            default: 0
        },

        completion: {
            type: Number,
            default: 0
        }
    },

    // options
    certificate: {
        type: Boolean,
        default: true
    },

    isFeatured: {
        type: Boolean,
        default: false
    },

    isPublished: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: [
            "draft",
            "published"
        ],
        default: "draft"
    },

    visibility: {
        type: String,
        enum: [
            "public",
            "private",
            "draft"
        ],
        default: "draft"
    },

    // content
    requirements: [String],

    whatYouWillLearn: [String],

    tags: [String],

    skills: [String],

    // curriculum
    modules: [moduleSchema],

    // course resources
    resources: [resourceSchema]

},
{
    timestamps:true
});

module.exports =
mongoose.model(
    "Course",
    courseSchema
);