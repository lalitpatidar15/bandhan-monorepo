const razorpay = require("../../config/razorpay.js");



const crypto = require("crypto");



const Recruiter = require("../../models/jobPoster/Recruiter.js");



const Job = require("../../models/jobPoster/Job.js");



const Application = require("../../models/jobPoster/Application.js");



const JobSeeker = require("../../models/jobSeeker/JobSeeker.js");



const Interview = require("../../models/jobPoster/Interview.js");



const Payment = require("../../models/shared/Payment.js");



const JobPromotion = require("../../models/jobPoster/JobPromotion.js");



const Billing = require("../../models/jobPoster/Billing.js");



const Plan = require("../../models/jobPoster/Plan.js");



const bcrypt = require("bcryptjs");







const jwt = require("jsonwebtoken");



const mongoose = require("mongoose");



// ======================== Candidate Profile =========================



exports.getCandidateProfile = async (req, res) => {







    try {







        const recruiterId = req.user.id;



        const { applicationId } = req.params;







        const application = await Application.findOne({



            _id: applicationId,



            recruiterId



        })



            .populate({



                path: "jobId",



                select: `



                jobTitle



                location



                jobType



                experienceLevel



                salaryMin



                salaryMax



            `



            })



            .populate({



                path: "seekerId",



                select: `



                fullName



                email



                phone



                profilePhoto



                experienceLevel



                skills



                college



                degree



                graduationYear



                workHistory



                resume



                location



                about



                lastActive



            `



            });







        if (!application) {







            return res.status(404).json({







                success: false,



                message: "Application not found"







            });







        }







        const seeker = application.seekerId;







        return res.status(200).json({







            success: true,







            data: {







                applicationId: application._id,







                status: application.status,







                appliedDate: application.createdAt,







                submittedAt: application.submittedAt,







                coverLetter: application.coverLetter,







                expectedSalary: application.expectedSalary,







                salaryType: application.salaryType,







                additionalAnswer: application.additionalAnswer,







                internalNote: application.internalNote,







                candidate: {







                    candidateId: seeker._id,







                    fullName: seeker.fullName,







                    email: seeker.email,







                    phone: seeker.phone,







                    profileImage: seeker.profilePhoto,







                    experienceLevel: seeker.experienceLevel,







                    location: seeker.location,







                    about: seeker.about,







                    skills: seeker.skills || [],







                    education: seeker.college ? [{



                        degree: seeker.degree,



                        institution: seeker.college,



                        year: seeker.graduationYear



                    }] : [],







                    workHistory: seeker.workHistory || [],







                    resume: seeker.resume,







                    lastActive: seeker.lastActive







                },







                job: {







                    jobId: application.jobId._id,







                    jobTitle: application.jobId.jobTitle,







                    location: application.jobId.location,







                    jobType: application.jobId.jobType,







                    experienceLevel: application.jobId.experienceLevel,







                    salaryMin: application.jobId.salaryMin,







                    salaryMax: application.jobId.salaryMax







                }







            }







        });







    }







    catch (error) {







        







        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({







            success: false,







            message: "Server error"







        });







    }







};











exports.saveInternalNote = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        const { applicationId } = req.params;







        const { internalNote } = req.body;







        if (!internalNote || internalNote.trim() === "") {







            return res.status(400).json({







                success: false,







                message: "Internal note is required"







            });







        }







        const application = await Application.findOne({







            _id: applicationId,







            recruiterId







        })



            .populate("seekerId", "fullName")



            .populate("jobId", "jobTitle");







        if (!application) {







            return res.status(404).json({







                success: false,







                message: "Application not found"







            });







        }







        application.internalNote = internalNote;







        await application.save();







        return res.status(200).json({







            success: true,







            message: "Internal note saved successfully",







            data: {







                applicationId: application._id,







                candidateName: application.seekerId.fullName,







                jobTitle: application.jobId.jobTitle,







                internalNote: application.internalNote,







                updatedAt: application.updatedAt







            }







        });







    }







    catch (error) {







        







        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({







            success: false,







            message: "Server error"







        });







    }







};







// ============= hirring pipline ===============



