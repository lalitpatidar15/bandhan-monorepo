"use client";

import { Check, ChevronDown, ChevronUp, Edit3, Plus, Trash2 } from "lucide-react";
import { Field } from "@bandhan/ui";
import { Event, EventPhase, EventTask, UpdateEventRequest } from "@/types/event";

interface Props {
  event: Event;
  onSaveTimeline: (partial: UpdateEventRequest) => void;
}

const PHASE_STATUSES = ["Not started", "In progress", "Done"] as const;
const TASK_PRIORITIES = ["Low", "Medium", "High"] as const;

function defaultPhaseNames(eventType: string): string[] {
  if (eventType === "Wedding") {
    return ["Venue & décor", "Invitations", "Catering", "Photography & video", "Attire & styling", "Music & entertainment", "Planning & coordination"];
  }
  return ["Planning", "Venue booking", "Vendor selection", "Final preparations"];
}

export default function EventTimeline({ event, onSaveTimeline }: Props) {
  const phases: EventPhase[] = Array.isArray(event.phases) && event.phases.length ? event.phases : [];
  const tasks: EventTask[] = Array.isArray(event.tasks) ? event.tasks : [];

  const donePhases = phases.filter((p) => p.status === "Done").length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  const setPhases = (updater: (p: EventPhase[]) => EventPhase[]) => {
    onSaveTimeline({ phases: updater(phases) });
  };
  const setTasks = (updater: (t: EventTask[]) => EventTask[]) => {
    onSaveTimeline({ tasks: updater(tasks) });
  };

  const addPhase = () => {
    const name = window.prompt("Phase name:", "New phase");
    if (!name) return;
    setPhases((p) => [...p, { name, status: "Not started", progress: 0 }]);
  };

  const addTask = (phaseName: string) => {
    const title = window.prompt("Task title:", "New task");
    if (!title) return;
    setTasks((t) => [...t, { title, priority: "Medium", status: "pending", phase: phaseName }]);
  };

  const movePhase = (idx: number, dir: number) => {
    setPhases((p) => {
      const copy = [...p];
      const [moved] = copy.splice(idx, 1);
      copy.splice(idx + dir, 0, moved);
      return copy;
    });
  };

  const moveTask = (idx: number, dir: number) => {
    setTasks((t) => {
      const copy = [...t];
      const [moved] = copy.splice(idx, 1);
      copy.splice(idx + dir, 0, moved);
      return copy;
    });
  };

  const updatePhase = (idx: number, patch: Partial<EventPhase>) => {
    setPhases((p) => p.map((ph, i) => (i === idx ? { ...ph, ...patch } : ph)));
  };

  const updateTask = (idx: number, patch: Partial<EventTask>) => {
    setTasks((t) => t.map((tk, i) => (i === idx ? { ...tk, ...patch } : tk)));
  };

  const removePhase = (idx: number) => {
    const name = phases[idx]?.name;
    setPhases((p) => p.filter((_, i) => i !== idx));
    if (name) setTasks((t) => t.filter((tk) => tk.phase !== name));
  };

  const removeTask = (idx: number) => {
    setTasks((t) => t.filter((_, i) => i !== idx));
  };

  return (
    <div className="bhn-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Event Timeline</h3>
        <button type="button" onClick={addPhase} className="bhn-btn bhn-btn-primary bhn-btn-sm gap-2">
          <Plus size={14} /> Add phase
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Phases" value={`${donePhases}/${phases.length || 0}`} />
        <StatTile label="Tasks" value={`${doneTasks}/${tasks.length}`} />
      </div>

      {phases.length === 0 && defaultPhaseNames(event.eventType).length > 0 ? (
        <div className="bhn-card bhn-card-hover p-6 text-center">
          <Edit3 size={32} className="mx-auto mb-3 text-[var(--bhn-brand-600)]" />
          <p className="text-sm text-[var(--bhn-text-muted)] mb-3">No phases yet. Add your first planning phase.</p>
          <button type="button" onClick={addPhase} className="bhn-btn bhn-btn-secondary bhn-btn-sm gap-2">
            <Plus size={12} /> Add phase
          </button>
        </div>
      ) : (
        <ul className="bhn-timeline">
          {phases.map((ph, i) => (
            <li key={ph._id || ph.id || i} className="bhn-timeline-item bhn-timeline-item-done mb-6 last:mb-0">
              <span className="bhn-timeline-dot">
                {ph.status === "Done" ? <Check size={12} /> : <span className="block h-2 w-2 rounded-full bg-[var(--bhn-brand-600)]" />}
              </span>
              <div className="bhn-timeline-content">
                <div className="flex items-center justify-between gap-3">
                  <p className="bhn-timeline-title">{ph.name}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-[var(--bhn-text-muted)]">{ph.status} · {Number(ph.progress || 0)}%</span>
                    <button type="button" onClick={() => movePhase(i, -1)} disabled={i === 0} className="bhn-btn bhn-btn-ghost bhn-btn-sm" title="Move up">
                      <ChevronUp size={12} />
                    </button>
                    <button type="button" onClick={() => movePhase(i, 1)} disabled={i === phases.length - 1} className="bhn-btn bhn-btn-ghost bhn-btn-sm" title="Move down">
                      <ChevronDown size={12} />
                    </button>
                    <button type="button" onClick={() => removePhase(i)} className="bhn-btn bhn-btn-ghost bhn-btn-sm" title="Remove phase">
                      <Trash2 size={12} className="text-[var(--bhn-error-600)]" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--bhn-text)]">Progress</span>
                    <button type="button" onClick={() => addTask(ph.name)} className="bhn-btn bhn-btn-secondary bhn-btn-sm gap-1">
                      <Plus size={11} /> Add task
                    </button>
                  </div>
                  <Field label="Phase name">
                    <input
                      value={ph.name}
                      onChange={(e) => updatePhase(i, { name: e.target.value })}
                      className="bhn-input w-full text-sm"
                    />
                  </Field>
                  <Field label="Status">
                    <select value={ph.status} onChange={(e) => updatePhase(i, { status: e.target.value })} className="bhn-select w-full">
                      {PHASE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Progress (%)">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Number(ph.progress || 0)}
                      onChange={(e) => updatePhase(i, { progress: Number(e.target.value) })}
                      className="w-full"
                    />
                  </Field>

                  <div className="pt-2 border-t border-[var(--bhn-border)] space-y-2">
                    {tasks.filter((t) => t.phase === ph.name).length === 0 ? (
                      <p className="text-[10px] text-[var(--bhn-text-soft)]">No tasks for this phase.</p>
                    ) : (
                      tasks
                        .map((t, ti) => ({ t, ti }))
                        .filter(({ t }) => t.phase === ph.name)
                        .map(({ t, ti }) => (
                          <TaskRow
                            key={t._id || t.id || `${ph.name}-${ti}`}
                            task={t}
                            globalIndex={ti}
                            onUpdate={updateTask}
                            onMove={(dir) => moveTask(ti, dir)}
                            onRemove={() => removeTask(ti)}
                            isFirst={ti === 0}
                            isLast={ti === tasks.length - 1}
                          />
                        ))
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => onSaveTimeline({ phases, tasks })}
          className="bhn-btn bhn-btn-primary gap-2"
        >
          <Check size={14} /> Save timeline
        </button>
      </div>
    </div>
  );
}

interface TaskRowProps {
  task: EventTask;
  globalIndex: number;
  onUpdate: (idx: number, patch: Partial<EventTask>) => void;
  onMove: (dir: number) => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function TaskRow({ task, globalIndex, onUpdate, onMove, onRemove, isFirst, isLast }: TaskRowProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={task.status === "done"}
          onChange={(e) => onUpdate(globalIndex, { status: e.target.checked ? "done" : "pending" })}
          className="accent-[var(--bhn-brand-600)]"
        />
        <span className="text-xs text-[var(--bhn-text-muted)]">done</span>
      </label>
      <input
        value={task.title}
        onChange={(e) => onUpdate(globalIndex, { title: e.target.value })}
        className="bhn-input flex-1 text-sm"
        placeholder="Task title"
      />
      <select
        value={task.priority}
        onChange={(e) => onUpdate(globalIndex, { priority: e.target.value })}
        className="bhn-select w-32 text-xs"
      >
        {TASK_PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <button type="button" onClick={() => onMove(-1)} disabled={isFirst} className="bhn-btn bhn-btn-ghost bhn-btn-sm" title="Move up">
        <ChevronUp size={12} />
      </button>
      <button type="button" onClick={() => onMove(1)} disabled={isLast} className="bhn-btn bhn-btn-ghost bhn-btn-sm" title="Move down">
        <ChevronDown size={12} />
      </button>
      <button type="button" onClick={onRemove} className="bhn-btn bhn-btn-ghost bhn-btn-sm" title="Remove">
        <Trash2 size={12} className="text-[var(--bhn-error-600)]" />
      </button>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bhn-card p-3 text-center">
      <p className="text-xs text-[var(--bhn-text-muted)]">{label}</p>
      <p className="text-xl font-semibold text-[var(--bhn-text)]">{value}</p>
    </div>
  );
}
