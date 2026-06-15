import { useState, useEffect } from "react";

const API = "https://flowmind-production-cc5b.up.railway.app";
const PRIORITY_COLORS = { 1: "#22c55e", 2: "#eab308", 3: "#f97316", 4: "#ef4444", 5: "#dc2626" };
const PRIORITY_LABELS = { 1: "Low", 2: "Medium", 3: "High", 4: "Urgent", 5: "Critical" };

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm FlowMind 🧠 Tell me a big goal like 'I want to crack Amazon in 3 months' and I'll build you a complete plan!" }
  ]);
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focusTask, setFocusTask] = useState(null);

  useEffect(() => {
  fetch(`${API}/api/tasks/`)
    .then(r => r.json())
    .then(data => setTasks(data));

  fetch(`${API}/api/focus/`)
    .then(r => r.json())
    .then(data => setFocusTask(data))
    .catch(() => {});
}, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput("");
    const newMessages = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: messages })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.message }]);
      if (data.task_created) setTasks(prev => [...prev, data.task_created]);
      if (data.tasks_created) {
        setTasks(prev => [...prev, ...data.tasks_created]);
        setMessages(prev => [...prev, { role: "assistant", text: `✅ Created ${data.tasks_created.length} tasks for your goal: "${data.goal}"! Check your task panel.` }]);
      }
      if (data.task_updated) setTasks(prev => prev.map(t => t.id === data.task_updated.id ? data.task_updated : t));
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: "Something went wrong. Try again!" }]);
    }
    setLoading(false);
  };

  const completeTask = async (taskId) => {
  const res = await fetch(`${API}/api/tasks/${taskId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "done" })
  });

  const updated = await res.json();

  setTasks(prev =>
    prev.map(t => t.id === updated.id ? updated : t)
  );

  // Refresh focus task automatically
  try {
    const focusRes = await fetch(`${API}/api/focus/`);
    const focusData = await focusRes.json();
    setFocusTask(focusData);
  } catch (err) {
    console.log(err);
  }
};

  const pendingTasks = tasks.filter(t => t.status !== "done");
  const doneTasks = tasks.filter(t => t.status === "done");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#0a0a0a", color: "white" }}>
      <div style={{ width: "320px", background: "#111", borderRight: "1px solid #222", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #222" }}>
          <h2 style={{ margin: 0, color: "#a855f7", fontSize: "20px" }}>⚡ FlowMind</h2>
          <p style={{ margin: "4px 0 0", color: "#555", fontSize: "12px" }}>AI Productivity Agent</p>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {focusTask && (
  <div
    style={{
      background: "#18181b",
      border: "1px solid #7c3aed",
      borderRadius: "12px",
      padding: "12px",
      marginBottom: "16px"
    }}
  >
    <div
      style={{
        color: "#a855f7",
        fontSize: "11px",
        fontWeight: "bold",
        marginBottom: "6px"
      }}
    >
      🎯 TODAY'S FOCUS
    </div>

    <div
      style={{
        fontSize: "13px",
        lineHeight: "1.5"
      }}
    >
      {focusTask.title}
    </div>

    <div
      style={{
        marginTop: "6px",
        fontSize: "11px",
        color: PRIORITY_COLORS[focusTask.priority]
      }}
    >
      {PRIORITY_LABELS[focusTask.priority]}
    </div>
  </div>
)}
          <p style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 10px" }}>Pending · {pendingTasks.length}</p>
          {pendingTasks.length === 0 && <p style={{ color: "#333", fontSize: "13px" }}>No pending tasks! Tell me a goal to get started.</p>}
          {pendingTasks.map(task => (
            <div key={task.id} style={{ background: "#1a1a1a", borderRadius: "10px", padding: "12px", marginBottom: "8px", borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || "#555"}` }}>
              <div style={{ fontSize: "13px", marginBottom: "6px", lineHeight: "1.4" }}>{task.title}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "10px", color: "#555" }}>{task.source === 'agent' ? '🤖' : '👤'} · <span style={{ color: PRIORITY_COLORS[task.priority] }}>{PRIORITY_LABELS[task.priority]}</span></span>
                <button onClick={() => completeTask(task.id)} style={{ background: "#1e3a1e", border: "1px solid #22c55e", borderRadius: "4px", color: "#22c55e", fontSize: "10px", padding: "2px 8px", cursor: "pointer" }}>Done ✓</button>
              </div>
            </div>
          ))}
          {doneTasks.length > 0 && (
            <>
              <p style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: "16px 0 10px" }}>Completed · {doneTasks.length}</p>
              {doneTasks.map(task => (
                <div key={task.id} style={{ background: "#111", borderRadius: "10px", padding: "12px", marginBottom: "8px", borderLeft: "3px solid #333", opacity: 0.4 }}>
                  <div style={{ fontSize: "13px", textDecoration: "line-through", color: "#555" }}>{task.title}</div>
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ padding: "16px", borderTop: "1px solid #222", display: "flex", justifyContent: "space-around" }}>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: "20px", fontWeight: "bold", color: "#a855f7" }}>{pendingTasks.length}</div><div style={{ fontSize: "10px", color: "#555" }}>Pending</div></div>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: "20px", fontWeight: "bold", color: "#22c55e" }}>{doneTasks.length}</div><div style={{ fontSize: "10px", color: "#555" }}>Done</div></div>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: "20px", fontWeight: "bold", color: "#eab308" }}>{tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0}%</div><div style={{ fontSize: "10px", color: "#555" }}>Complete</div></div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #222", background: "#111" }}>
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
          {loading && <div style={{ display: "flex", justifyContent: "flex-start" }}><div style={{ background: "#1a1a1a", border: "1px solid #333", padding: "12px 16px", borderRadius: "12px", fontSize: "14px", color: "#a855f7" }}>🧠 FlowMind is planning...</div></div>}
        </div>
        <div style={{ padding: "0 20px 10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["Crack Amazon in 3 months", "Learn React in 2 weeks", "What should I focus on?", "Mark my top task as done"].map(prompt => (
            <button key={prompt} onClick={() => setInput(prompt)} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "20px", padding: "6px 12px", color: "#888", fontSize: "11px", cursor: "pointer" }}>{prompt}</button>
          ))}
        </div>
        <div style={{ padding: "12px 20px 20px", borderTop: "1px solid #222", display: "flex", gap: "10px" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Tell me a goal or ask anything..." style={{ flex: 1, background: "#1a1a1a", border: "1px solid #333", borderRadius: "10px", padding: "12px 16px", color: "white", fontSize: "14px", outline: "none" }} />
          <button onClick={sendMessage} disabled={loading} style={{ background: loading ? "#333" : "#7c3aed", border: "none", borderRadius: "10px", padding: "12px 24px", color: "white", cursor: loading ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "600" }}>{loading ? "..." : "Send"}</button>
        </div>
      </div>
    </div>
  );
}

export default App;