exports.getHiringPipeline = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        const { jobId } = req.params;







        const search = req.query.search || "";







        const experience = req.query.experience || "";







        const status = req.query.status || "all";







        const sort = req.query.sort || "newest";







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







            recruiterId,



            jobId







        };







        if (status !== "all") {







            filter.status = status;







        }







        let applications = await Application.find(filter)







            .populate({







                path: "seekerId",







                select: `



                    fullName



                    email



                    profileImage



                    currentRole



                    experienceLevel



                    skills



                    location



                    resume



                `







            })







            .sort({







                createdAt: sort === "oldest" ? 1 : -1







            });







        applications = applications.filter(item => {







            if (!item.seekerId) return false;







            let matched = true;







            if (search) {







                matched =



                    item.seekerId.fullName



                        .toLowerCase()



                        .includes(search.toLowerCase());







            }







            if (matched && experience) {







                matched =



                    item.seekerId.experienceLevel === experience;







            }







            return matched;







        });







        const pipeline = {







            applied: [],



            shortlisted: [],



            interview: [],



            offer: [],



            hired: [],



            rejected: []







        };







        const counts = {







            applied: 0,



            shortlisted: 0,



            interview: 0,



            offer: 0,



            hired: 0,



            rejected: 0







        };







        for (const application of applications) {







            const candidate = {







                applicationId: application._id,







                candidateId: application.seekerId._id,







                fullName: application.seekerId.fullName,







                email: application.seekerId.email,







                profileImage:



                    application.seekerId.profileImage || "",







                currentRole:



                    application.seekerId.currentRole || "",







                experience:



                    application.seekerId.experienceLevel,







                location:



                    application.seekerId.location || "",







                skills:



                    application.seekerId.skills || [],







                status:



                    application.status,







                appliedDate:



                    application.createdAt,







                resume:



                    application.resume ||



                    application.seekerId.resume || ""







            };







            switch (application.status) {







                case "Submitted":







                    pipeline.applied.push(candidate);







                    counts.applied++;







                    break;







                case "Shortlisted":







                    pipeline.shortlisted.push(candidate);







                    counts.shortlisted++;







                    break;







                case "Reviewed":







                    pipeline.interview.push(candidate);







                    counts.interview++;







                    break;







                case "Hired":







                    pipeline.hired.push(candidate);







                    counts.hired++;







                    break;







                case "Rejected":







                    pipeline.rejected.push(candidate);







                    counts.rejected++;







                    break;







                default:







                    pipeline.offer.push(candidate);







                    counts.offer++;







            }







        }



        return res.status(200).json({







            success: true,







            data: {







                job: {







                    jobId: job._id,







                    jobTitle: job.jobTitle







                },







                counts,







                pipeline







            }







        });







    }







    catch (error) {







        







        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({







            success: false,







            message: "Server error"







        });







    }







};







// =============== payment and invoices dashboard ================ 



exports.getFinancialDashboard = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        // Total Spend







        const totalSpendResult = await Payment.aggregate([







            {







                $match: {







                    recruiterId,







                    status: "completed"







                }







            },







            {







                $group: {







                    _id: null,







                    total: {







                        $sum: "$totalAmount"







                    }







                }







            }







        ]);







        const totalSpend =







            totalSpendResult.length > 0







                ? totalSpendResult[0].total







                : 0;







        // Current Month Spend







        const firstDay = new Date(







            new Date().getFullYear(),







            new Date().getMonth(),







            1







        );







        const monthSpendResult = await Payment.aggregate([







            {







                $match: {







                    recruiterId,







                    status: "completed",







                    createdAt: {







                        $gte: firstDay







                    }







                }







            },







            {







                $group: {







                    _id: null,







                    total: {







                        $sum: "$totalAmount"







                    }







                }







            }







        ]);







        const monthSpend =







            monthSpendResult.length > 0







                ? monthSpendResult[0].total







                : 0;







        // Pending Payment







        const pendingResult = await Payment.aggregate([







            {







                $match: {







                    recruiterId,







                    status: "pending"







                }







            },







            {







                $group: {







                    _id: null,







                    total: {







                        $sum: "$totalAmount"







                    }







                }







            }







        ]);







        const pendingPayment =







            pendingResult.length > 0







                ? pendingResult[0].total







                : 0;







        // Current Plan







        const currentPlan = await Payment.findOne({







            recruiterId,







            paymentFor: "plan",







            status: "completed"







        })







            .sort({







                createdAt: -1







            })







            .select(







                "planName planExpiry"







            );







        // Monthly Graph







        const graph = await Payment.aggregate([







            {







                $match: {







                    recruiterId,







                    status: "completed"







                }







            },







            {







                $group: {







                    _id: {







                        month: {







                            $month: "$createdAt"







                        }







                    },







                    amount: {







                        $sum: "$totalAmount"







                    }







                }







            },







            {







                $sort: {







                    "_id.month": 1







                }







            }







        ]);







        return res.status(200).json({







            success: true,







            data: {







                totalSpend,







                monthSpend,







                pendingPayment,







                currentPlan: currentPlan







                    ? currentPlan.planName







                    : "Free",







                planExpiry: currentPlan







                    ? currentPlan.planExpiry







                    : null,







                monthlyGraph: graph







            }







        });







    }







    catch (error) {







        







        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({







            success: false,







            message: "Server error"







        });







    }







};







