import  { useState } from 'react';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Field } from '../components/Field';
import { ResultBox } from '../components/ResultBox';

type Res = Awaited<ReturnType<typeof api>> | null;

export function EdgeCasesSection() {
  // R39 — location reflects latest movement or swap
  const [locDeviceId, setLocDeviceId] = useState('1');
  const [locRes, setLocRes] = useState<Res>(null);

  // R40 — user reflects latest assignment or owner swap
  const [userDeviceId, setUserDeviceId] = useState('1');
  const [userRes, setUserRes] = useState<Res>(null);

  // R38 — simulate transaction test: try to swap a device with a non-existent partner
  // The transaction should roll back and neither device should be mutated
  const [txDevA, setTxDevA] = useState('1');
  const [txRes, setTxRes] = useState<Res>(null);

  return (
    <Section
      title="⚫ Edge Cases & Integrity (R38–R40)"
      rules={['R38','R39','R40']}
    >
      {/* R38 — Transaction rollback */}
      <div>
        <strong>R38 — Transaction rollback: swap device A with a non-existent device ID</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Expect 422 or 404. Then verify device A's location_id is UNCHANGED.
          A partial commit would mean the transaction is broken.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="valid device_a_id" value={txDevA} onChange={setTxDevA} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={async () => setTxRes(await api('POST', '/swaps', {
              device_a_id: Number(txDevA),
              device_b_id: 999999, // non-existent
            }))}
          >
            POST /swaps with fake device_b_id (expect fail)
          </button>
          <button
            onClick={async () => setTxRes(await api('GET', `/devices/${txDevA}`))}
          >
            GET /devices/{txDevA} — verify location unchanged
          </button>
        </div>
        <ResultBox result={txRes} />
      </div>

      {/* R39 — location reflects latest op */}
      <div>
        <strong>R39 — device.location reflects latest movement or swap</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          After performing a movement or location swap above, fetch the device here and confirm
          the "location" relation shows the new location, not a stale cached value.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="device_id" value={locDeviceId} onChange={setLocDeviceId} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () => setLocRes(await api('GET', `/devices/${locDeviceId}`))}
        >
          GET /devices/{locDeviceId} — check location
        </button>
        <ResultBox result={locRes} />
      </div>

      {/* R40 — user reflects latest op */}
      <div>
        <strong>R40 — device.user reflects latest assignment or owner swap</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          After an assignment or owner swap, fetch the device and confirm the "user"
          relation shows the correct current owner.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="device_id" value={userDeviceId} onChange={setUserDeviceId} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () => setUserRes(await api('GET', `/devices/${userDeviceId}`))}
        >
          GET /devices/{userDeviceId} — check user
        </button>
        <ResultBox result={userRes} />
      </div>

    </Section>
  );
}
