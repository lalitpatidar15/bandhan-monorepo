const mongoose = require("mongoose");
const Recruiter = require("../../models/jobPoster/Recruiter.js");
const Job = require("../../models/jobPoster/Job.js");
const Application = require("../../models/jobPoster/Application.js");
const JobSeeker = require("../../models/jobSeeker/JobSeeker.js");
const Interview = require("../../models/jobPoster/Interview.js");
const notificationService = require("../../services/notificationService.js");
const bcrypt = require("bcryptjs");
const { validatePassword } = require("../../utils/validatePassword.js");

const jwt = require("jsonwebtoken");


// ================= REGISTER =================
exports.register = async (req, res) => {
    try {

        const {
            companyName,
            companyEmail,
            password
        } = req.body;

        if (
            !companyName ||
            !companyEmail ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: passwordErrors[0],
            });
        }

        const existingRecruiter =
            await Recruiter.findOne({
                companyEmail
            });

        if (existingRecruiter) {
            return res.status(400).json({
                success: false,
                message: "Recruiter already exists"
            });
        }

        const recruiter =
            await Recruiter.create({
                companyName,
                companyEmail,
                password
            });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            redirectTo: "/company-profile",
            data: {
                recruiterId: recruiter._id,
                companyName: recruiter.companyName,
                companyEmail: recruiter.companyEmail,
                profileCompleted: recruiter.profileCompleted
            }
        });

    }
    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
    try {

        const {
            companyEmail,
            password
        } = req.body;

        if (
            !companyEmail ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const recruiter =
            await Recruiter.findOne({
                companyEmail
            });

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found"
            });
        }

        const isMatch =
            await bcrypt.compare(
                password,
                recruiter.password
            );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        const token =
            jwt.sign(
                {
                    id: recruiter._id,
                    role: recruiter.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        let redirectTo = "/company-profile";

        if (recruiter.profileCompleted) {
            redirectTo = "/dashboard";
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            redirectTo,
            data: {
                recruiterId: recruiter._id,
                companyName: recruiter.companyName,
                companyEmail: recruiter.companyEmail,
                profileCompleted: recruiter.profileCompleted,
                role: recruiter.role
            }
        });

    }
    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};

// =========== company profile setup ===========
exports.getCompanyProfile = async (req, res) => {
    try {

        const recruiter =
            await Recruiter.findById(req.user.id)
                .select("-password");

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                recruiterId:
                    recruiter._id,

                companyEmail:
                    recruiter.companyEmail,

                companyName:
                    recruiter.companyName || "",

                industry:
                    recruiter.industry || "",

                companySize:
                    recruiter.companySize || "",

                websiteUrl:
                    recruiter.websiteUrl || "",

                companyLogo:
                    recruiter.companyLogo || "",

                companyTagline:
                    recruiter.companyTagline || "",

                description:
                    recruiter.description || "",

                headquartersAddress:
                    recruiter.headquartersAddress || "",

                additionalLocations:
                    recruiter.additionalLocations || [],

                profileCompleted:
                    recruiter.profileCompleted,

                role:
                    recruiter.role,

                createdAt:
                    recruiter.createdAt,

                updatedAt:
                    recruiter.updatedAt
            }
        });

    }
    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};

