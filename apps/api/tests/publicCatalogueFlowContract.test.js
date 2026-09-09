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

test("course player exposes progress and embedded quiz data for enrolled students", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../controllers/Student/courseController.js"),
    "utf8",
  );
  const playerSource = source.slice(source.indexOf("exports.getCoursePlayer"), source.indexOf("exports.completeLesson"));

  assert.match(playerSource, /getStudentLessonQuizMetadata\(/);
  assert.match(playerSource, /Quiz\.find\(\{ courseId: course\._id \}\)/);
  assert.doesNotMatch(playerSource, /mcqData:\s*lesson\.mcqData \|\| null/);
  assert.doesNotMatch(playerSource, /quiz:\s*lesson\.quiz \|\| null/);
  assert.match(playerSource, /percentage:\s*enrollment\.progressPercentage/);
  assert.match(playerSource, /completed: completedLessonIds\.has\(String\(lesson\._id\)\)/);
});

test("embedded instructor MCQs can be loaded as an enrolled student quiz", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../controllers/Student/courseController.js"),
    "utf8",
  );
  const quizSource = source.slice(source.indexOf("exports.getQuizForStudent"), source.indexOf("exports.submitQuiz"));

  assert.match(quizSource, /"modules\.lessons\._id": req\.params\.lessonId/);
  assert.match(quizSource, /lesson\?\.quiz\?\.questions\?\.length/);
  assert.match(quizSource, /question\.options\.length >= 2/);
  assert.match(quizSource, /embeddedQuiz\?\.passingMarks \?\? embeddedQuiz\?\.passingScore/);
  assert.match(quizSource, /Quiz\.create\(/);
  assert.match(quizSource, /studentId: req\.user\.id/);
  assert.match(quizSource, /const studentQuiz = \{/);
  assert.doesNotMatch(quizSource.slice(quizSource.indexOf("const studentQuiz")), /isCorrect:\s*option\.isCorrect/);
});

test("quiz submissions use the authenticated student and advance course completion", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../controllers/Student/courseController.js"),
    "utf8",
  );
  const submitSource = source.slice(source.indexOf("exports.submitQuiz"), source.indexOf("exports.getQuizResult"));

  assert.match(submitSource, /const studentId = req\.user\.id/);
  assert.match(submitSource, /const alreadyPassed = existingResult\?\.passed === true/);
  assert.match(submitSource, /const result = existingResult \|\| new QuizResult/);
  assert.match(submitSource, /if \(passed\)/);
  assert.match(submitSource, /syncCourseProgress\(\{ enrollment, course, studentId \}\)/);
  assert.doesNotMatch(submitSource, /const \{ studentId, answers \}/);
});

test("quiz lessons cannot be marked complete until the authenticated student passes", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../controllers/Student/courseController.js"),
    "utf8",
  );
  const completionSource = source.slice(source.indexOf("exports.completeLesson"), source.indexOf("// ===== create quiz"));

  assert.match(completionSource, /const lessonRequiresQuiz = Boolean/);
  assert.match(completionSource, /QuizResult\.exists\(\{/);
  assert.match(completionSource, /studentId: req\.user\.id/);
  assert.match(completionSource, /Pass this lesson's quiz before marking it complete/);
});

test("completed courses issue downloadable PDF certificates", () => {
  const controller = fs.readFileSync(
    path.join(__dirname, "../controllers/Student/courseController.js"),
    "utf8",
  );
  const routes = fs.readFileSync(
    path.join(__dirname, "../routes/student/courseRoutes.js"),
    "utf8",
  );
  const certificateSource = controller.slice(controller.indexOf("exports.downloadCertificate"), controller.indexOf("// ===== profile"));

  assert.match(controller, /const buildCertificatePdf/);
  assert.match(controller, /const syncCourseProgress/);
  assert.match(controller, /for \(const enrollment of completedEnrollments\)/);
  assert.match(controller, /courseProgress\.certificates\.push\(\{ title, issuedAt: enrollment\.completedAt/);
  assert.match(certificateSource, /"certificates\._id": req\.params\.certificateId/);
  assert.match(certificateSource, /Content-Type", "application\/pdf"/);
  assert.match(certificateSource, /res\.status\(200\)\.send\(pdf\)/);
  assert.match(routes, /progress\/:studentId\/certificate\/:certificateId", auth, requireRole\("student"\)/);
});

test("quiz creation is instructor-only and scoped to the instructor's course", () => {
  const controller = fs.readFileSync(
    path.join(__dirname, "../controllers/Student/courseController.js"),
    "utf8",
  );
  const routes = fs.readFileSync(
    path.join(__dirname, "../routes/student/courseRoutes.js"),
    "utf8",
  );
  const createSource = controller.slice(controller.indexOf("exports.createQuiz"), controller.indexOf("// ====== quiz"));

  assert.match(routes, /post\("\/create", auth, requireRole\("instructor"\), courseController\.createQuiz\)/);
  assert.match(createSource, /instructorId: req\.user\.id/);
  assert.match(createSource, /course\.modules\.id\(moduleId\)/);
  assert.match(createSource, /module\?\.lessons\.id\(lessonId\)/);
});
