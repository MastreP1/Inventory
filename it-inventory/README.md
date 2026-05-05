# IT Inventory — Backend v2.1

## Architecture

### Device Inheritance Model

All physical items share one `devices` base table. Type-specific attributes
live in five specialized tables, each with a `device_id` FK back to `devices`.

```
devices (base)
├── computers    → Laptops, Mini Towers, Towers, Servers, Phones
├── printers     → Printers
├── monitors     → Monitors
├── hard_drives  → Hard Drives (assigned to computers, not users)
└── cartridges   → Cartridges (assigned to printers, not users)
```

The `category` column on `devices` is the discriminator derived from
`device_types.category` at creation — it never changes after creation.

---

## Migration Order

```
000001  departments
000002  users
000003  department_owners        ← pivot (many-to-many owners)
000004  sites                    ← no address, sites are floors
000005  locations                ← unique per site
000006  manufacturers
000007  device_types             ← with category discriminator
000008  device_models
000009  statuses                 ← device statuses
000010  drive_statuses
000011  cartridge_statuses
000012  devices                  ← base table
000013  computers
000014  printers
000015  monitors
000016  hard_drives
000017  cartridges
000018  device_assignments       ← devices → users
000019  hard_drive_assignments   ← drives → computers
000020  cartridge_assignments    ← cartridges → printers
000021  device_movements
000022  device_swaps
000023  device_owner_swaps
000024  hard_drive_swaps
000025  cartridge_swaps
000026  device_logs
```

Run: `php artisan migrate:fresh --seed`

---

## Sites & Locations

| Location               | Site   |
|------------------------|--------|
| HR Office              | LILLY  |
| Omar Office            | LILLY  |
| Procurement Office     | LILLY  |
| BC ProdB               | LILLY  |
| ProdC                  | LILLY  |
| ProdD                  | LILLY  |
| ProdE                  | LILLY  |
| Security Agent Office  | LILLY  |
| Server Room            | LILLY  |
| TL-BC Office           | LILLY  |
| Training 3             | LILLY  |
| Stock                  | LILLY2 |
| Open Space             | LILLY2 |
| EA ProdB               | LILLY2 |
| Training 5             | LILLY2 |
| BackUp                 | BCP    |

---

## Department Owners (pivot)

One user can own multiple departments. One department can have multiple owners.
Managed via `department_owners` pivot table.

Seeded owners:
- `owner.bcg@inventory.test`    → BCG
- `owner.hedd@inventory.test`   → HEDD
- `owner.it@inventory.test`     → IT
- `owner.misc@inventory.test`   → MISC
- `owner.mp.bcg@inventory.test` → MP **and** BCG (cross-department owner)

---

## Status Tables

### `statuses` (computers / printers / monitors)
| Name       | Assignable |
|------------|:----------:|
| Out        | ✗          |
| Returned   | ✗          |
| In Service | ✗          |
| Damaged    | ✗          |
| Reserved   | ✓          |
| Obsolete   | ✗          |

Assignment auto-sets: `Reserved → In Service` on assign, `In Service → Reserved` on unassign.
Manual status changes (not caused by assignment) write a `status_changed` log entry.

### `drive_statuses`
| Name      | Assignable |
|-----------|:----------:|
| Available | ✓          |
| In Use    | ✗          |
| Damaged   | ✗          |
| Obsolete  | ✗          |

### `cartridge_statuses`
| Name     | Assignable |
|----------|:----------:|
| Full     | ✓          |
| Partial  | ✓          |
| Empty    | ✗          |
| Damaged  | ✗          |
| Obsolete | ✗          |

---

## Audit Log Actions

| Action                | Triggered by                      |
|-----------------------|-----------------------------------|
| `status_changed`      | Manual PUT /devices/:id           |
| `assigned`            | POST /assignments                 |
| `unassigned`          | PUT /assignments/:id/end          |
| `moved`               | POST /movements                   |
| `location_swapped`    | POST /swaps                       |
| `owner_swapped`       | POST /owner-swaps                 |
| `drive_assigned`      | POST /drive-assignments           |
| `drive_unassigned`    | PUT /drive-assignments/:id/end    |
| `drive_swapped`       | POST /drive-swaps                 |
| `cartridge_assigned`  | POST /cartridge-assignments       |
| `cartridge_unassigned`| PUT /cartridge-assignments/:id/end|
| `cartridge_swapped`   | POST /cartridge-swaps             |

Logs are never deleted — there is no DELETE /logs endpoint.

---

## API — Complete Route List

### Reference Tables (all have GET + POST + DELETE)
```
GET|POST|DELETE  /sites
GET|POST|DELETE  /locations
GET|POST|DELETE  /manufacturers
GET|POST|DELETE  /device-types
GET|POST|DELETE  /device-models
GET|POST|DELETE  /statuses
GET|POST|DELETE  /drive-statuses
GET|POST|DELETE  /cartridge-statuses
GET|POST|DELETE  /departments
POST             /departments/:id/owners          { user_id }
DELETE           /departments/:id/owners/:userId
GET|POST|DELETE  /users
```

### Devices
```
GET    /devices           ?category=&department_id=&location_id=&user_id=&search=
POST   /devices
GET    /devices/:id
PUT    /devices/:id
DELETE /devices/:id
GET    /devices/:id/logs
GET    /devices/:id/assignments
GET    /devices/:id/movements
GET    /devices/:id/swaps
GET    /devices/:id/owner-swaps
GET    /devices/:id/drive-assignments
GET    /devices/:id/cartridge-assignments
GET    /devices/:id/drive-swaps
GET    /devices/:id/cartridge-swaps
```

### Assignments / Swaps / Movements (all have GET + POST + DELETE)
```
GET|POST         /assignments
PUT              /assignments/:id/end
DELETE           /assignments/:id

GET|POST         /drive-assignments
PUT              /drive-assignments/:id/end
DELETE           /drive-assignments/:id

GET|POST         /cartridge-assignments
PUT              /cartridge-assignments/:id/end
DELETE           /cartridge-assignments/:id

GET|POST|DELETE  /movements
GET|POST|DELETE  /swaps
GET|POST|DELETE  /owner-swaps
GET|POST|DELETE  /drive-swaps
GET|POST|DELETE  /cartridge-swaps
```

### Logs (read-only)
```
GET  /logs
GET  /devices/:id/logs
```
