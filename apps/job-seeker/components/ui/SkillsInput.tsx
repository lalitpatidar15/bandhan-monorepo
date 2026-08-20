import { useState } from "react";

interface SkillsInputProps {
  label: string;
  placeholder?: string;
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  suggestedSkills?: string[];
}

export function SkillsInput({
  label,
  placeholder = "Type skill and press Enter",
  skills,
  onSkillsChange,
  suggestedSkills = [],
}: SkillsInputProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      const newSkill = input.trim();
      if (!skills.includes(newSkill)) {
        onSkillsChange([...skills, newSkill]);
      }
      setInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter((skill) => skill !== skillToRemove));
  };

  const toggleSuggestedSkill = (skill: string) => {
    if (skills.includes(skill)) {
      removeSkill(skill);
    } else {
      onSkillsChange([...skills, skill]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-brown-900">{label}</label>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-brown-200 bg-white px-4 py-3 text-sm text-brown-950 placeholder-brown-500 transition focus:border-brown-500 focus:outline-none"
      />
      
      {/* Selected Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-2 rounded-full bg-[#FF9D56]/20 px-3 py-1.5 text-sm font-medium text-[#D27E2C]"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-[#D27E2C] transition hover:opacity-70"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Suggested Skills */}
      {suggestedSkills.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-brown-700">Suggested Skills</p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSuggestedSkill(skill)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  skills.includes(skill)
                    ? "bg-[#FF9D56]/20 text-[#D27E2C]"
                    : "border border-dashed border-brown-300 text-brown-600 hover:border-brown-400 hover:text-brown-700"
                }`}
              >
                {skills.includes(skill) ? "✓ " : "+ "}{skill}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
