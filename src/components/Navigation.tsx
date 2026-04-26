import React from 'react';

export default function Navigation() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h1>📚 Προπόνηση Πανελληνίων Εξετάσεων</h1>
        </div>
        <ul className="nav-menu">
          <li><a href="/">Ταμπλό</a></li>
          <li><a href="/textbook">Θεωρία</a></li>
          <li><a href="/tests/chapter">Δοκιμές</a></li>
          <li><a href="/generator">Δημιουργός Δοκιμών</a></li>
          <li><a href="/exams">Παλαιές Εξετάσεις</a></li>
          <li><a href="/essays">Δοκίμιο</a></li>
          <li><a href="/profile">Προφίλ</a></li>
        </ul>
      </div>
    </nav>
  );
}
