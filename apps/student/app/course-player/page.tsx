import { redirect } from "next/navigation";

export default function CoursePlayerAliasPage() {
  redirect("/student/course-player/[id]");
}
