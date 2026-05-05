import { useState } from 'react';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Field } from '../components/Field';
import { ResultBox } from '../components/ResultBox';

type Res = Awaited<ReturnType<typeof api>> | null;

export function CartridgeAssignmentsSection() {
  // ── List all ──────────────────────────────────────────
  const [listRes, setListRes] = useState<Res>(null);

  // ── Assign cartridge to printer ───────────────────────
  const [aCartridgeId, setACartridgeId] = useState('');
  const [aPrinterId, setAPrinterId] = useState('');
  const [assignRes, setAssignRes] = useState<Res>(null);

  // ── End assignment (remove cartridge) ─────────────────
  const [endId, setEndId] = useState('');
  const [endRes, setEndRes] = useState<Res>(null);

  // ── Delete assignment record ──────────────────────────
  const [deleteId, setDeleteId] = useState('');
  const [deleteRes, setDeleteRes] = useState<Res>(null);

  // ── View by device (cartridge or printer) ─────────────
  const [histDeviceId, setHistDeviceId] = useState('');
  const [histRes, setHistRes] = useState<Res>(null);

  return (
    <Section
      title="🖨️ Cartridge Assignments"
      rules={['cartridge → printer', 'ink type compatibility enforced', 'one cartridge per printer']}
    >

      {/* List all */}
      <div>
        <strong>GET /cartridge-assignments — All cartridge assignment records</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Returns all assignment records across all printers.
          Active assignments have <code>end_date = null</code>.
        </p>
        <button onClick={async () => setListRes(await api('GET', '/cartridge-assignments'))}>
          GET /cartridge-assignments
        </button>
        <ResultBox result={listRes} />
      </div>

      {/* Assign cartridge to printer */}
      <div>
        <strong>POST /cartridge-assignments — Install a cartridge into a printer</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          <strong>cartridge_id</strong>: device ID of a cartridge (category = cartridge).<br />
          <strong>printer_id</strong>: device ID of a printer (category = printer).<br />
          <br />
          The following are validated automatically:
          <br />
          • <strong>Ink type compatibility</strong>: cartridge.ink_type must match printer.printer_type
          (laser ↔ laser, inkjet ↔ inkjet).
          <br />
          • Cartridge must not already be installed in another printer.
          <br />
          • Cartridge status must be assignable (Full or Partial).
          <br />
          • If the printer already has a cartridge installed, that assignment is automatically closed first.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <Field
            label="cartridge_id"
            value={aCartridgeId}
            onChange={setACartridgeId}
            placeholder="Device ID of the cartridge"
          />
          <Field
            label="printer_id"
            value={aPrinterId}
            onChange={setAPrinterId}
            placeholder="Device ID of the printer"
          />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setAssignRes(
              await api('POST', '/cartridge-assignments', {
                cartridge_id: Number(aCartridgeId),
                printer_id: Number(aPrinterId),
              }),
            )
          }
        >
          POST /cartridge-assignments
        </button>
        <ResultBox result={assignRes} />
      </div>

      {/* End assignment */}
      <div>
        <strong>PUT /cartridge-assignments/:id/end — Remove a cartridge from its printer</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Closes the assignment by setting <code>end_date = now()</code>.
          The cartridge status is <strong>not</strong> automatically changed — use a manual status
          update or a cartridge swap if the cartridge is empty.
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
            setEndRes(await api('PUT', `/cartridge-assignments/${endId}/end`, {}))
          }
        >
          PUT /cartridge-assignments/{endId || ':id'}/end
        </button>
        <ResultBox result={endRes} />
      </div>

      {/* Delete record */}
      <div>
        <strong>DELETE /cartridge-assignments/:id — Hard-delete an assignment record</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Permanently removes the record. Only for erroneous entries.
          Use <em>/end</em> for the normal removal workflow.
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
            setDeleteRes(await api('DELETE', `/cartridge-assignments/${deleteId}`))
          }
        >
          DELETE /cartridge-assignments/{deleteId || ':id'}
        </button>
        <ResultBox result={deleteRes} />
      </div>

      {/* History by device */}
      <div>
        <strong>GET /devices/:id/cartridge-assignments — Assignment history for a device</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Works for both sides of the relationship:
          <br />
          • If the device is a <strong>cartridge</strong>: returns every printer it has been installed in.
          <br />
          • If the device is a <strong>printer</strong>: returns every cartridge that has been installed
          in it, including the nested cartridge detail row.
          <br />
          The active assignment (if any) has <code>end_date = null</code>.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field
            label="device_id (cartridge or printer)"
            value={histDeviceId}
            onChange={setHistDeviceId}
            placeholder="Device ID"
          />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setHistRes(await api('GET', `/devices/${histDeviceId}/cartridge-assignments`))
          }
        >
          GET /devices/{histDeviceId || ':id'}/cartridge-assignments
        </button>
        <ResultBox result={histRes} />
      </div>

    </Section>
  );
}