exports.saveCompanyProfile = async (req, res) => {
    try {
           console.log("BODY :", req.body); 
               console.log("FILE :", req.file);
 
        const {

            companyName,
            industry,
            companySize,
            websiteUrl,
            companyTagline,
            description,
            headquartersAddress,
            additionalLocations
        } = req.body;

        const recruiter =
            await Recruiter.findById(req.user.id);
 
            console.log("req.user.id :", req.user.id);
            console.log("Recruiter :", recruiter);

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found"
            });
        }

        recruiter.companyName =
            companyName;

        recruiter.industry =
            industry;

        recruiter.companySize =
            companySize;

        recruiter.websiteUrl =
            websiteUrl;

        if (req.file) {
        recruiter.companyLogo = req.file.path;
         console.log("Assigned Logo:", recruiter.companyLogo);
        }

        recruiter.companyTagline =
            companyTagline;

        recruiter.description =
            description;

        recruiter.headquartersAddress =
            headquartersAddress;

        recruiter.additionalLocations =
            additionalLocations
                ? additionalLocations
                    .split(",")
                    .map(location => location.trim())
                : [];

        recruiter.profileCompleted =
            true;

        await recruiter.save();
        const updatedRecruiter = await Recruiter.findById(req.user.id);
 
        console.log("Recruiter After Save:", updatedRecruiter);
        console.log("Saved companyLogo:", updatedRecruiter.companyLogo);

        return res.status(200).json({
            success: true,
            message: "Company profile saved successfully",
            data: {
                recruiterId:
                    recruiter._id,

                companyEmail:
                    recruiter.companyEmail,

                companyName:
                    recruiter.companyName,

                industry:
                    recruiter.industry,

                companySize:
                    recruiter.companySize,

                websiteUrl:
                    recruiter.websiteUrl,

                companyLogo:
                    recruiter.companyLogo,

                companyTagline:
                    recruiter.companyTagline,

                description:
                    recruiter.description,

                headquartersAddress:
                    recruiter.headquartersAddress,

                additionalLocations:
                    recruiter.additionalLocations,

                profileCompleted:
                    recruiter.profileCompleted,

                role:
                    recruiter.role,

                createdAt:
                    recruiter.createdAt,

                updatedAt:
                    recruiter.updatedAt
            }
        });

    }
    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};

// ============== dashboard ===============
exports.getRecruiterDashboard = async (req, res) => {
    try {

        const recruiterId = req.user.id;
         console.log("Logged Recruiter:", recruiterId);
         

        const allJobs = await Job.find();

        console.log("All Jobs:");
        console.log(allJobs.map(job => ({
            jobTitle: job.jobTitle,
            recruiterId: job.recruiterId.toString()
        })));
  

        const search =
            req.query.search || "";

        const status =
            req.query.status || "all";

        const sort =
            req.query.sort || "newest";

        let filter = {
            recruiterId
        };

        if (status !== "all") {
            filter.status = status;
        }

        if (search) {
            filter.jobTitle = {
                $regex: search,
                $options: "i"
            };
        }

        let sortOption = {
            createdAt: -1
        };

        if (sort === "oldest") {
            sortOption = {
                createdAt: 1
            };
        }

        const jobs =
            await Job.find(filter)
                .populate(
                    "recruiterId",
                    "companyName companyLogo"
                )
                .sort(sortOption);

        const activeJobs = await Job.countDocuments({
            recruiterId,
            status: "active",
            isPublished: true
        });

        const draftJobs = await Job.countDocuments({
            recruiterId,
            status: "draft",
            isDraft: true
        });

        const closedJobs = await Job.countDocuments({
            recruiterId,
            status: "closed"
        });

        // Count applications from Job model
        const totalApplicants = jobs.reduce((sum, job) => {
            return sum + (job.totalApplicants || 0);
        }, 0);

        return res.status(200).json({

            success: true,

            data: {

                stats: {

                    activeJobs,

                    draftJobs,

                    closedJobs,

                    totalApplicants

                },

                jobs

            }

        });

    }
    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }
};

// ================= create job posting ===============
exports.createJob = async (req, res) => {
    try {
        const {
            jobId,
            jobTitle,
            jobCategory,
            jobType,
            experienceLevel,
            salaryMin,
            salaryMax,
            location,
            remoteAvailable,
            aboutRole,
            responsibilities,
            skills,
            applicationDeadline,
            openings

        } = req.body;

        if (!jobTitle) {
            return res.status(400).json({
                success: false,
                message: "Job title is required"
            });
        }

        let job;

        if (jobId) {

            job =
                await Job.findOne({

                    _id: jobId,
                    recruiterId: req.user.id

                });

            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: "Job not found"
                });
            }

        } else {

            job = new Job({

                recruiterId: req.user.id

            });

        }

        job.jobTitle = jobTitle;

        job.jobCategory = jobCategory;

        job.jobType = jobType;

        job.experienceLevel = experienceLevel;

        job.salaryMin = salaryMin;

        job.salaryMax = salaryMax;

        job.location = location;

        job.remoteAvailable = remoteAvailable;

        job.aboutRole = aboutRole;

        job.responsibilities =
            responsibilities || [];

        job.skills =
            skills || [];

        job.applicationDeadline =
            applicationDeadline;

        job.openings = openings;

        job.currentStep = 2;

        job.completedSteps = [1];

        job.status = "draft";

        job.isDraft = true;

        job.isPublished = false;


        await job.save();

        return res.status(200).json({

            success: true,

            message: "Basic information saved successfully",

            data: {

                jobId: job._id,

                recruiterId: job.recruiterId,

                jobTitle: job.jobTitle,

                jobCategory: job.jobCategory,

                jobType: job.jobType,

                experienceLevel: job.experienceLevel,

                salaryMin: job.salaryMin,

                salaryMax: job.salaryMax,

                location: job.location,

                remoteAvailable: job.remoteAvailable,

                aboutRole: job.aboutRole,

                responsibilities: job.responsibilities,

                skills: job.skills,

                applicationDeadline:
                    job.applicationDeadline,

                openings: job.openings,

                currentStep:
                    job.currentStep,

                status:
                    job.status,

                createdAt:
                    job.createdAt,

                updatedAt:
                    job.updatedAt

            }

        });

    }
    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }
};

