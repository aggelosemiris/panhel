import React from 'react';

export default function LoginPage() {
  return (
    <div className="login-page">
      <h1>Σύνδεση</h1>
      <form>
        <input type="email" placeholder="Ηλεκτρονική διεύθυνση" />
        <input type="password" placeholder="Κωδικός πρόσβασης" />
        <button>Σύνδεση</button>
      </form>
      <p>Δεν έχετε λογαριασμό; <a href="/register">Εγγραφείτε εδώ</a></p>
    </div>
  );
}
