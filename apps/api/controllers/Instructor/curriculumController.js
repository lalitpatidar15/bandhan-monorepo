const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Course = require("../../models/student/Course.js");
const CoursePerformance = require("../../models/student/CoursePerformance.js");

//======== instructor -basic info =======

exports.getBasicInfoInit = async (req, res) => {
    try {

        const categories = [
            "UI/UX Design",
            "Web Development",
            "Mobile Development",
            "Data Science",
            "Marketing",
            "Business"
        ];

        const levels = [
            "Beginner",
            "Intermediate",
            "Advanced"
        ];

        const languages = [
            "English",
            "Hindi",
            "Gujarati"
        ];

        const suggestedSkills = [
            "Figma",
            "Wireframing",
            "Prototyping",
            "React",
            "Node.js",
            "JavaScript",
            "UI Design",
            "UX Research"
        ];

        res.status(200).json({
            success: true,
            message: "Basic info page data fetched successfully",
            data: {
                stepper: {
                    currentStep: 1,
                    totalSteps: 4,
                    steps: [
                        {
                            id: 1,
                            name: "Basic Info",
                            active: true
                        },
                        {
                            id: 2,
                            name: "Curriculum",
                            active: false
                        },
                        {
                            id: 3,
                            name: "Content",
                            active: false
                        },
                        {
                            id: 4,
                            name: "Pricing",
                            active: false
                        }
                    ]
                },

                dropdowns: {
                    categories,
                    levels,
                    languages
                },

                suggestedSkills,

                defaultValues: {
                    title: "",
                    subtitle: "",
                    category: "",
                    level: "",
                    description: "",
                    thumbnail: "",
                    language: "English",
                    estimatedDuration: "",
                    skills: []
                },

                livePreview: {
                    title: "Course Title",
                    instructor: req.user.name,
                    thumbnail: "",
                    rating: 0,
                    price: 0
                },

                checklist: {
                    titleAdded: false,
                    categorySelected: false,
                    descriptionCompleted: false,
                    thumbnailUploaded: false
                }
            }
        });

    }
    catch (error) {
      console.error("Error in controllers/Instructor/curriculumController.js:", error);


        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};



exports.createCourse =async(req,res)=>{
try{

const{
title,
subtitle,
category,
level,
description,
language,
estimatedDuration
}=req.body;

if(
!title||
!category||
!level||
!description
){
return res
.status(400)
.json({
success:false,
message:
"Required fields missing"
});
}

let skills=[];

if(req.body.skills){

try{

skills=
JSON.parse(
req.body.skills
);

}
catch{
  console.error("Error in controllers/Instructor/curriculumController.js:", err);

skills=[];
}
}

const course=
await Course.create({

instructorId:
req.user.id,

title,

subtitle,

category,

level,

description,

thumbnail:
req.file?.path
||"",

language,

estimatedDuration:
parseInt(String(estimatedDuration).replace(/\D/g, ""), 10) || 0,

skills,

status:
"draft",

visibility:
"draft"
});

res.status(201)
.json({

success:true,

message:
"Course created successfully",

data:course
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500)
.json({
success:false,
message:
"Server error"
});
}
};



exports.getCourseDetails=async(req,res)=>{
try{

const course=
await Course.findOne({

_id:
req.params.courseId,

instructorId:
req.user.id

});

if(!course){

return res
.status(404)
.json({
success:false,
message:
"Course not found"
});
}

res.status(200)
.json({
success:true,
data:course
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500)
.json({
success:false,
message:
"Server error"
});
}
};



// ==== get my courses ======
exports.updateCourse=async(req,res)=>{
try{

const course=
await Course.findOne({

_id:
req.params.courseId,

instructorId:
req.user.id
});

if(!course){

return res
.status(404)
.json({
success:false,
message:
"Course not found"
});
}

course.title=
req.body.title
||
course.title;

course.subtitle=
req.body.subtitle
||
course.subtitle;

course.category=
req.body.category
||
course.category;

course.level=
req.body.level
||
course.level;

course.description=
req.body.description
||
course.description;

course.language=
req.body.language
||
course.language;

course.estimatedDuration=
req.body.estimatedDuration != null
  ? parseInt(String(req.body.estimatedDuration).replace(/\D/g, ""), 10) || course.estimatedDuration
  : course.estimatedDuration;

if(req.file){

course.thumbnail=
req.file.path;
}

if(req.body.skills){

course.skills=
JSON.parse(
req.body.skills
);
}

await course.save();

res.status(200)
.json({

success:true,

message:
"Course updated successfully",

data:course
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500)
.json({
success:false,
message:
"Server error"
});
}
};



exports.getMyCourses=async(req,res)=>{
try{

const courses=
await Course
.find({
instructorId:
req.user.id
})
.sort({
createdAt:-1
});

res.status(200)
.json({

success:true,

count:
courses.length,

data:courses
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500)
.json({
success:false,
message:
"Server error"
});
}
};

// ======= curriculum builder ======
exports.getCurriculumBuilder =async (req,res)=>{
try{

const course =
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

if(!course){
return res.status(404)
.json({
success:false,
message:"Course not found"
});
}

const totalModules =
course.modules.length;

const totalLessons =
course.modules.reduce(
(sum,module)=>
sum+
module.lessons.length,
0
);

const totalQuizzes =
course.modules.reduce((sum, module) => {
  return (
    sum +
    module.lessons.filter((lesson) => lesson.quiz).length
  );
}, 0);

const totalDuration =
course.modules.reduce(
(sum,module)=>
sum+
module.lessons.reduce(
(a,b)=>
a+(b.duration||0),
0
),
0
);

res.status(200).json({

success:true,

data:{
course:{
_id:course._id,
title:course.title
},

modules:
course.modules,

summary:{
totalModules,
totalLessons,
totalQuizzes,
totalDuration
}
}
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});
}
};


exports.addModule = async(req,res)=>{
try{

    const course =
    await Course.findOne({
        _id:req.params.courseId,
        instructorId:req.user.id
    });

    if(!course){
        return res.status(404).json({
            success:false,
            message:"Course not found"
        });
    }

    course.modules.push({

        title:req.body.title,

        order:
        course.modules.length+1,

        lessons:[]
    });

    await course.save();

    res.status(201).json({

        success:true,

        message:"Module added",

        data:
        course.modules[
            course.modules.length-1
        ]
    });

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


    res.status(500).json({
        success:false,
        message: "Server error"
    });
}
};


exports.editModule =async(req,res)=>{
try{

const course =
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

if(!course){
return res.status(404)
.json({
success:false,
message:"Course not found"
});
}

const module =
course.modules.id(
req.params.moduleId
);

if(!module){
return res.status(404)
.json({
success:false,
message:"Module not found"
});
}

module.title =
req.body.title;

await course.save();

res.status(200).json({

success:true,

message:
"Module updated",

data:module
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});
}
};

exports.reorderModules = async (req, res) => {
try {

const course =
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

if(!course){
return res.status(404)
.json({
success:false,
message:"Course not found"
});
}

const moduleOrder = Array.isArray(req.body.moduleOrder)
? req.body.moduleOrder.map((id) => String(id))
: [];

if(moduleOrder.length !== course.modules.length){
return res.status(400)
.json({
success:false,
message:"Module order payload does not match existing modules"
});
}

const existingIds = course.modules.map((moduleItem) => String(moduleItem._id));
const hasSameModules =
moduleOrder.every((moduleId) => existingIds.includes(moduleId)) &&
existingIds.every((moduleId) => moduleOrder.includes(moduleId));

if(!hasSameModules){
return res.status(400)
.json({
success:false,
message:"Module order contains invalid module identifiers"
});
}

const moduleMap = new Map(
course.modules.map((moduleItem) => [String(moduleItem._id), moduleItem])
);

course.modules = moduleOrder.map((moduleId, index) => {
const moduleItem = moduleMap.get(moduleId);
moduleItem.order = index + 1;
return moduleItem;
});

await course.save();

res.status(200).json({

success:true,

message:"Modules reordered",

data:course.modules
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});
}
};

exports.deleteModule =async(req,res)=>{
try{

const course =
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

if(!course){
return res.status(404)
.json({
success:false,
message:"Course not found"
});
}

const module =
course.modules.id(
req.params.moduleId
);

if(!module){
return res.status(404)
.json({
success:false,
message:"Module not found"
});
}

module.deleteOne();

await course.save();

res.status(200).json({

success:true,
message:
"Module deleted"
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});
}
};

exports.addLesson = async(req,res)=>{
try{

    const course =
    await Course.findOne({
        _id:req.params.courseId,
        instructorId:req.user.id
    });

    if(!course){
        return res.status(404).json({
            success:false,
            message:"Course not found"
        });
    }

    const module =
    course.modules.id(
        req.params.moduleId
    );

    if(!module){
        return res.status(404).json({
            success:false,
            message:"Module not found"
        });
    }

    let mcqData = {};

    if(req.body.mcqData){

        mcqData =
        typeof req.body.mcqData === "string"
        ?
        JSON.parse(
            req.body.mcqData
        )
        :
        req.body.mcqData;
    }

    module.lessons.push({

        title:
        req.body.title,

        type:
        req.body.type,

        description:
        req.body.description,

        videoUrl:
        req.body.videoUrl,

        pdfUrl:
        req.body.pdfUrl,

        pdfFileName:
        req.body.pdfFileName,

        mcqData,

        duration:
        parseInt(String(req.body.duration).replace(/\D/g, ""), 10) || 0,

        isPreview:
        req.body.isPreview,

        order:
        module.lessons.length+1,

        quiz:null
    });

    course.totalLessons += 1;

    await course.save();

    res.status(201).json({

        success:true,

        message:"Lesson added",

        data:
        module.lessons[
            module.lessons.length-1
        ]
    });

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


    res.status(500).json({
        success:false,
        message: "Server error"
    });
}
};


exports.editLesson=async(req,res)=>{
try{

const course=
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

const module=
course.modules.id(
req.params.moduleId
);

const lesson=
module.lessons.id(
req.params.lessonId
);

lesson.title=
req.body.title;

lesson.description=
req.body.description;

lesson.videoUrl=
req.body.videoUrl;

lesson.duration=
parseInt(String(req.body.duration).replace(/\D/g, ""), 10) || 0;

lesson.isPreview=
req.body.isPreview;

await course.save();

res.json({
success:true,
message:
"Lesson updated",
data:lesson
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);

res.status(500).json({
success:false,
message: "Server error"
});
}
};

exports.deleteLesson=async(req,res)=>{
try{

const course=
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

const module=
course.modules.id(
req.params.moduleId
);

module.lessons.pull(
req.params.lessonId
);

await course.save();

res.json({
success:true,
message:
"Lesson deleted"
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);

res.status(500).json({
success:false,
message: "Server error"
});
}
};


exports.addQuiz = async(req,res)=>{
try{

    const course =
    await Course.findOne({
        _id:req.params.courseId,
        instructorId:req.user.id
    });

    if(!course){
        return res.status(404).json({
            success:false,
            message:"Course not found"
        });
    }

    const module =
    course.modules.id(
        req.params.moduleId
    );

    if(!module){
        return res.status(404).json({
            success:false,
            message:"Module not found"
        });
    }

    const lesson =
    module.lessons.id(
        req.params.lessonId
    );

    if(!lesson){
        return res.status(404).json({
            success:false,
            message:"Lesson not found"
        });
    }

    if(lesson.quiz){
        return res.status(400).json({
            success:false,
            message:
            "Quiz already exists"
        });
    }

    const questions =
    typeof req.body.questions
    === "string"
    ?
    JSON.parse(
        req.body.questions
    )
    :
    req.body.questions;

    lesson.quiz = {

        title:
        req.body.title,

        description:
        req.body.description,

        passingMarks:
        req.body.passingMarks,

        questions,

        status:
        req.body.status
        || "draft"
    };

    course.totalQuizzes += 1;

    await course.save();

    res.status(201).json({

        success:true,

        message:"Quiz added",

        data:
        lesson.quiz
    });

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


    res.status(500).json({
        success:false,
        message: "Server error"
    });
}
};


exports.editQuiz=async(req,res)=>{
try{

const course=
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

const module=
course.modules.id(
req.params.moduleId
);

const quiz=
module.quizzes.id(
req.params.quizId
);

quiz.title=
req.body.title;

quiz.questions=
req.body.questions;

await course.save();

res.json({
success:true,
message:
"Quiz updated",
data:quiz
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);

res.status(500).json({
success:false,
message: "Server error"
});
}
};

// 
exports.deleteQuiz=async(req,res)=>{
try{

const course=
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

const module=
course.modules.id(
req.params.moduleId
);

module.quizzes.pull(
req.params.quizId
);

await course.save();

res.json({
success:true,
message:
"Quiz deleted"
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);

res.status(500).json({
success:false,
message: "Server error"
});
}
};

exports.saveCurriculumAndContinue = async (req,res)=>{
try{

const course =
await Course.findOne({
    _id:req.params.courseId,
    instructorId:req.user.id
});

if(!course){
return res.status(404).json({
success:false,
message:"Course not found"
});
}

const totalModules =
course.modules.length;

if(totalModules===0){
return res.status(400).json({
success:false,
message:"Add at least one module"
});
}

const totalLessons =
course.modules.reduce(
(a,b)=>a+b.lessons.length,
0
);

if(totalLessons===0){
return res.status(400).json({
success:false,
message:"Add at least one lesson"
});
}

course.currentStep = 3;

await course.save();

res.status(200).json({

success:true,

message:
"Curriculum saved successfully",

data:{
courseId:course._id,
nextStep:3,
redirectUrl:
`/instructor/course/${course._id}/content`
}
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});
}
};

// 
exports.getCurriculum=async(req,res)=>{
try{

const course=
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

if(!course){
return res.status(404)
.json({
success:false,
message:
"Course not found"
});
}

const totalModules=
course.modules.length;

const totalLessons=
course.modules.reduce(
(a,b)=>
a+b.lessons.length,
0
);

const totalDuration=
course.modules.reduce(
(a,b)=>
a+
b.lessons.reduce(
(x,y)=>
x+y.duration,
0
),
0
);

res.json({
success:true,
data:{
courseId:
course._id,

title:
course.title,

modules:
course.modules,

summary:{
totalModules,
totalLessons,
totalDuration,
completion:
65
}
}
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);

res.status(500)
.json({
success:false,
message: "Server error"
});
}
};


// === content upload ====
exports.getContentPage = async (req,res)=>{
try{

const course =
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

if(!course){
return res.status(404).json({
success:false,
message:"Course not found"
});
}

const module =
course.modules.id(
req.params.moduleId
);

if(!module){
return res.status(404).json({
success:false,
message:"Module not found"
});
}

const lesson =
module.lessons.id(
req.params.lessonId
);

if(!lesson){
return res.status(404).json({
success:false,
message:"Lesson not found"
});
}

const lessonDetails =
Boolean(
lesson.title &&
lesson.description
);

let contentUploaded=false;

if(
lesson.type==="video"
){
contentUploaded=
!!lesson.videoUrl;
}

if(
lesson.type==="pdf"
){
contentUploaded=
!!lesson.pdfUrl;
}

if(
lesson.type==="mcq"
){
contentUploaded=
lesson.mcqData &&
lesson.mcqData.questions &&
lesson.mcqData.questions.length>0;
}

const resourcesAdded=
lesson.resources.length>0;

const readyToPublish=
lessonDetails &&
contentUploaded;

res.status(200).json({

success:true,

data:{

stepper:{
currentStep:3,
totalSteps:4
},

course:{
_id:course._id,
title:course.title
},

module:{
_id:module._id,
title:module.title
},

lesson,

resources:
lesson.resources,

uploadChecklist:{
lessonDetails,
contentUploaded,
resourcesAdded,
readyToPublish
}
}
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});
}
};

exports.uploadVideo = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video required"
      });
    }

    const course = await Course.findOne({
      _id: req.params.courseId,
      instructorId: req.user.id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const module = course.modules.id(
      req.params.moduleId
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found"
      });
    }

    const lesson = module.lessons.id(
      req.params.lessonId
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    lesson.videoUrl = req.file.path;
    lesson.uploadStatus = "completed";
    lesson.uploadProgress = 100;

    course.markModified("modules");

    await course.save();

    const updatedCourse =
      await Course.findById(
        req.params.courseId
      );

    const updatedLesson =
      updatedCourse
        .modules
        .id(req.params.moduleId)
        .lessons
        .id(req.params.lessonId);

    return res.status(200).json({
      success: true,
      message: "Video uploaded",
      data: {
        lessonId: updatedLesson._id,
        videoUrl: updatedLesson.videoUrl,
        uploadStatus:
          updatedLesson.uploadStatus,
        uploadProgress:
          updatedLesson.uploadProgress
      }
    });

  } catch (error) {

    

    console.error("Error in Instructor/curriculumController.js:", error);
return res.status(500).json({
      success: false,
      message: "Server error",
      
    });
  }
};


exports.uploadResource=async(req,res)=>{
try{

if(!req.file){
return res.status(400)
.json({
success:false,
message:
"Resource required"
});
}

const course=
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

const module=
course.modules.id(
req.params.moduleId
);

const lesson=
module.lessons.id(
req.params.lessonId
);

lesson.resources.push({

fileName:
req.file.originalname,

fileUrl:
req.file.path,

fileSize:
req.file.size
});

await course.save();

res.status(201)
.json({

success:true,

message:
"Resource uploaded",

data:
lesson.resources[
lesson.resources.length-1
]
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500)
.json({
success:false,
message: "Server error"
});
}
};


exports.updateLesson =async(req,res)=>{
try{

const course=
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

if(!course){
return res.status(404)
.json({
success:false,
message:
"Course not found"
});
}

const module=
course.modules.id(
req.params.moduleId
);

if(!module){
return res.status(404)
.json({
success:false,
message:
"Module not found"
});
}

const lesson=
module.lessons.id(
req.params.lessonId
);

if(!lesson){
return res.status(404)
.json({
success:false,
message:
"Lesson not found"
});
}

lesson.title=
req.body.title ??
lesson.title;

lesson.description=
req.body.description ??
lesson.description;

lesson.duration=
req.body.duration != null
  ? parseInt(String(req.body.duration).replace(/\D/g, ""), 10) || lesson.duration
  : lesson.duration;

lesson.isPreview=
req.body.isPreview ??
lesson.isPreview;

await course.save();

res.status(200).json({

success:true,

message:
"Lesson updated",

data:lesson
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});
}
};


exports.deleteResource =async(req,res)=>{
try{

const course =
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

const module =
course.modules.id(
req.params.moduleId
);

const lesson =
module.lessons.id(
req.params.lessonId
);

lesson.resources.pull(
req.params.resourceId
);

await course.save();

res.status(200)
.json({

success:true,

message:
"Resource deleted"

});

}
catch(error){

console.error("createCourse error:", error);

res.status(500)
.json({
success:false,
message:error.message||"Server error"
});
}
};

exports.getUploadStatus = async (req, res) => {
  try {

    const course =
      await Course.findOne({
        _id: req.params.courseId,
        instructorId: req.user.id
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const module =
      course.modules.id(
        req.params.moduleId
      );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found"
      });
    }

    const lesson =
      module.lessons.id(
        req.params.lessonId
      );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    const lessonDetails =
      !!(
        lesson.title ||
        lesson.description ||
        lesson.duration
      );

    let contentUploaded =
      false;

    if (
      lesson.type === "video"
    ) {
      contentUploaded =
        !!(
          lesson.videoUrl &&
          lesson.videoUrl.trim()
        );
    }

    if (
      lesson.type === "pdf"
    ) {
      contentUploaded =
        !!(
          lesson.pdfUrl &&
          lesson.pdfUrl.trim()
        );
    }

    if (
      lesson.type === "mcq"
    ) {
      contentUploaded =
        !!(
          lesson.mcqData &&
          lesson.mcqData.questions &&
          lesson.mcqData.questions.length
        );
    }

    const resourcesAdded =
      lesson.resources &&
      lesson.resources.length > 0;

    return res.status(200).json({
      success: true,
      data: {

        lessonId:
          lesson._id,

        lessonType:
          lesson.type,

        lessonDetails,

        contentUploaded,

        resourcesAdded,

        readyToPublish:
          lessonDetails &&
          contentUploaded,

        progress: {

          lesson:
            lessonDetails
              ? "completed"
              : "pending",

          video:
            contentUploaded
              ? "completed"
              : "pending",

          resource:
            resourcesAdded
              ? "completed"
              : "pending"
        },

        debug: {

          title:
            lesson.title,

          description:
            lesson.description,

          videoUrl:
            lesson.videoUrl,

          pdfUrl:
            lesson.pdfUrl
        }
      }
    });

  } catch (error) {

    

    console.error("Error in Instructor/curriculumController.js:", error);
return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.saveLessonDraft =async(req,res)=>{
try{

const course =
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

if(!course){
return res.status(404).json({
success:false,
message:"Course not found"
});
}

const module =
course.modules.id(
req.params.moduleId
);

if(!module){
return res.status(404).json({
success:false,
message:"Module not found"
});
}

const lesson =
module.lessons.id(
req.params.lessonId
);

if(!lesson){
return res.status(404).json({
success:false,
message:"Lesson not found"
});
}

lesson.title =
req.body.title ??
lesson.title;

lesson.description =
req.body.description ??
lesson.description;

lesson.duration =
req.body.duration != null
  ? parseInt(String(req.body.duration).replace(/\D/g, ""), 10) || lesson.duration
  : lesson.duration;

lesson.isPreview =
req.body.isPreview ??
lesson.isPreview;

lesson.status = "draft";

await course.save();

res.status(200).json({

success:true,

message:
"Draft saved successfully",

data:{
lessonId:
lesson._id,
status:
lesson.status
}
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});
}
};

exports.saveLessonAndContinue =async(req,res)=>{
try{

const course =
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

if(!course){
return res.status(404).json({
success:false,
message:"Course not found"
});
}

const module =
course.modules.id(
req.params.moduleId
);

if(!module){
return res.status(404).json({
success:false,
message:"Module not found"
});
}

const lesson =
module.lessons.id(
req.params.lessonId
);

if(!lesson){
return res.status(404).json({
success:false,
message:"Lesson not found"
});
}

lesson.title =
req.body.title ??
lesson.title;

lesson.description =
req.body.description ??
lesson.description;

lesson.duration =
req.body.duration != null
  ? parseInt(String(req.body.duration).replace(/\D/g, ""), 10) || lesson.duration
  : lesson.duration;

lesson.isPreview =
req.body.isPreview ??
lesson.isPreview;

if(
lesson.type==="video" &&
!lesson.videoUrl
){
return res.status(400).json({
success:false,
message:
"Upload video first"
});
}

lesson.status =
"published";

course.currentStep = 4;

await course.save();

res.status(200).json({

success:true,

message:
"Lesson saved successfully",

data:{
lessonId:
lesson._id,

status:
lesson.status,

nextStep:4,

redirectUrl:
`/instructor/course/${course._id}/pricing`
}
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});
}
};


// ======== pricing & publish =======

exports.updatePricing = async(req,res)=>{
try{

const course =
await Course.findOne({
    _id:req.params.courseId,
    instructorId:req.user.id
});

if(!course){
return res.status(404).json({
success:false,
message:"Course not found"
});
}

const {
basePrice,
enableDiscount,
discountPercentage
} = req.body;

let finalPrice = basePrice;

if(enableDiscount){
finalPrice =
basePrice -
(basePrice * discountPercentage / 100);
}

course.pricing = {
basePrice,
enableDiscount,
discountPercentage,
finalPrice
};

await course.save();

res.status(200).json({
success:true,
message:
"Pricing updated successfully",
data:course.pricing
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});

}
};

exports.updateEMI = async (req, res) => {
  try {

    const course = await Course.findOne({
      _id: req.params.courseId,
      instructorId: req.user.id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const { enabled, plans } = req.body;

    if (!course.pricing || course.pricing.finalPrice == null) {
      return res.status(400).json({
        success: false,
        message: "Please save pricing before enabling EMI."
      });
    }

    if (!enabled) {

      course.emi = {
        enabled: false,
        plans: []
      };

      await course.save();

      return res.status(200).json({
        success: true,
        message: "EMI disabled successfully",
        data: course.emi
      });
    }

    if (!Array.isArray(plans) || plans.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one EMI plan is required."
      });
    }

    const finalPrice = Number(course.pricing.finalPrice);

    const emiPlans = [];

    for (const plan of plans) {

      if (!plan.months || Number(plan.months) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid EMI months."
        });
      }

      emiPlans.push({
        months: Number(plan.months),
        monthlyAmount: Number(
          (finalPrice / Number(plan.months)).toFixed(2)
        )
      });
    }

    course.emi = {
      enabled: true,
      plans: emiPlans
    };

    await course.save();

    return res.status(200).json({
      success: true,
      message: "EMI updated successfully",
      data: course.emi
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};
 


exports.updateVisibility = async(req,res)=>{
try{

const course =
await Course.findOne({
    _id:req.params.courseId,
    instructorId:req.user.id
});

if(!course){
return res.status(404).json({
success:false,
message:"Course not found"
});
}

course.visibility =
req.body.visibility;

await course.save();

res.status(200).json({
success:true,
message:
"Visibility updated successfully",
data:{
visibility:
course.visibility
}
});

}
catch(error){
  console.error("Error in controllers/Instructor/curriculumController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});

}
};


exports.getPricingPage = async (req, res) => {
  try {

    const course =
      await Course.findOne({
        _id: req.params.courseId,
        instructorId: req.user.id
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    let totalLessons = 0;
    let totalQuizzes = 0;
    let totalDuration = 0;

    // Calculate stats
    course.modules.forEach(module => {

      totalLessons +=
        module.lessons?.length || 0;

      module.lessons.forEach(lesson => {

        // quiz count
        if (
          lesson.quiz ||
          lesson.type === "mcq" ||
          lesson.type === "quiz"
        ) {
          totalQuizzes++;
        }

        // duration
        totalDuration +=
          lesson.duration || 0;
      });
    });

    // Publish readiness
    const publishReadiness = {

      basicInfo:
        !!course.title &&
        !!course.category &&
        !!course.description,

      curriculum:
        course.modules?.length > 0,

      content:
        course.modules.every(
          module =>
            module.lessons.every(
              lesson =>
                lesson.videoUrl ||
                lesson.pdfUrl ||
                lesson.quiz ||
                lesson.mcqData
            )
        ),

      pricing:
        !!(
          course.pricing &&
          course.pricing.finalPrice >= 0
        )
    };

    return res.status(200).json({

      success: true,

      data: {

        courseId:
          course._id,

        title:
          course.title,

        thumbnail:
          course.thumbnail,

        pricing:
          course.pricing || {
            basePrice: 0,
            enableDiscount: false,
            discountPercentage: 0,
            finalPrice: 0
          },

        emi:
          course.emi || {
            enabled: false,
            months: 0,
            monthlyAmount: 0
          },

        visibility:
          course.visibility,

        publishReadiness,

        estimatedRevenue:
          course.pricing?.finalPrice || 0,

        totalLessons,

        totalQuizzes,

        totalDuration
      }
    });

  }
  catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.getPublishStatus =async(req,res)=>{
try{

const course =
await Course.findOne({
_id:req.params.courseId,
instructorId:req.user.id
});

if(!course){
return res.status(404).json({
success:false,
message:"Course not found"
});
}

const basicInfo =
Boolean(
course.title &&
course.category &&
course.description
);

const curriculum =
course.modules.length>0 &&
course.modules.every(
m=>m.lessons.length>0
);

const content =
course.modules.every(
module =>
module.lessons.every(
lesson => {

if(
lesson.type==="video"
){
return !!(
lesson.videoUrl &&
lesson.videoUrl.trim()
);
}

if(
lesson.type==="pdf"
){
return !!(
lesson.pdfUrl &&
lesson.pdfUrl.trim()
);
}

if(
lesson.type==="mcq"
){
return !!(
lesson.mcqData &&
lesson.mcqData.questions &&
lesson.mcqData.questions.length
);
}

return false;

})
);

const pricing =
course.pricing &&
course.pricing.finalPrice>=0;

return res.status(200).json({

success:true,

data:{

basicInfo,

curriculum,

content,

pricing,

readyToPublish:
basicInfo &&
curriculum &&
content &&
pricing
}
});

}
catch (error) {



console.error("Error in Instructor/curriculumController.js:", error);
return res.status(500).json({
success:false,
message: "Server error"
});
}
};

exports.publishCourse = async (req, res) => {
  try {

    const course =
      await Course.findOne({
        _id: req.params.courseId,
        instructorId: req.user.id
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Basic Info Validation
    const basicInfo =
      Boolean(
        course.title &&
        course.category &&
        course.level &&
        course.description
      );

    // Curriculum Validation
    const curriculum =
      course.modules.length > 0 &&
      course.modules.every(
        module =>
          module.lessons.length > 0
      );

    // Content Validation
    const content =
      course.modules.every(
        module =>
          module.lessons.every(
            lesson => {

              if (
                lesson.type === "video"
              ) {
                return !!lesson.videoUrl;
              }

              if (
                lesson.type === "pdf"
              ) {
                return !!lesson.pdfUrl;
              }

              if (
                lesson.type === "mcq"
              ) {
                return (
                  lesson.mcqData &&
                  lesson.mcqData.questions &&
                  lesson.mcqData.questions.length > 0
                );
              }

              return false;
            }
          )
      );

    // Pricing Validation
    const pricing =
      course.pricing &&
      course.pricing.basePrice >= 0;

    if (!basicInfo) {
      return res.status(400).json({
        success: false,
        message:
          "Basic information incomplete"
      });
    }

    if (!curriculum) {
      return res.status(400).json({
        success: false,
        message:
          "Curriculum incomplete"
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message:
          "Course content incomplete"
      });
    }

    if (!pricing) {
      return res.status(400).json({
        success: false,
        message:
          "Pricing incomplete"
      });
    }

    // Publish Course
    course.status =
      "published";

    course.visibility =
      "public";

    course.isPublished =
      true;

    await course.save();

    return res.status(200).json({

      success: true,

      message:
        "Course published successfully",

      data: {

        courseId:
          course._id,

        status:
          course.status,

        visibility:
          course.visibility,

        isPublished:
          course.isPublished
      }
    });

  }
  catch (error) {

    

    console.error("Error in Instructor/curriculumController.js:", error);
return res.status(500).json({
      success: false,
      message:
        "Server error"
    });
  }
};
