import { useState } from "react";

interface TagInputProps {
  label: string;
  placeholder?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags?: string[];
}

export function TagInput({
  label,
  placeholder = "Type and press Enter",
  tags,
  onTagsChange,
  availableTags,
}: TagInputProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      const newTag = input.trim();
      if (!tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      setInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-brown-900">{label}</label>
      <div className="space-y-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-brown-200 bg-white px-4 py-3 text-sm text-brown-950 placeholder-brown-500 transition focus:border-brown-500 focus:outline-none"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="inline-flex items-center gap-2 rounded-full bg-[#FF9D56]/20 px-3 py-1.5 text-sm font-medium text-[#D27E2C]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-[#D27E2C] transition hover:opacity-70"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {availableTags && (
          <div className="flex flex-wrap gap-2">
            {availableTags
              .filter((tag) => !tags.includes(tag))
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onTagsChange([...tags, tag]);
                  }}
                  className="rounded-full border border-dashed border-brown-300 px-3 py-1.5 text-xs font-medium text-brown-600 transition hover:border-brown-400 hover:text-brown-700"
                >
                  + {tag}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
