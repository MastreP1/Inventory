import React from 'react';

interface Props {
  title: string;
  rules: string[];
  children: React.ReactNode;
}

export function Section({ title, rules, children }: Props) {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 6, padding: 16, marginBottom: 24 }}>
      <h2 style={{ margin: '0 0 4px' }}>{title}</h2>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#666' }}>
        Rules: {rules.join(', ')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {children}
      </div>
    </div>
  );
}
