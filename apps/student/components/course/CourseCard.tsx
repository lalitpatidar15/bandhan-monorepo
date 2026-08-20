import { useRouter } from "next/navigation";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Progressbar from "../common/ProgressBar";


type CourseCardProps = {
  id: string;
  title: string;
  instructor?: string;
  progress?: number;
  status?: "Active" | "Pending" | "Completed";
  role?: "student" | "instructor";
};

export default function CourseCard({
  id,
  title,
  instructor,
  progress,
  status,
  role = "student",
}: CourseCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (role === "student") {
      router.push(`/student/course-player/${id}`);
    } else {
      router.push(`/instructor/curriculum/${id}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border">
      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {/* Instructor */}
      {instructor && (
        <p className="text-sm text-gray-500 mb-3">
          By {instructor}
        </p>
      )}

      {/* Status */}
      {status && (
        <div className="mb-3">
          <Badge
            text={status}
            variant={
              status === "Active"
                ? "success"
                : status === "Pending"
                ? "warning"
                : "info"
            }
          />
        </div>
      )}

      {/* Progress (only for student) */}
      {role === "student" && progress !== undefined && (
        <div className="mb-4">
          <Progressbar value={progress} />
        </div>
      )}

      {/* Button */}
      <Button className="w-full" onClick={handleClick}>
        {role === "student" ? "Continue" : "Manage"}
      </Button>
    </div>
  );
}