//===============create Invoice ==================



exports.createInvoice = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        const {







            clientName,







            invoiceNumber,







            amount,







            dueDate,







            notes







        } = req.body;







        if (







            !clientName ||







            !invoiceNumber ||







            !amount ||







            !dueDate







        ) {







            return res.status(400).json({







                success: false,







                message: "All required fields are mandatory."







            });







        }







        const invoiceExists = await Payment.findOne({







            invoiceNumber







        });







        if (invoiceExists) {







            return res.status(400).json({







                success: false,







                message: "Invoice number already exists."







            });







        }







        const invoice = await Payment.create({







            recruiterId,







            paymentFor: "invoice",







            isInvoice: true,







            clientName,







            invoiceNumber,







            subtotal: Number(amount),







            platformFee: 0,







            gst: 0,







            totalAmount: Number(amount),







            dueDate,







            notes,







            invoiceStatus: "pending",







            paymentMethod: "pending",







            status: "pending"







        });







        return res.status(201).json({







            success: true,







            message: "Invoice created successfully.",







            data: {







                _id: invoice._id,







                invoiceNumber: invoice.invoiceNumber,







                clientName: invoice.clientName,







                amount: invoice.totalAmount,







                dueDate: invoice.dueDate,







                notes: invoice.notes,







                invoiceStatus: invoice.invoiceStatus,







                status: invoice.status,







                createdAt: invoice.createdAt







            }







        });







    }







    catch (error) {







        console.error("createInvoice error:", error);







        return res.status(500).json({







            success: false,







            message: error.message || "Server error"







        });







    }







};







//=====================Get Invoice ================



exports.getInvoices = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        const invoices = await Payment.find({







            recruiterId,







            isInvoice: true







        })







            .select(`







            clientName







            invoiceNumber







            totalAmount







            dueDate







            invoiceStatus







            createdAt







            invoiceUrl







        `)







            .sort({







                createdAt: -1







            });







        return res.status(200).json({







            success: true,







            totalInvoices: invoices.length,







            data: invoices.map((invoice) => ({







                _id: invoice._id,







                invoiceNumber: invoice.invoiceNumber,







                clientName: invoice.clientName,







                amount: invoice.totalAmount,







                dueDate: invoice.dueDate,







                invoiceStatus: invoice.invoiceStatus,







                createdAt: invoice.createdAt







            }))







        });







    }







    catch (error) {







        







        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({







            success: false,







            message: "Server error"







        });







    }







};







//================Get By Id ====================



exports.getInvoiceById = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        const { id } = req.params;







        if (!mongoose.Types.ObjectId.isValid(id)) {







            return res.status(400).json({







                success: false,







                message: "Invalid invoice id."







            });







        }







        const invoice = await Payment.findOne({







            _id: id,







            recruiterId,







            isInvoice: true







        }).select(`







            clientName







            invoiceNumber







            subtotal







            platformFee







            gst







            totalAmount







            dueDate







            notes







            invoiceStatus







            paymentMethod







            billingName







            billingCompany







            billingAddress







            gstNumber







            invoiceUrl







            createdAt







            updatedAt







        `);







        if (!invoice) {







            return res.status(404).json({







                success: false,







                message: "Invoice not found."







            });







        }







        return res.status(200).json({







            success: true,







            data: {







                _id: invoice._id,







                invoiceNumber: invoice.invoiceNumber,







                clientName: invoice.clientName,







                amount: invoice.totalAmount,







                subtotal: invoice.subtotal,







                platformFee: invoice.platformFee,







                gst: invoice.gst,







                dueDate: invoice.dueDate,







                notes: invoice.notes,







                invoiceStatus: invoice.invoiceStatus,







                paymentMethod: invoice.paymentMethod,







                createdAt: invoice.createdAt,







                updatedAt: invoice.updatedAt







            }







        });







    }







    catch (error) {







        







        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({







            success: false,







            message: "Server error"







        });







    }







};







