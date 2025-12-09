import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // Load notes from localStorage on first render
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
  const [focusMinutes] = useState(25); // for future timer
  const [totalStudyTime] = useState("5h 30m"); // placeholder for now

  // Save notes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("ssn-notes", JSON.stringify(notes));
    } catch (e) {
      console.error("Failed to save notes to localStorage", e);
    }
  }, [notes]);

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

    setNotes([newNote, ...notes]);
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

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(filterText.toLowerCase()) ||
      note.content.toLowerCase().includes(filterText.toLowerCase())
  );

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
              {focusMinutes.toString().padStart(2, "0")}:00
            </div>
            <button className="primary-btn" type="button">
              Start focus session
            </button>
            <p className="dash-hint">
              Later this will become a real timer with reflection notes.
            </p>
          </div>

          <div className="dash-card">
            <div className="dash-label">This week</div>
            <div className="dash-stat">{totalStudyTime}</div>
            <p className="dash-hint">
              Track total focused study time across topics.
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
