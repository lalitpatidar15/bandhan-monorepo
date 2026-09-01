const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("rental catalogue continuation keeps the selected listing path", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../../user/components/catalog/PublicCatalogueDetail.tsx"),
    "utf8",
  );

  assert.match(source, /router\.push\(`\/listings\/product\/\$\{encodeURIComponent\(id\)\}`\)/);
  assert.doesNotMatch(source, /type=products\/\$\{encodeURIComponent\(id\)\}/);
});

test("portal client fallbacks use the current production API", () => {
  const portalFiles = [
    "../../user/store/api/baseApi.ts",
    "../../student/app/redux/services/baseApi.ts",
    "../../job-seeker/components/upgrade.tsx",
    "../../admin/lib/adminApi.ts",
  ];

  for (const relativePath of portalFiles) {
    const source = fs.readFileSync(path.join(__dirname, relativePath), "utf8");
    assert.match(source, /https:\/\/bandhan-api\.vercel\.app/);
    assert.doesNotMatch(source, /bandhan-backend-gykw\.onrender\.com/);
  }
});

test("course player fails closed when enrollment is missing", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../../student/app/student/course-player/[id]/page.tsx"),
    "utf8",
  );

  assert.match(source, /course\?\.enrollment\?\.isEnrolled === true/);
  assert.doesNotMatch(source, /course\?\.enrollment\?\.isEnrolled \?\? true/);
});

test("course player returns the authenticated student's enrollment", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../controllers/Student/courseController.js"),
    "utf8",
  );

  const playerSource = source.slice(source.indexOf("exports.getCoursePlayer"), source.indexOf("exports.completeLesson"));
  assert.match(playerSource, /Enrollment\.findOne\(\{\s*studentId: req\.user\.id,/);
  assert.match(playerSource, /enrollment:\s*\{\s*isEnrolled: true,/);
});