//==================Update Invoice ================



exports.updateInvoice = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        const { id } = req.params;







        if (!mongoose.Types.ObjectId.isValid(id)) {







            return res.status(400).json({







                success: false,







                message: "Invalid invoice id."







            });







        }







        const invoice = await Payment.findOne({







            _id: id,







            recruiterId,







            isInvoice: true







        });







        if (!invoice) {







            return res.status(404).json({







                success: false,







                message: "Invoice not found."







            });







        }







        if (invoice.invoiceStatus === "paid") {







            return res.status(400).json({







                success: false,







                message: "Paid invoice cannot be updated."







            });







        }







        const {







            clientName,







            invoiceNumber,







            amount,







            dueDate,







            notes,







            invoiceStatus







        } = req.body;







        // Check duplicate invoice number







        if (







            invoiceNumber &&







            invoiceNumber !== invoice.invoiceNumber







        ) {







            const exists = await Payment.findOne({







                invoiceNumber,







                _id: { $ne: id }







            });







            if (exists) {







                return res.status(400).json({







                    success: false,







                    message: "Invoice number already exists."







                });







            }







            invoice.invoiceNumber = invoiceNumber;







        }







        if (clientName)







            invoice.clientName = clientName;







        if (amount !== undefined) {







            invoice.subtotal = Number(amount);







            invoice.totalAmount = Number(amount);







        }







        if (dueDate)







            invoice.dueDate = dueDate;







        if (notes !== undefined)







            invoice.notes = notes;







        if (invoiceStatus)







            invoice.invoiceStatus = invoiceStatus;







        await invoice.save();







        return res.status(200).json({







            success: true,







            message: "Invoice updated successfully.",







            data: {







                _id: invoice._id,







                invoiceNumber: invoice.invoiceNumber,







                clientName: invoice.clientName,







                amount: invoice.totalAmount,







                dueDate: invoice.dueDate,







                notes: invoice.notes,







                invoiceStatus: invoice.invoiceStatus,







                updatedAt: invoice.updatedAt







            }







        });







    }







    catch (error) {







        console.error("updateInvoice error:", error);







        return res.status(500).json({







            success: false,







            message: error.message || "Server error"







        });







    }







};







//==============Delete Invoice ==============



exports.deleteInvoice = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        const { id } = req.params;







        if (!mongoose.Types.ObjectId.isValid(id)) {







            return res.status(400).json({







                success: false,







                message: "Invalid invoice id."







            });







        }







        const invoice = await Payment.findOne({







            _id: id,







            recruiterId,







            isInvoice: true







        });







        if (!invoice) {







            return res.status(404).json({







                success: false,







                message: "Invoice not found."







            });







        }







        if (invoice.invoiceStatus === "paid") {







            return res.status(400).json({







                success: false,







                message: "Paid invoice cannot be deleted."







            });







        }







        await Payment.findByIdAndDelete(id);







        return res.status(200).json({







            success: true,







            message: "Invoice deleted successfully."







        });







    }







    catch (error) {







        







        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({







            success: false,







            message: "Server error"







        });







    }







};







//===============get Billing ================



exports.getBilling = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        const billing = await Billing.findOne({







            recruiterId







        });







        if (!billing) {







            return res.status(200).json({







                success: true,







                data: {







                    billingName: "",







                    billingCompany: "",







                    billingAddress: "",







                    gstNumber: ""







                }







            });







        }







        return res.status(200).json({







            success: true,







            data: billing







        });







    }







    catch (error) {







        







        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({







            success: false,







            message: "Server error"







        });







    }







};







//================ update Billing=====================



