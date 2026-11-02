import React from 'react';

export default function DataActions({ busy, storageError, onLoadDemo, onReset }) {
  return (
    <div className="data-actions" aria-label="Gestion des données">
      <button className="secondary" onClick={onLoadDemo} disabled={busy || !!storageError}>
        Charger les articles de démonstration
      </button>
      <button className="reset" onClick={onReset} disabled={busy}>
        Réinitialiser les données
      </button>
    </div>
  );
}
