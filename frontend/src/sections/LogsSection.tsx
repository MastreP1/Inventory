import { useState } from 'react';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Field } from '../components/Field';
import { ResultBox } from '../components/ResultBox';

type Res = Awaited<ReturnType<typeof api>> | null;

export function LogsSection() {
  // All logs
  const [allRes, setAllRes] = useState<Res>(null);

  // Device-specific logs
  const [deviceId, setDeviceId] = useState('1');
  const [deviceLogsRes, setDeviceLogsRes] = useState<Res>(null);

  return (
    <Section
      title="📜 Logs (R30–R37)"
      rules={['R30','R31','R32','R33','R34','R35','R36','R37']}
    >
      <div>
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          Logs are created automatically by other operations — there is no POST /logs endpoint.
          Use these GETs to verify logs were written correctly after each operation above.<br /><br />
          <strong>R30:</strong> After POST /assignments → action="assigned"<br />
          <strong>R31:</strong> After PUT /assignments/:id/end → action="unassigned"<br />
          <strong>R32:</strong> After POST /movements → action="moved"<br />
          <strong>R33:</strong> After POST /swaps → TWO entries with action="location_swapped"<br />
          <strong>R34:</strong> After POST /owner-swaps → TWO entries with action="owner_swapped"<br />
          <strong>R37:</strong> The "details" field must be a JSON object, not a double-encoded string.
        </p>
      </div>

      {/* All logs — R35 */}
      <div>
        <strong>GET /logs — All logs across all devices (R35)</strong>
        <br />
        <button onClick={async () => setAllRes(await api('GET', '/logs'))}>
          GET /logs
        </button>
        <ResultBox result={allRes} />
      </div>

      {/* Device-specific logs — R36, R37 */}
      <div>
        <strong>GET /devices/:id/logs — Logs for one device (R36, R37)</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          R36: Only logs for this device must appear.<br />
          R37: Inspect the "details" field — it must be a JSON object like {`{"user_id":1}`},
          NOT a string like {`"{\\"user_id\\":1}"`}.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="device_id" value={deviceId} onChange={setDeviceId} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () => setDeviceLogsRes(await api('GET', `/devices/${deviceId}/logs`))}
        >
          GET /devices/{deviceId}/logs
        </button>
        <ResultBox result={deviceLogsRes} />
      </div>

    </Section>
  );
}
