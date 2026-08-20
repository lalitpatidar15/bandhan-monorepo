"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from '@/components/ui/Card';

type Props = {
  bookedDates?: number[];
};

export default function AvailabilityCalendar({ bookedDates = [10, 14, 18] }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9)); // October 2024
  const [selectedDate, setSelectedDate] = useState<number | null>(7);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = Array.from({ length: firstDay }, (_, i) => i + 1);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const changeMonth = (dir: number) => {
    setCurrentDate(new Date(year, month + dir));
    setSelectedDate(null);
  };

  return (
    <Card className="bg-white p-4 rounded-3xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => changeMonth(-1)}>
          <ChevronLeft />
        </button>

        <h3 className="text-sm font-medium text-[#1C1A16]">
          {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </h3>

        <button onClick={() => changeMonth(1)}>
          <ChevronRight />
        </button>
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 text-xs text-[#8B7E72] mb-3 text-center uppercase">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-2 text-sm">
        {/* Empty spaces */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={i}></div>
        ))}

        {/* Days */}
        {days.map((day) => {
          const isBooked = bookedDates.includes(day);
          const isSelected = selectedDate === day;

          return (
            <button
              key={day}
              disabled={isBooked}
              onClick={() => setSelectedDate(day)}
              className={`h-12 rounded-2xl flex items-center justify-center transition
                ${isSelected ? "bg-[#C2652A] text-white" : ""}
                ${isBooked ? "bg-[#F0E2D5] text-[#8B7E72] cursor-not-allowed" : ""}
                ${!isBooked && !isSelected ? "hover:bg-[#EAD9C8] text-[#6B625A]" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-6 text-xs text-[#6B625A]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#C2652A]" />
          Selected
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F0E2D5]" />
          Booked
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-[#C2652A]" />
          Available
        </div>
      </div>
    </Card>
  );
}