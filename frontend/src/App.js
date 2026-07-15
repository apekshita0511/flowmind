import { useState, useEffect, useCallback } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";
const PRIORITY_COLORS = { 1: "#22c55e", 2: "#eab308", 3: "#f97316", 4: "#ef4444", 5: "#dc2626" };
const PRIORITY_LABELS = { 1: "Low", 2: "Medium", 3: "High", 4: "Urgent", 5: "Critical" };
const PRIORITY_NAMES = { 1: "Low", 2: "Medium", 3: "High", 4: "Urgent", 5: "Critical" };

// ─── Auth Screen ────────────────────────────────────────────────────────────

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      if (mode === "register") {
        const res = await fetch(`${API}/api/v1/auth/register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(Object.values(data).flat().join(" "));
          setLoading(false);
          return;
        }
        setMode("login");
        setError("Account created! Sign in to continue.");
      } else {
        const res = await fetch(`${API}/api/v1/auth/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: form.username, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError("Invalid credentials");
          setLoading(false);
          return;
        }
        localStorage.setItem("fm_token", data.access);
        localStorage.setItem("fm_refresh", data.refresh);
        onLogin(data.access);
      }
    } catch {
      setError("Connection error — is the backend running?");
    }
    setLoading(false);
  };

  const fields = mode === "register"
    ? ["username", "email", "password"]
    : ["username", "password"];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a0a", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: "16px", padding: "40px", width: "360px" }}>
        <h2 style={{ color: "#a855f7", margin: "0 0 4px", fontSize: "24px" }}>⚡ FlowMind</h2>
        <p style={{ color: "#555", margin: "0 0 28px", fontSize: "13px" }}>AI Productivity Agent</p>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["login", "register"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", background: mode === m ? "#7c3aed" : "#1a1a1a", color: mode === m ? "white" : "#666" }}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {fields.map((field) => (
          <input key={field} type={field === "password" ? "password" : "text"}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={form[field]} onChange={update(field)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            style={{ width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", padding: "10px 14px", color: "white", fontSize: "14px", outline: "none", marginBottom: "10px", boxSizing: "border-box" }}
          />
        ))}

        {error && (
          <p style={{ color: error.includes("created") ? "#22c55e" : "#ef4444", fontSize: "13px", margin: "0 0 12px" }}>
            {error}
          </p>
        )}

        <button onClick={submit} disabled={loading}
          style={{ width: "100%", padding: "12px", background: loading ? "#333" : "#7c3aed", border: "none", borderRadius: "8px", color: "white", fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </div>
    </div>
  );
}

// ─── Analytics Panel ─────────────────────────────────────────────────────────

function AnalyticsPanel({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/v1/analytics/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [token]);

  if (!data) {
    return <div style={{ padding: "20px", color: "#555", fontSize: "13px" }}>Loading analytics...</div>;
  }

  const maxBar = Math.max(...data.daily_completion.map((d) => d.completed), 1);

  const statCards = [
    { label: "Productivity Score", value: data.productivity_score, suffix: "/100", color: "#a855f7" },
    { label: "Day Streak", value: data.streak_days, suffix: " days", color: "#f97316" },
    { label: "Completion Rate", value: data.completion_rate, suffix: "%", color: "#22c55e" },
    { label: "Tasks Done", value: data.completed, suffix: `/${data.total_tasks}`, color: "#eab308" },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
      <p style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 14px" }}>Analytics</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
        {statCards.map(({ label, value, suffix, color }) => (
          <div key={label} style={{ background: "#1a1a1a", borderRadius: "10px", padding: "12px" }}>
            <div style={{ color: "#555", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>{label}</div>
            <div style={{ color, fontSize: "22px", fontWeight: "bold" }}>
              {value}<span style={{ fontSize: "11px", color: "#666" }}>{suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#1a1a1a", borderRadius: "10px", padding: "14px", marginBottom: "12px" }}>
        <div style={{ color: "#555", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Last 7 Days</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px" }}>
          {data.daily_completion.map((day) => (
            <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{
                width: "100%", background: "#a855f7", borderRadius: "3px 3px 0 0",
                height: `${Math.max((day.completed / maxBar) * 60, day.completed > 0 ? 6 : 2)}px`,
                opacity: day.completed > 0 ? 1 : 0.15, transition: "height 0.3s",
              }} />
              <div style={{ fontSize: "9px", color: "#444" }}>{day.date.slice(5)}</div>
              <div style={{ fontSize: "10px", color: "#666" }}>{day.completed}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#1a1a1a", borderRadius: "10px", padding: "14px" }}>
        <div style={{ color: "#555", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>By Priority</div>
        {Object.entries(data.priority_stats)
          .filter(([, s]) => s.total > 0)
          .map(([p, s]) => (
            <div key={p} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span style={{ fontSize: "11px", color: PRIORITY_COLORS[+p] }}>{PRIORITY_NAMES[+p]}</span>
                <span style={{ fontSize: "11px", color: "#555" }}>{s.done}/{s.total} · {s.rate}%</span>
              </div>
              <div style={{ background: "#111", borderRadius: "4px", height: "4px" }}>
                <div style={{ background: PRIORITY_COLORS[+p], height: "100%", borderRadius: "4px", width: `${s.rate}%`, transition: "width 0.4s" }} />
              </div>
            </div>
          ))}
        {Object.values(data.priority_stats).every((s) => s.total === 0) && (
          <p style={{ color: "#333", fontSize: "12px", margin: 0 }}>Complete some tasks to see breakdown.</p>
        )}
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("fm_token"));
  const [activeTab, setActiveTab] = useState("tasks");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm FlowMind. Tell me a big goal like 'Crack Amazon in 3 months' and I'll build your complete action plan!" },
  ]);
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [focusTask, setFocusTask] = useState(null);
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  const refreshData = useCallback(async () => {
    if (!token) return;
    try {
      const [tRes, gRes, fRes] = await Promise.all([
        fetch(`${API}/api/v1/tasks/`, { headers: authHeaders() }),
        fetch(`${API}/api/v1/goals/`, { headers: authHeaders() }),
        fetch(`${API}/api/v1/focus/`, { headers: authHeaders() }),
      ]);
      setTasks(await tRes.json());
      setGoals(await gRes.json());
      setFocusTask(await fRes.json());
    } catch {}
  }, [token, authHeaders]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const logout = () => {
    localStorage.removeItem("fm_token");
    localStorage.removeItem("fm_refresh");
    setToken(null);
    setTasks([]);
    setGoals([]);
    setFocusTask(null);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput("");
    const newMessages = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/v1/chat/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ message: userMsg, history: messages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.message }]);

      if (data.task_created) {
        await refreshData();
      }
      if (data.tasks_created) {
        await refreshData();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: `Created ${data.tasks_created.length} tasks for "${data.goal}"! Check your task panel.` },
        ]);
      }
      if (data.task_updated) {
        setTasks((prev) => prev.map((t) => (t.id === data.task_updated.id ? data.task_updated : t)));
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong. Try again!" }]);
    }
    setLoading(false);
  };

  const completeTask = async (taskId) => {
    try {
      const res = await fetch(`${API}/api/v1/tasks/${taskId}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: "done" }),
      });
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      await refreshData();
    } catch {}
  };

  if (!token) return <AuthScreen onLogin={setToken} />;

  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#0a0a0a", color: "white" }}>

      {/* ── Sidebar ── */}
      <div style={{ width: "320px", background: "#111", borderRight: "1px solid #222", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, color: "#a855f7", fontSize: "18px" }}>⚡ FlowMind</h2>
            <p style={{ margin: "2px 0 0", color: "#555", fontSize: "11px" }}>AI Productivity Agent</p>
          </div>
          <button onClick={logout}
            style={{ background: "none", border: "1px solid #333", borderRadius: "6px", color: "#555", padding: "4px 10px", cursor: "pointer", fontSize: "11px" }}>
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #222" }}>
          {["tasks", "analytics"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "12px", textTransform: "capitalize", color: activeTab === tab ? "#a855f7" : "#555", borderBottom: activeTab === tab ? "2px solid #7c3aed" : "2px solid transparent" }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "analytics" ? (
          <AnalyticsPanel token={token} />
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

              {/* Focus task */}
              {focusTask && focusTask.title && (
                <div style={{ background: "#18181b", border: "1px solid #7c3aed", borderRadius: "12px", padding: "12px", marginBottom: "16px" }}>
                  <div style={{ color: "#a855f7", fontSize: "11px", fontWeight: "bold", marginBottom: "6px" }}>🎯 TODAY'S FOCUS</div>
                  <div style={{ fontSize: "13px", lineHeight: "1.5" }}>{focusTask.title}</div>
                  <div style={{ marginTop: "6px", fontSize: "11px", color: PRIORITY_COLORS[focusTask.priority] }}>
                    {PRIORITY_LABELS[focusTask.priority]}
                    {focusTask.score != null && (
                      <span style={{ color: "#444", marginLeft: "6px" }}>· score {focusTask.score}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Goals list */}
              <p style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 10px" }}>
                Goals · {goals.length}
              </p>

              {goals.length === 0 && (
                <p style={{ color: "#333", fontSize: "13px" }}>Tell me a goal to get started.</p>
              )}

              {goals.map((goal) => (
                <div key={goal.id} style={{ background: "#1a1a1a", borderRadius: "12px", padding: "12px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: "#a855f7", marginBottom: "4px" }}>
                    🎯 {goal.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "6px" }}>
                    {goal.progress}% complete
                  </div>
                  <div style={{ background: "#111", borderRadius: "4px", height: "3px", marginBottom: "10px" }}>
                    <div style={{ background: "#7c3aed", height: "100%", borderRadius: "4px", width: `${goal.progress}%`, transition: "width 0.4s" }} />
                  </div>
                  {goal.tasks.map((task) => (
                    <div key={task.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderTop: "1px solid #222" }}>
                      <span style={{ fontSize: "12px", color: task.status === "done" ? "#444" : "#ddd", textDecoration: task.status === "done" ? "line-through" : "none", flex: 1, marginRight: "8px" }}>
                        <span style={{ color: PRIORITY_COLORS[task.priority], marginRight: "4px", fontSize: "10px" }}>●</span>
                        {task.title}
                      </span>
                      {task.status !== "done" && (
                        <button onClick={() => completeTask(task.id)}
                          style={{ background: "#1e3a1e", border: "1px solid #22c55e", color: "#22c55e", borderRadius: "4px", padding: "2px 8px", cursor: "pointer", fontSize: "10px", flexShrink: 0 }}>
                          Done ✓
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {doneTasks.length > 0 && (
                <>
                  <p style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: "16px 0 10px" }}>
                    Completed · {doneTasks.length}
                  </p>
                  {doneTasks.filter((t) => !t.goal).map((task) => (
                    <div key={task.id} style={{ background: "#111", borderRadius: "10px", padding: "10px 12px", marginBottom: "6px", opacity: 0.4 }}>
                      <div style={{ fontSize: "12px", textDecoration: "line-through", color: "#555" }}>{task.title}</div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Stats footer */}
            <div style={{ padding: "14px 16px", borderTop: "1px solid #222", display: "flex", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#a855f7" }}>{pendingTasks.length}</div>
                <div style={{ fontSize: "10px", color: "#555" }}>Pending</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#22c55e" }}>{doneTasks.length}</div>
                <div style={{ fontSize: "10px", color: "#555" }}>Done</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#eab308" }}>
                  {tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0}%
                </div>
                <div style={{ fontSize: "10px", color: "#555" }}>Complete</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Chat panel ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #222", background: "#111" }}>
          <h3 style={{ margin: 0, fontSize: "14px", color: "#888" }}>Chat with FlowMind</h3>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#444" }}>Tell me your goals — I'll build your action plan</p>
        </div>

        <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ background: msg.role === "user" ? "#7c3aed" : "#1a1a1a", border: msg.role === "assistant" ? "1px solid #222" : "none", padding: "12px 16px", borderRadius: "12px", maxWidth: "65%", fontSize: "14px", lineHeight: "1.6" }}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ background: "#1a1a1a", border: "1px solid #333", padding: "12px 16px", borderRadius: "12px", fontSize: "14px", color: "#a855f7" }}>
                🧠 FlowMind is planning...
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "0 20px 10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["Crack Amazon in 3 months", "Learn React in 2 weeks", "What should I focus on?", "Mark my top task as done"].map((prompt) => (
            <button key={prompt} onClick={() => setInput(prompt)}
              style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "20px", padding: "6px 12px", color: "#888", fontSize: "11px", cursor: "pointer" }}>
              {prompt}
            </button>
          ))}
        </div>

        <div style={{ padding: "12px 20px 20px", borderTop: "1px solid #222", display: "flex", gap: "10px" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Tell me a goal or ask anything..."
            style={{ flex: 1, background: "#1a1a1a", border: "1px solid #333", borderRadius: "10px", padding: "12px 16px", color: "white", fontSize: "14px", outline: "none" }}
          />
          <button onClick={sendMessage} disabled={loading}
            style={{ background: loading ? "#333" : "#7c3aed", border: "none", borderRadius: "10px", padding: "12px 24px", color: "white", cursor: loading ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "600" }}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
