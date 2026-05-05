import React from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

export function Field({ label, value, onChange, placeholder, type = 'text' }: Props) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 13 }}>
      {label}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ padding: '4px 6px', fontSize: 13, width: 260 }}
      />
    </label>
  );
}
