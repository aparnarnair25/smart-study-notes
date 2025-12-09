import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // ---- Notes state (with localStorage) ----
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("ssn-notes");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load notes from localStorage", e);
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [filterText, setFilterText] = useState("");

  // ---- Focus timer state (custom minutes) ----
  const [focusMinutes, setFocusMinutes] = useState(25); // current timer length
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(25 * 60);
  const [isFocusing, setIsFocusing] = useState(false);
  const [focusMinutesInput, setFocusMinutesInput] = useState("25"); // input box value

  // Placeholder for weekly time (we’ll improve later)
  const [totalStudyTime] = useState("5h 30m");

  // Save notes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("ssn-notes", JSON.stringify(notes));
    } catch (e) {
      console.error("Failed to save notes to localStorage", e);
    }
  }, [notes]);

  // Focus timer ticking effect
  useEffect(() => {
    if (!isFocusing) return;

    const id = setInterval(() => {
      setFocusSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isFocusing]);

  // Stop timer automatically at 0
  useEffect(() => {
    if (focusSecondsLeft === 0 && isFocusing) {
      setIsFocusing(false);
    }
  }, [focusSecondsLeft, isFocusing]);

  // ---- Handlers ----

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const newNote = {
      id: Date.now(),
      title: title.trim() || "Untitled",
      content: content.trim(),
      createdAt: new Date().toLocaleString(),
      isDone: false,
    };

    setNotes((prev) => [newNote, ...prev]);
    setTitle("");
    setContent("");
  };

  const toggleDone = (id) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, isDone: !note.isDone } : note
      )
    );
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const handleToggleFocus = () => {
    // If finished (00:00), restart from current focusMinutes
    if (focusSecondsLeft === 0) {
      setFocusSecondsLeft(focusMinutes * 60);
    }
    setIsFocusing((prev) => !prev);
  };

  const handleResetFocus = () => {
    setIsFocusing(false);
    setFocusSecondsLeft(focusMinutes * 60);
  };

  const handleApplyFocusMinutes = () => {
    const mins = parseInt(focusMinutesInput, 10);
    if (isNaN(mins) || mins <= 0) {
      return;
    }
    const limited = Math.min(mins, 180); // limit to 3 hours max
    setFocusMinutes(limited);
    setFocusSecondsLeft(limited * 60);
    setIsFocusing(false);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(filterText.toLowerCase()) ||
      note.content.toLowerCase().includes(filterText.toLowerCase())
  );

  // Format timer display as MM:SS
  const focusMinutesDisplay = String(
    Math.floor(focusSecondsLeft / 60)
  ).padStart(2, "0");
  const focusSecondsDisplay = String(
    focusSecondsLeft % 60
  ).padStart(2, "0");

  const focusButtonLabel = isFocusing
    ? "Pause"
    : focusSecondsLeft === 0
    ? "Restart"
    : "Start focus session";

  return (
    <div className="app">
      {/* Top bar */}
      <header className="top-bar">
        <div className="top-left">
          <h1 className="app-title">Smart Study Notes</h1>
          <span className="app-subtitle">
            Calm space to capture topics, ideas and progress.
          </span>
        </div>
        <div className="top-right">
          <input
            type="text"
            className="top-search"
            placeholder="Search notes…"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <div className="avatar-circle">S</div>
        </div>
      </header>

      <main className="app-main">
        {/* Small dashboard row */}
        <section className="dash-row">
          <div className="dash-card">
            <div className="dash-label">Smart study mode</div>
            <div className="dash-timer">
              {focusMinutesDisplay}:{focusSecondsDisplay}
            </div>

            {/* Custom minutes input */}
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                type="number"
                min="1"
                max="180"
                value={focusMinutesInput}
                onChange={(e) => setFocusMinutesInput(e.target.value)}
                style={{
                  width: "80px",
                  borderRadius: "999px",
                  border: "1px solid #dedede",
                  padding: "6px 10px",
                  fontSize: "0.85rem",
                }}
              />
              <button
                type="button"
                onClick={handleApplyFocusMinutes}
                style={{
                  borderRadius: "999px",
                  border: "none",
                  padding: "6px 12px",
                  fontSize: "0.8rem",
                  background: "#e5e7eb",
                  cursor: "pointer",
                }}
              >
                Set time (min)
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <button
                className="primary-btn"
                type="button"
                onClick={handleToggleFocus}
              >
                {focusButtonLabel}
              </button>
              <button
                type="button"
                onClick={handleResetFocus}
                style={{
                  borderRadius: "999px",
                  border: "none",
                  padding: "6px 12px",
                  fontSize: "0.8rem",
                  background: "#e5e7eb",
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>

            <p className="dash-hint">
              Type your focus length in minutes, set it, then use the timer for
              deep work sessions.
            </p>
          </div>

          <div className="dash-card">
            <div className="dash-label">This week</div>
            <div className="dash-stat">{totalStudyTime}</div>
            <p className="dash-hint">
              Later we can connect this to real focus sessions and show total
              study time.
            </p>
          </div>
        </section>

        {/* Form + notes */}
        <section className="content-grid">
          <section className="note-form-section">
            <h2 className="section-title">New note</h2>
            <form className="note-form" onSubmit={handleAddNote}>
              <input
                type="text"
                placeholder="Topic (e.g. OS – Deadlocks)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                rows="4"
                placeholder="Key ideas, formulas, code snippets…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button type="submit" className="primary-btn">
                Add note
              </button>
            </form>
          </section>

          <section className="notes-section">
            <div className="notes-header">
              <h2 className="section-title">Your notes</h2>
              <span className="notes-count">
                {filteredNotes.length} note{filteredNotes.length !== 1 && "s"}
              </span>
            </div>

            {filteredNotes.length === 0 ? (
              <p className="empty-text">
                No notes yet. Start by adding one on the left.
              </p>
            ) : (
              <div className="notes-grid">
                {filteredNotes.map((note) => (
                  <article
                    key={note.id}
                    className={`note-card ${note.isDone ? "note-done" : ""}`}
                  >
                    <header className="note-header">
                      <h3>{note.title}</h3>
                    </header>

                    {note.content && (
                      <p className="note-content">{note.content}</p>
                    )}

                    <footer className="note-footer">
                      <span className="note-meta">{note.createdAt}</span>
                      <div className="note-actions">
                        <button
                          type="button"
                          onClick={() => toggleDone(note.id)}
                        >
                          {note.isDone ? "Mark pending" : "Mark done"}
                        </button>
                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() => deleteNote(note.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </footer>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
