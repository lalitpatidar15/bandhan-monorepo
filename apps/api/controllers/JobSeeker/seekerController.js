const JobSeeker = require("../../models/jobSeeker/JobSeeker.js");
const Job = require("../../models/jobPoster/Job.js");
const recruiters = require("../../models/jobPoster/Recruiter.js");
const Application = require("../../models/jobPoster/Application.js");
const SavedJob = require("../../models/jobSeeker/SavedJob.js");
const notificationService = require("../../services/notificationService.js");
const bcrypt = require("bcryptjs");
const { validatePassword } = require("../../utils/validatePassword.js");

const jwt = require("jsonwebtoken");
const uploadHelpers = require("../../middlewares/upload.js");

// ======== register ===========
exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
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

        const existingUser = await JobSeeker.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await JobSeeker.create({
            fullName,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
            },
        });
    } catch (error) {
        
        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
// =========== login ===========
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required",
            });
        }

        const user = await JobSeeker.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // JWT Token Generate
        const token = jwt.sign(
            {
                id: user._id,
                role: "jobseeker",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
            },
        });
    } catch (error) {
        
        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ========= update profile =========
exports.updateProfile = async (req, res) => {

    try {

        const user = await JobSeeker.findById(req.user.id);

        if (!user) {

            return res.status(404).json({

                success: false,
                message: "User not found"

            });

        }

        const {
            fullName,
            location,
            phone,
            currentRole,
            experienceLevel,
            skills,
            college,
            degree,
            graduationYear,
            preferredRoles,
            jobType,
            salaryExpectation
        } = req.body;

        if (fullName) user.fullName = fullName;

        if (location) user.location = location;

        if (phone) user.phone = phone;

        if (currentRole) user.currentRole = currentRole;

        if (experienceLevel) user.experienceLevel = experienceLevel;

        if (college) user.college = college;

        if (degree) user.degree = degree;

        if (graduationYear) user.graduationYear = graduationYear;

        if (salaryExpectation) user.salaryExpectation = salaryExpectation;

        if (skills) {

            user.skills = Array.isArray(skills)
                ? skills
                : JSON.parse(skills);

        }

        if (preferredRoles) {

            user.preferredRoles = Array.isArray(preferredRoles)
                ? preferredRoles
                : JSON.parse(preferredRoles);

        }

        if (jobType) {

            user.jobType = Array.isArray(jobType)
                ? jobType
                : JSON.parse(jobType);

        }

        if (req.file) {

            user.profilePhoto = req.file.path;

        }

        await user.save();

        return res.status(200).json({

            success: true,
            message: "Profile updated successfully",

            data: user

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({

            success: false,
            message: "Server error"

        });

    }

};
// ======= upload resume =========
exports.downloadResume = async (req, res) => {
    try {
        const seeker = await JobSeeker.findById(req.user.id);

        if (!seeker || !seeker.resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        const resumePath = seeker.resume;
        
        if (!resumePath || resumePath.includes("dummy.pdf") || resumePath.includes("w3.org")) {
            return res.status(404).json({
                success: false,
                message: "Resume not uploaded yet. Please upload your resume first."
            });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${seeker.fullName}_Resume.pdf"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        if (resumePath.startsWith("/uploads/") || !resumePath.startsWith("http")) {
            const path = require("path");
            const fs = require("fs");
            
            let filePath = resumePath;
            if (resumePath.startsWith("/uploads/")) {
                filePath = path.join(__dirname, "../../uploads", resumePath.replace("/uploads/", ""));
            } else if (!resumePath.startsWith("/")) {
                filePath = path.join(__dirname, "../../uploads", resumePath);
            }

            if (fs.existsSync(filePath)) {
                return res.sendFile(filePath);
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Resume file not found on server"
                });
            }
        } else {
            const https = require("https");
            const http = require("http");

            try {
                const protocol = resumePath.startsWith("https") ? https : http;
                
                const request = protocol.get(resumePath, { timeout: 30000 }, (fileRes) => {
                    console.log("Resume stream status:", fileRes.statusCode);
                    
                    if (fileRes.statusCode === 401 || fileRes.statusCode === 403) {
                        res.status(401).json({
                            success: false,
                            message: "Resume access denied. Try uploading again."
                        });
                        return;
                    }

                    if (fileRes.statusCode !== 200) {
                        res.status(404).json({
                            success: false,
                            message: `Resume not accessible (${fileRes.statusCode})`
                        });
                        return;
                    }

                    fileRes.pipe(res);
                });

                request.on("error", (err) => {
                    console.error("HTTP request error:", "Server error");
                    if (!res.headersSent) {
                        res.status(500).json({
                            success: false,
                            message: "Failed to fetch resume"
                        });
                    }
                });

                res.on("error", (err) => {
                    console.error("Response error:", "Server error");
                    request.abort();
                });

            } catch (err) {
                console.error("Stream error:", err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: "Failed to stream resume"
                    });
                }
            }
        }

    } catch (error) {
        console.error("Download resume error:", "Server error");
        return res.status(500).json({
            success: false,
            message: "Failed to download resume",
            error: "Failed to download resume"
        });
    }
};

