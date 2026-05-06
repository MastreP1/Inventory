import React, { useState, useEffect, useCallback, useRef, useContext, createContext, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════════════════════
const BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000/api';
async function api(method: string, path: string, body?: object) {
  const res = await fetch(`${BASE}${path}`, {
    method, headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: any; try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
type Lang = 'en' | 'fr' | 'ar';
type Theme = 'dark' | 'light';
interface Device {
  id: number; label: string; serial_number?: string | null; category: string;
  device_type?: { id: number; name: string; category: string };
  manufacturer?: { id: number; name: string };
  device_model?: { id: number; name: string; manufacturer?: { id: number; name: string } };
  location?: { id: number; name: string; site?: { name: string } };
  department?: { id: number; name: string };
  user?: { id: number; name: string; department_id?: number; department?: { id: number; name: string } };
  status?: { id: number; name: string; is_assignable: boolean };
  drive_status?: { id: number; name: string; is_assignable?: boolean };
  cartridge_status?: { id: number; name: string; is_assignable?: boolean };
  computer?: { cpu?: string; ram?: string; imei?: string; phone_number?: string };
  printer?: { printer_type: string; duplex: boolean; color_support: boolean };
  monitor?: { panel_type?: string; size_inches?: number; video_inputs?: string[] };
  hard_drive?: { drive_type: string; capacity_gb: number };
  cartridge?: { ink_type: string; printer_compatibility: string };
  comment?: string; created_at: string;
}
interface LookupItem { id: number; name: string; [k: string]: any; }
interface Toast { id: number; msg: string; ok: boolean; }
interface SelectOption { value: string; label: string; sub?: string; }

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════
interface AppCtxType {
  lang: Lang; setLang(l: Lang): void;
  theme: Theme; setTheme(t: Theme): void;
  isRTL: boolean; t(k: string, vars?: Record<string, string | number>): string;
  C: typeof DARK_C;
}
const AppCtx = createContext<AppCtxType>({ lang: 'en', setLang: () => {}, theme: 'dark', setTheme: () => {}, isRTL: false, t: k => k, C: {} as any });
const useApp = () => useContext(AppCtx);

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════════════
const TRANS: Record<Lang, Record<string, string>> = {
  en: {
    dashboard:'Dashboard',overview:'OVERVIEW',inventory:'INVENTORY',assignmentsG:'ASSIGNMENTS',
    operations:'OPERATIONS',audit:'AUDIT',admin:'ADMIN',
    pcs:'PC',mobile:'Mobile',printers:'Printers',monitors:'Monitors',
    addIns:'Add-ins',drives:'Drives',cartridges:'Cartridges',users:'Users',
    userAssign:'User Assignments',driveAssign:'Drive Assignments',cartAssign:'Cartridge Assignments',
    movements:'Movements',locSwaps:'Location Swaps',ownerSwaps:'Owner Swaps',
    driveSwaps:'Drive Swaps',cartChanges:'Cartridge Changes',auditLogs:'Audit Logs',settings:'Settings',
    add:'Add',cancel:'Cancel',create:'Create',delete:'Delete',save:'Save',edit:'Edit',end:'End',
    search:'Search…',filterBy:'Filter by…',filterVal:'Select value…',
    loading:'Loading…',noRecords:'No records found',records:'records',active:'active',
    confirm:'Confirm',close:'Close',assign:'Assign',move:'Move',swap:'Swap',
    labelF:'Name / Label',snF:'S/N *',modelF:'Model *',manufacturerF:'Manufacturer',
    locationF:'Location',departmentF:'Department',userF:'User',statusF:'Status',etatF:'État',
    commentF:'Notes',cpuF:'CPU',ramF:'RAM',panelF:'Panel',sizeF:'Size (in)',
    videoF:'Video Inputs',driveTypeF:'Drive Type',capacityF:'Capacity (GB)',
    inkTypeF:'Ink Type',compatF:'Compatibility',printerTypeF:'Printer Type',
    duplexF:'Duplex',colorF:'Color',imeiF:'IMEI *',phoneNumF:'Phone Number *',
    styleSettings:'Style & Appearance',languageLbl:'Language',themeLbl:'Theme',
    dark:'Dark',light:'Light',importExport:'Import / Export',
    importExcel:'Import Excel',exportExcel:'Export Excel',refData:'Reference Data',
    stockAlert:'⚠ Low Stock Alert',stockMsg:'Only {count} {cat} left in stock after this action.',
    criticalStock:'Stock critical!',inStockNew:'InStock/New',inStockUsed:'InStock/Used',
    installed:'Installed',destroyed:'Destroyed',
    bulkSelect:'Select',bulkEnd:'End Selected',bulkMove:'Move Selected',
    showHide:'Customize Dashboard',totalAssets:'Total Assets',inServiceLbl:'In Service',
    damagedLbl:'Damaged',auditEvents:'Audit Events',inventoryOverview:'Inventory',
    recentActivity:'Recent Activity',statusDistrib:'Status Distribution',deptComparison:'By Department',
    selectDevice:'Select device…',selectUser:'Select user…',selectLoc:'Select location…',
    selectPrinter:'Select printer…',selectComputer:'Select computer…',selectCart:'Select cartridge…',
    changeStatus:'Change Status',currentStatusLbl:'Current Status',newStatusLbl:'New Status',
    confirmAction:'Confirm Action',withOwner:'Department Owner',
    autoLocInfo:'Location will auto-set to Stock and user will be cleared.',
    reserved:'Reserved',noStock:'No items in stock for',ownerOpt:'Owner (optional)',
    required:'required',optional:'optional',departmentOwner:'Department Owner',
    searchModel:'Search model…',
  },
  fr: {
    dashboard:'Tableau de bord',overview:'APERÇU',inventory:'INVENTAIRE',assignmentsG:'ATTRIBUTIONS',
    operations:'OPÉRATIONS',audit:'AUDIT',admin:'ADMINISTRATION',
    pcs:'PC',mobile:'Mobile',printers:'Imprimantes',monitors:'Moniteurs',
    addIns:'Accessoires',drives:'Disques',cartridges:'Cartouches',users:'Utilisateurs',
    userAssign:'Attr. Utilisateurs',driveAssign:'Attr. Disques',cartAssign:'Attr. Cartouches',
    movements:'Mouvements',locSwaps:'Échanges Lieu',ownerSwaps:'Échanges Propriétaire',
    driveSwaps:'Échanges Disque',cartChanges:'Changements Cartouche',auditLogs:'Journaux',settings:'Paramètres',
    add:'Ajouter',cancel:'Annuler',create:'Créer',delete:'Supprimer',save:'Enregistrer',edit:'Modifier',end:'Terminer',
    search:'Rechercher…',filterBy:'Filtrer par…',filterVal:'Sélectionner valeur…',
    loading:'Chargement…',noRecords:'Aucun enregistrement',records:'enregistrements',active:'actif',
    confirm:'Confirmer',close:'Fermer',assign:'Attribuer',move:'Déplacer',swap:'Échanger',
    labelF:'Nom / Étiquette',snF:'N° Série *',modelF:'Modèle *',manufacturerF:'Fabricant',
    locationF:'Emplacement',departmentF:'Département',userF:'Utilisateur',statusF:'Statut',etatF:'État',
    commentF:'Remarques',cpuF:'Processeur',ramF:'Mémoire',panelF:'Type dalle',sizeF:'Taille (po)',
    videoF:'Entrées vidéo',driveTypeF:'Type disque',capacityF:'Capacité (Go)',
    inkTypeF:"Type d'encre",compatF:'Compatibilité',printerTypeF:"Type d'imprimante",
    duplexF:'Recto-verso',colorF:'Couleur',imeiF:'IMEI *',phoneNumF:'N° Téléphone *',
    styleSettings:'Style et apparence',languageLbl:'Langue',themeLbl:'Thème',
    dark:'Sombre',light:'Clair',importExport:'Import / Export',
    importExcel:'Importer Excel',exportExcel:'Exporter Excel',refData:'Données de référence',
    stockAlert:'⚠ Alerte Stock Bas',stockMsg:'Seulement {count} {cat} restent en stock après cette action.',
    criticalStock:'Stock critique !',inStockNew:'En stock/Neuf',inStockUsed:'En stock/Usagé',
    installed:'Installé',destroyed:'Détruit',
    bulkSelect:'Sélect.',bulkEnd:'Terminer sélect.',bulkMove:'Déplacer sélect.',
    showHide:'Personnaliser',totalAssets:'Total actifs',inServiceLbl:'En service',
    damagedLbl:'Endommagé',auditEvents:'Événements',inventoryOverview:'Inventaire',
    recentActivity:'Activité récente',statusDistrib:'Répartition statuts',deptComparison:'Par département',
    selectDevice:'Sélectionner appareil…',selectUser:'Sélectionner utilisateur…',selectLoc:'Sélectionner lieu…',
    selectPrinter:'Sélectionner imprimante…',selectComputer:'Sélectionner ordinateur…',selectCart:'Sélectionner cartouche…',
    changeStatus:'Changer le statut',currentStatusLbl:'Statut actuel',newStatusLbl:'Nouveau statut',
    confirmAction:"Confirmer l'action",withOwner:'Responsable département',
    autoLocInfo:"Le lieu sera défini sur Stock et l'utilisateur sera effacé.",
    reserved:'Réservé',noStock:'Aucun article en stock pour',ownerOpt:'Responsable (optionnel)',
    required:'obligatoire',optional:'optionnel',departmentOwner:'Responsable de département',
    searchModel:'Rechercher modèle…',
  },
  ar: {
    dashboard:'لوحة التحكم',overview:'نظرة عامة',inventory:'المخزون',assignmentsG:'التعيينات',
    operations:'العمليات',audit:'المراجعة',admin:'الإدارة',
    pcs:'حاسوب',mobile:'هاتف',printers:'طابعات',monitors:'شاشات',
    addIns:'إضافات',drives:'أقراص',cartridges:'خراطيش',users:'مستخدمون',
    userAssign:'تعيينات مستخدمين',driveAssign:'تعيينات أقراص',cartAssign:'تعيينات خراطيش',
    movements:'تنقلات',locSwaps:'تبادل أماكن',ownerSwaps:'تبادل ملاك',
    driveSwaps:'تبادل أقراص',cartChanges:'تغيير خراطيش',auditLogs:'سجلات',settings:'إعدادات',
    add:'إضافة',cancel:'إلغاء',create:'إنشاء',delete:'حذف',save:'حفظ',edit:'تعديل',end:'إنهاء',
    search:'بحث…',filterBy:'تصفية حسب…',filterVal:'اختر قيمة…',
    loading:'جاري التحميل…',noRecords:'لا توجد سجلات',records:'سجلات',active:'نشط',
    confirm:'تأكيد',close:'إغلاق',assign:'تعيين',move:'نقل',swap:'تبادل',
    labelF:'الاسم',snF:'رقم تسلسلي *',modelF:'الطراز *',manufacturerF:'الصانع',
    locationF:'الموقع',departmentF:'القسم',userF:'المستخدم',statusF:'الحالة',etatF:'الحالة',
    commentF:'ملاحظات',cpuF:'المعالج',ramF:'الذاكرة',panelF:'نوع الشاشة',sizeF:'الحجم',
    videoF:'مداخل فيديو',driveTypeF:'نوع القرص',capacityF:'السعة',
    inkTypeF:'نوع الحبر',compatF:'التوافق',printerTypeF:'نوع الطابعة',
    duplexF:'طباعة وجهين',colorF:'ألوان',imeiF:'IMEI *',phoneNumF:'رقم الهاتف *',
    styleSettings:'المظهر',languageLbl:'اللغة',themeLbl:'السمة',
    dark:'داكن',light:'فاتح',importExport:'استيراد / تصدير',
    importExcel:'استيراد Excel',exportExcel:'تصدير Excel',refData:'البيانات المرجعية',
    stockAlert:'⚠ تنبيه مخزون منخفض',stockMsg:'{count} {cat} فقط في المخزون.',
    criticalStock:'المخزون في حالة حرجة!',inStockNew:'في المخزن/جديد',inStockUsed:'في المخزن/مستعمل',
    installed:'مثبت',destroyed:'محطوم',
    bulkSelect:'تحديد',bulkEnd:'إنهاء المحدد',bulkMove:'نقل المحدد',
    showHide:'تخصيص اللوحة',totalAssets:'مجموع الأصول',inServiceLbl:'قيد الخدمة',
    damagedLbl:'تالف',auditEvents:'أحداث المراجعة',inventoryOverview:'المخزون',
    recentActivity:'النشاط الأخير',statusDistrib:'توزيع الحالات',deptComparison:'حسب القسم',
    selectDevice:'اختر جهاز…',selectUser:'اختر مستخدم…',selectLoc:'اختر موقع…',
    selectPrinter:'اختر طابعة…',selectComputer:'اختر حاسوب…',selectCart:'اختر خرطوشة…',
    changeStatus:'تغيير الحالة',currentStatusLbl:'الحالة الحالية',newStatusLbl:'الحالة الجديدة',
    confirmAction:'تأكيد الإجراء',withOwner:'مسؤول القسم',
    autoLocInfo:'سيتم تعيين الموقع إلى المخزن وإزالة المستخدم.',
    reserved:'محجوز',noStock:'لا يوجد مخزون لـ',ownerOpt:'المسؤول (اختياري)',
    required:'مطلوب',optional:'اختياري',departmentOwner:'مسؤول القسم',
    searchModel:'ابحث عن طراز…',
  },
};

function makeT(lang: Lang) {
  return (k: string, vars?: Record<string, string | number>): string => {
    let str = TRANS[lang][k] ?? TRANS.en[k] ?? k;
    if (vars) Object.entries(vars).forEach(([key, val]) => { str = str.replace(`{${key}}`, String(val)); });
    return str;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════
const DARK_C = {
  bg: '#020617', surface: '#0a0f1a', surface2: '#0f172a',
  border: '#0f172a', border2: '#1e293b',
  text: '#e2e8f0', muted: '#475569', dim: '#334155',
  blue: '#3b82f6', green: '#10b981', amber: '#f59e0b',
  purple: '#8b5cf6', cyan: '#06b6d4', pink: '#ec4899', danger: '#ef4444',
  inputBg: '#020617', cardBg: '#0a0f1a',
};
const LIGHT_C = {
  bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9',
  border: '#f1f5f9', border2: '#e2e8f0',
  text: '#0f172a', muted: '#64748b', dim: '#94a3b8',
  blue: '#2563eb', green: '#059669', amber: '#d97706',
  purple: '#7c3aed', cyan: '#0891b2', pink: '#db2777', danger: '#dc2626',
  inputBg: '#ffffff', cardBg: '#ffffff',
};

// NAV
const NAV = (t: (k:string)=>string) => [
  { group: t('overview'), items: [{ id:'dashboard', label:t('dashboard'), icon:'⊟' }] },
  { group: t('inventory'), items: [
    { id:'pcs', label:t('pcs'), icon:'💻' },
    { id:'mobile', label:t('mobile'), icon:'📱' },
    { id:'printers', label:t('printers'), icon:'🖨️' },
    { id:'monitors', label:t('monitors'), icon:'🖥️' },
    { id:'addins', label:t('addIns'), icon:'🔌' },
    { id:'users', label:t('users'), icon:'👤' },
  ]},
  { group: t('assignmentsG'), items: [
    { id:'user-assignments', label:t('userAssign'), icon:'🔗' },
    { id:'drive-assignments', label:t('driveAssign'), icon:'💾' },
    { id:'cart-assignments', label:t('cartAssign'), icon:'🖋️' },
  ]},
  { group: t('operations'), items: [
    { id:'movements', label:t('movements'), icon:'→' },
    { id:'loc-swaps', label:t('locSwaps'), icon:'⇄' },
    { id:'owner-swaps', label:t('ownerSwaps'), icon:'⇌' },
    { id:'drive-swaps', label:t('driveSwaps'), icon:'⇆' },
    { id:'cart-changes', label:t('cartChanges'), icon:'♻' },
  ]},
  { group: t('audit'), items: [{ id:'logs', label:t('auditLogs'), icon:'≡' }] },
  { group: t('admin'), items: [{ id:'settings', label:t('settings'), icon:'⚙' }] },
];

const PAGE_COLOR: Record<string, string> = {
  dashboard:'#3b82f6', pcs:'#60a5fa', mobile:'#ec4899', printers:'#8b5cf6',
  monitors:'#06b6d4', addins:'#f59e0b', users:'#10b981',
  'user-assignments':'#3b82f6', 'drive-assignments':'#f59e0b', 'cart-assignments':'#10b981',
  movements:'#f97316', 'loc-swaps':'#8b5cf6', 'owner-swaps':'#ec4899',
  'drive-swaps':'#f59e0b', 'cart-changes':'#10b981', logs:'#475569', settings:'#475569',
};

const STATUS_COLOR: Record<string, string> = {
  'In Service':'#10b981', Reserved:'#3b82f6', Damaged:'#ef4444', Out:'#475569',
  Returned:'#f59e0b', Obsolete:'#475569', Available:'#10b981', 'In Use':'#3b82f6',
  Full:'#10b981', Partial:'#f59e0b', Empty:'#ef4444',
  'InStock/New':'#10b981', 'InStock/Used':'#f59e0b', Installed:'#3b82f6', Destroyed:'#ef4444',
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function getStatus(d: Device) {
  if (d.category==='hard_drive') return d.drive_status;
  if (d.category==='cartridge') return d.cartridge_status;
  return d.status;
}
function fmt(s?: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}
function fmtDT(s?: string) {
  if (!s) return '—';
  return new Date(s).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}

// Display category label
function dispCat(d: Device): string {
  if (d.device_type?.name === 'Phone') return 'mobile';
  if (d.category === 'computer') return 'pc';
  if (d.category === 'printer') return 'printer';
  if (d.category === 'monitor') return 'monitor';
  if (d.category === 'hard_drive') return 'drive';
  if (d.category === 'cartridge') return 'cartridge';
  return d.category;
}

// Check if status is "in stock" (assignable)
function isInStock(d: Device): boolean {
  const s = getStatus(d);
  if (!s) return false;
  return (s as any).is_assignable === true;
}

// Count stock for category
function countStock(devices: Device[], catFilter: (d:Device)=>boolean): number {
  return devices.filter(d => catFilter(d) && isInStock(d)).length;
}

// Auto-locate to "Stock" when status → reserved/instock
const STOCK_TRIGGER_STATUSES = ['reserved','instock/new','instock/used','InStock/New','InStock/Used','Reserved'];

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCHABLE SELECT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function SearchableSelect({ options, value, onChange, placeholder, disabled }: {
  options: SelectOption[]; value: string; onChange(v:string):void;
  placeholder?: string; disabled?: boolean;
}) {
  const { C } = useApp();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);
  const filtered = useMemo(() =>
    options.filter(o => !q || o.label.toLowerCase().includes(q.toLowerCase()) || (o.sub||'').toLowerCase().includes(q.toLowerCase())),
    [options, q]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const inp: React.CSSProperties = {
    padding:'8px 12px', borderRadius:6, border:`1px solid ${C.border2}`,
    background:C.inputBg, color:C.text, fontSize:13, fontFamily:'monospace',
    outline:'none', width:'100%',
  };

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <div onClick={() => !disabled && setOpen(o => !o)} style={{
        ...inp, cursor:disabled?'default':'pointer', display:'flex', justifyContent:'space-between', alignItems:'center',
        opacity: disabled ? 0.5 : 1,
      }}>
        <span style={{ color: selected ? C.text : C.muted }}>
          {selected ? (
            <span>{selected.label}{selected.sub && <span style={{ color:C.muted, fontSize:11, marginLeft:6 }}>{selected.sub}</span>}</span>
          ) : (placeholder || '—')}
        </span>
        <span style={{ color:C.muted, fontSize:10 }}>{open?'▲':'▼'}</span>
      </div>
      {open && (
        <div style={{
          position:'absolute', zIndex:2000, background:C.surface2, border:`1px solid ${C.border2}`,
          borderRadius:8, width:'100%', maxHeight:240, overflow:'hidden', display:'flex',flexDirection:'column',
          boxShadow:`0 8px 24px rgba(0,0,0,0.3)`, top:'calc(100% + 4px)',
        }}>
          <div style={{ padding:8, borderBottom:`1px solid ${C.border2}` }}>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)}
              style={{ ...inp, padding:'6px 10px' }} placeholder="Type to search…" />
          </div>
          <div style={{ overflowY:'auto', maxHeight:180 }}>
            {value && (
              <div onClick={()=>{ onChange(''); setOpen(false); setQ(''); }}
                style={{ padding:'8px 12px', cursor:'pointer', color:C.danger, fontSize:12 }}>
                ✕ Clear
              </div>
            )}
            {filtered.length === 0 && <div style={{ padding:'12px', color:C.muted, fontSize:12 }}>No results</div>}
            {filtered.map(o => (
              <div key={o.value} onClick={()=>{ onChange(o.value); setOpen(false); setQ(''); }}
                style={{
                  padding:'8px 12px', cursor:'pointer', fontSize:13,
                  background: value===o.value ? C.blue+'25' : 'transparent',
                  color: value===o.value ? C.blue : C.text,
                  borderLeft: value===o.value ? `2px solid ${C.blue}` : '2px solid transparent',
                }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=C.border2}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=value===o.value?C.blue+'25':'transparent'}
              >
                {o.label}
                {o.sub && <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{o.sub}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DONUT CHART
// ═══════════════════════════════════════════════════════════════════════════════
function DonutChart({ data, title, size=140 }: {
  data: { label:string; value:number; color:string }[]; title:string; size?:number;
}) {
  const { C } = useApp();
  const total = data.reduce((s,d) => s+d.value, 0);
  const r = size*0.38, cx = size/2, cy = size/2, inner = size*0.22;
  let angle = -90;
  const arcs = data.map(d => {
    const pct = total>0 ? d.value/total : 0;
    const deg = pct*360;
    const start = angle; angle += deg;
    return { ...d, start, end:angle, pct };
  });
  const polar = (a:number) => ({
    x: cx + r*Math.cos((a-90)*Math.PI/180),
    y: cy + r*Math.sin((a-90)*Math.PI/180),
  });
  return (
    <div style={{ textAlign:'center' }}>
      <svg width={size} height={size} style={{ display:'block', margin:'0 auto' }}>
        {total===0 ? (
          <circle cx={cx} cy={cy} r={r} fill={C.border2} />
        ) : arcs.map((arc,i) => {
          if (arc.value===0) return null;
          const s = polar(arc.start), e = polar(arc.end);
          const large = arc.end-arc.start>180?1:0;
          return <path key={i}
            d={`M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`}
            fill={arc.color} />;
        })}
        <circle cx={cx} cy={cy} r={inner} fill={C.surface2} />
        <text x={cx} y={cy-5} textAnchor="middle" fill={C.text} fontSize={size*0.14} fontWeight={700}>{total}</text>
        <text x={cx} y={cy+size*0.1} textAnchor="middle" fill={C.muted} fontSize={size*0.08}>total</text>
      </svg>
      <div style={{ fontSize:12, fontWeight:700, color:C.muted, marginTop:6 }}>{title}</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:4, justifyContent:'center', marginTop:6 }}>
        {arcs.map((arc,i) => arc.value>0 && (
          <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, color:C.muted }}>
            <span style={{ width:7, height:7, borderRadius:2, background:arc.color, display:'inline-block' }}/>
            {arc.label}: {arc.value}
          </span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BAR CHART
// ═══════════════════════════════════════════════════════════════════════════════
function BarChart({ data, title }: { data:{label:string;value:number;color:string}[]; title:string }) {
  const { C } = useApp();
  const max = Math.max(...data.map(d=>d.value), 1);
  const H = 100, W = 240;
  const bw = Math.floor((W - (data.length+1)*4) / Math.max(data.length,1));
  return (
    <div>
      <div style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:8 }}>{title}</div>
      <svg width={W} height={H+30} style={{ overflow:'visible' }}>
        {data.map((d,i) => {
          const bh = Math.max((d.value/max)*H, d.value>0?4:0);
          const x = 4 + i*(bw+4);
          return (
            <g key={i}>
              <rect x={x} y={H-bh} width={bw} height={bh} rx={3} fill={d.color} opacity={0.85}/>
              <text x={x+bw/2} y={H-bh-4} textAnchor="middle" fill={C.text} fontSize={9} fontWeight={700}>
                {d.value>0?d.value:''}
              </text>
              <text x={x+bw/2} y={H+12} textAnchor="middle" fill={C.muted} fontSize={9}
                style={{ maxWidth:bw }}>
                {d.label.length>4?d.label.slice(0,4):d.label}
              </text>
            </g>
          );
        })}
        <line x1={0} y1={H} x2={W} y2={H} stroke={C.border2} strokeWidth={1}/>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function Toaster({ toasts, remove }: { toasts:Toast[]; remove(id:number):void }) {
  const { C } = useApp();
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={()=>remove(t.id)} style={{
          display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderRadius:8, cursor:'pointer',
          background: t.ok?'#0f1f14':'#1f0f0f',
          border:`1px solid ${t.ok?'#166534':'#991b1b'}`,
          color: t.ok?'#4ade80':'#f87171',
          fontSize:13, fontFamily:'monospace', maxWidth:380,
          boxShadow:'0 4px 20px rgba(0,0,0,0.4)',
        }}>
          <span>{t.ok?'✓':'✗'}</span><span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function Modal({ title, onClose, children, width=580 }: {
  title:string; onClose():void; children:React.ReactNode; width?:number;
}) {
  const { C } = useApp();
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}
      onClick={onClose}>
      <div style={{ background:C.surface2, border:`1px solid ${C.border2}`, borderRadius:12,
        width, maxWidth:'95vw', maxHeight:'90vh', overflow:'auto',
        boxShadow:'0 25px 60px rgba(0,0,0,0.6)' }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'18px 24px', borderBottom:`1px solid ${C.border2}` }}>
          <span style={{ color:C.text, fontSize:15, fontWeight:600 }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:C.muted, fontSize:20, cursor:'pointer' }}>×</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel, danger=false, extra }: {
  title:string; message:string; onConfirm():void; onCancel():void; danger?:boolean; extra?: React.ReactNode;
}) {
  const { t, C } = useApp();
  return (
    <Modal title={title} onClose={onCancel} width={420}>
      <p style={{ color:'#94a3b8', fontSize:14, marginBottom:16, lineHeight:1.6 }}>{message}</p>
      {extra}
      <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:16 }}>
        <Btn variant="ghost" onClick={onCancel}>{t('cancel')}</Btn>
        <Btn variant={danger?'danger':'primary'} onClick={onConfirm}>{t('confirm')}</Btn>
      </div>
    </Modal>
  );
}

function Btn({ onClick, children, variant='primary', small, disabled }: {
  onClick():void; children:React.ReactNode;
  variant?:'primary'|'ghost'|'danger'; small?:boolean; disabled?:boolean;
}) {
  const { C } = useApp();
  const styles: Record<string,React.CSSProperties> = {
    primary:{ background:disabled?'#1e3a5f':C.blue, color:'#fff', border:'none' },
    ghost:  { background:'none', border:`1px solid ${C.border2}`, color:C.muted },
    danger: { background:C.danger, color:'#fff', border:'none' },
  };
  return (
    <button disabled={!!disabled} onClick={onClick} style={{
      ...styles[variant], padding:small?'3px 10px':'8px 16px',
      borderRadius:6, cursor:disabled?'default':'pointer',
      fontSize:small?11:13, fontWeight:600, fontFamily:'inherit',
    }}>{children}</button>
  );
}

function FF({ label, children, required: req }: { label:string; children:React.ReactNode; required?:boolean }) {
  const { C } = useApp();
  return (
    <label style={{ display:'flex', flexDirection:'column', gap:5 }}>
      <span style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em' }}>
        {label}{req && <span style={{ color:C.danger, marginLeft:3 }}>*</span>}
      </span>
      {children}
    </label>
  );
}

function StatusBadge({ name }: { name:string }) {
  const { C } = useApp();
  const color = STATUS_COLOR[name] ?? C.muted;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'2px 8px',
      borderRadius:20, background:color+'18', border:`1px solid ${color}40`,
      color, fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:color }}/>
      {name}
    </span>
  );
}

function StatCard({ label, value, color, sub, onClick }: {
  label:string; value:number|string; color:string; sub?:string; onClick?():void;
}) {
  const { C } = useApp();
  return (
    <div onClick={onClick} style={{ background:C.surface, border:`1px solid ${C.border2}`, borderRadius:10,
      padding:'16px 20px', display:'flex', flexDirection:'column', gap:6,
      cursor:onClick?'pointer':undefined }}>
      <div style={{ fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:700, color, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:C.dim }}>{sub}</div>}
    </div>
  );
}

function TR({ children, onClick, active, selected }: { children:React.ReactNode; onClick?():void; active?:boolean; selected?:boolean }) {
  const { C } = useApp();
  const [hovered, setHovered] = useState(false);
  const bg = selected ? C.blue+'18' : active ? C.surface2 : hovered && onClick ? C.border2 : 'transparent';
  return (
    <tr onClick={onClick}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{
        borderBottom:`1px solid ${C.border}`,
        cursor:onClick?'pointer':undefined,
        background:bg,
        transition:'background 0.12s ease',
        boxShadow: hovered && onClick ? `inset 0 0 0 1px ${C.blue}30` : 'none',
      }}>
      {children}
    </tr>
  );
}

function TD({ children, mono, dim, right, small }: { children:React.ReactNode; mono?:boolean; dim?:boolean; right?:boolean; small?:boolean }) {
  const { C } = useApp();
  return (
    <td style={{ padding:'10px 14px', fontSize:small?11:13, color:dim?C.muted:'#94a3b8',
      fontFamily:mono?'monospace':undefined, textAlign:right?'right':undefined }}>
      {children}
    </td>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILTERABLE TABLE
// ═══════════════════════════════════════════════════════════════════════════════
type FilterField<T> = { key:string; label:string; getValue(item:T):string };

function FilterableTable<T extends { id:number }>({
  cols, items, loading, filterFields, searchFn, children, bulkActions,
}: {
  cols:string[]; items:T[]; loading?:boolean;
  filterFields?:FilterField<T>[];
  searchFn?(item:T, q:string):boolean;
  children(item:T, selected:boolean):React.ReactNode;
  bulkActions?: { label:string; onClick(ids:number[]):void; variant?:'primary'|'ghost'|'danger' }[];
}) {
  const { t, C } = useApp();
  const [search, setSearch] = useState('');
  const [filterKey, setFilterKey] = useState('');
  const [filterVal, setFilterVal] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const ff = filterFields?.find(f=>f.key===filterKey);
  const filterVals = useMemo(() => {
    if (!ff) return [];
    const vals = new Set(items.map(i=>ff.getValue(i)).filter(Boolean));
    return Array.from(vals).sort();
  }, [items, ff]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchSearch = !search || (searchFn ? searchFn(item,search) : true);
      const matchFilter = !filterKey || !filterVal || (ff ? ff.getValue(item)===filterVal : true);
      return matchSearch && matchFilter;
    });
  }, [items, search, filterKey, filterVal, ff]);

  const inp: React.CSSProperties = {
    padding:'7px 10px', borderRadius:6, border:`1px solid ${C.border2}`,
    background:C.inputBg, color:C.text, fontSize:12, outline:'none', fontFamily:'monospace',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {/* Toolbar */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
        {searchFn && (
          <div style={{ position:'relative', flex:'1', minWidth:180, maxWidth:300 }}>
            <span style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:C.muted, fontSize:13 }}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('search')}
              style={{ ...inp, paddingLeft:26, width:'100%' }} />
          </div>
        )}
        {filterFields && filterFields.length>0 && (
          <>
            <select value={filterKey} onChange={e=>{setFilterKey(e.target.value);setFilterVal('');}}
              style={{ ...inp, minWidth:130 }}>
              <option value="">{t('filterBy')}</option>
              {filterFields.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
            <select value={filterVal} onChange={e=>setFilterVal(e.target.value)}
              style={{ ...inp, minWidth:130 }} disabled={!filterKey}>
              <option value="">{t('filterVal')}</option>
              {filterVals.map(v=><option key={v} value={v}>{v}</option>)}
            </select>
            {(filterKey||filterVal||search) && (
              <button onClick={()=>{setFilterKey('');setFilterVal('');setSearch('');}}
                style={{ ...inp, cursor:'pointer', color:C.danger }}>✕</button>
            )}
          </>
        )}
        <span style={{ color:C.dim, fontSize:12, marginLeft:'auto' }}>{filtered.length} {t('records')}</span>
      </div>

      {/* Bulk action bar */}
      {bulkActions && selected.size>0 && (
        <div style={{ display:'flex', gap:8, alignItems:'center', padding:'8px 12px',
          background:C.blue+'15', borderRadius:8, border:`1px solid ${C.blue}30` }}>
          <span style={{ color:C.blue, fontSize:12, fontWeight:600 }}>{selected.size} selected</span>
          {bulkActions.map(a=>(
            <Btn key={a.label} small variant={a.variant||'ghost'} onClick={()=>a.onClick(Array.from(selected))}>
              {a.label}
            </Btn>
          ))}
          <button onClick={()=>setSelected(new Set())}
            style={{ marginLeft:'auto', background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:13 }}>✕</button>
        </div>
      )}

      {/* Table */}
      <div style={{ border:`1px solid ${C.border2}`, borderRadius:10, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {bulkActions && (
                <th style={{ padding:'9px 14px', width:36 }}>
                  <input type="checkbox"
                    checked={selected.size===filtered.length && filtered.length>0}
                    onChange={e=>setSelected(e.target.checked ? new Set(filtered.map(i=>i.id)) : new Set())}/>
                </th>
              )}
              {cols.map(h=>(
                <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11, color:C.muted,
                  textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:`1px solid ${C.border2}`, whiteSpace:'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={cols.length+(bulkActions?1:0)} style={{ padding:36, textAlign:'center', color:C.muted }}>{t('loading')}</td></tr>}
            {!loading && filtered.length===0 && <tr><td colSpan={cols.length+(bulkActions?1:0)} style={{ padding:36, textAlign:'center', color:C.muted }}>{t('noRecords')}</td></tr>}
            {!loading && filtered.map(item => (
              <tr key={item.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                {bulkActions && (
                  <td style={{ padding:'10px 14px' }}>
                    <input type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={e=>setSelected(prev=>{const n=new Set(prev); e.target.checked?n.add(item.id):n.delete(item.id); return n;})}/>
                  </td>
                )}
                {children(item, selected.has(item.id))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STOCK ALERT BANNER
// ═══════════════════════════════════════════════════════════════════════════════
function StockAlertBanner({ devices }: { devices:Device[] }) {
  const { t, C } = useApp();
  const cats = [
    { key:'pc', label:'PC', filter:(d:Device)=>d.category==='computer'&&d.device_type?.name!=='Phone' },
    { key:'mobile', label:'Mobile', filter:(d:Device)=>d.device_type?.name==='Phone' },
    { key:'printer', label:'Printer', filter:(d:Device)=>d.category==='printer' },
    { key:'monitor', label:'Monitor', filter:(d:Device)=>d.category==='monitor' },
    { key:'drive', label:'Drive', filter:(d:Device)=>d.category==='hard_drive' },
    { key:'cartridge', label:'Cartridge', filter:(d:Device)=>d.category==='cartridge' },
  ];
  const alerts = cats.filter(c=>countStock(devices,c.filter)<10);
  if (alerts.length===0) return null;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {alerts.map(a=>(
        <div key={a.key} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
          background:C.amber+'18', border:`1px solid ${C.amber}40`, borderRadius:8 }}>
          <span style={{ fontSize:16 }}>⚠</span>
          <span style={{ color:C.amber, fontSize:13, fontWeight:600 }}>
            {t('stockAlert')}: {a.label} — {countStock(devices,a.filter)} in stock (min 10)
          </span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEVICE STATUS CHANGE PANEL (shown in drawer)
// ═══════════════════════════════════════════════════════════════════════════════
function StatusChangePanel({ device, statuses, onChanged }: {
  device:Device; statuses:LookupItem[]; onChanged():void;
}) {
  const { t, C } = useApp();
  const [newStatusId, setNewStatusId] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const currentStatus = getStatus(device);
  const statusField = device.category==='hard_drive'?'drive_status_id':device.category==='cartridge'?'cartridge_status_id':'status_id';

  // Check if new status triggers auto-location
  const selectedStatus = statuses.find(s=>String(s.id)===newStatusId);
  const willAutoLoc = selectedStatus && STOCK_TRIGGER_STATUSES.some(n=>
    selectedStatus.name.toLowerCase().includes(n.toLowerCase())
  );

  const handleChange = async () => {
    if (!newStatusId) return;
    setSaving(true);
    // Send only the status field. Backend DeviceController.update() is the
    // authoritative handler for auto-stock-relocation (moves device to Stock
    // location and clears user_id), so we make a single call here.
    const body: Record<string,any> = { [statusField]: Number(newStatusId) };
    const r = await api('PUT', `/devices/${device.id}`, body);
    if (r.ok) {
      setMsg('Status updated');
      onChanged();
    } else {
      setMsg(r.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const inp: React.CSSProperties = {
    padding:'7px 10px', borderRadius:6, border:`1px solid ${C.border2}`,
    background:C.inputBg, color:C.text, fontSize:12, outline:'none', width:'100%',
  };

  return (
    <div style={{ padding:'12px 0', borderTop:`1px solid ${C.border2}`, marginTop:8 }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
        {t('changeStatus')}
      </div>
      <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
        {t('currentStatusLbl')}: <StatusBadge name={currentStatus?.name||'—'}/>
      </div>
      <select value={newStatusId} onChange={e=>setNewStatusId(e.target.value)} style={inp}>
        <option value="">{t('newStatusLbl')}…</option>
        {statuses.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      {willAutoLoc && (
        <div style={{ marginTop:6, padding:'6px 10px', background:C.amber+'15', borderRadius:6,
          fontSize:11, color:C.amber }}>
          ℹ {t('autoLocInfo')}
        </div>
      )}
      {newStatusId && (
        <button onClick={handleChange} disabled={saving} style={{
          marginTop:8, padding:'6px 14px', borderRadius:6, background:C.blue, color:'#fff',
          border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
        }}>
          {saving?'…':t('save')}
        </button>
      )}
      {msg && <div style={{ marginTop:6, fontSize:11, color:C.green }}>{msg}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEVICE DRAWER
// ═══════════════════════════════════════════════════════════════════════════════
function DeviceDrawer({ device, onClose, onChanged }: { device:Device; onClose():void; onChanged():void }) {
  const { t, C } = useApp();
  const [statuses, setStatuses] = useState<LookupItem[]>([]);

  useEffect(() => {
    const ep = device.category==='hard_drive'?'/drive-statuses':device.category==='cartridge'?'/cartridge-statuses':'/statuses';
    api('GET', ep).then(r=>r.ok&&setStatuses(r.data));
  }, [device]);

  const status = getStatus(device);
  const rows: [string, React.ReactNode][] = [
    [t('labelF'), <span style={{ color:C.text, fontFamily:'monospace', fontWeight:600 }}>{device.label}</span>],
    [t('snF').replace(' *',''), <span style={{ fontFamily:'monospace' }}>{device.serial_number||'—'}</span>],
    ['Type', device.device_type?.name??'—'],
    [t('manufacturerF'), device.manufacturer?.name??device.device_model?.manufacturer?.name??'—'],
    [t('modelF').replace(' *',''), device.device_model?.name??'—'],
    [status?.name?.includes('Stock')||status?.name==='Installed'||status?.name==='Destroyed'?t('etatF'):t('statusF'), status?<StatusBadge name={status.name}/>:'—'],
    [t('locationF'), device.location?`${device.location.site?.name} › ${device.location.name}`:'—'],
    [t('departmentF'), device.department?.name??'—'],
    ['Assigned To', device.user?.name??<span style={{ color:C.dim }}>Unassigned</span>],
    ['Registered', fmt(device.created_at)],
  ];
  if (device.computer) {
    if (device.device_type?.name==='Phone') {
      rows.push([t('imeiF').replace(' *',''), device.computer.imei||'—']);
      rows.push([t('phoneNumF').replace(' *',''), device.computer.phone_number||'—']);
    } else {
      rows.push([t('cpuF'), device.computer.cpu||'—'], [t('ramF'), device.computer.ram||'—']);
    }
  }
  if (device.printer) rows.push([t('printerTypeF'), device.printer.printer_type], [t('duplexF'), device.printer.duplex?'Yes':'No'], [t('colorF'), device.printer.color_support?'Yes':'No']);
  if (device.monitor) rows.push([t('panelF'), device.monitor.panel_type||'—'], [t('sizeF'), device.monitor.size_inches?`${device.monitor.size_inches}"`:' —'], [t('videoF'), device.monitor.video_inputs?.join(', ')||'—']);
  if (device.hard_drive) rows.push([t('driveTypeF'), device.hard_drive.drive_type], [t('capacityF'), `${device.hard_drive.capacity_gb} GB`]);
  if (device.cartridge) rows.push([t('inkTypeF'), device.cartridge.ink_type], [t('compatF'), device.cartridge.printer_compatibility]);
  if (device.comment) rows.push([t('commentF'), device.comment]);

  return (
    <div style={{ position:'fixed', top:0, right:0, bottom:0, width:380,
      background:C.surface2, borderLeft:`1px solid ${C.border2}`,
      zIndex:500, display:'flex', flexDirection:'column', boxShadow:'-20px 0 60px rgba(0,0,0,0.5)' }}>
      <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.border2}`,
        display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ color:C.text, fontWeight:700, fontSize:14 }}>{device.label}</div>
          <div style={{ color:C.dim, fontSize:11, marginTop:2 }}>#{device.id} · {device.category.replace('_',' ')}</div>
        </div>
        <button onClick={onClose} style={{ background:C.border2, border:'none', color:'#94a3b8', width:28, height:28, borderRadius:6, cursor:'pointer', fontSize:15 }}>×</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'8px 20px 20px' }}>
        {rows.map(([k,v])=>(
          <div key={String(k)} style={{ display:'flex', padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:110, color:C.muted, fontSize:12, flexShrink:0, paddingTop:1 }}>{k}</div>
            <div style={{ color:'#94a3b8', fontSize:13, flex:1 }}>{v}</div>
          </div>
        ))}
        <StatusChangePanel device={device} statuses={statuses} onChanged={()=>{ onClose(); onChanged(); }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const WIDGET_DEFAULTS = {
  kpis:true, inventory:true, stockAlerts:true, charts:true, recentActivity:true, deptChart:true
};

function Dashboard({ navigate }: { navigate(page:string):void }) {
  const { t, C } = useApp();
  const [devices, setDevices] = useState<Device[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [depts, setDepts] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<Record<string,boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('dashWidgets')||'null') || WIDGET_DEFAULTS; } catch { return WIDGET_DEFAULTS; }
  });
  const [showCustomize, setShowCustomize] = useState(false);

  useEffect(() => {
    Promise.all([api('GET','/devices'),api('GET','/logs'),api('GET','/departments')]).then(([d,l,dp])=>{
      if(d.ok) setDevices(d.data);
      if(l.ok) setLogs(l.data.slice(0,15));
      if(dp.ok) setDepts(dp.data);
      setLoading(false);
    });
  },[]);

  const toggleWidget = (k:string) => {
    setWidgets(w=>{ const n={...w,[k]:!w[k]}; localStorage.setItem('dashWidgets',JSON.stringify(n)); return n; });
  };

  const cats = [
    { id:'pcs', label:t('pcs'), color:'#60a5fa', filter:(d:Device)=>d.category==='computer'&&d.device_type?.name!=='Phone' },
    { id:'mobile', label:t('mobile'), color:'#ec4899', filter:(d:Device)=>d.device_type?.name==='Phone' },
    { id:'printers', label:t('printers'), color:'#8b5cf6', filter:(d:Device)=>d.category==='printer' },
    { id:'monitors', label:t('monitors'), color:'#06b6d4', filter:(d:Device)=>d.category==='monitor' },
    { id:'addins', label:t('addIns'), color:'#f59e0b', filter:(d:Device)=>d.category==='hard_drive'||d.category==='cartridge' },
  ];

  const totalInService = devices.filter(d=>d.status?.name==='In Service').length;
  const totalDamaged = devices.filter(d=>{ const s=getStatus(d); return s?.name==='Damaged'||s?.name==='Destroyed'; }).length;

  // Build donut data for each cat
  const statusGroups = ['In Service','Reserved','InStock/New','InStock/Used','Installed','Damaged','Destroyed','Obsolete','Other'];
  const buildDonut = (filter:(d:Device)=>boolean) => {
    const subset = devices.filter(filter);
    const groups: Record<string,number> = {};
    subset.forEach(d=>{ const s=getStatus(d)?.name||'Other'; groups[s]=(groups[s]||0)+1; });
    return Object.entries(groups).map(([label,value])=>({ label, value, color:STATUS_COLOR[label]||C.muted }));
  };

  // Dept bar chart
  const deptChartData = depts.map(dep=>({
    label:dep.name,
    value:devices.filter(d=>d.department?.id===dep.id).length,
    color:C.blue,
  }));

  const ACTION_COLOR: Record<string,string> = {
    device_created:C.green, device_deleted:C.danger,
    status_changed:C.amber, auto_stock_relocation:C.amber,
    assigned:C.blue, unassigned:C.muted, moved:C.amber,
    location_swapped:C.purple, owner_swapped:'#ec4899',
    drive_assigned:C.cyan, drive_unassigned:C.muted,
    drive_swapped:C.cyan, cartridge_assigned:C.green, cartridge_unassigned:C.muted,
    cartridge_swapped:C.green,
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {/* Header with customize button */}
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <Btn variant="ghost" small onClick={()=>setShowCustomize(true)}>⚙ {t('showHide')}</Btn>
      </div>

      {/* Customize modal */}
      {showCustomize && (
        <Modal title={t('showHide')} onClose={()=>setShowCustomize(false)} width={360}>
          {Object.entries(widgets).map(([k,v])=>(
            <label key={k} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0',
              borderBottom:`1px solid ${C.border}`, cursor:'pointer' }}>
              <input type="checkbox" checked={v} onChange={()=>toggleWidget(k)}/>
              <span style={{ color:C.text, fontSize:13, textTransform:'capitalize' }}>{k.replace(/([A-Z])/g,' $1')}</span>
            </label>
          ))}
        </Modal>
      )}

      {/* Stock Alerts */}
      {widgets.stockAlerts && !loading && <StockAlertBanner devices={devices}/>}

      {/* KPIs */}
      {widgets.kpis && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12 }}>
          <StatCard label="Total Assets" value={loading?'…':devices.length} color={C.blue}/>
          <StatCard label={t('inServiceLbl')} value={loading?'…':totalInService} color={C.green}/>
          <StatCard label={t('damagedLbl')} value={loading?'…':totalDamaged} color={C.danger}/>
          <StatCard label={t('auditEvents')} value={loading?'…':logs.length} color={C.muted} sub="recent"/>
        </div>
      )}

      {/* Inventory cards */}
      {widgets.inventory && (
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>{t('inventoryOverview')}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10 }}>
            {cats.map(c=>{
              const total = devices.filter(c.filter).length;
              const inStock = countStock(devices,c.filter);
              const low = inStock<10;
              return (
                <button key={c.id} onClick={()=>navigate(c.id)} style={{
                  background:C.surface, border:`1px solid ${low?C.amber:C.border2}`, borderRadius:10,
                  padding:'14px 18px', cursor:'pointer', textAlign:'left',
                }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=c.color}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=low?C.amber:C.border2}>
                  <div style={{ fontSize:24, fontWeight:700, color:c.color, lineHeight:1 }}>{loading?'…':total}</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{c.label}</div>
                  <div style={{ fontSize:10, color:low?C.amber:C.dim, marginTop:2 }}>
                    {inStock} in stock {low&&'⚠'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts */}
      {widgets.charts && !loading && (
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>{t('statusDistrib')}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:24, alignItems:'flex-start' }}>
            {cats.map(c=>(
              <div key={c.id} style={{ background:C.surface, border:`1px solid ${C.border2}`, borderRadius:10, padding:16 }}>
                <DonutChart data={buildDonut(c.filter)} title={c.label} size={130}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dept chart */}
      {widgets.deptChart && !loading && depts.length>0 && (
        <div style={{ background:C.surface, border:`1px solid ${C.border2}`, borderRadius:10, padding:16 }}>
          <BarChart data={deptChartData} title={t('deptComparison')}/>
        </div>
      )}

      {/* Recent activity */}
      {widgets.recentActivity && (
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>{t('recentActivity')}</div>
          <div style={{ border:`1px solid ${C.border2}`, borderRadius:10, overflow:'hidden' }}>
            {loading ? <div style={{ padding:30, textAlign:'center', color:C.muted }}>{t('loading')}</div>
            : logs.length===0 ? <div style={{ padding:30, textAlign:'center', color:C.muted }}>No activity yet</div>
            : logs.map((log,i)=>{
              const color=ACTION_COLOR[log.action]??C.muted;
              return (
                <div key={log.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px',
                  borderBottom:i<logs.length-1?`1px solid ${C.border}`:'none' }}>
                  <span style={{ padding:'2px 7px', borderRadius:4, background:color+'18', color, fontSize:11, fontWeight:600, fontFamily:'monospace', whiteSpace:'nowrap' }}>
                    {log.action}
                  </span>
                  <span style={{ color:'#94a3b8', fontSize:13, fontFamily:'monospace' }}>{log.device?.label??`#${log.device_id}`}</span>
                  <span style={{ marginLeft:'auto', color:C.dim, fontSize:11, whiteSpace:'nowrap' }}>{fmtDT(log.logged_at)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEVICE PAGE (handles all categories)
// ═══════════════════════════════════════════════════════════════════════════════
const PAGE_CATS: Record<string,{ category:string; typeFilter?:string; excludeType?:string; color:string }> = {
  pcs:     { category:'computer', excludeType:'Phone', color:'#60a5fa' },
  mobile:  { category:'computer', typeFilter:'Phone', color:'#ec4899' },
  printers:{ category:'printer', color:'#8b5cf6' },
  monitors:{ category:'monitor', color:'#06b6d4' },
  addins:  { category:'hard_drive,cartridge', color:'#f59e0b' },
  users:   { category:'user', color:'#10b981' },
};

function DevicePage({ pageId, toast }: { pageId:string; toast(msg:string,ok:boolean):void }) {
  const { t, C } = useApp();
  const pageCfg = PAGE_CATS[pageId];
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Device|null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState<Device|null>(null);
  const [form, setForm] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);
  const [lookups, setLookups] = useState<Record<string,LookupItem[]>>({});
  const [addinsTab, setAddinsTab] = useState<'drive'|'cartridge'>('drive');

  const isUsers = pageId==='users';
  const isAddins = pageId==='addins';

  const load = useCallback(async()=>{
    setLoading(true);
    if (isUsers) {
      const r=await api('GET','/users'); if(r.ok) setDevices(r.data); setLoading(false); return;
    }
    const cats = isAddins?['hard_drive','cartridge']:[pageCfg.category];
    const all: Device[] = [];
    for (const cat of cats) {
      const r=await api('GET',`/devices?category=${cat}`); if(r.ok) all.push(...r.data);
    }
    setDevices(all); setLoading(false);
  },[pageId]);

  useEffect(()=>{ load(); setSelected(null); setForm({}); },[load]);

  const loadLookups = async()=>{
    const [ty,mo,lo,de,st,ds,cs,us] = await Promise.all([
      api('GET','/device-types'), api('GET','/device-models'), api('GET','/locations'),
      api('GET','/departments'), api('GET','/statuses'), api('GET','/drive-statuses'),
      api('GET','/cartridge-statuses'), api('GET','/users'),
    ]);
    setLookups({
      types:ty.ok?ty.data:[],
      models:mo.ok?mo.data:[],
      locations:lo.ok?lo.data:[],
      departments:de.ok?de.data:[],
      statuses:st.ok?st.data:[],
      driveStatuses:ds.ok?ds.data:[],
      cartridgeStatuses:cs.ok?cs.data:[],
      users:us.ok?us.data:[],
    });
  };

  const sf=(k:string)=>(e:React.ChangeEvent<any>)=>{
    const val=e.target.value;
    setForm(p=>{ const n={...p,[k]:val};
      // Auto-fill manufacturer when model changes
      if(k==='device_model_id'&&val) {
        const mdl=(lookups.models||[]).find((m:any)=>String(m.id)===val);
        if(mdl?.manufacturer?.id) n.manufacturer_id=String(mdl.manufacturer.id);
        else if(mdl?.manufacturer_id) n.manufacturer_id=String(mdl.manufacturer_id);
      }
      return n;
    });
  };

  // Determine effective category for the form.
  // Priority: (1) type chosen by user, (2) addins tab, (3) page's own category
  const effectiveCatFromTab = isAddins ? (addinsTab==='cartridge'?'cartridge':'hard_drive') : null;
  const currentCategory = (lookups.types||[]).find((ty:any)=>String(ty.id)===form.device_type_id)?.category
    || effectiveCatFromTab
    || pageCfg?.category
    || 'computer';

  // Status options and FK name — derived purely from currentCategory
  const statusOptions = currentCategory==='hard_drive'
    ? lookups.driveStatuses||[]
    : currentCategory==='cartridge'
    ? lookups.cartridgeStatuses||[]
    : lookups.statuses||[];
  const statusField = currentCategory==='hard_drive'?'drive_status_id':currentCategory==='cartridge'?'cartridge_status_id':'status_id';

  // Model options filtered to page category
  const relevantModels = useMemo(()=>{
    const cat = isAddins&&addinsTab==='cartridge'?'cartridge':isAddins?'hard_drive':pageCfg?.category;
    return (lookups.models||[]).filter((m:any)=>{
      const typeC=(lookups.types||[]).find((ty:any)=>ty.id===m.device_type_id)?.category;
      return typeC===cat;
    });
  },[lookups.models, lookups.types, pageId, addinsTab]);

  const modelOptions: SelectOption[] = relevantModels.map((m:any)=>({
    value:String(m.id), label:m.name, sub:m.manufacturer?.name||'',
  }));

  const typeOptions: SelectOption[] = (lookups.types||[])
    .filter((ty:any)=>{
      const cat=isAddins&&addinsTab==='cartridge'?'cartridge':isAddins?'hard_drive':pageCfg?.category;
      return ty.category===cat;
    })
    .map((ty:any)=>({ value:String(ty.id), label:ty.name }));

  const locationOptions: SelectOption[] = (lookups.locations||[]).map((l:any)=>({
    value:String(l.id), label:l.name, sub:l.site?.name,
  }));

  const departmentOptions: SelectOption[] = (lookups.departments||[]).map((d:any)=>({
    value:String(d.id), label:d.name,
  }));

  const userOptions: SelectOption[] = (lookups.users||[]).map((u:any)=>({
    value:String(u.id), label:u.name, sub:u.department?.name||u.email||'',
  }));

  // Creating a device ADDS to stock — never show stock warning on creation.
  // Stock alerts only fire on assignment (removal from stock).
  const doCreate = async()=>{
    setSaving(true);
    const body: Record<string,any> = {};
    const strKeys=['label','serial_number','comment','cpu','ram','printer_compatibility','imei','phone_number'];
    Object.entries(form).forEach(([k,v])=>{
      if(!v) return;
      if(strKeys.includes(k)) body[k]=v;
      else if(v==='0'||v==='1') body[k]=Number(v);
      else body[k]=isNaN(Number(v))?v:Number(v);
    });
    // Auto-add manufacturer from model if not set
    if(form.device_model_id && !body.manufacturer_id) {
      const mdl=(lookups.models||[]).find((m:any)=>String(m.id)===form.device_model_id);
      if(mdl?.manufacturer_id) body.manufacturer_id=mdl.manufacturer_id;
    }
    const r=await api('POST','/devices',body);
    setSaving(false);
    if(r.ok){ toast(`"${r.data.label}" created`,true); setShowCreate(false); setForm({}); load(); }
    else toast(r.data?.message??'Failed to create',false);
  };

  const handleDelete=async(device:Device)=>{
    const ep=isUsers?`/users/${device.id}`:`/devices/${device.id}`;
    const r=await api('DELETE',ep);
    if(r.ok){ toast(`Deleted`,true); setShowDelete(null); if(selected?.id===device.id) setSelected(null); load(); }
    else toast(r.data?.message??'Cannot delete',false);
  };

  // Filter fields for FilterableTable
  const filterFields: FilterField<Device>[] = isUsers ? [
    { key:'department', label:t('departmentF'), getValue:d=>(d as any).department?.name||'' },
  ] : [
    { key:'status', label: currentCategory==='hard_drive'?t('etatF'):t('statusF'), getValue:d=>getStatus(d)?.name||'' },
    { key:'department', label:t('departmentF'), getValue:d=>d.department?.name||'' },
    { key:'location', label:t('locationF'), getValue:d=>d.location?.name||'' },
    { key:'category', label:'Category', getValue:d=>d.category },
  ];

  const inp: React.CSSProperties = {
    padding:'8px 12px', borderRadius:6, border:`1px solid ${C.border2}`,
    background:C.inputBg, color:C.text, fontSize:13, outline:'none', width:'100%', fontFamily:'monospace',
  };

  // Users page
  if (isUsers) {
    const users = devices as any[];
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <Btn onClick={()=>{ setForm({}); loadLookups(); setShowCreate(true); }}>+ {t('add')}</Btn>
        </div>
        <FilterableTable
          cols={['Name','Email','Department','']}
          items={users}
          loading={loading}
          filterFields={[{ key:'department', label:t('departmentF'), getValue:(u:any)=>u.department?.name||'' }]}
          searchFn={(u:any,q)=>u.name?.toLowerCase().includes(q.toLowerCase())||u.email?.toLowerCase().includes(q.toLowerCase())}
          children={(u:any)=>(
            <>
              <TD><div style={{ fontWeight:600, color:C.text }}>{u.name}</div></TD>
              <TD dim mono>{u.email}</TD>
              <TD dim>{u.department?.name||'—'}</TD>
              <td style={{ padding:'10px 14px', textAlign:'right' }}>
                <Btn small variant="ghost" onClick={()=>setShowDelete(u)}>✕</Btn>
              </td>
            </>
          )}
        />
        {showCreate && (
          <Modal title="Add User" onClose={()=>setShowCreate(false)} width={480}>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <FF label="Full Name" required><input style={inp} placeholder="Jane Doe" value={form.name||''} onChange={sf('name')}/></FF>
              <FF label="Email" required><input style={inp} type="email" placeholder="jane@co.com" value={form.email||''} onChange={sf('email')}/></FF>
              <FF label={t('departmentF')}><SearchableSelect options={departmentOptions} value={form.department_id||''} onChange={v=>setForm(p=>({...p,department_id:v}))} placeholder="Optional…"/></FF>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
                <Btn variant="ghost" onClick={()=>setShowCreate(false)}>{t('cancel')}</Btn>
                <Btn onClick={async()=>{
                  const body:any={name:form.name,email:form.email};
                  if(form.department_id) body.department_id=Number(form.department_id);
                  const r=await api('POST','/users',body);
                  if(r.ok){toast('User created',true);setShowCreate(false);setForm({});load();}
                  else toast(r.data?.message||'Failed',false);
                }}>{t('create')}</Btn>
              </div>
            </div>
          </Modal>
        )}
        {showDelete && (
          <ConfirmModal title={t('delete')} message={`Delete ${(showDelete as any).name}?`}
            onConfirm={()=>handleDelete(showDelete)} onCancel={()=>setShowDelete(null)} danger/>
        )}
      </div>
    );
  }

  // Add-ins tab toggle
  const effectiveCat = isAddins ? (addinsTab==='cartridge'?'cartridge':'hard_drive') : pageCfg.category;

  let displayDevices = devices.filter(d=>{
    if(isAddins) return addinsTab==='cartridge'?d.category==='cartridge':d.category==='hard_drive';
    if(pageCfg.typeFilter) return d.device_type?.name===pageCfg.typeFilter;
    if(pageCfg.excludeType) return d.device_type?.name!==pageCfg.excludeType;
    return true;
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {isAddins && (
        <div style={{ display:'flex', gap:4, background:C.bg, borderRadius:8, padding:4, border:`1px solid ${C.border2}`, width:'fit-content' }}>
          {([['drive','💾 Drives'],['cartridge','🖋 Cartridges']] as const).map(([tab,label])=>(
            <button key={tab} onClick={()=>setAddinsTab(tab)} style={{
              padding:'5px 14px', borderRadius:5, border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
              background:addinsTab===tab?C.border2:'transparent', color:addinsTab===tab?C.text:C.muted,
            }}>{label}</button>
          ))}
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <Btn onClick={()=>{ setForm({}); loadLookups(); setShowCreate(true); }}>+ {t('add')}</Btn>
      </div>

      <FilterableTable
        cols={[t('labelF'),t('modelF').replace(' *',''),'Details',t('locationF'), isAddins ? t('etatF') : t('statusF'),'']}
        items={displayDevices}
        loading={loading}
        filterFields={filterFields}
        searchFn={(d,q)=>d.label.toLowerCase().includes(q.toLowerCase())||d.serial_number?.toLowerCase().includes(q.toLowerCase())||d.device_model?.name?.toLowerCase().includes(q.toLowerCase())||false}
        children={(d,sel)=>(
          <>
            <td style={{ padding:'10px 14px' }} onClick={()=>setSelected(selected?.id===d.id?null:d)}>
              <div style={{ color:C.text, fontWeight:600, fontSize:13, fontFamily:'monospace' }}>{d.label}</div>
              {d.serial_number&&<div style={{ color:C.dim, fontSize:11, marginTop:1 }}>{d.serial_number}</div>}
            </td>
            <td style={{ padding:'10px 14px' }} onClick={()=>setSelected(selected?.id===d.id?null:d)}>
              <div style={{ fontSize:13, color:'#94a3b8' }}>{d.device_model?.name||'—'}</div>
              <div style={{ fontSize:11, color:C.dim }}>{d.manufacturer?.name||d.device_model?.manufacturer?.name||''}</div>
            </td>
            <td style={{ padding:'10px 14px', fontSize:12, color:C.muted }}>
              {d.computer&&d.device_type?.name==='Phone'&&<span>{d.computer.phone_number||'—'}</span>}
              {d.computer&&d.device_type?.name!=='Phone'&&<span>{d.computer.cpu||'—'} / {d.computer.ram||'—'}</span>}
              {d.printer&&<span style={{ textTransform:'capitalize' }}>{d.printer.printer_type}</span>}
              {d.monitor&&<span>{d.monitor.panel_type||'—'} {d.monitor.size_inches?`${d.monitor.size_inches}"`:'—'}</span>}
              {d.hard_drive&&<span>{d.hard_drive.drive_type} {d.hard_drive.capacity_gb}GB</span>}
              {d.cartridge&&<span style={{ textTransform:'capitalize' }}>{d.cartridge.ink_type}</span>}
            </td>
            <td style={{ padding:'10px 14px', fontSize:12, color:C.muted }}>
              {d.location?<><div>{d.location.name}</div><div style={{ fontSize:11, color:C.dim }}>{d.location.site?.name}</div></>:'—'}
            </td>
            <td style={{ padding:'10px 14px' }}>{getStatus(d)?<StatusBadge name={getStatus(d)!.name}/>:'—'}</td>
            <td style={{ padding:'10px 14px', textAlign:'right' }}>
              <Btn small variant="ghost" onClick={()=>setShowDelete(d)}>✕</Btn>
            </td>
          </>
        )}
      />

      {selected && <DeviceDrawer device={selected} onClose={()=>setSelected(null)} onChanged={load}/>}

      {/* Create Modal */}
      {showCreate && (
        <Modal title={`Add Device`} onClose={()=>setShowCreate(false)} width={660}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <FF label={t('labelF')} required><input style={inp} placeholder="e.g. PC-042" value={form.label||''} onChange={sf('label')}/></FF>
              <FF label={t('snF')} required><input style={inp} placeholder="e.g. SN-001" value={form.serial_number||''} onChange={sf('serial_number')}/></FF>
            </div>

            {/* Phone special: IMEI + phone_number */}
            {(pageId==='mobile'||(isAddins&&false)) && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FF label={t('imeiF')} required><input style={inp} placeholder="15-digit IMEI" maxLength={15} value={form.imei||''} onChange={sf('imei')}/></FF>
                <FF label={t('phoneNumF')} required><input style={inp} placeholder="+1234567890" value={form.phone_number||''} onChange={sf('phone_number')}/></FF>
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12 }}>
              <FF label={t('modelF')} required>
                <SearchableSelect options={modelOptions} value={form.device_model_id||''} onChange={v=>{setForm(p=>{const mdl=(lookups.models||[]).find((m:any)=>String(m.id)===v);const n={...p,device_model_id:v};if(mdl?.manufacturer_id)n.manufacturer_id=String(mdl.manufacturer_id);if(mdl?.device_type_id)n.device_type_id=String(mdl.device_type_id);return n;});}} placeholder={t('searchModel')}/>
              </FF>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <FF label={t('locationF')}>
                <SearchableSelect options={locationOptions} value={form.location_id||''} onChange={v=>setForm(p=>({...p,location_id:v}))} placeholder="Select…"/>
              </FF>
              <FF label={effectiveCat==='hard_drive'||effectiveCat==='cartridge'?t('etatF'):t('statusF')}>
                <SearchableSelect
                  options={statusOptions.map((s:any)=>({value:String(s.id),label:s.name}))}
                  value={form[statusField]||String(statusOptions.find((s:any)=>s.name.includes('Reserved')||s.name.includes('InStock')||s.name==='Full')?.id||'')}
                  onChange={v=>setForm(p=>({...p,[statusField]:v}))}
                  placeholder="Defaults to Reserved…"
                />
              </FF>
            </div>

            {/* Category-specific fields */}
            {!isAddins && effectiveCat==='computer' && pageId!=='mobile' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FF label={t('cpuF')}><input style={inp} placeholder="Intel i7…" value={form.cpu||''} onChange={sf('cpu')}/></FF>
                <FF label={t('ramF')}><input style={inp} placeholder="16GB DDR4" value={form.ram||''} onChange={sf('ram')}/></FF>
              </div>
            )}
            {effectiveCat==='printer' && (
              <FF label={t('printerTypeF')} required>
                <select style={inp} value={form.printer_type||''} onChange={sf('printer_type')}>
                  <option value="">Select…</option>
                  <option value="laser">Laser</option><option value="inkjet">Inkjet</option>
                </select>
              </FF>
            )}
            {(isAddins&&addinsTab==='drive') && (
              <FF label={t('driveTypeF')} required>
                <select style={inp} value={form.drive_type||''} onChange={sf('drive_type')}>
                  <option value="">Select…</option>
                  <option value="HDD">HDD</option><option value="SSD">SSD</option><option value="NVMe">NVMe</option>
                </select>
              </FF>
            )}
            {(isAddins&&addinsTab==='cartridge') && (
              <FF label={t('inkTypeF')} required>
                <select style={inp} value={form.ink_type||''} onChange={sf('ink_type')}>
                  <option value="">Select…</option>
                  <option value="laser">Laser</option><option value="inkjet">Inkjet</option>
                </select>
              </FF>
            )}

            {(isAddins&&addinsTab==='drive') && (
              <FF label={t('capacityF')} required><input style={inp} type="number" placeholder="512" value={form.capacity_gb||''} onChange={sf('capacity_gb')}/></FF>
            )}
            {(isAddins&&addinsTab==='cartridge') && (
              <FF label={t('compatF')} required><input style={inp} placeholder="e.g. HP 85A" value={form.printer_compatibility||''} onChange={sf('printer_compatibility')}/></FF>
            )}
            {effectiveCat==='printer' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FF label={t('duplexF')}><select style={inp} value={form.duplex||'0'} onChange={sf('duplex')}><option value="0">No</option><option value="1">Yes</option></select></FF>
                <FF label={t('colorF')}><select style={inp} value={form.color_support||'0'} onChange={sf('color_support')}><option value="0">No</option><option value="1">Yes</option></select></FF>
              </div>
            )}
            {effectiveCat==='monitor' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FF label={t('panelF')}><select style={inp} value={form.panel_type||''} onChange={sf('panel_type')}><option value="">—</option><option>IPS</option><option>TN</option><option>VA</option><option>OLED</option></select></FF>
                <FF label={t('sizeF')}><input style={inp} type="number" step="0.1" placeholder="27.0" value={form.size_inches||''} onChange={sf('size_inches')}/></FF>
              </div>
            )}

            {/* User assignment (phones) */}
            {pageId==='mobile' && (
              <FF label={t('userF')}>
                <SearchableSelect options={userOptions} value={form.user_id||''} onChange={v=>setForm(p=>({...p,user_id:v}))} placeholder="Optional…"/>
              </FF>
            )}

            <FF label={t('commentF')}><textarea style={{ ...inp, minHeight:50, resize:'vertical' }} placeholder="Optional notes…" value={form.comment||''} onChange={sf('comment')}/></FF>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <Btn variant="ghost" onClick={()=>setShowCreate(false)}>{t('cancel')}</Btn>
              <Btn onClick={doCreate} disabled={saving}>{saving?'…':t('create')}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {showDelete && (
        <ConfirmModal title={t('delete')} message={`Delete "${showDelete.label}"? This cannot be undone.`}
          onConfirm={()=>handleDelete(showDelete)} onCancel={()=>setShowDelete(null)} danger/>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSIGNMENTS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function AssignmentsPage({ type, toast }: { type:'user'|'drive'|'cartridge'; toast(m:string,ok:boolean):void }) {
  const { t, C } = useApp();
  const cfg = {
    user:     { ep:'/assignments', colA:'Device', colB:'User', selectA:t('selectDevice'), selectB:t('selectUser'), bodyA:'device_id', bodyB:'user_id' },
    drive:    { ep:'/drive-assignments', colA:'Drive', colB:'Computer', selectA:'Select drive…', selectB:t('selectComputer'), bodyA:'hard_drive_id', bodyB:'computer_id' },
    cartridge:{ ep:'/cartridge-assignments', colA:'Cartridge', colB:'Printer', selectA:t('selectCart'), selectB:t('selectPrinter'), bodyA:'cartridge_id', bodyB:'printer_id' },
  }[type];

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [optionsA, setOptionsA] = useState<SelectOption[]>([]);
  const [optionsB, setOptionsB] = useState<SelectOption[]>([]);
  const [selA, setSelA] = useState('');
  const [selB, setSelB] = useState('');
  const [stockConfirm, setStockConfirm] = useState<{msg:string;onConfirm():void}|null>(null);

  const load=useCallback(async()=>{ setLoading(true); const r=await api('GET',cfg.ep); if(r.ok) setItems(r.data); setLoading(false); },[type]);
  useEffect(()=>{ load(); },[load]);

  const openModal=async()=>{
    setSelA(''); setSelB('');
    if(type==='user') {
      const [devR,usrR]=await Promise.all([api('GET','/devices'),api('GET','/users')]);
      if(devR.ok) setOptionsA(devR.data.filter((d:Device)=>['computer','printer','monitor'].includes(d.category)).map((d:Device)=>({ value:String(d.id), label:d.label, sub:`${d.category} · ${d.status?.name||''}` })));
      if(usrR.ok) setOptionsB(usrR.data.map((u:any)=>({ value:String(u.id), label:u.name, sub:u.department?.name||u.email })));
    } else if(type==='drive') {
      const [drR,coR]=await Promise.all([api('GET','/devices?category=hard_drive'),api('GET','/devices?category=computer')]);
      if(drR.ok) setOptionsA(drR.data.map((d:Device)=>({ value:String(d.id), label:d.label, sub:`${d.hard_drive?.drive_type||''} ${d.hard_drive?.capacity_gb||''}GB` })));
      if(coR.ok) setOptionsB(coR.data.map((d:Device)=>({ value:String(d.id), label:d.label })));
    } else {
      const [caR,prR]=await Promise.all([api('GET','/devices?category=cartridge'),api('GET','/devices?category=printer')]);
      if(caR.ok) setOptionsA(caR.data.map((d:Device)=>({ value:String(d.id), label:d.label, sub:d.cartridge?.ink_type||'' })));
      if(prR.ok) setOptionsB(prR.data.map((d:Device)=>({ value:String(d.id), label:d.label })));
    }
    setShowModal(true);
  };

  const doAssign=async()=>{
    const body:any={ [cfg.bodyA]:Number(selA), [cfg.bodyB]:Number(selB) };
    const r=await api('POST',cfg.ep,body);
    if(r.ok){ toast('Assignment created',true); setShowModal(false); load(); }
    else toast(r.data?.message??'Failed',false);
  };

  const handleAssign=async()=>{
    if(type==='user') {
      // 1. Category uniqueness: fetch device to get its display category
      const devR=await api('GET',`/devices/${selA}`);
      if(!devR.ok){ toast('Could not load device details',false); return; }
      const devD:Device=devR.data;

      // Determine display category robustly from device_type name
      const deviceTypeName = devD.device_type?.name||'';
      const displayCat = deviceTypeName==='Phone' ? 'mobile' : devD.category;

      // Check user's existing active assignments for same display-category
      const existR=await api('GET',`/users/${selB}/assignments`);
      if(existR.ok) {
        const activeAssigns=existR.data.filter((a:any)=>!a.end_date);
        const conflict=activeAssigns.find((a:any)=>{
          const ad=a.device;
          if(!ad) return false;
          const adTypeName=ad.device_type?.name||'';
          const adCat=adTypeName==='Phone'?'mobile':ad.category;
          return adCat===displayCat;
        });
        if(conflict){
          toast(`User already has a ${displayCat.toUpperCase()} assigned: ${conflict.device?.label}. End that assignment first.`,false);
          return;
        }
      }

      // 2. Stock alert — only fire if this specific device is currently in a
      // "stock" status (Reserved / InStock/New / InStock/Used), meaning assigning
      // it actually removes it from available stock.
      const STOCK_STATUS_NAMES = ['reserved','instock/new','instock/used','full'];
      const deviceCurrentStatus = getStatus(devD)?.name ?? '';
      const deviceIsInStock = STOCK_STATUS_NAMES.includes(deviceCurrentStatus.toLowerCase());

      if (deviceIsInStock) {
        const allR=await api('GET',`/devices?category=${devD.category}`);
        if(allR.ok){
          const inStockNow=countStock(allR.data,(d:Device)=>d.category===devD.category);
          const afterAssign=inStockNow-1; // this device leaves stock
          if(afterAssign<10){
            setStockConfirm({
              msg:t('stockMsg',{count:afterAssign,cat:devD.category.replace('_',' ')}),
              onConfirm:()=>{ setStockConfirm(null); doAssign(); }
            });
            return;
          }
        }
      }
    }
    doAssign();
  };

  const handleEnd=async(id:number)=>{
    const r=await api('PUT',`${cfg.ep}/${id}/end`,{});
    if(r.ok){
      toast('Assignment ended',true);
      load();
    } else {
      toast(r.data?.message??'Failed',false);
    }
  };

  const getA=(item:any)=>type==='user'?item.device:type==='drive'?item.hard_drive:item.cartridge;
  const getB=(item:any)=>type==='user'?item.user:type==='drive'?item.computer:item.printer;
  const active=items.filter(i=>!i.end_date).length;

  const filterFields: FilterField<any>[] = [
    { key:'active', label:'Status', getValue:(i:any)=>i.end_date?'Ended':'Active' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13 }}>
          <span style={{ color:'#475569' }}>{items.length} {t('records')} · </span>
          <span style={{ color:'#10b981', fontWeight:600 }}>{active} {t('active')}</span>
        </span>
        <Btn onClick={openModal}>+ New Assignment</Btn>
      </div>

      <FilterableTable
        cols={[cfg.colA, cfg.colB, 'Started','Status','']}
        items={items}
        loading={loading}
        filterFields={filterFields}
        searchFn={(i:any,q)=>{
          const a=getA(i); const b=getB(i);
          return (a?.label||a?.name||'').toLowerCase().includes(q.toLowerCase())||(b?.label||b?.name||'').toLowerCase().includes(q.toLowerCase());
        }}
        bulkActions={[{ label:t('bulkEnd'), variant:'danger', onClick:async(ids)=>{ for(const id of ids)await handleEnd(id); }}]}
        children={(item:any)=>{
          const a=getA(item); const b=getB(item); const isActive=!item.end_date;
          return (
            <>
              <TD mono>{a?.label??a?.name??'—'}</TD>
              <TD>{b?.name??b?.label??'—'}</TD>
              <TD dim>{fmt(item.start_date)}</TD>
              <td style={{ padding:'10px 14px' }}>
                {isActive?<span style={{ color:'#10b981', fontSize:11, fontWeight:700 }}>● Active</span>
                  :<span style={{ color:'#334155', fontSize:12 }}>{fmt(item.end_date)}</span>}
              </td>
              <td style={{ padding:'10px 14px', textAlign:'right' }}>
                {isActive&&<Btn small variant="ghost" onClick={()=>handleEnd(item.id)}>{t('end')}</Btn>}
              </td>
            </>
          );
        }}
      />

      {showModal && (
        <Modal title={`New ${cfg.colA} → ${cfg.colB}`} onClose={()=>setShowModal(false)} width={620}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <FF label={cfg.colA} required>
              <SearchableSelect options={optionsA} value={selA} onChange={setSelA} placeholder={cfg.selectA}/>
            </FF>
            <FF label={cfg.colB} required>
              <SearchableSelect options={optionsB} value={selB} onChange={setSelB} placeholder={cfg.selectB}/>
            </FF>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <Btn variant="ghost" onClick={()=>setShowModal(false)}>{t('cancel')}</Btn>
              <Btn onClick={handleAssign} disabled={!selA||!selB}>{t('assign')}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {stockConfirm && (
        <ConfirmModal title={t('stockAlert')} message={stockConfirm.msg}
          onConfirm={stockConfirm.onConfirm} onCancel={()=>setStockConfirm(null)}/>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOVEMENTS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function MovementsPage({ toast }: { toast(m:string,ok:boolean):void }) {
  const { t, C } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deviceOpts, setDeviceOpts] = useState<SelectOption[]>([]);
  const [locOpts, setLocOpts] = useState<SelectOption[]>([]);
  const [selDevice, setSelDevice] = useState('');
  const [selLoc, setSelLoc] = useState('');
  const [bulkLoc, setBulkLoc] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const load=useCallback(async()=>{ setLoading(true); const r=await api('GET','/movements'); if(r.ok) setItems(r.data); setLoading(false); },[]);
  useEffect(()=>{ load(); },[load]);

  const openModal=async()=>{
    const [dR,lR]=await Promise.all([api('GET','/devices'),api('GET','/locations')]);
    if(dR.ok) setDeviceOpts(dR.data.map((d:Device)=>({ value:String(d.id), label:d.label, sub:d.category })));
    if(lR.ok) setLocOpts(lR.data.map((l:any)=>({ value:String(l.id), label:l.name, sub:l.site?.name })));
    setSelDevice(''); setSelLoc('');
    setShowModal(true);
  };

  const handleMove=async()=>{
    const r=await api('POST','/movements',{ device_id:Number(selDevice), to_location_id:Number(selLoc) });
    if(r.ok){ toast('Device moved',true); setShowModal(false); load(); }
    else toast(r.data?.message??'Failed',false);
  };

  const handleBulkMove=async()=>{
    for(const id of selectedIds) {
      await api('POST','/movements',{ device_id:id, to_location_id:Number(bulkLoc) });
    }
    toast(`Moved ${selectedIds.length} devices`,true); setShowBulk(false); setBulkLoc(''); load();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        {selectedIds.length>0 && <Btn variant="ghost" onClick={async()=>{ const lR=await api('GET','/locations'); if(lR.ok) setLocOpts(lR.data.map((l:any)=>({value:String(l.id),label:l.name,sub:l.site?.name}))); setShowBulk(true); }}>{t('bulkMove')} ({selectedIds.length})</Btn>}
        <Btn onClick={openModal}>+ {t('move')}</Btn>
      </div>

      <FilterableTable
        cols={['Device','From','To','Date']}
        items={items}
        loading={loading}
        filterFields={[
          { key:'device', label:'Device', getValue:(i:any)=>i.device?.label||'' },
          { key:'toSite', label:'To Site', getValue:(i:any)=>i.to_location?.site?.name||'' },
        ]}
        searchFn={(i:any,q)=>(i.device?.label||'').toLowerCase().includes(q.toLowerCase())}
        bulkActions={[{ label:t('bulkMove'), onClick:(ids)=>setSelectedIds(ids) }]}
        children={(m:any)=>(
          <>
            <TD mono>{m.device?.label??`#${m.device_id}`}</TD>
            <TD dim>{m.from_location?`${m.from_location.site?.name} › ${m.from_location.name}`:'—'}</TD>
            <TD>{m.to_location?`${m.to_location.site?.name} › ${m.to_location.name}`:'—'}</TD>
            <TD dim small>{fmt(m.moved_at)}</TD>
          </>
        )}
      />

      {showModal && (
        <Modal title="Move Device" onClose={()=>setShowModal(false)} width={620}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <FF label="Device" required><SearchableSelect options={deviceOpts} value={selDevice} onChange={setSelDevice} placeholder={t('selectDevice')}/></FF>
            <FF label="Destination" required><SearchableSelect options={locOpts} value={selLoc} onChange={setSelLoc} placeholder={t('selectLoc')}/></FF>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <Btn variant="ghost" onClick={()=>setShowModal(false)}>{t('cancel')}</Btn>
              <Btn onClick={handleMove} disabled={!selDevice||!selLoc}>{t('move')}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {showBulk && (
        <Modal title={t('bulkMove')} onClose={()=>setShowBulk(false)} width={400}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ color:'#94a3b8', fontSize:13 }}>Moving {selectedIds.length} devices to:</p>
            <FF label="Destination"><SearchableSelect options={locOpts} value={bulkLoc} onChange={setBulkLoc} placeholder={t('selectLoc')}/></FF>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <Btn variant="ghost" onClick={()=>setShowBulk(false)}>{t('cancel')}</Btn>
              <Btn onClick={handleBulkMove} disabled={!bulkLoc}>{t('confirm')}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SWAPS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
interface SwapCfg { ep:string; title:string; lA:string; lB:string; bodyFn(a:string,b:string):object; cols:string[]; rowFn(i:any):React.ReactNode; }
const SWAP_CFGS: Record<string,SwapCfg> = {
  'loc-swaps': {
    ep:'/swaps', title:'Swap Locations', lA:'Device A', lB:'Device B',
    bodyFn:(a,b)=>({device_a_id:Number(a),device_b_id:Number(b)}), cols:['Device A','Device B','Locations','Date'],
    rowFn:(i:any)=><><TD mono>{i.device_a?.label??'—'}</TD><TD mono>{i.device_b?.label??'—'}</TD><TD dim>{i.location_a?.name??'—'} ↔ {i.location_b?.name??'—'}</TD><TD dim small>{fmt(i.swapped_at)}</TD></>,
  },
  'owner-swaps': {
    ep:'/owner-swaps', title:'Swap Owners', lA:'Device A', lB:'Device B',
    bodyFn:(a,b)=>({device_a_id:Number(a),device_b_id:Number(b)}), cols:['Device A','Device B','Users','Date'],
    rowFn:(i:any)=><><TD mono>{i.device_a?.label??'—'}</TD><TD mono>{i.device_b?.label??'—'}</TD><TD dim>{i.user_a?.name??'Unassigned'} ↔ {i.user_b?.name??'Unassigned'}</TD><TD dim small>{fmt(i.swapped_at)}</TD></>,
  },
  'drive-swaps': {
    ep:'/drive-swaps', title:'Swap Drives', lA:'Computer A', lB:'Computer B',
    bodyFn:(a,b)=>({computer_a_id:Number(a),computer_b_id:Number(b)}), cols:['Computer A','Computer B','Drives','Date'],
    rowFn:(i:any)=><><TD mono>{i.computer_a?.label??'—'}</TD><TD mono>{i.computer_b?.label??'—'}</TD><TD dim>{i.drive_a?.label??'—'} ↔ {i.drive_b?.label??'—'}</TD><TD dim small>{fmt(i.swapped_at)}</TD></>,
  },
  'cart-changes': {
    ep:'/cartridge-swaps', title:'Change Cartridge', lA:'Printer', lB:'New Cartridge',
    bodyFn:(a,b)=>({printer_id:Number(a),new_cartridge_id:Number(b)}), cols:['Printer','Old','New','Date'],
    rowFn:(i:any)=><><TD mono>{i.printer?.label??'—'}</TD><TD dim>{i.old_cartridge?.label??'none'}</TD><TD mono>{i.new_cartridge?.label??'—'}</TD><TD dim small>{fmt(i.swapped_at)}</TD></>,
  },
};

function SwapPage({ pageId, toast }: { pageId:string; toast(m:string,ok:boolean):void }) {
  const { t, C } = useApp();
  const cfg = SWAP_CFGS[pageId];
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [optsA, setOptsA] = useState<SelectOption[]>([]);
  const [optsB, setOptsB] = useState<SelectOption[]>([]);
  const [selA, setSelA] = useState('');
  const [selB, setSelB] = useState('');

  const load=useCallback(async()=>{ setLoading(true); const r=await api('GET',cfg.ep); if(r.ok) setItems(r.data); setLoading(false); },[pageId]);
  useEffect(()=>{ load(); },[load]);

  const openModal=async()=>{
    setSelA(''); setSelB('');
    if(pageId==='loc-swaps'||pageId==='owner-swaps') {
      const r=await api('GET','/devices'); if(r.ok){ const opts=r.data.map((d:Device)=>({value:String(d.id),label:d.label,sub:d.category})); setOptsA(opts); setOptsB(opts); }
    } else if(pageId==='drive-swaps') {
      const r=await api('GET','/devices?category=computer'); if(r.ok){ const opts=r.data.map((d:Device)=>({value:String(d.id),label:d.label})); setOptsA(opts); setOptsB(opts); }
    } else if(pageId==='cart-changes') {
      const [pR,cR]=await Promise.all([api('GET','/devices?category=printer'),api('GET','/devices?category=cartridge')]);
      if(pR.ok) setOptsA(pR.data.map((d:Device)=>({value:String(d.id),label:d.label})));
      if(cR.ok) setOptsB(cR.data.map((d:Device)=>({value:String(d.id),label:d.label,sub:d.cartridge?.ink_type||''})));
    }
    setShowModal(true);
  };

  const handleSwap=async()=>{
    const r=await api('POST',cfg.ep,cfg.bodyFn(selA,selB));
    if(r.ok){ toast('Done',true); setShowModal(false); load(); }
    else toast(r.data?.message??'Failed',false);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <Btn onClick={openModal}>+ New {pageId==='cart-changes'?'Change':'Swap'}</Btn>
      </div>
      <FilterableTable
        cols={cfg.cols} items={items} loading={loading}
        searchFn={(i:any,q)=>JSON.stringify(i).toLowerCase().includes(q.toLowerCase())}
        children={(item:any)=><>{cfg.rowFn(item)}</>}
      />
      {showModal && (
        <Modal title={cfg.title} onClose={()=>setShowModal(false)} width={620}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <FF label={cfg.lA} required><SearchableSelect options={optsA} value={selA} onChange={setSelA} placeholder="Select…"/></FF>
            <FF label={cfg.lB} required><SearchableSelect options={optsB} value={selB} onChange={setSelB} placeholder="Select…"/></FF>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <Btn variant="ghost" onClick={()=>setShowModal(false)}>{t('cancel')}</Btn>
              <Btn onClick={handleSwap} disabled={!selA||!selB}>{t('confirm')}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function LogsPage() {
  const { C } = useApp();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ api('GET','/logs').then(r=>{ if(r.ok) setLogs(r.data); setLoading(false); }); },[]);
  const ACTION_COLOR: Record<string,string> = {
    device_created:C.green, device_deleted:C.danger,
    status_changed:C.amber, auto_stock_relocation:C.amber,
    assigned:C.blue, unassigned:C.muted,
    moved:C.amber, location_swapped:C.purple, owner_swapped:'#ec4899',
    drive_assigned:C.cyan, drive_unassigned:C.muted, drive_swapped:C.cyan,
    cartridge_assigned:C.green, cartridge_unassigned:C.muted, cartridge_swapped:C.green,
  };
  return (
    <FilterableTable
      cols={['Device','Action','Details','Date']}
      items={logs}
      loading={loading}
      filterFields={[
        { key:'action', label:'Action', getValue:(l:any)=>l.action||'' },
        { key:'device', label:'Device', getValue:(l:any)=>l.device?.label||'' },
      ]}
      searchFn={(l:any,q)=>(l.device?.label||'').toLowerCase().includes(q.toLowerCase())||(l.action||'').includes(q.toLowerCase())}
      children={(log:any)=>{
        const color=ACTION_COLOR[log.action]??C.muted;
        return (
          <>
            <TD mono>{log.device?.label??`#${log.device_id}`}</TD>
            <td style={{ padding:'9px 14px' }}>
              <span style={{ padding:'2px 7px', borderRadius:4, background:color+'18', color, fontSize:11, fontWeight:600, fontFamily:'monospace' }}>{log.action}</span>
            </td>
            <td style={{ padding:'9px 14px', color:C.muted, fontSize:11, fontFamily:'monospace', maxWidth:280, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {log.details?JSON.stringify(log.details):'—'}
            </td>
            <TD dim small>{fmtDT(log.logged_at)}</TD>
          </>
        );
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsPage({ toast }: { toast(m:string,ok:boolean):void }) {
  const { t, C, lang, setLang, theme, setTheme } = useApp();
  const [tab, setTab] = useState('style');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Record<string,string>>({});
  const [sites, setSites] = useState<LookupItem[]>([]);
  const [allTypes, setAllTypes] = useState<LookupItem[]>([]);
  const [allMfrs, setAllMfrs] = useState<LookupItem[]>([]);
  const [allDepts, setAllDepts] = useState<LookupItem[]>([]);
  const [allUsers, setAllUsers] = useState<LookupItem[]>([]);

  const REF_TABS = [
    { id:'sites', label:'Sites', ep:'/sites' },
    { id:'locations', label:'Locations', ep:'/locations' },
    { id:'manufacturers', label:'Manufacturers', ep:'/manufacturers' },
    { id:'device-types', label:'Device Types', ep:'/device-types' },
    { id:'device-models', label:'Device Models', ep:'/device-models' },
    { id:'statuses', label:'Statuses', ep:'/statuses' },
    { id:'drive-statuses', label:'État (Drive)', ep:'/drive-statuses' },
    { id:'cartridge-statuses', label:'Cart. Statuses', ep:'/cartridge-statuses' },
    { id:'departments', label:'Departments', ep:'/departments' },
  ];

  const activeRef = REF_TABS.find(r=>r.id===tab);

  const loadRef=useCallback(async()=>{
    if(!activeRef) return;
    setLoading(true);
    const r=await api('GET',activeRef.ep); if(r.ok) setItems(r.data);
    setLoading(false);
  },[tab]);

  useEffect(()=>{ if(activeRef) loadRef(); },[loadRef]);

  useEffect(()=>{
    api('GET','/sites').then(r=>r.ok&&setSites(r.data));
    api('GET','/device-types').then(r=>r.ok&&setAllTypes(r.data));
    api('GET','/manufacturers').then(r=>r.ok&&setAllMfrs(r.data));
    api('GET','/departments').then(r=>r.ok&&setAllDepts(r.data));
    api('GET','/users').then(r=>r.ok&&setAllUsers(r.data));
  },[]);

  const sf=(k:string)=>(e:React.ChangeEvent<any>)=>setForm(p=>({...p,[k]:e.target.value}));

  const handleAdd=async()=>{
    if(!activeRef) return;
    const body:Record<string,any>={};
    Object.entries(form).forEach(([k,v])=>{
      if(!v) return;
      if(k==='is_assignable'){body[k]=v==='1';return;}
      if(['name','email','category'].includes(k)){body[k]=v;return;}
      body[k]=isNaN(Number(v))?v:Number(v);
    });
    const r=await api('POST',activeRef.ep,body);
    if(r.ok){
      // Handle dept owner if provided
      if(tab==='departments'&&form.owner_id&&r.data?.id) {
        await api('POST',`/departments/${r.data.id}/owners`,{user_id:Number(form.owner_id)});
      }
      toast('Created',true); setShowAdd(false); setForm({}); loadRef();
    } else toast(r.data?.message??'Failed',false);
  };

  const handleDelete=async(item:any)=>{
    if(!activeRef) return;
    const r=await api('DELETE',`${activeRef.ep}/${item.id}`);
    if(r.ok){ toast('Deleted',true); loadRef(); }
    else toast(r.data?.message??'Cannot delete',false);
  };

  const inp:React.CSSProperties={ padding:'7px 10px',borderRadius:6,border:`1px solid ${C.border2}`,background:C.inputBg,color:C.text,fontSize:13,outline:'none',width:'100%' };

  const renderAddForm=()=>{
    switch(tab) {
      case 'sites': return <FF label="Name" required><input style={inp} placeholder="e.g. LILLY" value={form.name||''} onChange={sf('name')}/></FF>;
      case 'locations': return (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <FF label="Site" required>
            <select style={inp} value={form.site_id||''} onChange={sf('site_id')}>
              <option value="">Select…</option>
              {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FF>
          <FF label="Name" required><input style={inp} placeholder="e.g. IT Office" value={form.name||''} onChange={sf('name')}/></FF>
        </div>
      );
      case 'manufacturers': return <FF label="Name" required><input style={inp} placeholder="e.g. HP" value={form.name||''} onChange={sf('name')}/></FF>;
      case 'device-types': return (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <FF label="Name" required><input style={inp} placeholder="e.g. Laptop" value={form.name||''} onChange={sf('name')}/></FF>
          <FF label="Category" required>
            <select style={inp} value={form.category||''} onChange={sf('category')}>
              <option value="">Select…</option>
              {['computer','printer','monitor','hard_drive','cartridge'].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </FF>
        </div>
      );
      case 'device-models': return (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <FF label="Manufacturer" required>
            <select style={inp} value={form.manufacturer_id||''} onChange={sf('manufacturer_id')}>
              <option value="">Select…</option>
              {allMfrs.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </FF>
          <FF label="Device Type" required>
            <select style={inp} value={form.device_type_id||''} onChange={sf('device_type_id')}>
              <option value="">Select…</option>
              {allTypes.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </FF>
          <FF label="Model Name" required><input style={inp} placeholder="e.g. ThinkPad T14" value={form.name||''} onChange={sf('name')}/></FF>
        </div>
      );
      case 'statuses': case 'drive-statuses': case 'cartridge-statuses': return (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <FF label="Name" required><input style={inp} placeholder={tab==='drive-statuses'?'e.g. InStock/New':'e.g. Reserved'} value={form.name||''} onChange={sf('name')}/></FF>
          <FF label="Is Assignable">
            <select style={inp} value={form.is_assignable||'0'} onChange={sf('is_assignable')}>
              <option value="0">No</option><option value="1">Yes</option>
            </select>
          </FF>
        </div>
      );
      case 'departments': return (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <FF label="Name" required><input style={inp} placeholder="e.g. IT" value={form.name||''} onChange={sf('name')}/></FF>
          <FF label={t('departmentOwner')}>
            <select style={inp} value={form.owner_id||''} onChange={sf('owner_id')}>
              <option value="">{t('ownerOpt')}</option>
              {allUsers.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </FF>
        </div>
      );
      default: return null;
    }
  };

  const renderCell=(item:any)=>{
    switch(tab) {
      case 'locations': return `${item.site?.name??''} › ${item.name}`;
      case 'device-types': return <span>{item.name} <span style={{color:C.muted,fontSize:11}}>({item.category})</span></span>;
      case 'device-models': return <span>{item.name} <span style={{color:C.muted,fontSize:11}}>— {item.manufacturer?.name}</span></span>;
      case 'statuses': case 'drive-statuses': case 'cartridge-statuses': return (
        <span style={{display:'inline-flex',alignItems:'center',gap:10}}>
          {item.name}
          <span style={{fontSize:11,color:item.is_assignable?C.green:C.muted}}>{item.is_assignable?'✓ assignable':'✗'}</span>
        </span>
      );
      case 'departments': return (
        <span>{item.name}
          {item.owners?.length>0&&<span style={{color:C.muted,fontSize:11,marginLeft:10}}>Owners: {item.owners.map((o:any)=>o.name).join(', ')}</span>}
        </span>
      );
      case 'sites': return <span>{item.name} <span style={{color:C.muted,fontSize:11}}>— {item.locations_count??0} locations</span></span>;
      default: return item.name;
    }
  };

  const MAIN_TABS = ['style','importExport'];
  const ALL_TABS = [...MAIN_TABS,...REF_TABS.map(r=>r.id)];

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:20, background:C.bg, borderRadius:8, padding:5, border:`1px solid ${C.border2}` }}>
        <button onClick={()=>setTab('style')} style={{ padding:'5px 12px', borderRadius:5, border:'none', cursor:'pointer', fontSize:12, fontWeight:tab==='style'?600:400, background:tab==='style'?C.border2:'transparent', color:tab==='style'?C.text:C.muted }}>⚙ {t('styleSettings')}</button>
        <button onClick={()=>setTab('importExport')} style={{ padding:'5px 12px', borderRadius:5, border:'none', cursor:'pointer', fontSize:12, fontWeight:tab==='importExport'?600:400, background:tab==='importExport'?C.border2:'transparent', color:tab==='importExport'?C.text:C.muted }}>📥 {t('importExport')}</button>
        <div style={{ width:1, background:C.border2, margin:'4px 4px' }}/>
        <span style={{ fontSize:10, color:C.dim, alignSelf:'center', marginRight:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('refData')}</span>
        {REF_TABS.map(r=>(
          <button key={r.id} onClick={()=>setTab(r.id)} style={{ padding:'5px 10px', borderRadius:5, border:'none', cursor:'pointer', fontSize:11, fontWeight:tab===r.id?600:400, background:tab===r.id?C.border2:'transparent', color:tab===r.id?C.text:C.muted }}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Style tab */}
      {tab==='style' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={{ background:C.surface, border:`1px solid ${C.border2}`, borderRadius:10, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:14 }}>{t('themeLbl')}</div>
            <div style={{ display:'flex', gap:10 }}>
              {(['dark','light'] as const).map(th=>(
                <button key={th} onClick={()=>setTheme(th)} style={{
                  padding:'10px 20px', borderRadius:8, border:`2px solid ${theme===th?C.blue:C.border2}`,
                  background:th==='dark'?'#020617':'#f8fafc', color:th==='dark'?'#e2e8f0':'#0f172a',
                  cursor:'pointer', fontSize:13, fontWeight:600, transition:'border-color 0.2s',
                }}>{th==='dark'?'🌙 '+t('dark'):'☀️ '+t('light')}</button>
              ))}
            </div>
          </div>
          <div style={{ background:C.surface, border:`1px solid ${C.border2}`, borderRadius:10, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:14 }}>{t('languageLbl')}</div>
            <div style={{ display:'flex', gap:10 }}>
              {([['en','🇬🇧 English'],['fr','🇫🇷 Français'],['ar','🇲🇦 العربية']] as [Lang,string][]).map(([l,label])=>(
                <button key={l} onClick={()=>setLang(l)} style={{
                  padding:'10px 20px', borderRadius:8, border:`2px solid ${lang===l?C.blue:C.border2}`,
                  background:C.surface2, color:C.text, cursor:'pointer', fontSize:13, fontWeight:lang===l?700:400,
                }}>{label}</button>
              ))}
            </div>
            {lang==='ar'&&<div style={{ marginTop:10, padding:'8px 12px', background:C.amber+'15', borderRadius:6, fontSize:12, color:C.amber }}>Arabic mode: RTL layout active ← لوحة العربية متاحة</div>}
          </div>
        </div>
      )}

      {/* Import/Export tab */}
      {tab==='importExport' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* CSV Export */}
          <div style={{ background:C.surface, border:`1px solid ${C.border2}`, borderRadius:10, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:6 }}>⬇ Export CSV</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:14 }}>
              Download all devices as a UTF-8 CSV file (opens in Excel).
            </div>
            <Btn onClick={()=>{ window.open(`${BASE}/export/csv`, '_blank'); }}>⬇ Download CSV</Btn>
          </div>

          {/* JSON Export */}
          <div style={{ background:C.surface, border:`1px solid ${C.border2}`, borderRadius:10, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:6 }}>⬇ Export Full JSON</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:14 }}>
              Export devices, assignments, movements and logs as JSON (for backup or re-import).
            </div>
            <Btn onClick={async()=>{
              const r=await api('GET','/export');
              if(!r.ok){ toast('Export failed',false); return; }
              const blob=new Blob([JSON.stringify(r.data,null,2)],{type:'application/json'});
              const url=URL.createObjectURL(blob);
              const a=document.createElement('a'); a.href=url;
              a.download=`inventory_export_${Date.now()}.json`; a.click();
              URL.revokeObjectURL(url);
              toast(`Exported ${r.data.summary?.devices||0} devices`,true);
            }}>⬇ {t('exportExcel')}</Btn>
          </div>

          {/* JSON Import */}
          <div style={{ background:C.surface, border:`1px solid ${C.border2}`, borderRadius:10, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:6 }}>⬆ {t('importExcel')}</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:14 }}>
              Import devices from a JSON file (exported format). Each row needs:
              <code style={{ display:'block', marginTop:6, padding:'6px 10px', background:C.bg, borderRadius:6, fontSize:11, color:C.green }}>
                label*, serial_number*, category*, device_type*, model, location, status, cpu, ram, imei, phone_number…
              </code>
            </div>
            <label style={{ cursor:'pointer', display:'inline-block' }}>
              <span style={{ padding:'8px 16px', borderRadius:6, background:C.blue, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>⬆ Choose JSON File</span>
              <input type="file" accept=".json" style={{ display:'none' }} onChange={async(e)=>{
                const file=e.target.files?.[0]; if(!file) return;
                try {
                  const text=await file.text();
                  const parsed=JSON.parse(text);
                  // Accept either { devices: [...] } (export format) or raw array
                  const rows=Array.isArray(parsed)?parsed:(parsed.devices||[]);
                  if(!rows.length){ toast('No devices found in file',false); return; }
                  const r=await api('POST','/import',{ devices:rows });
                  if(r.ok||r.status===207){
                    toast(`${r.data.message} ${r.data.errors?.length?' ('+r.data.errors.length+' errors)':''}`,r.status!==207);
                  } else {
                    toast(r.data?.message||'Import failed',false);
                  }
                } catch(err) { toast('Invalid JSON file',false); }
                // Reset file input
                e.target.value='';
              }}/>
            </label>
          </div>

          {/* Template download */}
          <div style={{ background:C.surface, border:`1px solid ${C.border2}`, borderRadius:10, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:6 }}>📄 Import Template</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:14 }}>Download a sample JSON template to fill in.</div>
            <Btn variant="ghost" onClick={()=>{
              const template={ devices:[
                { label:'PC-001', serial_number:'SN-001', category:'computer', device_type:'Laptop', model:'ThinkPad T14', location:'IT Office', status:'Reserved', department:'IT', cpu:'Intel i5', ram:'16GB DDR4', comment:'Sample import' },
                { label:'PRN-001', serial_number:'SN-002', category:'printer', device_type:'Printer', model:'LaserJet Pro M404n', location:'HR Office', status:'Reserved', printer_type:'laser', duplex:'true', color:'false' },
              ]};
              const blob=new Blob([JSON.stringify(template,null,2)],{type:'application/json'});
              const url=URL.createObjectURL(blob);
              const a=document.createElement('a'); a.href=url; a.download='import_template.json'; a.click();
              URL.revokeObjectURL(url);
            }}>⬇ Download Template</Btn>
          </div>
        </div>
      )}

      {/* Reference data tabs */}
      {activeRef && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <span style={{ color:C.muted, fontSize:13 }}>{items.length} {t('records')}</span>
            <Btn onClick={()=>{ setForm({}); setShowAdd(true); }}>+ {t('add')}</Btn>
          </div>
          <div style={{ border:`1px solid ${C.border2}`, borderRadius:10, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:C.bg }}>
                {['#','Details',''].map(h=><th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:`1px solid ${C.border2}` }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {loading&&<tr><td colSpan={3} style={{ padding:30, textAlign:'center', color:C.muted }}>{t('loading')}</td></tr>}
                {!loading&&items.length===0&&<tr><td colSpan={3} style={{ padding:30, textAlign:'center', color:C.muted }}>{t('noRecords')}</td></tr>}
                {items.map(item=>(
                  <tr key={item.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <TD dim mono>#{item.id}</TD>
                    <TD>{renderCell(item)}</TD>
                    <td style={{ padding:'10px 14px', textAlign:'right' }}>
                      <Btn small variant="ghost" onClick={()=>handleDelete(item)}>✕</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showAdd && (
            <Modal title={`Add ${activeRef.label}`} onClose={()=>setShowAdd(false)} width={440}>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {renderAddForm()}
                <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:4 }}>
                  <Btn variant="ghost" onClick={()=>setShowAdd(false)}>{t('cancel')}</Btn>
                  <Btn onClick={handleAdd}>{t('create')}</Btn>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lang, setLang] = useState<Lang>(()=>(localStorage.getItem('lang') as Lang)||'en');
  const [theme, setTheme] = useState<Theme>(()=>(localStorage.getItem('theme') as Theme)||'dark');
  const toastId = useRef(0);
  const isRTL = lang==='ar';
  const C = theme==='dark'?DARK_C:LIGHT_C;
  const t = useMemo(()=>makeT(lang),[lang]);

  const addToast=useCallback((msg:string,ok:boolean)=>{
    const id=++toastId.current;
    setToasts(p=>[...p,{id,msg,ok}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4500);
  },[]);

  const handleSetLang=(l:Lang)=>{ setLang(l); localStorage.setItem('lang',l); };
  const handleSetTheme=(th:Theme)=>{ setTheme(th); localStorage.setItem('theme',th); };

  // Inject styles
  useEffect(()=>{
    const s=document.createElement('style');
    s.textContent=`
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      body{background:${C.bg};color:${C.text};font-family:-apple-system,'Segoe UI',sans-serif;overflow:hidden;}
      button,input,select,textarea{font-family:inherit;}
      ::-webkit-scrollbar{width:4px;height:4px;}
      ::-webkit-scrollbar-track{background:transparent;}
      ::-webkit-scrollbar-thumb{background:${C.border2};border-radius:2px;}
      input[type=checkbox]{accent-color:${C.blue};}
    `;
    document.head.appendChild(s);
    document.body.style.background=C.bg;
    return()=>s.remove();
  },[theme]);

  const navGroups = NAV(t);
  const getNavItem=(id:string)=>{ for(const g of navGroups) for(const i of g.items) if(i.id===id) return i; return navGroups[0].items[0]; };
  const nav=getNavItem(page);
  const accentColor=PAGE_COLOR[page]??C.blue;

  const renderPage=()=>{
    if(page==='dashboard') return <Dashboard navigate={setPage}/>;
    if(page in PAGE_CATS) return <DevicePage pageId={page} toast={addToast}/>;
    if(page==='user-assignments') return <AssignmentsPage type="user" toast={addToast}/>;
    if(page==='drive-assignments') return <AssignmentsPage type="drive" toast={addToast}/>;
    if(page==='cart-assignments') return <AssignmentsPage type="cartridge" toast={addToast}/>;
    if(page==='movements') return <MovementsPage toast={addToast}/>;
    if(page in SWAP_CFGS) return <SwapPage pageId={page} toast={addToast}/>;
    if(page==='logs') return <LogsPage/>;
    if(page==='settings') return <SettingsPage toast={addToast}/>;
    return null;
  };

  const ctxVal: AppCtxType = { lang, setLang:handleSetLang, theme, setTheme:handleSetTheme, isRTL, t, C };

  return (
    <AppCtx.Provider value={ctxVal}>
      <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:C.bg, direction:isRTL?'rtl':'ltr' }}>

        {/* SIDEBAR */}
        <aside style={{ width:214, minWidth:214, background:C.surface, borderRight:isRTL?'none':'1px solid '+C.border, borderLeft:isRTL?'1px solid '+C.border:'none', display:'flex', flexDirection:'column', height:'100vh' }}>
          {/* Logo */}
          <div style={{ padding:'16px 14px 14px', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:30, height:30, background:'#1d4ed8', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#fff', flexShrink:0 }}>▣</div>
              <div>
                <div style={{ color:C.text, fontSize:13, fontWeight:700, letterSpacing:'-0.02em' }}>IT Assets</div>
                <div style={{ color:C.dim, fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:1 }}>Manager</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, overflowY:'auto', padding:'6px 0 12px' }}>
            {navGroups.map(group=>(
              <div key={group.group} style={{ marginTop:8 }}>
                <div style={{ padding:'5px 14px 3px', fontSize:9, fontWeight:700, color:C.border2, letterSpacing:'0.16em', textTransform:'uppercase' }}>{group.group}</div>
                {group.items.map(item=>{
                  const on=page===item.id;
                  const color=PAGE_COLOR[item.id]??C.blue;
                  return (
                    <button key={item.id} onClick={()=>setPage(item.id)} style={{
                      display:'flex', alignItems:'center', gap:9, width:'100%', padding:'6px 14px', border:'none',
                      borderLeft:(!isRTL&&on)?`2px solid ${color}`:'2px solid transparent',
                      borderRight:(isRTL&&on)?`2px solid ${color}`:'2px solid transparent',
                      background:on?color+'12':'transparent',
                      color:on?color:C.muted, fontSize:12.5, cursor:'pointer', textAlign:'left',
                    }}>
                      <span style={{ fontSize:13, opacity:on?1:0.45, flexShrink:0 }}>{item.icon}</span>
                      <span style={{ fontWeight:on?600:400 }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <div style={{ padding:'8px 14px', borderTop:`1px solid ${C.border}`, fontSize:9, color:C.border2, fontFamily:'monospace', wordBreak:'break-all' }}>
            {BASE}
          </div>
        </aside>

        {/* MAIN */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
          {/* Header */}
          <header style={{ height:50, background:C.surface, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', padding:'0 24px', gap:10, flexShrink:0 }}>
            <span style={{ fontSize:15 }}>{nav.icon}</span>
            <h1 style={{ fontSize:14, fontWeight:700, color:C.text }}>{nav.label}</h1>
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ padding:'2px 9px', background:accentColor+'15', border:`1px solid ${accentColor}30`, borderRadius:20, fontSize:11, color:accentColor, fontWeight:600 }}>{nav.label}</span>
              <span style={{ fontSize:11, color:C.muted, cursor:'pointer' }} onClick={()=>setPage('settings')}>
                {lang.toUpperCase()} | {theme==='dark'?'🌙':'☀️'}
              </span>
            </div>
          </header>

          {/* Content */}
          <main style={{ flex:1, overflowY:'auto', padding:24 }}>{renderPage()}</main>
        </div>

        <Toaster toasts={toasts} remove={id=>setToasts(p=>p.filter(t=>t.id!==id))}/>
      </div>
    </AppCtx.Provider>
  );
}