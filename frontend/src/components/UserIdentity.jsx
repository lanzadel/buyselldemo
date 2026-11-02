import React from 'react';

export default function UserIdentity({ login, onChange, disabled }) {
  return (
    <section className="identity">
      <div>
        <label htmlFor="login">Votre identifiant</label>
        <small>Changez d’identifiant pour simuler un autre utilisateur.</small>
      </div>
      <input id="login" value={login} onChange={(event) => onChange(event.target.value)}
        maxLength={100} required disabled={disabled} />
    </section>
  );
}
