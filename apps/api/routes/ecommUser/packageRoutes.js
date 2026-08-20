const router = require("express").Router();
const upload = require("../../middlewares/upload.js");
const packagecontroller = require("../../controllers/ecommUser/packageController.js");

// /**
//  * @swagger
//  * /api/packages/{id}:
//  *   get:
//  *     summary: Get package detail
//  *     description: Fetch single package by ID
//  *     tags: [Packages]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: Package ID
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Package fetched successfully
//  *       404:
//  *         description: Package not found
//  */
// router.get("/:id", packagecontroller.getPackageDetail);

// /**
//  * @swagger
//  * /api/packages/create:
//  *   post:
//  *     summary: Create a new package
//  *     description: Add package with images, highlights, vendor and reviews
//  *     tags: [Packages]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - title
//  *               - price
//  *             properties:
//  *               title:
//  *                 type: string
//  *               price:
//  *                 type: number
//  *               originalPrice:
//  *                 type: number
//  *               discount:
//  *                 type: number
//  *               rating:
//  *                 type: number
//  *               totalReviews:
//  *                 type: number
//  *               eventType:
//  *                 type: string
//  *               serviceTier:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               
//  *               highlights:
//  *                 type: string
//  *               
//  *               vendor:
//  *                 type: string
//  *               
//  *               reviews:
//  *                 type: string
//  *               
//  *               images:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                   format: binary
//  *     responses:
//  *       200:
//  *         description: Package created successfully
//  *       500:
//  *         description: Server error
//  */
router.post("/create", upload.array("images", 5), packagecontroller.createPackage);

router.get("/", packagecontroller.getAllPackages);
router.get("/:id", packagecontroller.getPackageDetail);

router.put("/update/:id", upload.array("images", 5), packagecontroller.updatePackage);

router.delete("/delete/:id", packagecontroller.deletePackage);



module.exports = router;