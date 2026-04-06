import { useState, useRef, useEffect, useCallback } from "react";
import { AGENTS, COLORS, ICONS } from "../lib/agents";
import { loadProjects, saveProject, deleteProject, newProject, loadMemory, addMemory, getMemoryContext } from "../lib/storage";

// ─── LIVE SPORTS DATA ───────────────────────────────────────────────────────
// Uses ESPN's free public API — no key needed
async function fetchLiveSports() {
  const sports = [
    { name: "NBA", url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard" },
    { name: "NFL", url: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard" },
    { name: "MLB", url: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard" },
    { name: "NCAAFB", url: "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard" },
    { name: "NCAAMB", url: "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard" },
  ];

  const results = [];

  for (const sport of sports) {
    try {
      const res = await fetch(sport.url);
      const data = await res.json();
      const events = data.events || [];

      if (events.length === 0) {
        results.push(`${sport.name}: No games today.`);
        continue;
      }

      const gameLines = events.map(event => {
        const comp = event.competitions?.[0];
        const status = comp?.status?.type?.description || "Unknown";
        const detail = comp?.status?.type?.detail || "";
        const competitors = comp?.competitors || [];
        const home = competitors.find(c => c.homeAway === "home");
        const away = competitors.find(c => c.homeAway === "away");
        const homeName = home?.team?.abbreviation || "?";
        const awayName = away?.team?.abbreviation || "?";
        const homeScore = home?.score ?? "-";
        const awayScore = away?.score ?? "-";
        const homeRecord = home?.records?.[0]?.summary || "";
        const awayRecord = away?.records?.[0]?.summary || "";

        let line = `  ${awayName}${awayRecord ? ` (${awayRecord})` : ""} ${awayScore} @ ${homeName}${homeRecord ? ` (${homeRecord})` : ""} ${homeScore}`;
        line += ` — ${status}${detail ? `: ${detail}` : ""}`;

        // Add leaders if available
        const leaders = comp?.leaders || [];
        const pts = leaders.find(l => l.name === "points" || l.abbreviation === "PTS" || l.abbreviation === "REC");
        if (pts?.leaders?.[0]) {
          const leader = pts.leaders[0];
          line += `\n    ⭐ ${leader.athlete?.displayName || "?"}: ${leader.displayValue}`;
        }

        return line;
      });

      results.push(`${sport.name} (${events.length} game${events.length !== 1 ? "s" : ""}):\n${gameLines.join("\n")}`);
    } catch (e) {
      results.push(`${sport.name}: Could not fetch data.`);
    }
  }

  return results.join("\n\n");
}

async function fetchTeamGame(teamName) {
  const sports = [
    { name: "NBA", url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard" },
    { name: "NFL", url: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard" },
    { name: "MLB", url: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard" },
    { name: "NCAAFB", url: "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard" },
    { name: "NCAAMB", url: "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard" },
  ];

  const query = teamName.toLowerCase();

  for (const sport of sports) {
    try {
      const res = await fetch(sport.url);
      const data = await res.json();
      const events = data.events || [];

      for (const event of events) {
        const comp = event.competitions?.[0];
        const competitors = comp?.competitors || [];
        const names = competitors.map(c => [
          c.team?.displayName?.toLowerCase(),
          c.team?.shortDisplayName?.toLowerCase(),
          c.team?.abbreviation?.toLowerCase(),
          c.team?.name?.toLowerCase(),
        ]).flat();

        if (names.some(n => n && n.includes(query))) {
          const status = comp?.status?.type?.description || "Unknown";
          const detail = comp?.status?.type?.detail || "";
          const home = competitors.find(c => c.homeAway === "home");
          const away = competitors.find(c => c.homeAway === "away");
          const homeName = home?.team?.displayName || "?";
          const awayName = away?.team?.displayName || "?";
          const homeScore = home?.score ?? "-";
          const awayScore = away?.score ?? "-";

          let result = `[${sport.name}] ${awayName} ${awayScore} @ ${homeName} ${homeScore}\nStatus: ${status}${detail ? ` — ${detail}` : ""}`;

          // Add all stat leaders
          const leaders = comp?.leaders || [];
          if (leaders.length > 0) {
            result += "\n\nStat Leaders:";
            leaders.forEach(cat => {
              const top = cat.leaders?.[0];
              if (top) result += `\n  ${cat.displayName}: ${top.athlete?.displayName || "?"} — ${top.displayValue}`;
            });
          }

          return result;
        }
      }
    } catch (e) {
      // continue to next sport
    }
  }

  return `No current game found for "${teamName}". They may not be playing today.`;
}

// Detect if a message is asking about sports/live games
function detectSportsQuery(message) {
  const msg = message.toLowerCase();
  const sportsKeywords = [
    "score", "game", "playing", "live", "tonight", "today", "vs", "versus",
    "quarter", "half", "period", "inning", "match", "winning", "losing",
    "nba", "nfl", "mlb", "ncaa", "basketball", "football", "baseball",
    "lakers", "warriors", "celtics", "knicks", "bulls", "heat", "nets",
    "chiefs", "eagles", "cowboys", "patriots", "broncos", "packers",
    "yankees", "dodgers", "astros", "cubs", "mets", "red sox",
    "ducks", "ducks game", "oregon", "duke", "kansas", "kentucky",
    "luka", "lebron", "curry", "durant", "giannis", "mahomes",
    "standings", "playoffs", "championship", "final score", "box score",
    "stats", "points", "touchdown", "home run", "who won", "who's winning"
  ];
  return sportsKeywords.some(kw => msg.includes(kw));
}

// Extract team name from message
function extractTeamName(message) {
  const msg = message.toLowerCase();
  const teams = [
    "lakers", "warriors", "celtics", "knicks", "bulls", "heat", "nets", "bucks",
    "suns", "nuggets", "clippers", "mavs", "mavericks", "rockets", "spurs",
    "chiefs", "eagles", "cowboys", "patriots", "broncos", "packers", "49ers",
    "ravens", "bills", "bengals", "rams", "seahawks", "bears", "lions", "vikings",
    "yankees", "dodgers", "astros", "cubs", "mets", "red sox", "braves", "giants",
    "oregon", "duke", "kansas", "kentucky", "unc", "ucla", "michigan", "ohio state"
  ];
  return teams.find(t => msg.includes(t)) || null;
}
// ─────────────────────────────────────────────────────────────────────────────

async function askClaude(messages, system) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text || "";
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

const AGENT_LIST = Object.values(AGENTS);

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [view, setView] = useState("home");
  const [directAgent, setDirectAgent] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [memory, setMemory] = useState([]);
  const [sideTab, setSideTab] = useState("agents");
  const chatEndRef = useRef(null);
  const activeRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setProjects(loadProjects());
    setMemory(loadMemory());
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeProject?.messages]);

  useEffect(() => {
    if (activeProject) {
      saveProject(activeProject);
      setProjects(loadProjects());
    }
  }, [activeProject]);

  useEffect(() => { activeRef.current = activeProject; }, [activeProject]);

  const updateProject = useCallback((updates) => {
    setActiveProject(prev => {
      if (!prev) return prev;
      const next = typeof updates === "function" ? updates(prev) : { ...prev, ...updates };
      next.updatedAt = new Date().toISOString();
      return next;
    });
  }, []);

  const addMsg = useCallback((role, text, isStatus = false) => {
    setActiveProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...(prev.messages || []), {
          id: `${Date.now()}-${Math.random()}`,
          role, text, isStatus,
          time: fmtTime(),
        }],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const replaceTyping = useCallback((role, text) => {
    setActiveProject(prev => {
      if (!prev) return prev;
      const msgs = [...prev.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === role && msgs[i].text === "...") {
          msgs[i] = { ...msgs[i], text, isStatus: false };
          break;
        }
      }
      return { ...prev, messages: msgs, updatedAt: new Date().toISOString() };
    });
  }, []);

  function pushHistory(agentName, role, content) {
    setActiveProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        agentHistories: {
          ...prev.agentHistories,
          [agentName]: [...(prev.agentHistories?.[agentName] || []), { role, content }],
        },
      };
    });
  }

  async function callAgent(agentName, userMessage) {
    const proj = activeRef.current;
    const agent = AGENTS[agentName];
    if (!agent) throw new Error(`Unknown agent: ${agentName}`);
    const system = agent.system + getMemoryContext();
    const history = proj?.agentHistories?.[agentName] || [];
    const messages = [...history, { role: "user", content: userMessage }];
    pushHistory(agentName, "user", userMessage);
    const response = await askClaude(messages, system);
    pushHistory(agentName, "assistant", response);
    return response;
  }

  async function runTeamChat(userMessage) {
    setLoading(true);
    try {
      // ── SPORTS INTERCEPTION ──────────────────────────────────────
      if (detectSportsQuery(userMessage)) {
        addMsg("researcher", "...");
        await sleep(200);

        let sportsContext = "";
        const teamName = extractTeamName(userMessage);

        if (teamName) {
          addMsg("researcher", `🔴 LIVE — Fetching ${teamName} game data...`, true);
          await sleep(100);
          sportsContext = await fetchTeamGame(teamName);
        } else {
          addMsg("researcher", "🔴 LIVE — Fetching all scores now...", true);
          await sleep(100);
          sportsContext = await fetchLiveSports();
        }

        // Remove the status message and replace with real answer
        const response = await callAgent("researcher",
          `Jose asked: "${userMessage}"\n\nHere is the LIVE sports data pulled right now:\n\n${sportsContext}\n\nAnswer Jose's question using this real data. Be concise and direct. If a game is live, say so clearly.`
        );
        replaceTyping("researcher", response);
        setLoading(false);
        return;
      }
      // ─────────────────────────────────────────────────────────────

      addMsg("orchestrator", "...");
      await sleep(300);

      let plan;
      try {
        const orchRaw = await callAgent("orchestrator",
          `Jose just said: "${userMessage}"\n\nAnalyze this. Return ONLY JSON:\n{"plan":"brief description","agents":["researcher"],"tasks":{"researcher":"specific task"}}`
        );
        const cleaned = orchRaw.replace(/```json|```/g, "").trim();
        const start = cleaned.indexOf("{");
        plan = JSON.parse(start >= 0 ? cleaned.slice(start) : cleaned);
        if (!plan.agents || !Array.isArray(plan.agents)) throw new Error("bad plan");
      } catch {
        plan = { plan: "Handling directly.", agents: ["writer"], tasks: { writer: userMessage } };
      }

      replaceTyping("orchestrator", `**Plan:** ${plan.plan}\n\nActivating: ${plan.agents.join(", ")}`);
      await sleep(400);

      let context = `Jose's request: "${userMessage}"\nPlan: ${plan.plan}`;

      for (const agentName of plan.agents) {
        if (!AGENTS[agentName]) continue;
        const task = plan.tasks?.[agentName] || userMessage;
        addMsg(agentName, "...");
        await sleep(200);
        let response;
        try {
          response = await callAgent(agentName, `${context}\n\nYour task: ${task}\n\nDeliver your full output now.`);
        } catch (e) {
          response = `Error: ${e.message}`;
        }
        context += `\n\n${agentName.toUpperCase()} OUTPUT:\n${response}`;
        replaceTyping(agentName, response);
        await sleep(300);
      }

      try {
        const memRaw = await askClaude(
          [{ role: "user", content: `${context}\n\nExtract 1-2 key facts worth remembering. Return ONLY JSON array: ["fact1"]. If nothing, return [].` }],
          "Extract concise memory facts. Return only JSON array."
        );
        const cleaned = memRaw.replace(/```json|```/g, "").trim();
        const start = cleaned.indexOf("[");
        if (start >= 0) {
          const facts = JSON.parse(cleaned.slice(start));
          facts.forEach(f => { if (f && f.length > 5) addMemory(f); });
          setMemory(loadMemory());
        }
      } catch { }

    } catch (e) {
      addMsg("orchestrator", `Something went wrong: ${e.message}`);
    }
    setLoading(false);
  }

  async function runDirectChat(agentName, userMessage) {
    setLoading(true);

    // Sports interception for direct chat too
    if (detectSportsQuery(userMessage) && (agentName === "researcher" || agentName === "analyst")) {
      addMsg(agentName, "...");
      await sleep(200);
      const teamName = extractTeamName(userMessage);
      let sportsContext = teamName ? await fetchTeamGame(teamName) : await fetchLiveSports();
      try {
        const response = await callAgent(agentName,
          `Jose asked: "${userMessage}"\n\nLIVE sports data:\n\n${sportsContext}\n\nAnswer using this real data.`
        );
        replaceTyping(agentName, response);
      } catch (e) {
        replaceTyping(agentName, `Error: ${e.message}`);
      }
      setLoading(false);
      return;
    }

    addMsg(agentName, "...");
    try {
      const response = await callAgent(agentName, userMessage);
      replaceTyping(agentName, response);
    } catch (e) {
      replaceTyping(agentName, `Error: ${e.message}`);
    }
    setLoading(false);
  }

  async function runDailyBriefing() {
    const proj = newProject("Daily Briefing — " + new Date().toLocaleDateString(), "team");
    setActiveProject(proj);
    setView("team");
    saveProject(proj);
    setProjects(loadProjects());
    await sleep(100);
    setLoading(true);
    addMsg("orchestrator", "Good morning Jose. Running your daily briefing...");
    await sleep(500);

    // Fetch live sports for briefing
    addMsg("researcher", "🔴 Pulling live scores...", true);
    let liveScores = "";
    try {
      liveScores = await fetchLiveSports();
    } catch (e) {
      liveScores = "Could not fetch live scores.";
    }

    addMsg("researcher", "...");
    try {
      const response = await callAgent("researcher",
        `Generate Jose's daily briefing for ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.\n\nHere are TODAY'S LIVE SCORES (pulled right now):\n\n${liveScores}\n\nCover IN THIS ORDER:\n1. NBA & SPORTS — use the live scores above, add context/analysis\n2. NIL INDUSTRY — deals, rule changes, trends for OA and NEST\n3. STOCK MARKET — major moves, investing news\n4. AI & TECH — notable developments\n5. ECONOMICS — macro trends\n\n2-3 bullets per section. End with:\n## TODAY'S PRIORITIES\nWhat Jose should focus on today.`
      );
      replaceTyping("researcher", response);
    } catch (e) {
      replaceTyping("researcher", `Briefing error: ${e.message}`);
    }
    setLoading(false);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    let proj = activeRef.current;
    if (!proj) {
      proj = newProject(text, view === "direct" ? "direct" : "team");
      if (view === "direct" && directAgent) proj.directAgent = directAgent;
      setActiveProject(proj);
      saveProject(proj);
      setProjects(loadProjects());
      await sleep(50);
    }

    addMsg("user", text);
    await sleep(100);

    if (view === "direct" && directAgent) {
      await runDirectChat(directAgent, text);
    } else {
      await runTeamChat(text);
    }
  }

  function startNewTeamChat() {
    const proj = newProject("New conversation", "team");
    setActiveProject(proj);
    setView("team");
    saveProject(proj);
    setProjects(loadProjects());
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function startDirectChat(agentName) {
    const agent = AGENTS[agentName];
    const proj = newProject(`Chat with ${agent.label}`, "direct");
    proj.directAgent = agentName;
    setActiveProject(proj);
    setDirectAgent(agentName);
    setView("direct");
    saveProject(proj);
    setProjects(loadProjects());
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function openProject(proj) {
    setActiveProject(proj);
    setView(proj.mode || "team");
    if (proj.directAgent) setDirectAgent(proj.directAgent);
  }

  function handleDelete(e, id) {
    e.stopPropagation();
    deleteProject(id);
    setProjects(loadProjects());
    if (activeProject?.id === id) { setActiveProject(null); setView("home"); }
  }

  const phase = activeProject?.status || "idle";
  const isPaused = phase === "paused";
  const isDone = phase === "done";
  const c = (n) => COLORS[n] || "#888";
  const ico = (n) => ICONS[n] || "◇";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#070709", fontFamily: "'IBM Plex Mono','Courier New',monospace" }}>

      {/* SIDEBAR */}
      <div style={{ width: "260px", minWidth: "260px", background: "#09090d", borderRight: "1px solid #13131a", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #13131a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "18px", color: "#ff6b35" }}>◈</span>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "3px", color: "#ff6b35" }}>JOSE'S TEAM</div>
              <div style={{ fontSize: "9px", color: "#3a3a3e", letterSpacing: "1px" }}>8 AGENTS · 🔴 LIVE SPORTS</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button onClick={startNewTeamChat} style={{ padding: "9px", background: "#ff6b35", border: "none", borderRadius: "6px", color: "#000", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", cursor: "pointer", fontFamily: "inherit" }}>
              + NEW TEAM CHAT
            </button>
            <button onClick={runDailyBriefing} disabled={loading} style={{ padding: "9px", background: "transparent", border: "1px solid #1e1e28", borderRadius: "6px", color: loading ? "#3a3a3e" : "#4ecdc4", fontSize: "11px", letterSpacing: "1px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              ☀ DAILY BRIEFING
            </button>
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid #13131a" }}>
          {["agents", "projects", "memory"].map(tab => (
            <button key={tab} onClick={() => setSideTab(tab)} style={{ flex: 1, padding: "8px 4px", background: "transparent", border: "none", borderBottom: `2px solid ${sideTab === tab ? "#ff6b35" : "transparent"}`, color: sideTab === tab ? "#ff6b35" : "#3a3a3e", fontSize: "9px", letterSpacing: "1px", cursor: "pointer", fontFamily: "inherit" }}>
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {sideTab === "agents" && (
            <div style={{ padding: "6px" }}>
              <div style={{ padding: "6px 6px 4px", fontSize: "9px", color: "#52525b", letterSpacing: "1px" }}>CLICK TO DIRECT MESSAGE</div>
              {AGENT_LIST.map(agent => (
                <div key={agent.name} onClick={() => startDirectChat(agent.name)}
                  style={{ display: "flex", gap: "10px", padding: "9px", borderRadius: "6px", cursor: "pointer", marginBottom: "2px", border: "1px solid transparent", alignItems: "center" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#0e0e14"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#0e0e14", border: `1px solid ${agent.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: agent.color, flexShrink: 0 }}>
                    {agent.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "10px", color: agent.color, letterSpacing: "1px", fontWeight: "600" }}>{agent.label}</div>
                    <div style={{ fontSize: "10px", color: "#52525b", lineHeight: "1.3", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sideTab === "projects" && (
            <div style={{ padding: "6px" }}>
              {projects.length === 0 && (
                <div style={{ padding: "20px 10px", fontSize: "11px", color: "#27272a", textAlign: "center", lineHeight: "1.8" }}>
                  No projects yet.<br />Start a team chat.
                </div>
              )}
              {projects.map(p => (
                <div key={p.id} onClick={() => openProject(p)}
                  style={{ padding: "10px", borderRadius: "6px", cursor: "pointer", background: activeProject?.id === p.id ? "#13131a" : "transparent", border: `1px solid ${activeProject?.id === p.id ? "#2a2a2e" : "transparent"}`, marginBottom: "2px" }}>
                  <div style={{ fontSize: "11px", color: activeProject?.id === p.id ? "#e4e4e7" : "#71717a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "3px" }}>{p.title}</div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span style={{ fontSize: "9px", color: p.mode === "direct" ? c(p.directAgent) : "#ff6b35" }}>
                      {p.mode === "direct" ? `◎ ${p.directAgent?.toUpperCase()}` : "◈ TEAM"}
                    </span>
                    <span style={{ fontSize: "9px", color: "#3a3a3e" }}>{fmtDate(p.createdAt)}</span>
                    <span onClick={e => handleDelete(e, p.id)} style={{ marginLeft: "auto", color: "#3a3a3e", cursor: "pointer", fontSize: "12px" }}>✕</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sideTab === "memory" && (
            <div style={{ padding: "6px" }}>
              <div style={{ padding: "6px 6px 4px", fontSize: "9px", color: "#52525b", letterSpacing: "1px" }}>TEAM MEMORY ({memory.length})</div>
              {memory.length === 0 && (
                <div style={{ padding: "16px 10px", fontSize: "11px", color: "#27272a", textAlign: "center", lineHeight: "1.8" }}>
                  No memories yet.<br />Agents save facts after each project.
                </div>
              )}
              {memory.slice(0, 30).map((m, i) => (
                <div key={i} style={{ padding: "8px 10px", marginBottom: "4px", background: "#0e0e14", borderRadius: "4px", borderLeft: "2px solid #ff6b3544", fontSize: "10px", color: "#71717a", lineHeight: "1.5" }}>
                  {m.fact}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: "50px", borderBottom: "1px solid #13131a", background: "#09090d", display: "flex", alignItems: "center", padding: "0 20px", gap: "12px", flexShrink: 0 }}>
          {view === "home" && <span style={{ fontSize: "12px", color: "#3a3a3e" }}>Select a project or start a new chat</span>}
          {view === "team" && (
            <>
              <span style={{ fontSize: "12px", color: "#ff6b35" }}>◈</span>
              <span style={{ fontSize: "11px", color: "#71717a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeProject?.title || "Team Chat"}</span>
              <div style={{ display: "flex", gap: "3px" }}>
                {AGENT_LIST.map(a => (
                  <div key={a.name} title={a.label} style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#0e0e14", border: `1px solid ${a.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: a.color }}>
                    {a.icon}
                  </div>
                ))}
              </div>
            </>
          )}
          {view === "direct" && directAgent && (
            <>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#0e0e14", border: `1px solid ${c(directAgent)}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: c(directAgent) }}>
                {ico(directAgent)}
              </div>
              <div>
                <div style={{ fontSize: "11px", color: c(directAgent), letterSpacing: "1px", fontWeight: "600" }}>{AGENTS[directAgent]?.label}</div>
                <div style={{ fontSize: "9px", color: "#3a3a3e" }}>Direct message</div>
              </div>
              <button onClick={startNewTeamChat} style={{ marginLeft: "auto", background: "transparent", border: "1px solid #1e1e28", borderRadius: "4px", color: "#52525b", fontSize: "10px", padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>
                ← TEAM CHAT
              </button>
            </>
          )}
          {loading && (
            <div style={{ marginLeft: view === "home" ? "auto" : undefined, display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", border: "2px solid #ff6b35", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: "10px", color: "#ff6b3588", letterSpacing: "1px" }}>WORKING...</span>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {view === "home" && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <div style={{ fontSize: "32px", color: "#1e1e28", marginBottom: "8px" }}>◈</div>
              <div style={{ fontSize: "14px", color: "#52525b", letterSpacing: "2px" }}>JOSE'S AGENT TEAM</div>
              <div style={{ fontSize: "11px", color: "#3a3a3e", marginBottom: "4px" }}>8 agents ready to work</div>
              <div style={{ fontSize: "9px", color: "#ff6b3566", letterSpacing: "1px", marginBottom: "20px" }}>🔴 LIVE SPORTS DATA ENABLED</div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "32px" }}>
                <button onClick={startNewTeamChat} style={{ padding: "12px 20px", background: "#ff6b35", border: "none", borderRadius: "8px", color: "#000", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", cursor: "pointer", fontFamily: "inherit" }}>
                  START TEAM CHAT
                </button>
                <button onClick={runDailyBriefing} style={{ padding: "12px 20px", background: "transparent", border: "1px solid #1e1e28", borderRadius: "8px", color: "#4ecdc4", fontSize: "11px", letterSpacing: "1px", cursor: "pointer", fontFamily: "inherit" }}>
                  ☀ DAILY BRIEFING
                </button>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", maxWidth: "500px" }}>
                {AGENT_LIST.map(a => (
                  <div key={a.name} onClick={() => startDirectChat(a.name)}
                    style={{ padding: "6px 12px", borderRadius: "20px", border: `1px solid ${a.color}33`, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                    onMouseEnter={e => e.currentTarget.style.background = a.color + "18"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ color: a.color, fontSize: "11px" }}>{a.icon}</span>
                    <span style={{ fontSize: "10px", color: a.color, letterSpacing: "1px" }}>{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(view === "team" || view === "direct") && activeProject?.messages?.map(msg => {
            const isUser = msg.role === "user";
            const color = c(msg.role);
            const icon = ico(msg.role);
            const isTyping = msg.text === "...";

            return (
              <div key={msg.id} style={{ display: "flex", gap: "12px", marginBottom: "16px", justifyContent: isUser ? "flex-end" : "flex-start", animation: "fadeUp .2s ease" }}>
                {!isUser && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                    <div style={{ width: "30px", height: "30px", minWidth: "30px", borderRadius: "50%", background: "#0e0e14", border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color }}>
                      {isTyping
                        ? <div style={{ width: "12px", height: "12px", border: `2px solid ${color}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                        : icon}
                    </div>
                    <span style={{ fontSize: "8px", color: color + "88", letterSpacing: "1px" }}>{msg.role.slice(0, 5).toUpperCase()}</span>
                  </div>
                )}
                <div style={{ maxWidth: "74%", padding: "10px 14px", borderRadius: isUser ? "12px 12px 3px 12px" : "3px 12px 12px 12px", background: isUser ? "#0f0f18" : "#0d0d12", border: `1px solid ${isUser ? "#1e1e2e" : color + "22"}`, borderLeft: isUser ? undefined : `2px solid ${msg.isStatus ? color + "44" : color + "66"}`, fontSize: "12px", lineHeight: "1.8", color: isUser ? "#a1a1aa" : msg.isStatus ? color + "aa" : "#d4d4d8", fontStyle: msg.isStatus && !isTyping ? "italic" : "normal", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {isTyping ? (
                    <div style={{ display: "flex", gap: "4px", alignItems: "center", padding: "2px 0" }}>
                      {[0, 1, 2].map(i => <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
                    </div>
                  ) : msg.text}
                </div>
                {isUser && (
                  <div style={{ width: "30px", height: "30px", minWidth: "30px", borderRadius: "50%", background: "#13131a", border: "1px solid #2a2a2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#71717a" }}>J</div>
                )}
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {view !== "home" && (
          <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #13131a", background: "#09090d", flexShrink: 0 }}>
            <div style={{ fontSize: "9px", letterSpacing: "2px", marginBottom: "8px", color: view === "direct" && directAgent ? c(directAgent) + "88" : "#ff6b3566" }}>
              {view === "direct" && directAgent ? `TALKING TO ${AGENTS[directAgent]?.label}` : "TALKING TO THE WHOLE TEAM"}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                disabled={loading}
                placeholder={loading ? "Team is working..." : view === "direct" ? `Message ${AGENTS[directAgent]?.label}...` : "Message your team..."}
                rows={1}
                style={{ flex: 1, background: "#0e0e14", border: `1px solid ${view === "direct" && directAgent ? c(directAgent) + "44" : "#1e1e28"}`, borderRadius: "8px", color: "#d4d4d8", fontSize: "12px", padding: "11px 14px", outline: "none", resize: "none", lineHeight: "1.6", fontFamily: "inherit", opacity: loading ? 0.5 : 1 }}
              />
              <button onClick={handleSend} disabled={!input.trim() || loading}
                style={{ width: "42px", height: "42px", borderRadius: "8px", border: "none", background: input.trim() && !loading ? (view === "direct" && directAgent ? c(directAgent) : "#ff6b35") : "#13131a", color: input.trim() && !loading ? "#000" : "#3a3a3e", fontSize: "16px", cursor: input.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}>
                ↑
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2e; border-radius: 2px; }
        textarea::placeholder { color: #3a3a3e; }
      `}</style>
    </div>
  );
}
