import React, { useState } from 'react';
import { api } from '../api/client';
import { ResultBox } from '../components/ResultBox';
import { Field } from '../components/Field';

type Res = Awaited<ReturnType<typeof api>> | null;

// ── Tab definitions ───────────────────────────────────────────────────────────

type TabId =
  | 'sites'
  | 'locations'
  | 'manufacturers'
  | 'device-types'
  | 'device-models'
  | 'statuses'
  | 'drive-statuses'
  | 'cartridge-statuses'
  | 'departments'
  | 'users';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'sites',              label: 'Sites',               icon: '🏢' },
  { id: 'locations',          label: 'Locations',           icon: '📍' },
  { id: 'manufacturers',      label: 'Manufacturers',       icon: '🏭' },
  { id: 'device-types',       label: 'Device Types',        icon: '🏷️' },
  { id: 'device-models',      label: 'Device Models',       icon: '📋' },
  { id: 'statuses',           label: 'Statuses',            icon: '🟢' },
  { id: 'drive-statuses',     label: 'Drive Statuses',      icon: '💾' },
  { id: 'cartridge-statuses', label: 'Cartridge Statuses',  icon: '🖨️' },
  { id: 'departments',        label: 'Departments',         icon: '🏛️' },
  { id: 'users',              label: 'Users',               icon: '👤' },
];

// ── Reusable sub-components ───────────────────────────────────────────────────

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: 14,
        background: '#fff',
        marginBottom: 16,
      }}
    >
      <strong style={{ fontSize: 13 }}>{title}</strong>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 8 }}>
      {children}
    </div>
  );
}

// ── Tab panels ────────────────────────────────────────────────────────────────

function SitesTab() {
  const [listRes, setListRes] = useState<Res>(null);
  const [name, setName] = useState('');
  const [createRes, setCreateRes] = useState<Res>(null);
  const [deleteId, setDeleteId] = useState('');
  const [deleteRes, setDeleteRes] = useState<Res>(null);

  return (
    <>
      <Panel title="GET /sites — List all sites">
        <button onClick={async () => setListRes(await api('GET', '/sites'))}>
          GET /sites
        </button>
        <ResultBox result={listRes} />
      </Panel>

      <Panel title="POST /sites — Create a new site">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          A site is a physical building or floor. Locations belong to sites.
        </p>
        <Row>
          <Field label="name" value={name} onChange={setName} placeholder="e.g. LILLY" />
          <button
            onClick={async () => setCreateRes(await api('POST', '/sites', { name }))}
          >
            POST /sites
          </button>
        </Row>
        <ResultBox result={createRes} />
      </Panel>

      <Panel title="DELETE /sites/:id — Delete a site">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          Fails if the site still has locations assigned to it.
        </p>
        <Row>
          <Field label="site id" value={deleteId} onChange={setDeleteId} placeholder="ID" />
          <button onClick={async () => setDeleteRes(await api('DELETE', `/sites/${deleteId}`))}>
            DELETE /sites/{deleteId || ':id'}
          </button>
        </Row>
        <ResultBox result={deleteRes} />
      </Panel>
    </>
  );
}

function LocationsTab() {
  const [listRes, setListRes] = useState<Res>(null);
  const [siteId, setSiteId] = useState('');
  const [name, setName] = useState('');
  const [createRes, setCreateRes] = useState<Res>(null);
  const [deleteId, setDeleteId] = useState('');
  const [deleteRes, setDeleteRes] = useState<Res>(null);

  return (
    <>
      <Panel title="GET /locations — List all locations">
        <button onClick={async () => setListRes(await api('GET', '/locations'))}>
          GET /locations
        </button>
        <ResultBox result={listRes} />
      </Panel>

      <Panel title="POST /locations — Create a location within a site">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          Location names must be unique within a site. The site is auto-resolved from
          <code> site_id</code>.
        </p>
        <Row>
          <Field label="site_id" value={siteId} onChange={setSiteId} placeholder="Site ID" />
          <Field label="name" value={name} onChange={setName} placeholder="e.g. IT Office" />
          <button
            onClick={async () =>
              setCreateRes(
                await api('POST', '/locations', {
                  site_id: Number(siteId),
                  name,
                }),
              )
            }
          >
            POST /locations
          </button>
        </Row>
        <ResultBox result={createRes} />
      </Panel>

      <Panel title="DELETE /locations/:id — Delete a location">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          Fails if any devices are still assigned to this location.
        </p>
        <Row>
          <Field label="location id" value={deleteId} onChange={setDeleteId} placeholder="ID" />
          <button
            onClick={async () =>
              setDeleteRes(await api('DELETE', `/locations/${deleteId}`))
            }
          >
            DELETE /locations/{deleteId || ':id'}
          </button>
        </Row>
        <ResultBox result={deleteRes} />
      </Panel>
    </>
  );
}