exports.updateBilling = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        const {







            billingName,







            billingCompany,







            billingAddress,







            gstNumber







        } = req.body;







        if (







            !billingName ||







            !billingCompany ||







            !billingAddress







        ) {







            return res.status(400).json({







                success: false,







                message: "Billing Name, Company and Address are required."







            });







        }







        const billing = await Billing.findOneAndUpdate(







            {







                recruiterId







            },







            {







                recruiterId,







                billingName,







                billingCompany,







                billingAddress,







                gstNumber







            },







            {







                new: true,







                upsert: true,







                runValidators: true







            }







        );







        return res.status(200).json({







            success: true,







            message: "Billing information updated successfully.",







            data: {







                billingName: billing.billingName,







                billingCompany: billing.billingCompany,







                billingAddress: billing.billingAddress,







                gstNumber: billing.gstNumber







            }







        });







    }







    catch (error) {







        







        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({







            success: false,







            message: "Server error"







        });







    }







};







//=================recruiters =================



exports.getRecruiters = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        const recruiter = await Recruiter.findById(recruiterId)



            .select(`



                companyName



                companyEmail



                profileCompleted



            `);







        if (!recruiter) {







            return res.status(404).json({







                success: false,







                message: "Recruiter not found."







            });







        }







        const outstandingResult = await Payment.aggregate([







            {







                $match: {







                    recruiterId: new mongoose.Types.ObjectId(recruiterId),







                    status: "pending"







                }







            },







            {







                $group: {







                    _id: null,







                    total: {







                        $sum: "$totalAmount"







                    }







                }







            }







        ]);







        const outstandingBalance = outstandingResult.length



            ? outstandingResult[0].total



            : 0;







        const latestPlan = await Payment.findOne({







            recruiterId,







            paymentFor: "plan",







            status: "completed"







        })



            .sort({







                createdAt: -1







            })



            .select("planName");







        return res.status(200).json({







            success: true,







            data: {







                recruiterId: recruiter._id,







                companyName: recruiter.companyName,







                companyEmail: recruiter.companyEmail,







                currentPlan: latestPlan?.planName || "Free",







                outstandingBalance,







                profileStatus: recruiter.profileCompleted



                    ? "Completed"



                    : "Incomplete"







            }







        });







    }







    catch (error) {







        







        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({







            success: false,







            message: "Server error"







        });







    }







};







// ================= job upgrade ============



exports.getPlans = async (req, res) => {







    try {







        const plans = await Plan.find({ isActive: true }).sort({ price: 1 }).lean();







        return res.status(200).json({



            success: true,



            totalPlans: plans.length,



            data: plans



        });







    }







    catch (error) {







        







        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({



            success: false,



            message: "Server error"



        });







    }







};



exports.getCurrentPlan = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        const payment = await Payment.findOne({







            recruiterId,







            paymentFor: "plan",







            status: "completed"







        })



        .sort({ createdAt: -1 });







        if (!payment) {







            return res.status(200).json({







                success: true,







                data: {







                    planName: "Free",







                    price: 0,







                    duration: 30,







                    purchasedOn: null,







                    expiryDate: null,







                    remainingDays: 0,







                    status: "Active"







                }







            });







        }







        let remainingDays = 0;







        let status = "Expired";







        if (payment.planExpiry) {







            const today = new Date();







            const expiry = new Date(payment.planExpiry);







            remainingDays = Math.max(







                Math.ceil(







                    (expiry - today) /







                    (1000 * 60 * 60 * 24)







                ),







                0







            );







            status = remainingDays > 0 ? "Active" : "Expired";







        }







        return res.status(200).json({







            success: true,







            data: {







                paymentId: payment._id,







                planName: payment.planName,







                price: payment.totalAmount,







                duration: payment.planDuration,







                purchasedOn: payment.createdAt,







                expiryDate: payment.planExpiry,







                remainingDays,







                paymentMethod: payment.paymentMethod,







                transactionId: payment.transactionId,







                status







            }







        });







    }







    catch (error) {







        







        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({







            success: false,







            message: "Server error"







        });







    }







};







//===================== create order ==================



