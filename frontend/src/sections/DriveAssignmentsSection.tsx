import  { useState } from 'react';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Field } from '../components/Field';
import { ResultBox } from '../components/ResultBox';

type Res = Awaited<ReturnType<typeof api>> | null;

export default function DriveAssignmentsSection() {
  // ── List all ──────────────────────────────────────────
  const [listRes, setListRes] = useState<Res>(null);

  // ── Assign drive to computer ──────────────────────────
  const [aDriveId, setADriveId] = useState('');
  const [aComputerId, setAComputerId] = useState('');
  const [assignRes, setAssignRes] = useState<Res>(null);

  // ── End assignment ────────────────────────────────────
  const [endId, setEndId] = useState('');
  const [endRes, setEndRes] = useState<Res>(null);

  // ── Delete assignment record ──────────────────────────
  const [deleteId, setDeleteId] = useState('');
  const [deleteRes, setDeleteRes] = useState<Res>(null);

  // ── View by device (hard drive or computer) ───────────
  const [histDeviceId, setHistDeviceId] = useState('');
  const [histRes, setHistRes] = useState<Res>(null);

  return (
    <Section
      title="💾 Drive Assignments"
      rules={['hard_drive → computer', 'drive status auto-managed']}
    >

      {/* List all */}
      <div>
        <strong>GET /drive-assignments — All active and historical drive assignments</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Returns every assignment record. Active ones have <code>end_date = null</code>;
          historical ones have an <code>end_date</code> set.
        </p>
        <button onClick={async () => setListRes(await api('GET', '/drive-assignments'))}>
          GET /drive-assignments
        </button>
        <ResultBox result={listRes} />
      </div>

      {/* Assign drive to computer */}
      <div>
        <strong>POST /drive-assignments — Install a hard drive into a computer</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          <strong>hard_drive_id</strong>: device ID of a hard drive (category = hard_drive).<br />
          <strong>computer_id</strong>: device ID of a computer (category = computer).<br />
          The drive must not already be installed (no active assignment).
          Drive status must be assignable (e.g. "Available").
          On success the drive status is automatically set to <strong>"In Use"</strong>.
          A computer can hold multiple drives simultaneously.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <Field
            label="hard_drive_id"
            value={aDriveId}
            onChange={setADriveId}
            placeholder="Device ID of the hard drive"
          />
          <Field
            label="computer_id"
            value={aComputerId}
            onChange={setAComputerId}
            placeholder="Device ID of the computer"
          />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setAssignRes(
              await api('POST', '/drive-assignments', {
                hard_drive_id: Number(aDriveId),
                computer_id: Number(aComputerId),
              }),
            )
          }
        >
          POST /drive-assignments
        </button>
        <ResultBox result={assignRes} />
      </div>

      {/* End assignment */}
      <div>
        <strong>PUT /drive-assignments/:id/end — Remove (uninstall) a drive from its computer</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Closes the active assignment by setting <code>end_date = now()</code>.
          The drive status is automatically set to <strong>"Available"</strong>.
          Use the assignment <code>id</code> returned from POST or GET /drive-assignments.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field
            label="assignment id"
            value={endId}
            onChange={setEndId}
            placeholder="Assignment record ID"
          />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setEndRes(await api('PUT', `/drive-assignments/${endId}/end`, {}))
          }
        >
          PUT /drive-assignments/{endId || ':id'}/end
        </button>
        <ResultBox result={endRes} />
      </div>

      {/* Delete record */}
      <div>
        <strong>DELETE /drive-assignments/:id — Hard-delete an assignment record</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Permanently removes the record. Only use for erroneous entries.
          Use <em>/end</em> for the normal uninstall workflow.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field
            label="assignment id"
            value={deleteId}
            onChange={setDeleteId}
            placeholder="Assignment record ID"
          />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setDeleteRes(await api('DELETE', `/drive-assignments/${deleteId}`))
          }
        >
          DELETE /drive-assignments/{deleteId || ':id'}
        </button>
        <ResultBox result={deleteRes} />
      </div>

      {/* History by device */}
      <div>
        <strong>GET /devices/:id/drive-assignments — Assignment history for a device</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Works for both sides of the relationship:
          <br />
          • If the device is a <strong>hard drive</strong>: returns every computer it has been installed in.
          <br />
          • If the device is a <strong>computer</strong>: returns every drive that has been installed in it.
          <br />
          The active assignment has <code>end_date = null</code>.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field
            label="device_id (hard drive or computer)"
            value={histDeviceId}
            onChange={setHistDeviceId}
            placeholder="Device ID"
          />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setHistRes(await api('GET', `/devices/${histDeviceId}/drive-assignments`))
          }
        >
          GET /devices/{histDeviceId || ':id'}/drive-assignments
        </button>
        <ResultBox result={histRes} />
      </div>

    </Section>
  );
}