function ManufacturersTab() {
  const [listRes, setListRes] = useState<Res>(null);
  const [name, setName] = useState('');
  const [createRes, setCreateRes] = useState<Res>(null);
  const [deleteId, setDeleteId] = useState('');
  const [deleteRes, setDeleteRes] = useState<Res>(null);

  return (
    <>
      <Panel title="GET /manufacturers — List all manufacturers">
        <button onClick={async () => setListRes(await api('GET', '/manufacturers'))}>
          GET /manufacturers
        </button>
        <ResultBox result={listRes} />
      </Panel>

      <Panel title="POST /manufacturers — Add a manufacturer">
        <Row>
          <Field label="name" value={name} onChange={setName} placeholder="e.g. HP" />
          <button
            onClick={async () => setCreateRes(await api('POST', '/manufacturers', { name }))}
          >
            POST /manufacturers
          </button>
        </Row>
        <ResultBox result={createRes} />
      </Panel>

      <Panel title="DELETE /manufacturers/:id — Delete a manufacturer">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          Fails if device models reference this manufacturer.
        </p>
        <Row>
          <Field label="manufacturer id" value={deleteId} onChange={setDeleteId} placeholder="ID" />
          <button
            onClick={async () =>
              setDeleteRes(await api('DELETE', `/manufacturers/${deleteId}`))
            }
          >
            DELETE /manufacturers/{deleteId || ':id'}
          </button>
        </Row>
        <ResultBox result={deleteRes} />
      </Panel>
    </>
  );
}

function DeviceTypesTab() {
  const [listRes, setListRes] = useState<Res>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('computer');
  const [createRes, setCreateRes] = useState<Res>(null);
  const [deleteId, setDeleteId] = useState('');
  const [deleteRes, setDeleteRes] = useState<Res>(null);

  const categories = ['computer', 'printer', 'monitor', 'hard_drive', 'cartridge'];

  return (
    <>
      <Panel title="GET /device-types — List all device types">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          Each type maps to an internal category (e.g. "Laptop" → computer,
          "Hard Drive" → hard_drive). The category determines which specialized table is joined.
        </p>
        <button onClick={async () => setListRes(await api('GET', '/device-types'))}>
          GET /device-types
        </button>
        <ResultBox result={listRes} />
      </Panel>

      <Panel title="POST /device-types — Create a device type">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          The <strong>category</strong> is the internal discriminator and cannot be changed after
          creation. Multiple types can share the same category (e.g. "Laptop" and "Mini Tower"
          both map to "computer").
        </p>
        <Row>
          <Field label="name" value={name} onChange={setName} placeholder="e.g. Laptop" />
          <label style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 2 }}>
            category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ padding: '4px 6px', fontSize: 13 }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <button
            style={{ alignSelf: 'flex-end' }}
            onClick={async () =>
              setCreateRes(await api('POST', '/device-types', { name, category }))
            }
          >
            POST /device-types
          </button>
        </Row>
        <ResultBox result={createRes} />
      </Panel>

      <Panel title="DELETE /device-types/:id — Delete a device type">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          Fails if devices or device models reference this type.
        </p>
        <Row>
          <Field label="device type id" value={deleteId} onChange={setDeleteId} placeholder="ID" />
          <button
            onClick={async () =>
              setDeleteRes(await api('DELETE', `/device-types/${deleteId}`))
            }
          >
            DELETE /device-types/{deleteId || ':id'}
          </button>
        </Row>
        <ResultBox result={deleteRes} />
      </Panel>
    </>
  );
}