exports.getResume = async (req, res) => {
    try {
        const seeker = await JobSeeker.findById(req.user.id);

        if (!seeker || !seeker.resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        const resumeUrl = uploadHelpers.normalizeResumeUrl(seeker.resume);

        return res.status(200).json({
            success: true,
            message: "Resume fetched successfully",
            data: {
                resumeUrl: resumeUrl,
                downloadUrl: `/api/seeker/resume/download`,
                fileName: seeker.fullName + "_Resume.pdf"
            }
        });

    } catch (error) {
        
        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

exports.uploadResume = async (req, res) => {
    try {
        console.log("========== Upload Resume ==========");

        console.log("User ID:", req.user);

        console.log("Req.file:", req.file);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume required"
            });
        }

        const user = await JobSeeker.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.log("Cloudinary File Object:");
        console.log(req.file);

        console.log("Path:", req.file.path);
        console.log("Secure URL:", req.file.secure_url);
        console.log("Filename:", req.file.filename);
        console.log("Mimetype:", req.file.mimetype);
        console.log("Size:", req.file.size);

        const resumeUrl = req.file.secure_url || req.file.path;

        user.resume = resumeUrl;

        await user.save();

        console.log("Resume Saved:", resumeUrl);

        return res.status(200).json({
            success: true,
            message: "Resume uploaded successfully",
            resume: resumeUrl,
            file: req.file
        });

    } catch (error) {

        console.log("========= ERROR =========");
        console.log(error);
        console.log("Server error");
        console.log(error.stack);

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error
        });
    }
};

exports.deleteResume = async (req, res) => {

    try {

        const user = await JobSeeker.findById(req.user.id);

        user.resume = "";

        await user.save();

        res.status(200).json({

            success: true,
            message: "Resume deleted"

        })

    } catch (error) {
      console.error("Error in controllers/JobSeeker/seekerController.js:", error);


        res.status(500).json({

            success: false,
            message: "Server error"

        })

    }

}

exports.getProfile = async (req, res) => {

    try {

        const user = await JobSeeker.findById(req.user.id).select("-password");

        res.status(200).json({

            success: true,

            data: user

        })

    } catch (error) {
      console.error("Error in controllers/JobSeeker/seekerController.js:", error);


        res.status(500).json({

            success: false,

            message: "Server error"

        })

    }

}

