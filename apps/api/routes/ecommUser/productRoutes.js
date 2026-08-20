const router = require("express").Router();
const upload = require("../../middlewares/upload.js");
const productController = require("../../controllers/ecommUser/productController.js");
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Fetch products with optional filters and sorting
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [low, high, rating, newest, popularity]
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: productType
 *         schema:
 *           type: string
 *           enum: [sale, rent, both]
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */
router.get("/", productController.getPublicProducts);

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get all product categories
 *     tags: [Products]
 */
router.get("/categories", productController.getCategories);

/**
 * @swagger
 * /api/products/brands:
 *   get:
 *     summary: Get all product brands
 *     tags: [Products]
 */
router.get("/brands", productController.getBrands);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/:id", productController.getProductById);

/**
 * @swagger
 * /api/products/create:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.post("/create", auth, requireRole("seller","admin"), upload.array("images", 10), productController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", auth, requireRole("seller","admin"), upload.array("images", 10), productController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", auth, requireRole("seller","admin"), productController.deleteProduct);

module.exports = router;
