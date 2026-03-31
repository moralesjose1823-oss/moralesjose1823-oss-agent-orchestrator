const PROJECTS_KEY = "jose_projects_v2";
const MEMORY_KEY = "jose_team_memory";

export function loadProjects() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]");
  } catch { return []; }
}

export function saveProject(project) {
  if (typeof window === "undefined") return;
  const all = loadProjects();
  const idx = all.findIndex(p => p.id === project.id);
  if (idx >= 0) all[idx] = project;
  else all.unshift(project);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(all.slice(0, 100)));
}

export function deleteProject(id) {
  if (typeof window === "undefined") return;
  const all = loadProjects().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(all));
}

export function newProject(goal, mode = "team") {
  return {
    id: Date.now().toString(),
    goal,
    mode,
    directAgent: null,
    title: goal.length > 60 ? goal.slice(0, 60) + "..." : goal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "idle",
    messages: [],
    agentHistories: {},
  };
}

export function loadMemory() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");
  } catch { return []; }
}

export function addMemory(fact) {
  if (typeof window === "undefined") return;
  const mem = loadMemory();
  mem.unshift({ fact, addedAt: new Date().toISOString() });
  localStorage.setItem(MEMORY_KEY, JSON.stringify(mem.slice(0, 200)));
}

export function getMemoryContext() {
  const mem = loadMemory();
  if (mem.length === 0) return "";
  return "\n\nTEAM MEMORY FROM PAST PROJECTS:\n" +
    mem.slice(0, 20).map(m => `- ${m.fact}`).join("\n");
}
