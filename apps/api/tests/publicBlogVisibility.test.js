const test = require("node:test");
const assert = require("node:assert/strict");

const Blog = require("../models/shared/Blog.js");
const blogController = require("../controllers/ecommUser/blogController.js");

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("public blog slug lookup only queries published posts", async (context) => {
  const originalFindOne = Blog.findOne;
  context.after(() => {
    Blog.findOne = originalFindOne;
  });

  let capturedFilter;
  Blog.findOne = (filter) => {
    capturedFilter = filter;
    return {
      select: async () => null,
    };
  };

  const response = responseRecorder();
  await blogController.getBlogBySlug({ params: { slug: "private-draft" } }, response);

  assert.deepEqual(capturedFilter, {
    slug: "private-draft",
    status: "published",
    published: true,
  });
  assert.equal(response.statusCode, 404);
  assert.equal(response.body.success, false);
});