// ========= job listings =======
exports.getAllJobs = async (req, res) => {

    try {

        let filter = {
            status: "active",
            isPublished: true
        };

        const {
            q,
            jobCategory,
            jobType,
            experienceLevel,
            location,
            remoteAvailable,
            salaryMin,
            salaryMax,
            sort,
            page = 1,
            limit = 12,
        } = req.query;

        if (jobCategory) filter.jobCategory = jobCategory;
        if (jobType) filter.jobType = jobType;
        if (experienceLevel) filter.experienceLevel = experienceLevel;
        if (remoteAvailable === "true") filter.remoteAvailable = true;
        if (location) filter.location = { $regex: location, $options: "i" };

        if (salaryMin || salaryMax) {
            filter.salaryMax = {};
            if (salaryMax) filter.salaryMax.$gte = Number(salaryMin);
            if (salaryMin) filter.salaryMin = {};
            if (salaryMin) filter.salaryMin.$lte = Number(salaryMax);
        }

        if (q) {
            filter.$or = [
                { jobTitle: { $regex: q, $options: "i" } },
                { location: { $regex: q, $options: "i" } },
                { skills: { $regex: q, $options: "i" } },
                { aboutRole: { $regex: q, $options: "i" } },
            ];
        }

        let query = Job.find(filter).populate(
            "recruiterId",
            "companyName companyLogo industry"
        );

        if (sort === "newest") query = query.sort({ createdAt: -1 });
        else if (sort === "oldest") query = query.sort({ createdAt: 1 });
        else if (sort === "salary-high") query = query.sort({ salaryMax: -1 });
        else query = query.sort({ createdAt: -1 });

        const total = await Job.countDocuments(filter);
        const jobs = await query
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        let savedJobIds = [];

        if (req.user && req.user.id) {
            const savedJobs = await SavedJob.find({
                seekerId: req.user.id
            }).select("jobId");

            savedJobIds = savedJobs.map(item =>
                item.jobId.toString()
            );
        }

        const formattedJobs = jobs.map(job => {
            const item = job.toObject();
            item.isSaved = savedJobIds.includes(job._id.toString());
            return item;
        });

        return res.status(200).json({
            success: true,
            totalJobs: total,
            jobs: formattedJobs,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

// ================= JOB DETAILS =================
exports.getJobDetails = async (req, res) => {

    try {

        console.log("Job Id :", req.params.jobId);

        console.log("User :", req.user);

        const { jobId } = req.params;

        const seekerId = req.user.id;

        const job = await Job.findOne({

            _id: jobId,

            status: "active",

            isPublished: true

        })

        .populate(

            "recruiterId",

            `
            companyName
            companyLogo
            companyEmail
            industry
            companySize
            websiteUrl
            description
            headquartersAddress
            `

        );

        if (!job) {

            return res.status(404).json({

                success: false,

                message: "Job not found"

            });

        }

        job.views += 1;

        await job.save();

        const savedJob = await SavedJob.findOne({

            seekerId,

            jobId

        });

        const similarJobs = await Job.find({

            _id: { $ne: job._id },

            jobCategory: job.jobCategory,

            status: "active",

            isPublished: true

        })

        .populate(

            "recruiterId",

            "companyName companyLogo"

        )

        .limit(5);

        const savedJobs = await SavedJob.find({

            seekerId

        }).select("jobId");

        const savedJobIds = savedJobs.map(item =>
            item.jobId.toString()
        );

        return res.status(200).json({

            success: true,

            data: {

                jobId: job._id,

                jobTitle: job.jobTitle,

                company: {

                    recruiterId: job.recruiterId._id,

                    companyName: job.recruiterId.companyName,

                    companyLogo: job.recruiterId.companyLogo,

                    companyEmail: job.recruiterId.companyEmail,

                    industry: job.recruiterId.industry,

                    companySize: job.recruiterId.companySize,

                    websiteUrl: job.recruiterId.websiteUrl,

                    description: job.recruiterId.description,

                    headquartersAddress:
                    job.recruiterId.headquartersAddress

                },

                jobCategory: job.jobCategory,

                jobType: job.jobType,

                experienceLevel: job.experienceLevel,

                salaryMin: job.salaryMin,

                salaryMax: job.salaryMax,

                salaryCurrency: job.salaryCurrency,

                location: job.location,

                remoteAvailable: job.remoteAvailable,

                aboutRole: job.aboutRole,

                responsibilities: job.responsibilities,

                skills: job.skills,

                applicationDeadline: job.applicationDeadline,

                openings: job.openings,

                totalApplicants: job.totalApplicants,

                totalViews: job.views,

                postedOn: job.createdAt,

                isSaved: !!savedJob,

                shareUrl: `${req.protocol}://${req.get("host")}/jobs/${job._id}`,

                similarJobs: similarJobs.map(item => ({

                    jobId: item._id,

                    jobTitle: item.jobTitle,

                    companyName: item.recruiterId.companyName,

                    companyLogo: item.recruiterId.companyLogo,

                    location: item.location,

                    salaryMin: item.salaryMin,

                    salaryMax: item.salaryMax,

                    jobType: item.jobType,

                    isSaved: savedJobIds.includes(
                        item._id.toString()
                    )

                }))

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.saveJob = async (req, res) => {

    try {

        const { jobId } = req.params;

        const seekerId = req.user.id;

        const job = await Job.findById(jobId);

        if (!job) {

            return res.status(404).json({

                success: false,
                message: "Job not found"

            });

        }

        const alreadySaved = await SavedJob.findOne({

            seekerId,
            jobId

        });

        if (alreadySaved) {

            return res.json({

                success: true,
                alreadySaved: true,
                message: "Job already saved",
                savedJob: alreadySaved

            });

        }

        const savedJob = await SavedJob.create({

            seekerId,
            jobId

        });

        return res.status(201).json({

            success: true,
            alreadySaved: false,
            message: "Job saved successfully",
            savedJob

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({

            success: false,
            message: "Server error"

        });

    }

};

exports.removeSavedJob = async (req, res) => {

    try {

        const { jobId } = req.params;

        const seekerId = req.user.id;

        const savedJob = await SavedJob.findOneAndDelete({

            seekerId,
            jobId

        });

        if (!savedJob) {

            return res.json({

                success: true,
                alreadyRemoved: true,
                message: "Job already removed from saved jobs"

            });

        }

        return res.status(200).json({

            success: true,
            alreadyRemoved: false,
            message: "Job removed from saved jobs"

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({

            success: false,
            message: "Server error"

        });

    }

};

exports.getSavedJobs = async (req, res) => {

    try {

        const seekerId = req.user.id;

        const savedJobs = await SavedJob.find({

            seekerId

        })

        .populate({

            path: "jobId",

            populate: {

                path: "recruiterId",

                select: "companyName companyLogo industry"

            }

        })

        .sort({

            createdAt: -1

        });

        return res.status(200).json({

            success: true,

            totalSavedJobs: savedJobs.length,

            savedJobs

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({

            success: false,
            message: "Server error"

        });

    }

};

exports.getJobShareLink = async (req, res) => {

    try {

        const { jobId } = req.params;

        const job = await Job.findById(jobId);

        if (!job) {

            return res.status(404).json({
                success: false,
                message: "Job not found"
            });

        }

        const baseUrl =
            process.env.FRONTEND_URL ||
            `${req.protocol}://${req.get("host")}`;

        return res.status(200).json({

            success: true,

            data: {

                jobId: job._id,

                jobTitle: job.jobTitle,

                shareUrl: `${baseUrl}/jobs/${job._id}`

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

// ========= job application =========
exports.getApplyPage = async (req, res) => {

    try {

        const job = await Job.findOne({

            _id: req.params.jobId,

            status: "active",

            isPublished: true

        }).populate(

            "recruiterId",

            "companyName companyLogo companyEmail industry companySize websiteUrl description headquartersAddress"

        );

        if (!job) {

            return res.status(404).json({

                success: false,

                message: "Job not found"

            });

        }

        const seeker = await JobSeeker.findById(req.user.id);

        if (!seeker) {

            return res.status(404).json({

                success: false,

                message: "Job seeker not found"

            });

        }

        return res.status(200).json({

            success: true,

            data: {

                jobId: job._id,

                jobTitle: job.jobTitle,

                company: {

                    recruiterId: job.recruiterId._id,

                    companyName: job.recruiterId.companyName,

                    companyLogo: job.recruiterId.companyLogo,

                    companyEmail: job.recruiterId.companyEmail,

                    industry: job.recruiterId.industry,

                    companySize: job.recruiterId.companySize,

                    website: job.recruiterId.websiteUrl,

                    description: job.recruiterId.description,

                    headquarters: job.recruiterId.headquartersAddress

                },

                jobCategory: job.jobCategory,

                location: job.location,

                salaryMin: job.salaryMin,

                salaryMax: job.salaryMax,

                salaryCurrency: job.salaryCurrency,

                experienceLevel: job.experienceLevel,

                jobType: job.jobType,

                remoteAvailable: job.remoteAvailable,

                aboutRole: job.aboutRole,

                responsibilities: job.responsibilities,

                skills: job.skills,

                applicationDeadline: job.applicationDeadline,

                openings: job.openings,

                totalApplicants: job.totalApplicants,

                totalViews: job.views,

                postedOn: job.createdAt,

                resume: {

                    resumeUrl: seeker.resume || ""

                },

                form: {

                    coverLetter: "",

                    expectedSalary: 0,

                    salaryType: "Fixed",

                    additionalAnswer: ""

                }

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.replaceResume = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,
                message: "Resume file is required"

            });

        }

        const seeker =
            await JobSeeker.findById(req.user.id);

        if (!seeker) {

            return res.status(404).json({

                success: false,
                message: "Job seeker not found"

            });

        }

        let resumeUrl = req.file.path;
        
        if (!resumeUrl.startsWith("http") && !resumeUrl.startsWith("/")) {
            resumeUrl = `/uploads/${req.file.filename || req.file.originalname}`;
        }

        seeker.resume = resumeUrl;

        await seeker.save();

        return res.status(200).json({

            success: true,

            message: "Resume replaced successfully",

            data: {

                seekerId: seeker._id,

                resume: seeker.resume,

                updatedAt: seeker.updatedAt

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.saveDraft = async (req, res) => {

    try {

        const {
            coverLetter,
            expectedSalary,
            salaryType,
            additionalAnswer
        } = req.body;

        const job = await Job.findOne({
            _id: req.params.jobId,
            status: "active",
            isPublished: true
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const seeker = await JobSeeker.findById(req.user.id);

        if (!seeker) {
            return res.status(404).json({
                success: false,
                message: "Job seeker not found"
            });
        }

        let application = await Application.findOne({
            jobId: job._id,
            seekerId: seeker._id
        });

        // Already submitted
        if (application && application.status === "Submitted") {
            return res.status(400).json({
                success: false,
                message: "Application already submitted. Draft cannot be updated."
            });
        }

        if (!application) {
            application = new Application({
                jobId: job._id,
                recruiterId: job.recruiterId,
                seekerId: seeker._id
            });
        }

        application.coverLetter = coverLetter || "";
        application.expectedSalary = expectedSalary || 0;
        application.salaryType = salaryType || "Fixed";
        application.additionalAnswer = additionalAnswer || "";
        application.resume = uploadHelpers.normalizeResumeUrl(seeker.resume);

        application.status = "Draft";
        application.isDraft = true;

        await application.save();

        return res.status(200).json({
            success: true,
            message: "Application saved as draft",
            data: {
                applicationId: application._id,
                jobId: application.jobId,
                recruiterId: application.recruiterId,
                seekerId: application.seekerId,
                status: application.status,
                submittedAt: application.submittedAt
            }
        });

    } catch (error) {

        

        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};

exports.getDraft = async (req, res) => {

    try {

        const job = await Job.findOne({

            _id: req.params.jobId,

            status: "active",

            isPublished: true

        });

        if (!job) {

            return res.status(404).json({

                success: false,

                message: "Job not found"

            });

        }

        const seeker = await JobSeeker.findById(req.user.id);

        if (!seeker) {

            return res.status(404).json({

                success: false,

                message: "Job seeker not found"

            });

        }

        const application =
            await Application.findOne({

                jobId: job._id,

                seekerId: seeker._id,

                isDraft: true

            });

        if (!application) {

            return res.status(200).json({

                success: true,

                message: "No draft found",

                data: null

            });

        }

        return res.status(200).json({

            success: true,

            message: "Draft fetched successfully",

            data: {

                applicationId:
                    application._id,

                jobId:
                    application.jobId,

                recruiterId:
                    application.recruiterId,

                seekerId:
                    application.seekerId,

                resume:
                    uploadHelpers.normalizeResumeUrl(application.resume),

                coverLetter:
                    application.coverLetter,

                expectedSalary:
                    application.expectedSalary,

                salaryType:
                    application.salaryType,

                additionalAnswer:
                    application.additionalAnswer,

                status:
                    application.status,

                isDraft:
                    application.isDraft,

                createdAt:
                    application.createdAt,

                updatedAt:
                    application.updatedAt

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.submitApplication = async (req, res) => {

    try {

        const {
            coverLetter,
            expectedSalary,
            salaryType,
            additionalAnswer
        } = req.body;

        const job = await Job.findOne({

            _id: req.params.jobId,
            status: "active",
            isPublished: true

        });

        if (!job) {

            return res.status(404).json({

                success: false,
                message: "Job not found"

            });

        }

        const seeker = await JobSeeker.findById(req.user.id);

        if (!seeker) {

            return res.status(404).json({

                success: false,
                message: "Job Seeker not found"

            });

        }

        if (!seeker.resume) {

            return res.status(400).json({

                success: false,
                message: "Please upload resume first"

            });

        }

        let application = await Application.findOne({

            jobId: job._id,
            seekerId: seeker._id

        });

        let isNewApplication = false;

        if (application && application.status === "Submitted") {

            return res.status(400).json({

                success: false,
                message: "You have already applied for this job."

            });

        }

        if (!application) {

            application = new Application({

                jobId: job._id,
                recruiterId: job.recruiterId,
                seekerId: seeker._id

            });

            isNewApplication = true;

        }

        application.coverLetter = coverLetter;
        application.expectedSalary = expectedSalary;
        application.salaryType = salaryType;
        application.additionalAnswer = additionalAnswer;
        application.resume = uploadHelpers.normalizeResumeUrl(seeker.resume);
        application.status = "Submitted";
        application.isDraft = false;
        application.submittedAt = new Date();

        await application.save();

        if (isNewApplication) {

            await Job.findByIdAndUpdate(

                job._id,

                {

                    $inc: {

                        totalApplicants: 1

                    }

                }

            );

        }

        // ===========================
        // Notification To Recruiter
        // ===========================

        await notificationService.createNotification({

    userId: job.recruiterId,

    userModel: "Recruiter",

    senderId: seeker._id,

    senderModel: "JobSeeker",

    title: "New Job Application",

    message: `${seeker.fullName} applied for ${job.jobTitle}`,

    type: "application",

    referenceId: application._id,

    referenceModel: "Application",

    redirectUrl: `/recruiter/applications/${application._id}`,

    icon: "application"

});

        return res.status(201).json({

            success: true,

            message: "Application submitted successfully",

            data: application

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/seekerController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};
