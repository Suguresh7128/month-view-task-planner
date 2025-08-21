import React, { useEffect, useMemo, useRef, useState } from "react";

// --- Utility: date helpers ---------------------------------------------------
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const toISODate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
const fromISODate = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addMonths = (date, n) => new Date(date.getFullYear(), date.getMonth() + n, 1);
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Adjust if week should start Mon

// Sample labels and statuses
const DEFAULT_LABELS = [
  { key: "design", name: "Design", color: "#a78bfa" },
  { key: "dev", name: "Development", color: "#60a5fa" },
  { key: "content", name: "Content", color: "#f59e0b" },
  { key: "ops", name: "Ops", color: "#34d399" },
];
const STATUSES = [
  { key: "todo", name: "To Do" },
  { key: "inprogress", name: "In Progress" },
  { key: "done", name: "Done" },
];

// --- Storage keys ------------------------------------------------------------
const LS_TASKS_KEY = "month_planner_tasks_v1";
const LS_SETTINGS_KEY = "month_planner_settings_v1";

// --- Task Modal --------------------------------------------------------------
function TaskModal({ open, onClose, onSave, onDelete, initial }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [date, setDate] = useState(initial?.date || toISODate(new Date()));
  const [label, setLabel] = useState(initial?.label || DEFAULT_LABELS[0].key);
  const [status, setStatus] = useState(initial?.status || "todo");
  const [notes, setNotes] = useState(initial?.notes || "");

  useEffect(() => {
    if (open) {
      setTitle(initial?.title || "");
      setDate(initial?.date || toISODate(new Date()));
      setLabel(initial?.label || DEFAULT_LABELS[0].key);
      setStatus(initial?.status || "todo");
      setNotes(initial?.notes || "");
    }
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl" 
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{initial?.id ? "Edit Task" : "New Task"}</h3>
          <button className="rounded-lg px-2 py-1 text-sm hover:bg-gray-100" onClick={onClose}>✕</button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Title</span>
            <input
              className="rounded-xl border p-2 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Finalize hero section"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">Date</span>
              <input
                type="date"
                className="rounded-xl border p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">Status</span>
              <select
                className="rounded-xl border p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s.key} value={s.key}>{s.name}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Label</span>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_LABELS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => setLabel(l.key)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:shadow ${label === l.key ? "ring-2 ring-indigo-500" : ""}`}
                >
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.name}
                </button>
              ))}
            </div>
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Notes</span>
            <textarea
              rows={3}
              className="rounded-xl border p-2 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between">
          {initial?.id ? (
            <button
              onClick={() => onDelete?.(initial)}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100"
            >
              Delete
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-xl px-3 py-2 hover:bg-gray-100">Cancel</button>
            <button
              onClick={() => onSave({ ...initial, title, date, label, status, notes })}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Task Card ---------------------------------------------------------------
function TaskCard({ task, onDragStart, onClick }) {
  const labelMeta = DEFAULT_LABELS.find((l) => l.key === task.label) || DEFAULT_LABELS[0];
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/task-id", task.id);
        onDragStart?.(task);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(task);
      }}
      className="group flex cursor-grab items-center gap-2 rounded-xl border bg-white px-2 py-1 text-sm shadow hover:shadow-md active:cursor-grabbing"
      title="Drag to reschedule"
    >
      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: labelMeta.color }} />
      <span className="line-clamp-1 flex-1">{task.title}</span>
      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-600">
        {task.status}
      </span>
    </div>
  );
}

