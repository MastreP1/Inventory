import { useState } from 'react';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Field } from '../components/Field';
import { ResultBox } from '../components/ResultBox';

type Res = Awaited<ReturnType<typeof api>> | null;

export function OwnerSwapsSection() {
  // List all
  const [listRes, setListRes] = useState<Res>(null);

  // Normal owner swap
  const [devA, setDevA] = useState('1');
  const [devB, setDevB] = useState('2');
  const [swapRes, setSwapRes] = useState<Res>(null);

  // Verify users on both devices after swap (R24)
  const [checkIdA, setCheckIdA] = useState('1');
  const [checkIdB, setCheckIdB] = useState('2');
  const [checkResA, setCheckResA] = useState<Res>(null);
  const [checkResB, setCheckResB] = useState<Res>(null);

  // Null user swap (R28) — device with no owner
  const [nullDevA, setNullDevA] = useState('1');
  const [nullDevB, setNullDevB] = useState('3');
  const [nullSwapRes, setNullSwapRes] = useState<Res>(null);

  // Self-swap — expect 422 (R27)
  const [selfId, setSelfId] = useState('1');
  const [selfRes, setSelfRes] = useState<Res>(null);

  // Owner swap history (R29)
  const [histId, setHistId] = useState('1');
  const [histRes, setHistRes] = useState<Res>(null);

  return (
    <Section title="👥 Owner Swaps (R24–R29)" rules={['R24','R25','R26','R27','R28','R29']}>

      {/* List */}
      <div>
        <strong>GET /owner-swaps — List all</strong>
        <br />
        <button onClick={async () => setListRes(await api('GET', '/owner-swaps'))}>
          GET /owner-swaps
        </button>
        <ResultBox result={listRes} />
      </div>

      {/* Normal swap — R24, R25, R26 */}
      <div>
        <strong>POST /owner-swaps — Swap owners between two devices (R24, R25, R26)</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          R24: device A gets B's user, device B gets A's user.<br />
          R25: swap record stores original user IDs as snapshots (user_a_id, user_b_id).<br />
          R26: Two log entries created — one per device — with action="owner_swapped".
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Field label="device_a_id" value={devA} onChange={setDevA} />
          <Field label="device_b_id" value={devB} onChange={setDevB} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () => setSwapRes(await api('POST', '/owner-swaps', {
            device_a_id: Number(devA),
            device_b_id: Number(devB),
          }))}
        >
          POST /owner-swaps
        </button>
        <ResultBox result={swapRes} />
      </div>

      {/* Verify user_id on both devices — R24 */}
      <div>
        <strong>Verify user_id swapped on both devices (R24)</strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          <Field label="device A id" value={checkIdA} onChange={setCheckIdA} />
          <Field label="device B id" value={checkIdB} onChange={setCheckIdB} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={async () => setCheckResA(await api('GET', `/devices/${checkIdA}`))}>
            GET /devices/{checkIdA}
          </button>
          <button onClick={async () => setCheckResB(await api('GET', `/devices/${checkIdB}`))}>
            GET /devices/{checkIdB}
          </button>
        </div>
        <ResultBox result={checkResA} label={`Device A (${checkIdA})`} />
        <ResultBox result={checkResB} label={`Device B (${checkIdB})`} />
      </div>

      {/* Null user swap — R28 */}
      <div>
        <strong>POST /owner-swaps — One device has no owner (user_id=null) (R28)</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          R28: null must transfer correctly. Device B should become unassigned, device A gets B's previous user (or null).
          Make sure one of these devices actually has user_id=null before running.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Field label="device_a_id (has user)" value={nullDevA} onChange={setNullDevA} />
          <Field label="device_b_id (no user / null)" value={nullDevB} onChange={setNullDevB} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () => setNullSwapRes(await api('POST', '/owner-swaps', {
            device_a_id: Number(nullDevA),
            device_b_id: Number(nullDevB),
          }))}
        >
          POST /owner-swaps (null user test)
        </button>
        <ResultBox result={nullSwapRes} />
      </div>

      {/* Self-swap — R27 */}
      <div>
        <strong>POST /owner-swaps with same device for A and B — expect 422 (R27)</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="device_id" value={selfId} onChange={setSelfId} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () => setSelfRes(await api('POST', '/owner-swaps', {
            device_a_id: Number(selfId),
            device_b_id: Number(selfId),
          }))}
        >
          POST /owner-swaps (self-swap, expect 422)
        </button>
        <ResultBox result={selfRes} />
      </div>

      {/* History — R29 */}
      <div>
        <strong>GET /devices/:id/owner-swaps — History as A or B (R29)</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="device_id" value={histId} onChange={setHistId} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () => setHistRes(await api('GET', `/devices/${histId}/owner-swaps`))}
        >
          GET /devices/{histId}/owner-swaps
        </button>
        <ResultBox result={histRes} />
      </div>

    </Section>
  );
}
