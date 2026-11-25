"use client";

import CurriculumHeader from "@/components/common/CurriculumHeader";
import { useGetInstructorCourseQuery } from "@/app/redux/instructor-services/courseApi";
import { useRouter, useSearchParams } from "next/navigation";

export default function CoursePreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const { data, isLoading, error } = useGetInstructorCourseQuery(courseId, { skip: !courseId });
  const course = data?.data;

  return (
    <div className="min-h-screen bg-[var(--bhn-surface-3)] text-[var(--bhn-text)]">
      <CurriculumHeader currentStep={4} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--bhn-brand-700)]">Instructor preview</p>
            <h1 className="mt-1 text-3xl font-serif font-semibold">Course preview</h1>
          </div>
          <button onClick={() => router.back()} className="bhn-btn bhn-btn-secondary">
            Back to pricing
          </button>
        </div>

        {!courseId ? <p className="rounded-xl bg-[var(--bhn-surface)] p-5">Missing course id.</p> : null}
        {isLoading ? <p className="rounded-xl bg-[var(--bhn-surface)] p-5">Loading course preview…</p> : null}
        {error ? <p className="rounded-xl bg-[var(--bhn-surface)] p-5 text-[var(--bhn-error-600)]">Unable to load this course preview.</p> : null}

        {course ? (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <section className="overflow-hidden rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)]">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title || "Course thumbnail"} className="h-72 w-full object-cover sm:h-96" />
              ) : (
                <div className="flex h-72 items-center justify-center bg-[var(--bhn-surface-3)] text-[var(--bhn-text-soft)] sm:h-96">No thumbnail uploaded</div>
              )}
              <div className="p-6">
                <p className="text-sm text-[var(--bhn-brand-700)]">{course.category || "Uncategorised"} · {course.level || "All levels"}</p>
                <h2 className="mt-2 text-3xl font-serif font-semibold">{course.title || "Untitled course"}</h2>
                <p className="mt-4 whitespace-pre-wrap leading-7 text-[var(--bhn-text-muted)]">{course.description || "No course description yet."}</p>
              </div>
            </section>

            <aside className="h-fit rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--bhn-brand-700)]">Course details</p>
              <p className="mt-4 text-3xl font-bold">₹{course.pricing?.finalPrice ?? course.pricing?.basePrice ?? 0}</p>
              <p className="mt-2 text-sm text-[var(--bhn-text-soft)]">{course.visibility === "private" ? "Private course" : "Visible to students once published"}</p>
              <div className="mt-6 border-t border-[var(--bhn-border)] pt-5">
                <h3 className="font-semibold">Curriculum</h3>
                <div className="mt-3 space-y-3">
                  {(course.modules || []).map((module: any) => (
                    <div key={module._id} className="rounded-lg bg-[var(--bhn-surface-2)] p-3">
                      <p className="font-medium">{module.title || "Untitled module"}</p>
                      <p className="mt-1 text-sm text-[var(--bhn-text-soft)]">{(module.lessons || []).length} lesson(s)</p>
                    </div>
                  ))}
                  {(course.modules || []).length === 0 ? <p className="text-sm text-[var(--bhn-text-soft)]">No modules added yet.</p> : null}
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}
