import React, { useState } from 'react';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Field } from '../components/Field';
import { ResultBox } from '../components/ResultBox';

type Res = Awaited<ReturnType<typeof api>> | null;

export function SwapsSection() {
  // List all
  const [listRes, setListRes] = useState<Res>(null);

  // Swap locations
  const [devA, setDevA] = useState('1');
  const [devB, setDevB] = useState('2');
  const [swapRes, setSwapRes] = useState<Res>(null);

  // Verify locations after swap (R19)
  const [checkIdA, setCheckIdA] = useState('1');
  const [checkIdB, setCheckIdB] = useState('2');
  const [checkResA, setCheckResA] = useState<Res>(null);
  const [checkResB, setCheckResB] = useState<Res>(null);

  // Self-swap — expect 422 (R22)
  const [selfId, setSelfId] = useState('1');
  const [selfRes, setSelfRes] = useState<Res>(null);

  // Device swap history (R23)
  const [histId, setHistId] = useState('1');
  const [histRes, setHistRes] = useState<Res>(null);

  return (
    <Section title="🔄 Location Swaps (R19–R23)" rules={['R19','R20','R21','R22','R23']}>

      {/* List */}
      <div>
        <strong>GET /swaps — List all</strong>
        <br />
        <button onClick={async () => setListRes(await api('GET', '/swaps'))}>
          GET /swaps
        </button>
        <ResultBox result={listRes} />
      </div>

      {/* Swap — R19, R20, R21 */}
      <div>
        <strong>POST /swaps — Swap locations between two devices (R19, R20, R21)</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          R19: After swap, device A is at B's old location and vice versa.<br />
          R20: swap record stores the ORIGINAL locations as snapshots (location_a_id, location_b_id).<br />
          R21: Two log entries are created — one per device — with action="location_swapped".
        </p>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 6px' }}>
          Tip: note the current locations of both devices BEFORE swapping, then verify AFTER.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Field label="device_a_id" value={devA} onChange={setDevA} />
          <Field label="device_b_id" value={devB} onChange={setDevB} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () => setSwapRes(await api('POST', '/swaps', {
            device_a_id: Number(devA),
            device_b_id: Number(devB),
          }))}
        >
          POST /swaps
        </button>
        <ResultBox result={swapRes} />
      </div>

      {/* Verify locations after swap — R19 */}
      <div>
        <strong>Verify locations swapped on both devices (R19)</strong>
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

      {/* Self-swap — R22 */}
      <div>
        <strong>POST /swaps with same device for A and B — expect 422 (R22)</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="device_id (used for both)" value={selfId} onChange={setSelfId} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () => setSelfRes(await api('POST', '/swaps', {
            device_a_id: Number(selfId),
            device_b_id: Number(selfId),
          }))}
        >
          POST /swaps (self-swap, expect 422)
        </button>
        <ResultBox result={selfRes} />
      </div>

      {/* Swap history — R23 */}
      <div>
        <strong>GET /devices/:id/swaps — History for device appearing as A or B (R23)</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="device_id" value={histId} onChange={setHistId} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () => setHistRes(await api('GET', `/devices/${histId}/swaps`))}
        >
          GET /devices/{histId}/swaps
        </button>
        <ResultBox result={histRes} />
      </div>

    </Section>
  );
}
