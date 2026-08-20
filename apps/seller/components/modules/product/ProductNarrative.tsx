"use client";

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";

export default function ProductNarrative({
  description,
  setDescription,
  textareaRef,
  formatText,
  addLink,
  tags,
  tagInput,
  setTagInput,
  setTags,
  removeTag,
  readOnly,
}: {
  description: string;
  setDescription: (v: string) => void;
  textareaRef: React.RefObject<HTMLDivElement | null>;
  formatText: (command: string) => void;
  addLink: () => void;
  tags: string[];
  tagInput: string;
  setTagInput: (v: string) => void;
  setTags: (v: string[] | ((prev: string[]) => string[])) => void;
  removeTag: (tag: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="bg-white border border-[#EEE7E1] rounded-[26px] p-4 sm:p-7">
      <div className="flex items-center gap-3 mb-7">
        <div className="w-7 h-7 rounded-md border border-[#B7794F] bg-[#FFF8F3] flex items-center justify-center">
          <Image src="/image08.png" alt="story" width={15} height={15} />
        </div>

        <h2 className="font-serif text-[22px] sm:text-[25px] leading-none text-[#2C1F1A] font-semibold">
          Narrative & Story
        </h2>
      </div>

      <label className="block text-[12px] tracking-[2px] font-semibold text-[#A59C95] mb-3">DESCRIPTION</label>

      <div className="border border-[#E6DFD8] rounded-[18px] overflow-hidden bg-white">
        <div className="min-h-[44px] border-b border-[#ECE6E1] flex flex-wrap items-center gap-2 px-3 py-2 bg-[#FCFBFA]">
          {[{ label: "B", action: "bold" }, { label: "I", action: "italic" }, { label: "U", action: "underline" }].map((btn, i) => (
            <button
              key={i}
              type="button"
              onClick={() => !readOnly && formatText(btn.action)}
              disabled={readOnly}
              className={`w-8 h-8 rounded-md flex items-center justify-center text-[#9C948E] ${readOnly ? "bg-[#F4F2EE] cursor-not-allowed" : "hover:bg-[#F3E6DC]"}`}
            >
              {btn.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => !readOnly && formatText("insertUnorderedList")}
            disabled={readOnly}
            className={`w-8 h-8 rounded-md flex items-center justify-center text-[#9C948E] ${readOnly ? "bg-[#F4F2EE] cursor-not-allowed" : "hover:bg-[#F3E6DC]"}`}
          >☰</button>
          <button
            type="button"
            onClick={() => !readOnly && addLink()}
            disabled={readOnly}
            className={`w-8 h-8 rounded-md flex items-center justify-center text-[#9C948E] ${readOnly ? "bg-[#F4F2EE] cursor-not-allowed" : "hover:bg-[#F3E6DC]"}`}
          >🔗</button>
        </div>

        <div
          ref={textareaRef}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          className={`w-full min-h-[220px] sm:min-h-[260px] p-5 outline-none overflow-y-auto text-[15px] sm:text-[16px] text-[#3A3A3A] ${readOnly ? "bg-[#F4F2EE]" : "bg-white"}`}
          onInput={(e) => !readOnly && setDescription(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: description }}
        />

        <div className="border-t border-[#ECE6E1] px-5 py-3 flex justify-end">
          <span className="text-[11px] tracking-[1px] font-semibold text-[#B0AAA5] uppercase">{description.length} / 2500 Characters</span>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-[12px] tracking-[2px] font-semibold text-[#A59C95] mb-4">SEARCH TAGS</label>

        <div className="border border-[#E6DFD8] rounded-[18px] px-3 py-3 flex flex-wrap items-center gap-3 min-h-[64px]">
          {tags.map((tag, index) => (
            <div key={index} className="h-[36px] px-4 rounded-full border border-[#DDD6CF] bg-white flex items-center gap-2 text-[14px]">
              <span>{tag}</span>
              {!readOnly && (
                <button type="button" onClick={() => removeTag(tag)} className="text-[#7D746E] hover:text-red-500 transition"><X size={14} /></button>
              )}
            </div>
          ))}

          {!readOnly && (
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const trimmed = tagInput.trim();
                if (!trimmed) return;
                if (tags.includes(trimmed)) { alert("Tag already added"); return; }
                if (tags.length >= 10) { alert("Maximum 10 tags allowed"); return; }
                setTags([...tags, trimmed]);
                setTagInput("");
              }
            }} placeholder="Add tag..." className="flex-1 min-w-[120px] h-[36px] outline-none text-[14px] bg-transparent" />
          )}
        </div>

        <p className="text-[11px] text-[#B3AAA3] mt-3">Press enter after each tag. Max 10 tags.</p>
      </div>
    </div>
  );
}
