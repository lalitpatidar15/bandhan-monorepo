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
    <div className="min-h-screen bg-[#F7F3EF] text-[#2D201B]">
      <CurriculumHeader currentStep={4} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8A4A26]">Instructor preview</p>
            <h1 className="mt-1 text-3xl font-serif font-semibold">Course preview</h1>
          </div>
          <button onClick={() => router.back()} className="bhn-btn bhn-btn-secondary">
            Back to pricing
          </button>
        </div>

        {!courseId ? <p className="rounded-xl bg-white p-5">Missing course id.</p> : null}
        {isLoading ? <p className="rounded-xl bg-white p-5">Loading course preview…</p> : null}
        {error ? <p className="rounded-xl bg-white p-5 text-red-600">Unable to load this course preview.</p> : null}

        {course ? (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <section className="overflow-hidden rounded-2xl border border-[#E8DDD5] bg-white">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title || "Course thumbnail"} className="h-72 w-full object-cover sm:h-96" />
              ) : (
                <div className="flex h-72 items-center justify-center bg-[#F0E6DF] text-[#7D6E66] sm:h-96">No thumbnail uploaded</div>
              )}
              <div className="p-6">
                <p className="text-sm text-[#8A4A26]">{course.category || "Uncategorised"} · {course.level || "All levels"}</p>
                <h2 className="mt-2 text-3xl font-serif font-semibold">{course.title || "Untitled course"}</h2>
                <p className="mt-4 whitespace-pre-wrap leading-7 text-[#5E5049]">{course.description || "No course description yet."}</p>
              </div>
            </section>

            <aside className="h-fit rounded-2xl border border-[#E8DDD5] bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8A4A26]">Course details</p>
              <p className="mt-4 text-3xl font-bold">₹{course.pricing?.finalPrice ?? course.pricing?.basePrice ?? 0}</p>
              <p className="mt-2 text-sm text-[#7D6E66]">{course.visibility === "private" ? "Private course" : "Visible to students once published"}</p>
              <div className="mt-6 border-t border-[#EEE5DF] pt-5">
                <h3 className="font-semibold">Curriculum</h3>
                <div className="mt-3 space-y-3">
                  {(course.modules || []).map((module: any) => (
                    <div key={module._id} className="rounded-lg bg-[#FAF7F5] p-3">
                      <p className="font-medium">{module.title || "Untitled module"}</p>
                      <p className="mt-1 text-sm text-[#7D6E66]">{(module.lessons || []).length} lesson(s)</p>
                    </div>
                  ))}
                  {(course.modules || []).length === 0 ? <p className="text-sm text-[#7D6E66]">No modules added yet.</p> : null}
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}