exports.createOrder = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        const {







            paymentFor,







            planName,







            jobId







        } = req.body;







        if (!paymentFor || !planName) {







            return res.status(400).json({







                success: false,







                message: "Payment type and plan name are required."







            });







        }







        const plan = await Plan.findOne({ planName, isActive: true });







        if (!plan) {







            return res.status(400).json({







                success: false,







                message: "Invalid Plan."







            });







        }







        let amount = plan.price;







        let duration = plan.duration;







        if (paymentFor === "featured_job") {







            if (!jobId) {







                return res.status(400).json({







                    success: false,







                    message: "Job Id is required."







                });







            }







            const job = await Job.findOne({







                _id: jobId,







                recruiterId







            });







            if (!job) {







                return res.status(404).json({







                    success: false,







                    message: "Job not found."







                });







            }







        }







        const subtotal = amount;







        const platformFee = 0;







        const gst = 0;







        const totalAmount = subtotal + platformFee + gst;







        const receipt =







            "REC-" +







            Date.now();







        if (!razorpay) {



          return res.status(503).json({ success: false, message: "Payment service not configured" });



        }



        const razorpayOrder =







            await razorpay.orders.create({







                amount: totalAmount * 100,







                currency: "INR",







                receipt,







                payment_capture: 1







            });







        const payment =







            await Payment.create({







                recruiterId,







                jobId: jobId || null,







                paymentFor,







                planName,







                planDuration: duration,







                subtotal,







                platformFee,







                gst,







                totalAmount,







                currency: "INR",







                paymentGateway: "razorpay",







                paymentMethod: "pending",







                orderId: razorpayOrder.id,







                receipt,







                status: "created"







            });







        return res.status(201).json({







            success: true,







            message: "Order created successfully.",







            data: {







                paymentId: payment._id,







                orderId: razorpayOrder.id,







                amount: razorpayOrder.amount,







                currency: razorpayOrder.currency,







                receipt,







                razorpayKey: process.env.RAZORPAY_KEY_ID,







                planName,







                paymentFor







            }







        });







    }







    catch (error) {







        







        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({







            success: false,







            message: "Server error"







        });







    }







};







//==================== verify - payment =================



// exports.verifyPayment = async (req, res) => {







//     try {







//         const recruiterId = req.user.id;







//         const {







//             orderId,







//             paymentId,







//             signature







//         } = req.body;







//         if (



//             !orderId ||



//             !paymentId ||



//             !signature



//         ) {







//             return res.status(400).json({







//                 success:false,







//                 message:"All fields are required."







//             });







//         }







//         const payment = await Payment.findOne({







//             recruiterId,







//             orderId







//         });







//         if(!payment){







//             return res.status(404).json({







//                 success:false,







//                 message:"Payment not found."







//             });







//         }







//         if(payment.status==="completed"){







//             return res.status(400).json({







//                 success:false,







//                 message:"Payment already verified."







//             });







//         }







//         const generatedSignature = crypto







//         .createHmac(







//             "sha256",







//             process.env.RAZORPAY_KEY_SECRET







//         )







//         .update(







//             orderId + "|" + paymentId







//         )







//         .digest("hex");







//         if(generatedSignature!==signature){







//             payment.status="failed";







//             await payment.save();







//             return res.status(400).json({







//                 success:false,







//                 message:"Invalid payment signature."







//             });







//         }







//         const razorpayPayment =







//         await razorpay.payments.fetch(







//             paymentId







//         );







//         payment.transactionId=paymentId;







//         payment.signature=signature;







//         payment.paymentMethod=







//             razorpayPayment.method || "pending";







//         payment.cardType=







//             razorpayPayment.card?.network || "";







//         payment.cardLast4=







//             razorpayPayment.card?.last4 || "";







//         payment.bank=







//             razorpayPayment.bank || "";







//         payment.wallet=







//             razorpayPayment.wallet || "";







//         payment.vpa=







//             razorpayPayment.vpa || "";







//         payment.fee=







//             razorpayPayment.fee || 0;







//         payment.tax=







//             razorpayPayment.tax || 0;







//         payment.status="completed";







//         payment.paidAt=new Date();







//         if(payment.paymentFor==="plan"){







//             const expiry=new Date();







//             expiry.setDate(







//                 expiry.getDate()+







//                 payment.planDuration







//             );







//             payment.planExpiry=expiry;







//         }







//         if(payment.paymentFor==="featured_job"){







//             const expiry=new Date();







//             expiry.setDate(







//                 expiry.getDate()+







//                 payment.planDuration







//             );







//             payment.planExpiry=expiry;







//             await Job.findByIdAndUpdate(







//                 payment.jobId,







//                 {







//                     isFeatured:true,







//                     featuredPlan:payment.planName,







//                     featuredPrice:payment.totalAmount,







//                     featuredStartedAt:new Date(),







