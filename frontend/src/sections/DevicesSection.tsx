import React, { useState } from 'react';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Field } from '../components/Field';
import { ResultBox } from '../components/ResultBox';

type Res = Awaited<ReturnType<typeof api>> | null;

export function DevicesSection() {
  // --- List all devices ---
  const [listRes, setListRes] = useState<Res>(null);

  // --- Create device ---
  const [cModelId, setCModelId] = useState('1');
  const [cTypeId, setCTypeId] = useState('1');
  const [cStatusId, setCStatusId] = useState('1');
  const [cLocationId, setCLocationId] = useState('1');
  const [cDeptId, setCDeptId] = useState('');
  const [cLabel, setCLabel] = useState('DEV-001');
  const [cSerial, setCSerial] = useState('SN-001');
  const [cComment, setCComment] = useState('');
  const [createRes, setCreateRes] = useState<Res>(null);

  // --- Get device by ID ---
  const [showId, setShowId] = useState('1');
  const [showRes, setShowRes] = useState<Res>(null);

  // --- Update device ---
  const [updateId, setUpdateId] = useState('1');
  const [updateLabel, setUpdateLabel] = useState('');
  const [updateSerial, setUpdateSerial] = useState('');
  const [updateStatusId, setUpdateStatusId] = useState('');
  const [updateLocationId, setUpdateLocationId] = useState('');
  const [updateDeptId, setUpdateDeptId] = useState('');
  const [updateRes, setUpdateRes] = useState<Res>(null);

  // --- Delete device ---
  const [deleteId, setDeleteId] = useState('1');
  const [deleteRes, setDeleteRes] = useState<Res>(null);

  // --- Unique label conflict test ---
  const [dupLabel, setDupLabel] = useState('DEV-DUP');
  const [dupRes, setDupRes] = useState<Res>(null);

  // helpers
  function buildBody(obj: Record<string, string>) {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== ''));
  }

  return (
    <Section title="🖥️ Devices (R01–R07)" rules={['R01','R02','R03','R04','R05','R06','R07']}>

      {/* List all */}
      <div>
        <strong>GET /devices — List all (R07 relations check)</strong>
        <br />
        <button onClick={async () => setListRes(await api('GET', '/devices'))}>
          GET /devices
        </button>
        <ResultBox result={listRes} />
      </div>

      {/* Create */}
      <div>
        <strong>POST /devices — Create (R01, R02, R03)</strong>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
          <Field label="device_model_id" value={cModelId} onChange={setCModelId} />
          <Field label="device_type_id" value={cTypeId} onChange={setCTypeId} />
          <Field label="status_id" value={cStatusId} onChange={setCStatusId} />
          <Field label="location_id" value={cLocationId} onChange={setCLocationId} />
          <Field label="department_id (opt)" value={cDeptId} onChange={setCDeptId} />
          <Field label="label" value={cLabel} onChange={setCLabel} />
          <Field label="serial_number" value={cSerial} onChange={setCSerial} />
          <Field label="comment (opt)" value={cComment} onChange={setCComment} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setCreateRes(await api('POST', '/devices', buildBody({
              device_model_id: cModelId,
              device_type_id: cTypeId,
              status_id: cStatusId,
              location_id: cLocationId,
              department_id: cDeptId,
              label: cLabel,
              serial_number: cSerial,
              comment: cComment,
            })))
          }
        >
          POST /devices
        </button>
        <ResultBox result={createRes} />
      </div>

      {/* Duplicate label test R02/R03 */}
      <div>
        <strong>Duplicate label/serial test (R02, R03) — submit same label twice, expect 422</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="label to duplicate" value={dupLabel} onChange={setDupLabel} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setDupRes(await api('POST', '/devices', {
              device_model_id: 1,
              device_type_id: 1,
              status_id: 1,
              location_id: 1,
              label: dupLabel,
              serial_number: dupLabel + '-SN',
            }))
          }
        >
          POST /devices with duplicate label (run twice)
        </button>
        <ResultBox result={dupRes} />
      </div>

      {/* Show by ID */}
      <div>
        <strong>GET /devices/:id — Show with nested relations (R07)</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="device id" value={showId} onChange={setShowId} />
        </div>
        <button style={{ marginTop: 8 }} onClick={async () => setShowRes(await api('GET', `/devices/${showId}`))}>
          GET /devices/{showId}
        </button>
        <ResultBox result={showRes} />
      </div>

      {/* Update */}
      <div>
        <strong>PUT /devices/:id — Update (R04 same-device label uniqueness, R05 serial)</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Leave fields blank to skip them. Test R04: set label to the device's own existing label — must succeed (not conflict with itself).
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
          <Field label="device id" value={updateId} onChange={setUpdateId} />
          <Field label="label (opt)" value={updateLabel} onChange={setUpdateLabel} />
          <Field label="serial_number (opt)" value={updateSerial} onChange={setUpdateSerial} />
          <Field label="status_id (opt)" value={updateStatusId} onChange={setUpdateStatusId} />
          <Field label="location_id (opt)" value={updateLocationId} onChange={setUpdateLocationId} />
          <Field label="department_id (opt)" value={updateDeptId} onChange={setUpdateDeptId} />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setUpdateRes(await api('PUT', `/devices/${updateId}`, buildBody({
              label: updateLabel,
              serial_number: updateSerial,
              status_id: updateStatusId,
              location_id: updateLocationId,
              department_id: updateDeptId,
            })))
          }
        >
          PUT /devices/{updateId}
        </button>
        <ResultBox result={updateRes} />
      </div>

      {/* Delete */}
      <div>
        <strong>DELETE /devices/:id — Delete then fetch → 404 (R06)</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field label="device id" value={deleteId} onChange={setDeleteId} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={async () => setDeleteRes(await api('DELETE', `/devices/${deleteId}`))}>
            DELETE /devices/{deleteId}
          </button>
          <button onClick={async () => setDeleteRes(await api('GET', `/devices/${deleteId}`))}>
            GET /devices/{deleteId} (expect 404)
          </button>
        </div>
        <ResultBox result={deleteRes} />
      </div>

    </Section>
  );
}