exports.saveDraft = async (req, res) => {
    try {

        const job =
            await Job.findOne({

                _id: req.params.jobId,
                recruiterId: req.user.id

            });

        if (!job) {

            return res.status(404).json({

                success: false,
                message: "Job not found"

            });

        }

        job.status = "draft";

        job.isDraft = true;

        job.isPublished = false;

        await job.save();

        return res.status(200).json({

            success: true,

            message: "Job saved as draft successfully",

            data: {

                jobId: job._id,

                recruiterId: job.recruiterId,

                jobTitle: job.jobTitle,

                status: job.status,

                isDraft: job.isDraft,

                isPublished: job.isPublished,

                currentStep: job.currentStep,

                updatedAt: job.updatedAt

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.getBasicInfo = async (req, res) => {
    try {

        const job = await Job.findOne({
            _id: req.params.jobId,

            recruiterId: req.user.id

        });

        if (!job) {

            return res.status(404).json({

                success: false,

                message: "Job not found"

            });

        }

        return res.status(200).json({

            success: true,

            data: {

                jobId: job._id,

                recruiterId: job.recruiterId,

                jobTitle: job.jobTitle,

                jobCategory: job.jobCategory,

                jobType: job.jobType,

                experienceLevel: job.experienceLevel,

                salaryMin: job.salaryMin,

                salaryMax: job.salaryMax,

                location: job.location,

                remoteAvailable: job.remoteAvailable,

                aboutRole: job.aboutRole,

                responsibilities: job.responsibilities,

                skills: job.skills,

                applicationDeadline: job.applicationDeadline,

                openings: job.openings,

                currentStep: job.currentStep,

                completedSteps: job.completedSteps,

                status: job.status,

                isPublished: job.isPublished,

                createdAt: job.createdAt,

                updatedAt: job.updatedAt

            }

        });

    }
    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }
};

exports.getJobById = async (req, res) => {
    try {

        const job =
            await Job.findOne({

                _id: req.params.jobId,
                recruiterId: req.user.id

            })
                .populate(
                    "recruiterId",
                    "companyName companyLogo companyEmail"
                );

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        return res.status(200).json({

            success: true,

            data: {

                jobId: job._id,

                recruiter: {

                    recruiterId:
                        job.recruiterId._id,

                    companyName:
                        job.recruiterId.companyName,

                    companyLogo:
                        job.recruiterId.companyLogo,

                    companyEmail:
                        job.recruiterId.companyEmail
                },

                jobTitle:
                    job.jobTitle,

                jobCategory:
                    job.jobCategory,

                jobType:
                    job.jobType,

                experienceLevel:
                    job.experienceLevel,

                salaryMin:
                    job.salaryMin,

                salaryMax:
                    job.salaryMax,

                location:
                    job.location,

                remoteAvailable:
                    job.remoteAvailable,

                aboutRole:
                    job.aboutRole,

                responsibilities:
                    job.responsibilities,

                skills:
                    job.skills,

                applicationDeadline:
                    job.applicationDeadline,

                openings:
                    job.openings,

                status:
                    job.status,

                currentStep:
                    job.currentStep,

                completedSteps:
                    job.completedSteps,

                isDraft:
                    job.isDraft,

                isPublished:
                    job.isPublished,

                createdAt:
                    job.createdAt,

                updatedAt:
                    job.updatedAt
            }

        });

    }

    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({

            success: false,
            message: "Server error"

        });

    }
};

exports.updateJob = async (req, res) => {
    try {

        const { jobId } = req.params;

        const {
            jobTitle,
            jobCategory,
            jobType,
            experienceLevel,
            salaryMin,
            salaryMax,
            location,
            remoteAvailable,
            aboutRole,
            responsibilities,
            skills,
            applicationDeadline,
            openings
        } = req.body;

        // Check Job
        const job = await Job.findOne({
            _id: jobId,
            recruiterId: req.user.id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Update only provided fields
        if (jobTitle !== undefined)
            job.jobTitle = jobTitle;

        if (jobCategory !== undefined)
            job.jobCategory = jobCategory;

        if (jobType !== undefined)
            job.jobType = jobType;

        if (experienceLevel !== undefined)
            job.experienceLevel = experienceLevel;

        if (salaryMin !== undefined)
            job.salaryMin = salaryMin;

        if (salaryMax !== undefined)
            job.salaryMax = salaryMax;

        if (location !== undefined)
            job.location = location;

        if (remoteAvailable !== undefined)
            job.remoteAvailable = remoteAvailable;

        if (aboutRole !== undefined)
            job.aboutRole = aboutRole;

        if (responsibilities !== undefined)
            job.responsibilities = responsibilities;

        if (skills !== undefined)
            job.skills = skills;

        if (applicationDeadline !== undefined)
            job.applicationDeadline = applicationDeadline;

        if (openings !== undefined)
            job.openings = openings;

        await job.save();

        return res.status(200).json({
            success: true,
            message: "Job updated successfully",
            data: job
        });

    } catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};

exports.deleteJob = async (req, res) => {
    try {

        const job =
            await Job.findOne({

                _id: req.params.jobId,
                recruiterId: req.user.id

            });

        if (!job) {

            return res.status(404).json({

                success: false,
                message: "Job not found"

            });

        }

        await Job.findByIdAndDelete(
            req.params.jobId
        );

        return res.status(200).json({

            success: true,

            message: "Job deleted successfully",

            data: {

                jobId: job._id,

                jobTitle: job.jobTitle

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.publishJob = async (req, res) => {
    try {

        const job =
            await Job.findOne({

                _id: req.params.jobId,
                recruiterId: req.user.id

            });

        if (!job) {

            return res.status(404).json({

                success: false,
                message: "Job not found"

            });

        }

        job.status = "active";

        job.isPublished = true;

        job.isDraft = false;

        await job.save();

        return res.status(200).json({

            success: true,

            message: "Job published successfully",

            data: {

                jobId: job._id,

                recruiterId: job.recruiterId,

                jobTitle: job.jobTitle,

                status: job.status,

                isDraft: job.isDraft,

                isPublished: job.isPublished,

                publishedAt: job.updatedAt

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

// ======== job details management =======
exports.getJobDetails = async (req, res) => {

    try {

        const recruiterId = req.user.id;
        const { jobId } = req.params;

        const job = await Job.findOne({
            _id: jobId,
            recruiterId
        }).populate(
            "recruiterId",
            "companyName companyLogo"
        );

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const totalApplicants = await Application.countDocuments({
            jobId
        });

        const shortlisted = await Application.countDocuments({
            jobId,
            status: "Shortlisted"
        });

        const interviewed = await Application.countDocuments({
            jobId,
            status: "Reviewed"
        });

        const rejected = await Application.countDocuments({
            jobId,
            status: "Rejected"
        });

        const applicants = await Application.find({
            jobId
        })
        .populate({
            path: "seekerId",
            select: "fullName email experienceLevel profileImage"
        })
        .sort({ createdAt: -1 });

        const applicantList = applicants.map(item => ({

            applicationId: item._id,

            candidateId: item.seekerId?._id,

            fullName: item.seekerId?.fullName,

            email: item.seekerId?.email,

            profileImage: item.seekerId?.profileImage,

          experienceLevel: item.seekerId?.experienceLevel || "Fresher",

            appliedDate: item.createdAt,

            status: item.status,

            resume: item.resume || item.seekerId?.resume || "",

            coverLetter: item.coverLetter || ""

        }));
        
        return res.status(200).json({

            success: true,

            data: {

                job: {

                    jobId: job._id,

                    title: job.jobTitle,

                    company: job.recruiterId.companyName,

                    companyLogo: job.recruiterId.companyLogo,

                    location: job.location,

                    status: job.status,

                    postedDate: job.createdAt

                },

                stats: {

                    totalApplicants,

                    shortlisted,

                    interviewed,

                    rejected

                },

                applicants: applicantList

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.closeJob = async (req, res) => {

    try {

        const { jobId } = req.params;

        const recruiterId = req.user.id;

        const job = await Job.findOne({

            _id: jobId,
            recruiterId

        });

        if (!job) {

            return res.status(404).json({

                success: false,
                message: "Job not found"

            });

        }

        if (job.status === "closed") {

            return res.status(400).json({

                success: false,
                message: "Job is already closed"

            });

        }

        job.status = "closed";

        job.isPublished = false;

        job.isDraft = false;

        await job.save();

        return res.status(200).json({

            success: true,

            message: "Job closed successfully",

            data: {

                jobId: job._id,

                jobTitle: job.jobTitle,

                status: job.status,

                isPublished: job.isPublished,

                closedAt: job.updatedAt

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};


// =========== applicants list ============
exports.getApplicants = async (req, res) => {

    try {

        const recruiterId = req.user.id;

        const { jobId } = req.params;

        const search = req.query.search || "";

        const status = req.query.status || "all";

        const sort = req.query.sort || "newest";

        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const job = await Job.findOne({

            _id: jobId,

            recruiterId

        });

        if (!job) {

            return res.status(404).json({

                success: false,

                message: "Job not found"

            });

        }

        let filter = {

            jobId

        };

        if (status !== "all") {

            filter.status = status;

        }

        let applicants = await Application.find(filter)

            .populate({

                path: "seekerId",

                select: `
                    fullName
                    email
                    profilePhoto
                    experienceLevel
                    skills
                    resume
                    location
                    currentRole
                `

            });

        // Search by Candidate Name

        if (search) {

            applicants = applicants.filter(item =>

                item.seekerId &&
                item.seekerId.fullName &&
                item.seekerId.fullName
                    .toLowerCase()
                    .includes(search.toLowerCase())

            );

        }

        // Sorting

        applicants.sort((a, b) => {

            if (sort === "oldest") {

                return new Date(a.createdAt) - new Date(b.createdAt);

            }

            return new Date(b.createdAt) - new Date(a.createdAt);

        });

        // Dashboard Stats

        const totalApplicants = await Application.countDocuments({

            jobId

        });

        const shortlisted = await Application.countDocuments({

            jobId,

            status: "Shortlisted"

        });

        const interviewed = await Application.countDocuments({

            jobId,

            status: "Reviewed"

        });

        const rejected = await Application.countDocuments({

            jobId,

            status: "Rejected"

        });

        // Pagination

        const paginatedApplicants = applicants.slice(skip, skip + limit);

        return res.status(200).json({

            success: true,

            data: {

                job: {

                    jobId: job._id,

                    jobTitle: job.jobTitle

                },

                stats: {

                    totalApplicants,

                    shortlisted,

                    interviewed,

                    rejected

                },

                pagination: {

                    currentPage: page,

                    totalPages: Math.ceil(applicants.length / limit),

                    totalRecords: applicants.length

                },

                applicants: paginatedApplicants.map(item => ({

                    applicationId: item._id,

                    candidateId: item.seekerId?._id,

                    profilePhoto: item.seekerId?.profilePhoto || "",

                    fullName: item.seekerId?.fullName || "",

                    email: item.seekerId?.email || "",

                    location: item.seekerId?.location || "",

                    currentRole: item.seekerId?.currentRole || "",

                    experience: item.seekerId?.experienceLevel || "Fresher",

                    skills: item.seekerId?.skills || [],

                    resume: item.resume || item.seekerId?.resume || "",

                    coverLetter: item.coverLetter || "",

                    expectedSalary: item.expectedSalary || 0,

                    salaryType: item.salaryType || "Fixed",

                    additionalAnswer: item.additionalAnswer || "",

                    appliedDate: item.createdAt,

                    submittedAt: item.submittedAt,

                    status: item.status

                }))

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.updateApplicationStatus = async (req, res) => {

    try {

        const recruiterId = req.user.id;

        const { applicationId } = req.params;

        const { status } = req.body;

        const allowedStatus = [

            "Submitted",
            "Reviewed",
            "Shortlisted",
            "Rejected",
            "Hired"

        ];

        if (!status) {

            return res.status(400).json({

                success: false,

                message: "Status is required"

            });

        }

        if (!allowedStatus.includes(status)) {

            return res.status(400).json({

                success: false,

                message: "Invalid status"

            });

        }

        const application = await Application.findOne({

            _id: applicationId,

            recruiterId

        })

        .populate({

            path: "jobId",

            select: "jobTitle"

        })

        .populate({

            path: "seekerId",

            select: "fullName email"

        });

        if (!application) {

            return res.status(404).json({

                success: false,

                message: "Application not found"

            });

        }

        application.status = status;

        await application.save();

        // ===========================
        // Notification Message
        // ===========================

        let title = "";

        let message = "";

        let icon = "";

        switch (status) {

            case "Reviewed":

                title = "Application Reviewed";

                message =
                `Your application for ${application.jobId.jobTitle} has been reviewed.`;

                icon = "review";

            break;

            case "Shortlisted":

                title = "Congratulations 🎉";

                message =
                `You have been shortlisted for ${application.jobId.jobTitle}.`;

                icon = "shortlist";

            break;

            case "Rejected":

                title = "Application Update";

                message =
                `Your application for ${application.jobId.jobTitle} was not selected.`;

                icon = "rejected";

            break;

            case "Hired":

                title = "Congratulations 🎉";

                message =
                `You have been hired for ${application.jobId.jobTitle}.`;

                icon = "hired";

            break;

            default:

                title = "Application Updated";

                message =
                `Your application status changed to ${status}.`;

                icon = "application";

        }

        // ===========================
        // Create Notification
        // ===========================

       await notificationService.createNotification({

    userId: application.seekerId._id,

    userModel: "JobSeeker",

    senderId: recruiterId,

    senderModel: "Recruiter",

    title,

    message,

    type: "application",

    referenceId: application._id,

    referenceModel: "Application",

    redirectUrl: `/job-seeker/applications/${application._id}`,

    icon

});

        return res.status(200).json({

            success: true,

            message: "Application status updated successfully",

            data: {

                applicationId: application._id,

                jobTitle: application.jobId.jobTitle,

                candidate: application.seekerId.fullName,

                status,

                updatedAt: application.updatedAt

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.downloadResume = async (req, res) => {

    try {

        const recruiterId = req.user.id;

        const { applicationId } = req.params;

        const application = await Application.findOne({
            _id: applicationId,
            recruiterId
        })
        .populate({
            path: "seekerId",
            select: "fullName resume"
        });

        if (!application) {

            return res.status(404).json({
                success: false,
                message: "Application not found"
            });

        }

        const resumeUrl = application.resume || application.seekerId?.resume;

        if (!resumeUrl) {

            return res.status(404).json({
                success: false,
                message: "Resume not uploaded"
            });

        }

        return res.status(200).json({

            success: true,

            data: {

                candidateId: application.seekerId?._id,

                candidateName: application.seekerId?.fullName,

                resumeUrl

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({

            success: false,
            message: "Server error"

        });

    }

};

exports.bulkUpdateStatus = async (req, res) => {

    try {

        const recruiterId = req.user.id;

        const {
            applicationIds,
            status
        } = req.body;


        const allowedStatus = [
            "Submitted",
            "Reviewed",
            "Shortlisted",
            "Rejected",
            "Hired"
        ];


        if (!applicationIds || !applicationIds.length) {

            return res.status(400).json({

                success: false,

                message: "Application ids are required"

            });

        }


        if (!allowedStatus.includes(status)) {

            return res.status(400).json({

                success: false,

                message: "Invalid status"

            });

        }


        const applications =
            await Application.find({

                _id: {
                    $in: applicationIds
                },

                recruiterId

            })
            .populate({

                path: "jobId",

                select: "jobTitle"

            })
            .populate({

                path: "seekerId",

                select: "fullName email"

            });



        if (!applications.length) {

            return res.status(404).json({

                success:false,

                message:"Applications not found"

            });

        }



        const result =
            await Application.updateMany(

                {
                    _id:{
                        $in: applicationIds
                    },

                    recruiterId

                },

                {
                    $set:{
                        status
                    }
                }

            );



        // ==============================
        // Send Notification To Candidates
        // ==============================


        for (const application of applications) {


            let title = "Application Updated";

            let message =
            `Your application status changed to ${status}.`;

            let icon = "application";



            if(status === "Reviewed") {

                title = "Application Reviewed";

                message =
                `Your application for ${application.jobId.jobTitle} has been reviewed.`;

                icon = "review";

            }



            if(status === "Shortlisted") {

                title = "Congratulations 🎉";

                message =
                `You have been shortlisted for ${application.jobId.jobTitle}.`;

                icon = "shortlist";

            }



            if(status === "Rejected") {

                title = "Application Update";

                message =
                `Your application for ${application.jobId.jobTitle} was not selected.`;

                icon = "rejected";

            }



            if(status === "Hired") {

                title = "Congratulations 🎉";

                message =
                `You have been hired for ${application.jobId.jobTitle}.`;

                icon = "hired";

            }



            await notificationService.createNotification({

                userId:
                application.seekerId._id,

                userModel:
                "JobSeeker",


                senderId:
                recruiterId,

                senderModel:
                "Recruiter",


                title,

                message,


                type:
                "application",


                referenceId:
                application._id,


                referenceModel:
                "Application",


                redirectUrl:
                `/job-seeker/applications/${application._id}`,


                icon

            });


        }



        return res.status(200).json({

            success:true,

            message:"Applications updated successfully",

            data:{

                modifiedCount:
                result.modifiedCount,

                status

            }

        });


    }


    catch (error) {


        


        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({

            success:false,

            message: "Server error"

        });


    }

};

exports.scheduleInterview = async (req, res) => {


    try {


        const recruiterId = req.user.id;


        const {
            applicationId
        } = req.params;

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ success: false, message: "Invalid application ID format" });
        }

        const {

            interviewDate,

            meetingLink,

            interviewer,

            notes

        } = req.body;




        const application =
        await Application.findOne({

            _id: applicationId,

            recruiterId

        })
        .populate({

            path:"jobId",

            select:"jobTitle"

        })
        .populate({

            path:"seekerId",

            select:"fullName email"

        });




        if(!application){


            return res.status(404).json({

                success:false,

                message:"Application not found"

            });


        }


        const interview =
        await Interview.create({


            applicationId,


            recruiterId,


            seekerId:
            application.seekerId._id,


            interviewDate,


            meetingLink,


            interviewer,


            notes


        });





        application.status =
        "Reviewed";


        await application.save();


        await notificationService.createNotification({


            userId:
            application.seekerId._id,


            userModel:
            "JobSeeker",



            senderId:
            recruiterId,


            senderModel:
            "Recruiter",



            title:
            "Interview Scheduled",



            message:
            `Your interview for ${application.jobId.jobTitle} has been scheduled on ${interviewDate}.`,



            type:
            "interview",



            referenceId:
            interview._id,



            referenceModel:
            "Interview",



            redirectUrl:
            `/job-seeker/interviews/${interview._id}`,



            icon:
            "interview"


        });







        return res.status(201).json({


            success:true,


            message:
            "Interview scheduled successfully",



            data: interview



        });



    }


    catch (error) {


        


        console.error("Error in JobPoster/jobController.js:", error);
return res.status(500).json({


            success:false,


            message: "Server error"


        });


    }


};


//         return res.status(201).json({

//             success: true,

//             message:
//             "Interview scheduled successfully",

//             data: interview

//         });

//     }

//     catch (error) {

//         

// console.error("Error in JobPoster/jobController.js:", error);
// return res.status(500).json({

//             success: false,

//             message: "Server error"

//         });

//     }

// };