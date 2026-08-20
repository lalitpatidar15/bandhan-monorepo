"use client";

import { useState } from "react";

type Tab = {
  label: string;
  value: string;
  content: React.ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
};

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div>
      <div className="bhn-tabs border-b border-[var(--bhn-border)] mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`bhn-tab bhn-tab-line ${activeTab === tab.value ? "bhn-tab-active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {tabs.map(
          (tab) =>
            tab.value === activeTab && (
              <div key={tab.value}>{tab.content}</div>
            )
        )}
      </div>
    </div>
  );
}