//                     featuredTill:expiry,







//                     promotionStatus:"active"







//                 }







//             );







//         }







//         if(payment.paymentFor==="invoice"){







//             payment.invoiceStatus="paid";







//         }







//         await payment.save();







//         return res.status(200).json({







//             success:true,







//             message:"Payment verified successfully.",







//             data:payment







//         });







//     }







//     catch (error) {







//         







// console.error("Error in JobPoster/jobProfileController.js:", error);



// return res.status(500).json({







//             success:false,







//             message: "Server error"







//         });







//     }







// };



exports.verifyPayment = async (req, res) => {







    try {







        const recruiterId = req.user.id;







        const {







            orderId,







            paymentId,







            signature







        } = req.body;











        if (



            !orderId ||



            !paymentId ||



            !signature



        ) {







            return res.status(400).json({







                success:false,







                message:"All fields are required."







            });







        }















        const payment = await Payment.findOne({







            recruiterId,







            orderId







        });















        if(!payment){







            return res.status(404).json({







                success:false,







                message:"Payment not found."







            });







        }















        if(payment.status==="completed"){







            return res.status(400).json({







                success:false,







                message:"Payment already verified."







            });







        }















        const generatedSignature = crypto







        .createHmac(







            "sha256",







            process.env.RAZORPAY_KEY_SECRET







        )







        .update(







            orderId + "|" + paymentId







        )







        .digest("hex");



















        if(generatedSignature !== signature){











            payment.status="failed";











            await payment.save();















            return res.status(400).json({







                success:false,







                message:"Invalid payment signature."







            });











        }























        if (!razorpay) {



          return res.status(503).json({ success: false, message: "Payment service not configured" });



        }



        const razorpayPayment =







        await razorpay.payments.fetch(







            paymentId







        );























        payment.transactionId = paymentId;











        payment.signature = signature;











        payment.paymentMethod =







            razorpayPayment.method || "pending";















        payment.cardType =







            razorpayPayment.card?.network || "";















        payment.cardLast4 =







            razorpayPayment.card?.last4 || "";















        payment.bank =







            razorpayPayment.bank || "";















        payment.wallet =







            razorpayPayment.wallet || "";















        payment.vpa =







            razorpayPayment.vpa || "";















        payment.fee =







            razorpayPayment.fee || 0;















        payment.tax =







            razorpayPayment.tax || 0;















        payment.status = "completed";











        payment.paidAt = new Date();



























        // ==========================



        // Plan Expiry



        // ==========================











        if(payment.paymentFor === "plan"){











            const expiry = new Date();











            expiry.setDate(







                expiry.getDate() +







                payment.planDuration







            );











            payment.planExpiry = expiry;











        }























        // ==========================



        // Featured Job Upgrade



        // ==========================











        if(payment.paymentFor === "featured_job"){











            const expiry = new Date();











            expiry.setDate(







                expiry.getDate() +







                payment.planDuration







            );















            payment.planExpiry = expiry;















            await Job.findByIdAndUpdate(







                payment.jobId,







                {







                    isFeatured:true,







                    featuredPlan:



                    payment.planName,







                    featuredPrice:



                    payment.totalAmount,







                    featuredStartedAt:



                    new Date(),







                    featuredTill:



                    expiry,







                    promotionStatus:"active"







                }







            );











        }























        // ==========================



        // Invoice Payment



        // ==========================











        if(payment.paymentFor === "invoice"){











            payment.invoiceStatus = "paid";











        }























        await payment.save();























        // ==========================



        // Firebase Notification



        // ==========================











        await notificationService.createNotification({











            userId:



            recruiterId,











            userModel:



            "Recruiter",















            senderId:



            recruiterId,











            senderModel:



            "Recruiter",















            title:



            "Payment Successful",















            message:



            `Your ${payment.planName || payment.paymentFor} payment of ₹${payment.totalAmount} was successful.`,















            type:



            "payment",















            referenceId:



            payment._id,















            referenceModel:



            "Payment",















            redirectUrl:



            "/billing",















            icon:



            "payment"











        });































        return res.status(200).json({











            success:true,











            message:



            "Payment verified successfully.",















            data:payment















        });















    }











    catch (error) {











        











        console.error("Error in JobPoster/jobProfileController.js:", error);



return res.status(500).json({











            success:false,











            message: "Server error"











        });











    }







};