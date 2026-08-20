const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const upload = require("../../middlewares/upload.js");
const inventoryController = require("../../controllers/ecommUser/inventoryController");

/**
 * @swagger
 * /api/inventory/create:
 *   post:
 *     summary: Create product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product created successfully
 */
router.post(
  "/create",
  auth, requireRole("seller","admin"),
  upload.single("image"),
  inventoryController.addProduct
);


/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get seller products
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */
router.get("/", auth, requireRole("seller","admin"), inventoryController.getProducts);


/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.put("/:id", auth, requireRole("seller","admin"), inventoryController.updateProduct);


/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete("/:id", auth, requireRole("seller","admin"), inventoryController.deleteProduct);


/**
 * @swagger
 * /api/inventory/stats/summary:
 *   get:
 *     summary: Get seller inventory summary
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory summary fetched successfully
 */
router.get("/stats/summary", auth, requireRole("seller","admin"), inventoryController.inventoryStats);


/**
 * @swagger
 * /api/inventory/create-management:
 *   post:
 *     summary: Add product management
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               subCategory:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product added successfully
 */
router.post(
  "/create-management",
  auth, requireRole("seller","admin"),
  upload.array("images", 5),
  inventoryController.addProductManagement
);


/**
 * @swagger
 * /api/inventory/draft/{id}:
 *   put:
 *     summary: Save product as draft
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Draft saved successfully
 */
router.put("/draft/:id", inventoryController.saveDraft);


/**
 * @swagger
 * /api/inventory/stats:
 *   get:
 *     summary: Get inventory stats
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Inventory stats fetched successfully
 */
router.get("/stats", auth, requireRole("seller","admin"), inventoryController.getInventoryStats);


/**
 * @swagger
 * /api/inventory/products:
 *   get:
 *     summary: Get inventory products
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory products fetched successfully
 */
router.get("/products", auth, requireRole("seller","admin"), inventoryController.getInventoryProducts);


/**
 * @swagger
 * /api/inventory/update-stock/{id}:
 *   put:
 *     summary: Update product stock
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Stock updated successfully
 */
router.put(
  "/update-stock/:id",
  inventoryController.updateStock
);


/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Get product by id
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product fetched successfully
 */
router.get("/:id", inventoryController.getProduct);

module.exports = router;
