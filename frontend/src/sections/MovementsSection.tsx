import React, { useState } from 'react';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Field } from '../components/Field';
import { ResultBox } from '../components/ResultBox';

type Res = Awaited<ReturnType<typeof api>> | null;

export function MovementsSection() {
  // List all
  const [listRes, setListRes] = useState<Res>(null);

  // Move device
  const [mDeviceId, setMDeviceId] = useState('1');
  const [mToLocationId, setMToLocationId] = useState('2');
  const [moveRes, setMoveRes] = useState<Res>(null);

  // Verify device.location_id updated (R15)
  const [checkDeviceId, setCheckDeviceId] = useState('1');
  const [checkRes, setCheckRes] = useState<Res>(null);

  // Device movement history (R18)
  const [histDeviceId, setHistDeviceId] = useState('1');
  const [histRes, setHistRes] = useState<Res>(null);

  return (
    <Section title="📍 Movements (R15–R18)" rules={['R15','R16','R17','R18']}>

      {/* List */}
      <div>
        <strong>GET /movements — List all</strong>
        <br />
        <button onClick={async () => setListRes(await api('GET', '/movements'))}>
          GET /movements
        </button>
        <ResultBox result={listRes} />
      </div>

      {/* Move device — R15, R16, R17 */}
      <div>
        <strong>POST /movements — Move device to new location (R15, R16, R17)</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          R15: device.location_id must update to to_location_id.<br />
          R16: movement.from_location_id is auto-captured from the device's CURRENT location (not sent in body).<br />
          R17: a log entry with action="moved" must appear in /devices/:id/logs.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="device_id" value={mDeviceId} onChange={setMDeviceId} />
          <Field label="to_location_id" value={mToLocationId} onChange={setMToLocationId} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () => setMoveRes(await api('POST', '/movements', {
            device_id: Number(mDeviceId),
            to_location_id: Number(mToLocationId),
          }))}
        >
          POST /movements
        </button>
        <ResultBox result={moveRes} />
      </div>

      {/* Verify location updated — R15 */}
      <div>
        <strong>Verify device.location_id updated (R15)</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="device_id" value={checkDeviceId} onChange={setCheckDeviceId} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () => setCheckRes(await api('GET', `/devices/${checkDeviceId}`))}
        >
          GET /devices/{checkDeviceId} — check location_id
        </button>
        <ResultBox result={checkRes} />
      </div>

      {/* Device movement history — R18 */}
      <div>
        <strong>GET /devices/:id/movements — Movement history (R18)</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="device_id" value={histDeviceId} onChange={setHistDeviceId} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () => setHistRes(await api('GET', `/devices/${histDeviceId}/movements`))}
        >
          GET /devices/{histDeviceId}/movements
        </button>
        <ResultBox result={histRes} />
      </div>

    </Section>
  );
}
