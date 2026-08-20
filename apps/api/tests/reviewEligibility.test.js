const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");

const authRoutes = require("../routes/ecommUser/authRoutes.js");
const userRoutes = require("../routes/ecommUser/userRoutes.js");
const accountController = require("../controllers/ecommUser/ecommUserController.js");
const reviewController = require("../controllers/ecommUser/reviewController.js");
const Order = require("../models/shared/Order.js");
const Product = require("../models/shared/Product.js");
const Review = require("../models/shared/Review.js");
const User = require("../models/shared/User.js");

const PRODUCT_ID = "64f000000000000000000001";
const USER_ID = "64f000000000000000000002";
const SELLER_ID = "64f000000000000000000003";

function hasRoute(router, method, path) {
  return router.stack.some((layer) => layer.route?.path === path && layer.route.methods?.[method]);
}

function selectable(value) {
  return { select: async () => value };
}

function responseRecorder() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("account and logout endpoints are registered with the methods used by the user app", () => {
  assert.equal(hasRoute(userRoutes, "get", "/profile"), true);
  assert.equal(hasRoute(userRoutes, "patch", "/profile"), true);
  assert.equal(hasRoute(userRoutes, "post", "/password"), true);
  assert.equal(hasRoute(userRoutes, "get", "/preferences"), true);
  assert.equal(hasRoute(userRoutes, "patch", "/preferences"), true);
  assert.equal(hasRoute(authRoutes, "post", "/logout"), true);

  const profileIndex = userRoutes.stack.findIndex((layer) => layer.route?.path === "/profile");
  const dynamicUserIndex = userRoutes.stack.findIndex((layer) => layer.route?.path === "/:id");
  assert.ok(profileIndex >= 0 && profileIndex < dynamicUserIndex);
});

test("password changes explicitly select the hidden password hash", async (t) => {
  const originalFindById = User.findById;
  const originalCompare = bcrypt.compare;
  const originalHash = bcrypt.hash;
  t.after(() => {
    User.findById = originalFindById;
    bcrypt.compare = originalCompare;
    bcrypt.hash = originalHash;
  });

  let selectedField = "";
  let saved = false;
  const user = {
    password: "stored-hash",
    async save() {
      saved = true;
    },
  };
  User.findById = () => ({
    select: async (field) => {
      selectedField = field;
      return user;
    },
  });
  bcrypt.compare = async () => true;
  bcrypt.hash = async () => "replacement-hash";

  const res = responseRecorder();
  await accountController.changePassword(
    { user: { id: USER_ID }, body: { currentPassword: "old-password", newPassword: "new-password" } },
    res
  );

  assert.equal(selectedField, "+password");
  assert.equal(saved, true);
  assert.equal(user.password, "replacement-hash");
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
});

test("an authenticated user can review an existing product without an order lookup", async (t) => {
  const originals = {
    orderFind: Order.find,
    productFindById: Product.findById,
    reviewFindOne: Review.findOne,
    reviewCreate: Review.create,
    userFindById: User.findById,
  };
  t.after(() => {
    Order.find = originals.orderFind;
    Product.findById = originals.productFindById;
    Review.findOne = originals.reviewFindOne;
    Review.create = originals.reviewCreate;
    User.findById = originals.userFindById;
  });

  let orderLookups = 0;
  let createdReview;
  Order.find = () => {
    orderLookups += 1;
    throw new Error("purchase history must not control review access");
  };
  Product.findById = () => selectable({ _id: PRODUCT_ID, sellerId: SELLER_ID, title: "Wedding Chair" });
  Review.findOne = () => selectable(null);
  Review.create = async (data) => {
    createdReview = data;
    return { _id: "review-1", ...data };
  };
  User.findById = (id) => selectable(
    String(id) === USER_ID
      ? { _id: USER_ID, fullName: "Asha Buyer", email: "asha@example.com" }
      : { _id: SELLER_ID, fullName: "Ravi Seller", email: "ravi@example.com" }
  );

  const res = responseRecorder();
  await reviewController.createReview(
    {
      user: { id: USER_ID },
      body: {
        productId: PRODUCT_ID,
        sellerId: "64f000000000000000000099",
        rating: 5,
        title: "Lovely",
        comment: "Comfortable and clean",
      },
    },
    res
  );

  assert.equal(orderLookups, 0);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(String(createdReview.userId), USER_ID);
  assert.equal(String(createdReview.sellerId), SELLER_ID);
});

test("review eligibility is true for a logged-in user with no existing review", async (t) => {
  const originalProductFindById = Product.findById;
  const originalReviewFindOne = Review.findOne;
  const originalOrderFind = Order.find;
  t.after(() => {
    Product.findById = originalProductFindById;
    Review.findOne = originalReviewFindOne;
    Order.find = originalOrderFind;
  });

  let orderLookups = 0;
  Order.find = () => {
    orderLookups += 1;
    throw new Error("purchase history must not control review access");
  };
  Product.findById = () => selectable({ _id: PRODUCT_ID });
  Review.findOne = () => selectable(null);

  const res = responseRecorder();
  await reviewController.canReviewProduct(
    { user: { id: USER_ID }, params: { productId: PRODUCT_ID } },
    res
  );

  assert.equal(orderLookups, 0);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: true, canReview: true });
});

test("a user cannot create a second review for the same product", async (t) => {
  const originalProductFindById = Product.findById;
  const originalReviewFindOne = Review.findOne;
  const originalReviewCreate = Review.create;
  t.after(() => {
    Product.findById = originalProductFindById;
    Review.findOne = originalReviewFindOne;
    Review.create = originalReviewCreate;
  });

  Product.findById = () => selectable({ _id: PRODUCT_ID, sellerId: SELLER_ID, title: "Wedding Chair" });
  Review.findOne = () => selectable({ _id: "existing-review" });
  Review.create = async () => {
    throw new Error("duplicate review should be rejected before create");
  };

  const res = responseRecorder();
  await reviewController.createReview(
    { user: { id: USER_ID }, body: { productId: PRODUCT_ID, rating: 4, comment: "Again" } },
    res
  );

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /already reviewed/i);
});

test("a review cannot be created for a product that does not exist", async (t) => {
  const originalProductFindById = Product.findById;
  t.after(() => {
    Product.findById = originalProductFindById;
  });
  Product.findById = () => selectable(null);

  const res = responseRecorder();
  await reviewController.createReview(
    { user: { id: USER_ID }, body: { productId: PRODUCT_ID, rating: 5, comment: "Missing" } },
    res
  );

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Product not found");
});
