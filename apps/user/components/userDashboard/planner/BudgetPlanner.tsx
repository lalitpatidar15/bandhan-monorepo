"use client";

import { DEFAULT_BUDGET_CATEGORIES, Event, EventBudget, UpdateEventRequest } from "@/types/event";

interface Props {
  event: Event;
  onSaveBudget: (partial: UpdateEventRequest) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

function allocFor(base: EventBudget, total: number): Record<string, number> {
  const existing = base.allocated || {};
  const hasAlloc = DEFAULT_BUDGET_CATEGORIES.some((c) => (existing[c.key] || 0) > 0);
  const out: Record<string, number> = {};
  DEFAULT_BUDGET_CATEGORIES.forEach((c) => {
    out[c.key] = Number(existing[c.key]) || (hasAlloc ? 0 : Math.round((total * c.defaultPercent) / 100));
  });
  return out;
}

export default function BudgetPlanner({ event, onSaveBudget }: Props) {
  const base: EventBudget = event.budget || { total: 0, spent: 0, vendorPaid: 0, pending: 0, allocated: {}, spentByCategory: {} };
  const total = Number(base.total || 0);
  const aggregateSpent = Number(base.spent || 0);
  const vendorPaid = Number(base.vendorPaid || 0);

  const allocByCat = allocFor(base, total);
  const spentByCat: Record<string, number> = base.spentByCategory || {};
  const totalAllocated = Object.values(allocByCat).reduce((s, v) => s + (v || 0), 0);
  const remainingBudget = total - aggregateSpent;

  const buildBudget = (overrides: {
    total?: number;
    spent?: number;
    allocated?: Record<string, number>;
    spentByCategory?: Record<string, number>;
  }): EventBudget => {
    const nextTotal = Number(overrides.total ?? total);
    const nextSpent = Number(overrides.spent ?? aggregateSpent);
    return {
      total: nextTotal,
      spent: nextSpent,
      vendorPaid,
      pending: nextTotal - nextSpent,
      allocated: { ...allocByCat, ...(overrides.allocated || {}) },
      spentByCategory: { ...spentByCat, ...(overrides.spentByCategory || {}) },
    };
  };

  const handleTotalChange = (value: string) => {
    const v = Number(value) || 0;
    const reset = allocFor({ total: v, spent: aggregateSpent, vendorPaid, pending: v - aggregateSpent, allocated: {} }, v);
    onSaveBudget({ budget: buildBudget({ total: v, allocated: reset }) });
  };

  const handleAllocChange = (cat: string, v: number) => {
    onSaveBudget({ budget: buildBudget({ allocated: { [cat]: v } }) });
  };

  const handleSpentQuickAdd = (cat: string) => {
    const input = window.prompt('Add spent for "' + cat + '". Enter amount (₹):', "0");
    const amount = input === null ? null : Number(input);
    if (amount === null || Number.isNaN(amount) || amount < 0) return;
    onSaveBudget({
      budget: buildBudget({
        spent: aggregateSpent + amount,
        spentByCategory: { [cat]: (spentByCat[cat] || 0) + amount },
      }),
    });
  };

  const handleSpentDirect = (cat: string, v: number) => {
    const raw = Number(v) || 0;
    const delta = raw - (spentByCat[cat] || 0);
    onSaveBudget({
      budget: buildBudget({
        spent: aggregateSpent + delta,
        spentByCategory: { [cat]: raw },
      }),
    });
  };

  return (
    <div className="bhn-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Budget Planner</h3>
        <button type="button" onClick={() => onSaveBudget({ budget: buildBudget({}) })} className="bhn-btn bhn-btn-secondary bhn-btn-sm">
          Save now
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <BudgetStat label="Total budget" value={fmt(total)} tone="brand" />
        <BudgetStat label="Allocated" value={fmt(totalAllocated)} tone="info" />
        <BudgetStat label="Spent" value={fmt(aggregateSpent)} tone="warning" />
        <BudgetStat label="Remaining" value={fmt(remainingBudget)} tone={remainingBudget >= 0 ? "success" : "error"} />
      </div>

      <FieldRow label="Total budget (₹)" type="number" value={String(total)} onChange={handleTotalChange} />

      <div className="space-y-3">
        <p className="text-xs font-semibold text-[var(--bhn-text)] uppercase tracking-wider">Category allocation</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DEFAULT_BUDGET_CATEGORIES.map((c) => {
            const catAlloc = allocByCat[c.key] || 0;
            const catSpent = spentByCat[c.key] || 0;
            const used = catAlloc > 0 ? Math.min((catSpent / catAlloc) * 100, 100) : 0;
            const over = catSpent - catAlloc;
            const overClass = over > 0 ? "border-[var(--bhn-error-600)]" : "border-[var(--bhn-border)]";
            return (
              <div key={c.key} className={`bhn-card p-3 space-y-2 border-l-2 ${overClass}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--bhn-text)]">{c.label}</span>
                  <span className="text-xs text-[var(--bhn-text-muted)]">{c.defaultPercent}%</span>
                </div>
                <FieldRow label="Allocated (₹)" value={String(catAlloc)} onChange={(v) => handleAllocChange(c.key, Number(v))} />
                <FieldRow label="Spent (₹)" value={String(catSpent)} onChange={(v) => handleSpentDirect(c.key, Number(v))} />
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-[var(--bhn-surface-3)] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--bhn-brand-600)] transition-all" style={{ width: `${used}%` }} />
                  </div>
                  <button type="button" onClick={() => handleSpentQuickAdd(c.key)} className="bhn-btn bhn-btn-ghost bhn-btn-sm">
                    + spent
                  </button>
                </div>
                {over > 0 ? <p className="text-[10px] text-[var(--bhn-error-600)] font-medium">Over allocation</p> : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bhn-card bhn-card-hover p-4 space-y-2">
        <h4 className="text-xs font-semibold text-[var(--bhn-text)] uppercase tracking-wider">Vendor payments</h4>
        <p className="text-xs text-[var(--bhn-text-muted)]">
          Committed spend: <span className="font-semibold text-[var(--bhn-text)]">{fmt(aggregateSpent)}</span>. Paid to vendors:{" "}
          <span className="font-semibold text-[var(--bhn-text)]">{fmt(vendorPaid)}</span>. Pending dues:{" "}
          <span className="font-semibold text-[var(--bhn-text)]">{fmt(remainingBudget)}</span>.
        </p>
      </div>
    </div>
  );
}

function FieldRow({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-[var(--bhn-text)]">{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="bhn-input w-full text-xs" />
    </div>
  );
}

function BudgetStat({ label, value, tone }: { label: string; value: string; tone: "brand" | "info" | "warning" | "success" | "error" }) {
  const toneMap: Record<string, string> = {
    brand: "var(--bhn-brand-600)",
    info: "var(--bhn-info-600)",
    warning: "var(--bhn-warning-600)",
    success: "var(--bhn-success-600)",
    error: "var(--bhn-error-600)",
  };
  return (
    <div className="bhn-card p-3 flex flex-col gap-0.5">
      <span className="text-xs text-[var(--bhn-text-muted)]">{label}</span>
      <span className="font-semibold" style={{ color: toneMap[tone] }}>
        {value}
      </span>
    </div>
  );
}
