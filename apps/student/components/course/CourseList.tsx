import CourseCard from "../course/CourseCard";

type Course = {
  id: string;
  title: string;
  instructor?: string;
  progress?: number;
  status?: "Active" | "Pending" | "Completed";
};

type CourseListProps = {
  courses: Course[];
  role?: "student" | "instructor";
};

export default function CourseList({
  courses,
  role = "student",
}: CourseListProps) {
  if (courses.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No courses available
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          id={course.id}
          title={course.title}
          instructor={course.instructor}
          progress={course.progress}
          status={course.status}
          role={role}
        />
      ))}
    </div>
  );
}