// --- Main Component ----------------------------------------------------------
export default function TaskPlannerMonth() {
  // state
  const [current, setCurrent] = useState(() => startOfMonth(new Date()));
  const [tasks, setTasks] = useState(() => {
    const raw = localStorage.getItem(LS_TASKS_KEY);
    if (raw) return JSON.parse(raw);
    // Seed with a few demo tasks
    const today = new Date();
    return [
      { id: crypto.randomUUID(), title: "Kickoff moodboard", date: toISODate(today), label: "design", status: "todo", notes: "Collect 10 refs" },
      { id: crypto.randomUUID(), title: "API contract review", date: toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)), label: "dev", status: "inprogress" },
      { id: crypto.randomUUID(), title: "Landing copy draft", date: toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)), label: "content", status: "todo" },
      { id: crypto.randomUUID(), title: "Vendor onboarding", date: toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)), label: "ops", status: "done" },
    ];
  });
  const [filters, setFilters] = useState(() => {
    const raw = localStorage.getItem(LS_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { query: "", labels: new Set(), statuses: new Set() };
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // persist
  useEffect(() => {
    localStorage.setItem(LS_TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    // Serialize sets for storage
    const s = {
      query: filters.query || "",
      labels: Array.from(filters.labels || []),
      statuses: Array.from(filters.statuses || []),
    };
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(s));
  }, [filters]);
  useEffect(() => {
    // When loading, convert arrays back to sets
    if (!(filters.labels instanceof Set)) {
      setFilters((f) => ({
        ...f,
        labels: new Set(f.labels || []),
        statuses: new Set(f.statuses || []),
      }));
    }
  }, []);

  // computed calendar grid
  const days = useMemo(() => {
    const start = startOfMonth(current);
    const end = endOfMonth(current);
    const startDay = start.getDay(); // 0 Sun .. 6 Sat
    // Begin grid on Sunday before/at first of month
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - startDay);

    // 6 weeks * 7 days = 42 cells ensures full grid
    return Array.from({ length: 42 }).map((_, i) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      return d;
    });
  }, [current]);

  // filtering
  const filteredTasks = useMemo(() => {
    const q = (filters.query || "").toLowerCase();
    const labelSet = filters.labels instanceof Set ? filters.labels : new Set(filters.labels || []);
    const statusSet = filters.statuses instanceof Set ? filters.statuses : new Set(filters.statuses || []);
    return tasks.filter((t) => {
      const matchQ = !q || t.title.toLowerCase().includes(q) || (t.notes || "").toLowerCase().includes(q);
      const matchLabel = labelSet.size === 0 || labelSet.has(t.label);
      const matchStatus = statusSet.size === 0 || statusSet.has(t.status);
      return matchQ && matchLabel && matchStatus;
    });
  }, [tasks, filters]);

  const tasksByDate = useMemo(() => {
    const map = new Map();
    for (const t of filteredTasks) {
      const arr = map.get(t.date) || [];
      arr.push(t);
      map.set(t.date, arr);
    }
    // Sort tasks within a day by status -> title
    for (const [k, arr] of map) {
      arr.sort((a, b) => (a.status > b.status ? 1 : a.status < b.status ? -1 : a.title.localeCompare(b.title)));
    }
    return map;
  }, [filteredTasks]);

  const onDropTaskToDate = (e, day) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/task-id");
    if (!id) return;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, date: toISODate(day) } : t)));
  };

  const clearFilters = () => setFilters({ query: "", labels: new Set(), statuses: new Set() });

  // UI helpers
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(current);
  const today = new Date();

  return (
    <div className="mx-auto max-w-7xl p-4">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className="rounded-2xl border bg-white px-3 py-2 shadow hover:bg-gray-50"
            onClick={() => setCurrent(addMonths(current, -1))}
            title="Previous month"
          >
            ←
          </button>
          <button
            className="rounded-2xl border bg-white px-3 py-2 shadow hover:bg-gray-50"
            onClick={() => setCurrent(addMonths(current, 1))}
            title="Next month"
          >
            →
          </button>
          <button
            className="rounded-2xl border bg-white px-3 py-2 shadow hover:bg-gray-50"
            onClick={() => setCurrent(startOfMonth(new Date()))}
            title="Jump to current month"
          >
            Today
          </button>
          <h2 className="ml-2 text-2xl font-semibold">{monthLabel}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              className="w-56 rounded-2xl border bg-white px-3 py-2 pl-9 shadow outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search tasks..."
              value={filters.query || ""}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            />
            <span className="pointer-events-none absolute left-3 top-2.5">🔎</span>
          </div>
          <button
            className="rounded-2xl bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700"
            onClick={() => {
              setEditing({ date: toISODate(today), title: "", status: "todo", label: DEFAULT_LABELS[0].key });
              setModalOpen(true);
            }}
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="mb-4 grid gap-3 rounded-2xl border bg-white p-3 shadow">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Labels:</span>
          {DEFAULT_LABELS.map((l) => (
            <label key={l.key} className="flex items-center gap-2 rounded-xl border px-3 py-1 text-sm">
              <input
                type="checkbox"
                checked={filters.labels instanceof Set ? filters.labels.has(l.key) : (filters.labels || []).includes(l.key)}
                onChange={(e) =>
                  setFilters((f) => {
                    const s = f.labels instanceof Set ? new Set(f.labels) : new Set(f.labels || []);
                    e.target.checked ? s.add(l.key) : s.delete(l.key);
                    return { ...f, labels: s };
                  })
                }
              />
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />
              {l.name}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          {STATUSES.map((s) => (
            <label key={s.key} className="flex items-center gap-2 rounded-xl border px-3 py-1 text-sm">
              <input
                type="checkbox"
                checked={filters.statuses instanceof Set ? filters.statuses.has(s.key) : (filters.statuses || []).includes(s.key)}
                onChange={(e) =>
                  setFilters((f) => {
                    const st = f.statuses instanceof Set ? new Set(f.statuses) : new Set(f.statuses || []);
                    e.target.checked ? st.add(s.key) : st.delete(s.key);
                    return { ...f, statuses: st };
                  })
                }
              />
              {s.name}
            </label>
          ))}
          <button onClick={clearFilters} className="ml-auto rounded-xl px-3 py-2 text-sm hover:bg-gray-100">Clear filters</button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 rounded-t-2xl bg-gray-50 text-sm font-medium text-gray-600">
        {WEEKDAYS.map((d) => (
          <div key={d} className="border-b p-2 text-center">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 rounded-b-2xl border border-t-0">
        {days.map((day, i) => {
          const inMonth = day.getMonth() === current.getMonth();
          const isToday = isSameDay(day, today);
          const key = toISODate(day);
          const dayTasks = tasksByDate.get(key) || [];
          const showTasks = dayTasks.slice(0, 3);
          const extra = dayTasks.length - showTasks.length;

          return (
            <div
              key={i}
              onDoubleClick={() => {
                setEditing({ date: key, title: "", status: "todo", label: DEFAULT_LABELS[0].key });
                setModalOpen(true);
              }}
              onClick={() => {/* single-click selects; dblclick creates */}}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropTaskToDate(e, day)}
              className={`min-h-[120px] border p-2 ${inMonth ? "bg-white" : "bg-gray-50"} relative hover:bg-indigo-50/30`}
            >
              <div className="mb-1 flex items-center justify-between">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${isToday ? "bg-indigo-600 text-white" : "text-gray-700"}`}>
                  {day.getDate()}
                </div>
                <button
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
                  title="Add task"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing({ date: key, title: "", status: "todo", label: DEFAULT_LABELS[0].key });
                    setModalOpen(true);
                  }}
                >
                  ＋
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {showTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onDragStart={() => {}}
                    onClick={(task) => {
                      setEditing(task);
                      setModalOpen(true);
                    }}
                  />
                ))}
                {extra > 0 && (
                  <button
                    className="mt-1 text-left text-xs text-indigo-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open a lightweight day list modal
                      setEditing({ __dayList: true, date: key });
                      setModalOpen(true);
                    }}
                  >
                    +{extra} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day list modal (simple reuse of TaskModal UI for viewing) */}
      {modalOpen && editing?.__dayList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={() => setModalOpen(false)}>
          <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tasks on {editing.date}</h3>
              <button className="rounded-lg px-2 py-1 text-sm hover:bg-gray-100" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="grid gap-2">
              {(tasksByDate.get(editing.date) || []).map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onClick={(task) => {
                    setEditing(task);
                    // Switch to edit modal
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      <TaskModal
        open={modalOpen && !editing?.__dayList}
        initial={editing && !editing.__dayList ? editing : null}
        onClose={() => setModalOpen(false)}
        onDelete={(task) => {
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
          setModalOpen(false);
        }}
        onSave={(data) => {
          if (!data.title?.trim()) return;
          if (data.id) {
            setTasks((prev) => prev.map((t) => (t.id === data.id ? { ...t, ...data } : t)));
          } else {
            setTasks((prev) => [
              ...prev,
              { id: crypto.randomUUID(), title: data.title.trim(), date: data.date, label: data.label, status: data.status, notes: data.notes || "" },
            ]);
          }
          setModalOpen(false);
        }}
      />

      {/* Footer tips */}
      <div className="mt-6 grid gap-1 text-sm text-gray-600">
        <p>Tips:</p>
        <ul className="list-inside list-disc">
          <li>Double‑click a date cell to quickly add a task for that day.</li>
          <li>Drag a task card to another date to reschedule it.</li>
          <li>Use the label and status filters to focus on what matters.</li>
          <li>All data is stored locally in your browser (localStorage).</li>
        </ul>
      </div>
    </div>
  );
}
