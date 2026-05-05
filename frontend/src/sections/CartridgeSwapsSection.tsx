import  { useState } from 'react';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Field } from '../components/Field';
import { ResultBox } from '../components/ResultBox';

type Res = Awaited<ReturnType<typeof api>> | null;

export function CartridgeSwapsSection() {
  // ── List all ──────────────────────────────────────────
  const [listRes, setListRes] = useState<Res>(null);

  // ── Swap cartridge in printer ─────────────────────────
  const [printerId, setPrinterId] = useState('');
  const [newCartridgeId, setNewCartridgeId] = useState('');
  const [swapRes, setSwapRes] = useState<Res>(null);

  // ── Verify printer and cartridges after swap ──────────
  const [checkPrinterId, setCheckPrinterId] = useState('');
  const [checkPrinterRes, setCheckPrinterRes] = useState<Res>(null);

  // ── Delete swap record ────────────────────────────────
  const [deleteId, setDeleteId] = useState('');
  const [deleteRes, setDeleteRes] = useState<Res>(null);

  // ── Swap history for a printer ────────────────────────
  const [histId, setHistId] = useState('');
  const [histRes, setHistRes] = useState<Res>(null);

  return (
    <Section
      title="♻️ Cartridge Swaps"
      rules={[
        'new cartridge must be uninstalled and assignable',
        'ink type must match printer type',
        'old cartridge status → Empty',
      ]}
    >

      {/* List all */}
      <div>
        <strong>GET /cartridge-swaps — All cartridge swap records</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Each record stores the printer, the old cartridge (nullable — printer may have had no
          cartridge before), and the new cartridge installed.
        </p>
        <button onClick={async () => setListRes(await api('GET', '/cartridge-swaps'))}>
          GET /cartridge-swaps
        </button>
        <ResultBox result={listRes} />
      </div>

      {/* Swap cartridge */}
      <div>
        <strong>POST /cartridge-swaps — Replace the cartridge in a printer</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          <strong>printer_id</strong>: device ID of a printer (category = printer).<br />
          <strong>new_cartridge_id</strong>: device ID of the replacement cartridge
          (category = cartridge).
          <br /><br />
          What happens automatically:
          <br />
          1. The new cartridge's <strong>ink_type</strong> is checked against the
          printer's <strong>printer_type</strong> (laser ↔ laser, inkjet ↔ inkjet).
          <br />
          2. If the printer has a current cartridge, its assignment is closed and its status
          is set to <strong>"Empty"</strong>.
          <br />
          3. The new cartridge is installed (new assignment created).
          <br />
          4. A swap record is written.
          <br />
          5. Log entries are created for the printer and both cartridges.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <Field
            label="printer_id"
            value={printerId}
            onChange={setPrinterId}
            placeholder="Device ID of the printer"
          />
          <Field
            label="new_cartridge_id"
            value={newCartridgeId}
            onChange={setNewCartridgeId}
            placeholder="Device ID of the new cartridge"
          />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setSwapRes(
              await api('POST', '/cartridge-swaps', {
                printer_id: Number(printerId),
                new_cartridge_id: Number(newCartridgeId),
              }),
            )
          }
        >
          POST /cartridge-swaps
        </button>
        <ResultBox result={swapRes} />
      </div>

      {/* Verify printer after swap */}
      <div>
        <strong>Verify printer after swap — check active cartridge assignment</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Fetch the printer's cartridge assignments to confirm the new cartridge is active
          (<code>end_date = null</code>) and the old one is closed.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field
            label="printer device_id"
            value={checkPrinterId}
            onChange={setCheckPrinterId}
            placeholder="Printer device ID"
          />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setCheckPrinterRes(
              await api('GET', `/devices/${checkPrinterId}/cartridge-assignments`),
            )
          }
        >
          GET /devices/{checkPrinterId || ':id'}/cartridge-assignments
        </button>
        <ResultBox result={checkPrinterRes} />
      </div>

      {/* Delete record */}
      <div>
        <strong>DELETE /cartridge-swaps/:id — Hard-delete a swap record</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Removes the historical record only. Does not reverse any assignments or status changes.
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
            setDeleteRes(await api('DELETE', `/cartridge-swaps/${deleteId}`))
          }
        >
          DELETE /cartridge-swaps/{deleteId || ':id'}
        </button>
        <ResultBox result={deleteRes} />
      </div>

      {/* Swap history for printer */}
      <div>
        <strong>GET /devices/:id/cartridge-swaps — Cartridge swap history for a printer</strong>
        <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
          Returns every cartridge swap that has occurred on this printer, ordered newest first.
          Useful for tracking consumable usage over time.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Field
            label="printer device_id"
            value={histId}
            onChange={setHistId}
            placeholder="Printer device ID"
          />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={async () =>
            setHistRes(await api('GET', `/devices/${histId}/cartridge-swaps`))
          }
        >
          GET /devices/{histId || ':id'}/cartridge-swaps
        </button>
        <ResultBox result={histRes} />
      </div>

    </Section>
  );
}