function DeviceModelsTab() {
  const [listRes, setListRes] = useState<Res>(null);
  const [mfrId, setMfrId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [name, setName] = useState('');
  const [createRes, setCreateRes] = useState<Res>(null);
  const [deleteId, setDeleteId] = useState('');
  const [deleteRes, setDeleteRes] = useState<Res>(null);

  return (
    <>
      <Panel title="GET /device-models — List all device models">
        <button onClick={async () => setListRes(await api('GET', '/device-models'))}>
          GET /device-models
        </button>
        <ResultBox result={listRes} />
      </Panel>

      <Panel title="POST /device-models — Create a device model">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          Model names must be unique per manufacturer. Both <code>manufacturer_id</code> and
          <code> device_type_id</code> are required.
        </p>
        <Row>
          <Field label="manufacturer_id" value={mfrId} onChange={setMfrId} placeholder="Manufacturer ID" />
          <Field label="device_type_id" value={typeId} onChange={setTypeId} placeholder="Device Type ID" />
          <Field label="name" value={name} onChange={setName} placeholder="e.g. ThinkPad T14" />
          <button
            style={{ alignSelf: 'flex-end' }}
            onClick={async () =>
              setCreateRes(
                await api('POST', '/device-models', {
                  manufacturer_id: Number(mfrId),
                  device_type_id: Number(typeId),
                  name,
                }),
              )
            }
          >
            POST /device-models
          </button>
        </Row>
        <ResultBox result={createRes} />
      </Panel>

      <Panel title="DELETE /device-models/:id — Delete a model">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          Fails if devices reference this model.
        </p>
        <Row>
          <Field label="model id" value={deleteId} onChange={setDeleteId} placeholder="ID" />
          <button
            onClick={async () =>
              setDeleteRes(await api('DELETE', `/device-models/${deleteId}`))
            }
          >
            DELETE /device-models/{deleteId || ':id'}
          </button>
        </Row>
        <ResultBox result={deleteRes} />
      </Panel>
    </>
  );
}

function StatusesTab({ endpoint, label }: { endpoint: string; label: string }) {
  const [listRes, setListRes] = useState<Res>(null);
  const [name, setName] = useState('');
  const [assignable, setAssignable] = useState(false);
  const [createRes, setCreateRes] = useState<Res>(null);
  const [deleteId, setDeleteId] = useState('');
  const [deleteRes, setDeleteRes] = useState<Res>(null);

  return (
    <>
      <Panel title={`GET /${endpoint} — List all ${label}`}>
        <button onClick={async () => setListRes(await api('GET', `/${endpoint}`))}>
          GET /{endpoint}
        </button>
        <ResultBox result={listRes} />
      </Panel>

      <Panel title={`POST /${endpoint} — Create a ${label.slice(0, -1)}`}>
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          <strong>is_assignable</strong>: whether devices in this status can be assigned.
        </p>
        <Row>
          <Field label="name" value={name} onChange={setName} placeholder="e.g. Reserved" />
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
            <input
              type="checkbox"
              checked={assignable}
              onChange={(e) => setAssignable(e.target.checked)}
            />
            is_assignable
          </label>
          <button
            style={{ alignSelf: 'flex-end' }}
            onClick={async () =>
              setCreateRes(
                await api('POST', `/${endpoint}`, {
                  name,
                  is_assignable: assignable,
                }),
              )
            }
          >
            POST /{endpoint}
          </button>
        </Row>
        <ResultBox result={createRes} />
      </Panel>

      <Panel title={`DELETE /${endpoint}/:id — Delete a ${label.slice(0, -1)}`}>
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          Fails if devices use this status.
        </p>
        <Row>
          <Field label="status id" value={deleteId} onChange={setDeleteId} placeholder="ID" />
          <button
            onClick={async () =>
              setDeleteRes(await api('DELETE', `/${endpoint}/${deleteId}`))
            }
          >
            DELETE /{endpoint}/{deleteId || ':id'}
          </button>
        </Row>
        <ResultBox result={deleteRes} />
      </Panel>
    </>
  );
}

function DepartmentsTab() {
  const [listRes, setListRes] = useState<Res>(null);
  const [name, setName] = useState('');
  const [createRes, setCreateRes] = useState<Res>(null);
  const [deleteId, setDeleteId] = useState('');
  const [deleteRes, setDeleteRes] = useState<Res>(null);
  // Owner management
  const [ownerDeptId, setOwnerDeptId] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [addOwnerRes, setAddOwnerRes] = useState<Res>(null);
  const [removeOwnerDeptId, setRemoveOwnerDeptId] = useState('');
  const [removeOwnerUserId, setRemoveOwnerUserId] = useState('');
  const [removeOwnerRes, setRemoveOwnerRes] = useState<Res>(null);

  return (
    <>
      <Panel title="GET /departments — List all departments with owners">
        <button onClick={async () => setListRes(await api('GET', '/departments'))}>
          GET /departments
        </button>
        <ResultBox result={listRes} />
      </Panel>

      <Panel title="POST /departments — Create a department">
        <Row>
          <Field label="name" value={name} onChange={setName} placeholder="e.g. IT" />
          <button
            onClick={async () => setCreateRes(await api('POST', '/departments', { name }))}
          >
            POST /departments
          </button>
        </Row>
        <ResultBox result={createRes} />
      </Panel>

      <Panel title="DELETE /departments/:id — Delete a department">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          Fails if users or devices still belong to this department.
        </p>
        <Row>
          <Field label="department id" value={deleteId} onChange={setDeleteId} placeholder="ID" />
          <button
            onClick={async () =>
              setDeleteRes(await api('DELETE', `/departments/${deleteId}`))
            }
          >
            DELETE /departments/{deleteId || ':id'}
          </button>
        </Row>
        <ResultBox result={deleteRes} />
      </Panel>

      <Panel title="POST /departments/:id/owners — Add an owner to a department">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          One user can own multiple departments. Duplicate pairs are silently ignored.
        </p>
        <Row>
          <Field label="department_id" value={ownerDeptId} onChange={setOwnerDeptId} placeholder="Department ID" />
          <Field label="user_id" value={ownerUserId} onChange={setOwnerUserId} placeholder="User ID" />
          <button
            onClick={async () =>
              setAddOwnerRes(
                await api('POST', `/departments/${ownerDeptId}/owners`, {
                  user_id: Number(ownerUserId),
                }),
              )
            }
          >
            POST /departments/{ownerDeptId || ':id'}/owners
          </button>
        </Row>
        <ResultBox result={addOwnerRes} />
      </Panel>

      <Panel title="DELETE /departments/:id/owners/:userId — Remove an owner">
        <Row>
          <Field label="department_id" value={removeOwnerDeptId} onChange={setRemoveOwnerDeptId} placeholder="Department ID" />
          <Field label="user_id" value={removeOwnerUserId} onChange={setRemoveOwnerUserId} placeholder="User ID" />
          <button
            onClick={async () =>
              setRemoveOwnerRes(
                await api(
                  'DELETE',
                  `/departments/${removeOwnerDeptId}/owners/${removeOwnerUserId}`,
                ),
              )
            }
          >
            DELETE /departments/{removeOwnerDeptId || ':id'}/owners/{removeOwnerUserId || ':userId'}
          </button>
        </Row>
        <ResultBox result={removeOwnerRes} />
      </Panel>
    </>
  );
}

function UsersTab() {
  const [listRes, setListRes] = useState<Res>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [deptId, setDeptId] = useState('');
  const [createRes, setCreateRes] = useState<Res>(null);
  const [deleteId, setDeleteId] = useState('');
  const [deleteRes, setDeleteRes] = useState<Res>(null);

  return (
    <>
      <Panel title="GET /users — List all users with department and owned departments">
        <button onClick={async () => setListRes(await api('GET', '/users'))}>
          GET /users
        </button>
        <ResultBox result={listRes} />
      </Panel>

      <Panel title="POST /users — Create a user">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          Email must be unique. <code>department_id</code> is optional.
        </p>
        <Row>
          <Field label="name" value={name} onChange={setName} placeholder="e.g. John Doe" />
          <Field label="email" value={email} onChange={setEmail} placeholder="john@example.com" type="email" />
          <Field label="department_id (opt)" value={deptId} onChange={setDeptId} placeholder="Department ID" />
          <button
            style={{ alignSelf: 'flex-end' }}
            onClick={async () => {
              const body: Record<string, unknown> = { name, email };
              if (deptId) body.department_id = Number(deptId);
              setCreateRes(await api('POST', '/users', body));
            }}
          >
            POST /users
          </button>
        </Row>
        <ResultBox result={createRes} />
      </Panel>

      <Panel title="DELETE /users/:id — Delete a user">
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          Fails if the user has active device assignments.
        </p>
        <Row>
          <Field label="user id" value={deleteId} onChange={setDeleteId} placeholder="ID" />
          <button
            onClick={async () =>
              setDeleteRes(await api('DELETE', `/users/${deleteId}`))
            }
          >
            DELETE /users/{deleteId || ':id'}
          </button>
        </Row>
        <ResultBox result={deleteRes} />
      </Panel>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LookupsSection() {
  const [activeTab, setActiveTab] = useState<TabId>('sites');

  const renderTab = () => {
    switch (activeTab) {
      case 'sites':              return <SitesTab />;
      case 'locations':          return <LocationsTab />;
      case 'manufacturers':      return <ManufacturersTab />;
      case 'device-types':       return <DeviceTypesTab />;
      case 'device-models':      return <DeviceModelsTab />;
      case 'statuses':           return <StatusesTab endpoint="statuses" label="Statuses" />;
      case 'drive-statuses':     return <StatusesTab endpoint="drive-statuses" label="Drive Statuses" />;
      case 'cartridge-statuses': return <StatusesTab endpoint="cartridge-statuses" label="Cartridge Statuses" />;
      case 'departments':        return <DepartmentsTab />;
      case 'users':              return <UsersTab />;
    }
  };

  return (
    <div>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          marginBottom: 20,
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: 6,
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 11px',
                border: 'none',
                borderRadius: 5,
                background: isActive ? '#0f172a' : 'transparent',
                color: isActive ? '#f1f5f9' : '#64748b',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              <span style={{ fontSize: 13 }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      <div>{renderTab()}</div>
    </div>
  );
}