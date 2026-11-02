import React from 'react';

export default function Notice({ type = 'error', children }) {
  if (!children) return null;

  return (
    <p className={`notice ${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
