import React from 'react';

interface Props {
  result: { ok: boolean; status: number; data: unknown } | null;
  label?: string;
}

export function ResultBox({ result, label }: Props) {
  if (!result) return null;
  const color = result.ok ? 'green' : 'red';
  return (
    <div style={{ marginTop: 8, border: `1px solid ${color}`, padding: 8, borderRadius: 4 }}>
      <strong style={{ color }}>{label ?? (result.ok ? '✅ OK' : '❌ FAIL')} — HTTP {result.status}</strong>
      <pre style={{ margin: '4px 0 0', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(result.data, null, 2)}
      </pre>
    </div>
  );
}
