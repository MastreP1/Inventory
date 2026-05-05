import  { useState } from 'react';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Field } from '../components/Field';
import { ResultBox } from '../components/ResultBox';

type Res = Awaited<ReturnType<typeof api>> | null;

export function DriveSwapsSection() {
  // ── List all ──────────────────────────────────────────
  const [listRes, setListRes] = useState<Res>(null);

  // ── Swap drives between two computers ─────────────────
  const [compA, setCompA] = useState('');
  const [compB, setCompB] = useState('');
  const [swapRes, setSwapRes] = useState<Res>(null);

  // ── Verify drives on both computers after swap ─────────
  const [checkIdA, setCheckIdA] = useState('');
  const [checkIdB, setCheckIdB] = useState('');
  const [checkResA, setCheckResA] = useState<Res>(null);
  const [checkResB, setCheckResB] = useState<Res>(null);

  // ── Delete swap record ────────────────────────────────
  const [deleteId, setDeleteId] = useState('');
  const [deleteRes, setDeleteRes] = useState<Res>(null);

  // ── Swap history for a computer ───────────────────────
  const [histId, setHistId] = useState('');
  const [histRes, setHistRes] = useState<Res>(null);

  return (
    <Section
      title="🔀 Drive Swaps"
      rules={['both computers must have an active drive', 'drives exchange computers']}
    >

      {/* List all */}
      <div>
        <strong>GET /drive-swaps — All drive swap records</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Each record stores the two computers and their drives as snapshots at the time of the swap.
        </p>
        <button onClick={async () => setListRes(await api('GET', '/drive-swaps'))}>
          GET /drive-swaps
        </button>
        <ResultBox result={listRes} />
      </div>

      {/* Swap */}
      <div>
        <strong>POST /drive-swaps — Swap the drives installed in two computers</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          <strong>computer_a_id</strong> and <strong>computer_b_id</strong> must both be devices
          with category = computer, and <em>both must have an active drive assignment</em>.
          <br /><br />
          What happens:
          <br />
          1. Both active assignments are closed (<code>end_date = now()</code>).
          <br />
          2. Computer A receives Drive B (new assignment created).
          <br />
          3. Computer B receives Drive A (new assignment created).
          <br />
          4. A swap record is written with <code>drive_a_id</code> and <code>drive_b_id</code>
          as snapshots of the original state.
          <br />
          5. Four log entries are created — one per device involved.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <Field
            label="computer_a_id"
            value={compA}
            onChange={setCompA}
            placeholder="Device ID of computer A"
          />
          <Field
            label="computer_b_id"
            value={compB}
            onChange={setCompB}
            placeholder="Device ID of computer B"
          />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setSwapRes(
              await api('POST', '/drive-swaps', {
                computer_a_id: Number(compA),
                computer_b_id: Number(compB),
              }),
            )
          }
        >
          POST /drive-swaps
        </button>
        <ResultBox result={swapRes} />
      </div>

      {/* Verify drives after swap */}
      <div>
        <strong>Verify drives swapped — check active assignments on both computers</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          After the swap, each computer should have the other's drive.
          Fetch each computer's active drive assignment to confirm.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          <Field label="computer A id" value={checkIdA} onChange={setCheckIdA} placeholder="Computer A device ID" />
          <Field label="computer B id" value={checkIdB} onChange={setCheckIdB} placeholder="Computer B device ID" />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={async () =>
              setCheckResA(await api('GET', `/devices/${checkIdA}/drive-assignments`))
            }
          >
            GET /devices/{checkIdA || 'A'}/drive-assignments
          </button>
          <button
            onClick={async () =>
              setCheckResB(await api('GET', `/devices/${checkIdB}/drive-assignments`))
            }
          >
            GET /devices/{checkIdB || 'B'}/drive-assignments
          </button>
        </div>
        <ResultBox result={checkResA} label={`Computer A (${checkIdA || '?'})`} />
        <ResultBox result={checkResB} label={`Computer B (${checkIdB || '?'})`} />
      </div>

      {/* Delete record */}
      <div>
        <strong>DELETE /drive-swaps/:id — Hard-delete a swap record</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Removes the historical record only. Does <strong>not</strong> reverse the swap —
          use a new POST /drive-swaps to swap back if needed.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field
            label="swap id"
            value={deleteId}
            onChange={setDeleteId}
            placeholder="Swap record ID"
          />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setDeleteRes(await api('DELETE', `/drive-swaps/${deleteId}`))
          }
        >
          DELETE /drive-swaps/{deleteId || ':id'}
        </button>
        <ResultBox result={deleteRes} />
      </div>

      {/* History for a computer */}
      <div>
        <strong>GET /devices/:id/drive-swaps — Drive swap history for a computer</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Returns all swap records where this computer appeared as either side A or side B.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field
            label="computer device_id"
            value={histId}
            onChange={setHistId}
            placeholder="Computer device ID"
          />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setHistRes(await api('GET', `/devices/${histId}/drive-swaps`))
          }
        >
          GET /devices/{histId || ':id'}/drive-swaps
        </button>
        <ResultBox result={histRes} />
      </div>

    </Section>
  );
}