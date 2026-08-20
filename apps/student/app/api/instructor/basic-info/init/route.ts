import { NextResponse } from "next/server";

export async function GET() {
  const categories = [
    "UI/UX Design",
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Marketing",
    "Business",
  ];

  const levels = ["Beginner", "Intermediate", "Advanced"];

  const languages = ["English", "Hindi", "Gujarati"];

  const suggestedSkills = [
    "Figma",
    "Wireframing",
    "Prototyping",
    "React",
    "Node.js",
    "JavaScript",
    "UI Design",
    "UX Research",
  ];

  return NextResponse.json({
    success: true,
    message: "Basic info page data fetched successfully",
    data: {
      stepper: {
        currentStep: 1,
        totalSteps: 4,
        steps: [
          { id: 1, name: "Basic Info", active: true },
          { id: 2, name: "Curriculum", active: false },
          { id: 3, name: "Content", active: false },
          { id: 4, name: "Pricing", active: false },
        ],
      },
      dropdowns: {
        categories,
        levels,
        languages,
      },
      suggestedSkills,
      defaultValues: {
        title: "",
        subtitle: "",
        category: "",
        level: "",
        description: "",
        thumbnail: "",
        language: "English",
        estimatedDuration: "",
        skills: [],
      },
      livePreview: {
        title: "Course Title",
        instructor: "Instructor Name",
        thumbnail: "",
        rating: 0,
        price: 0,
      },
      checklist: {
        titleAdded: false,
        categorySelected: false,
        descriptionCompleted: false,
        thumbnailUploaded: false,
      },
    },
  });
}
