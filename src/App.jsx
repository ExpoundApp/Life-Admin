import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Home, CalendarDays, Users, Wallet, MoreHorizontal, Plus, Check, Clock,
  AlertTriangle, Shirt, BookOpen, Utensils, Music, Waves, PartyPopper,
  FileText, Bell, Pencil, Trash2, X, ChevronRight, Mail, Sparkles,
  MapPin, Sun, Inbox, Footprints, Ticket, ShoppingBag, Backpack, Coins
} from "lucide-react";
import { store } from "./store";

/* ============================================================
   Family Admin — one calm place for two parents to share the load
   A working prototype of the product brief (MVP + differentiators).
   ============================================================ */

/* ---- theme ---- */
const T = {
  bg: "#EEF2F0",
  card: "#FFFFFF",
  ink: "#20302E",
  muted: "#66787A",
  faint: "#8A999A",
  line: "#E4EAE7",
  brand: "#137A66",
  brandSoft: "#E2F0EC",
  red: "#D9534F",
  redSoft: "#FBEAE9",
  amber: "#C98A1E",
  amberSoft: "#FBF1DC",
  green: "#3F9C6D",
  greenSoft: "#E6F3EC",
  grey: "#97A4A8",
  greySoft: "#EEF1F1",
};
const ACCENTS = ["#E8896B", "#6C7BD9", "#D99A2B", "#2FA58C", "#A1668E", "#4F93C4"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SCHOOL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const RECUR_ICONS = {
  shirt: Shirt, book: BookOpen, swim: Waves, music: Music, bag: Backpack,
  shoe: Footprints, food: Utensils, star: Sparkles,
};

/* ---- date helpers ---- */
const midnight = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const today0 = () => midnight(new Date());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return midnight(x); };
const iso = (d) => midnight(d).toISOString().slice(0, 10);
const parseISO = (s) => midnight(new Date(s + "T00:00:00"));
const wkday = (d) => WEEKDAYS[new Date(d).getDay()];
const sameDay = (a, b) => iso(a) === iso(b);
const daysUntil = (s) => Math.round((parseISO(s) - today0()) / 86400000);
const fmtDay = (d) => new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
const fmtNice = (s) => {
  const n = daysUntil(s);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n === -1) return "Yesterday";
  if (n < 0) return `${Math.abs(n)} days ago`;
  return fmtDay(parseISO(s));
};
const money = (n) => "£" + Number(n || 0).toFixed(2);
const uid = (() => { let i = 0; return (p = "id") => `${p}_${Date.now().toString(36)}${(i++).toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`; })();

/* ---- seed data (dates computed relative to today so the demo stays live) ---- */
function seed() {
  const a1 = "a_sam", a2 = "a_alex";
  const c1 = "c_emma", c2 = "c_oliver";
  const D = (n) => iso(addDays(today0(), n));
  return {
    settings: { householdName: "Our family" },
    adults: [
      { id: a1, name: "Sam", color: "#3A6B7A" },
      { id: a2, name: "Alex", color: "#7A6B9C" },
    ],
    children: [
      {
        id: c1, name: "Emma", emoji: "🦊", color: ACCENTS[0],
        school: "Oakfield Primary", year: "Year 3",
        modules: { calendar: true, money: true, lunches: true, clubs: true, bookings: true, forms: true, social: true },
        lunch: { Mon: "school", Tue: "packed", Wed: "school", Thu: "packed", Fri: "school" },
        lunchBalance: 3.2, lunchThreshold: 5,
        recurring: [
          { id: uid("r"), label: "PE kit", icon: "shirt", days: ["Tue", "Thu"], owner: a1 },
          { id: uid("r"), label: "Library book", icon: "book", days: ["Wed"], owner: a2 },
          { id: uid("r"), label: "Reading record", icon: "book", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], owner: a1 },
          { id: uid("r"), label: "Swimming kit", icon: "swim", days: ["Fri"], owner: a2 },
          { id: uid("r"), label: "Recorder", icon: "music", days: ["Thu"], owner: a1 },
        ],
        payments: [
          { id: uid("p"), label: "School trip — Sealife Centre", amount: 12, due: D(5), status: "due", owner: a2 },
          { id: uid("p"), label: "School photos", amount: 15, due: D(12), status: "notdue", owner: null },
          { id: uid("p"), label: "PTA summer fair", amount: 5, due: D(-2), status: "due", owner: a1 },
        ],
        clubs: [
          { id: uid("cl"), name: "Football club", day: "Mon", time: "15:30–16:30", location: "School field", kit: "Boots + shin pads", owner: a1 },
          { id: uid("cl"), name: "Choir", day: "Wed", time: "Lunchtime", location: "Music room", kit: "", owner: a2 },
        ],
        forms: [
          { id: uid("f"), label: "Trip consent form", status: "todo", due: D(4), owner: a2 },
          { id: uid("f"), label: "Photo permission", status: "returned", due: D(-5), owner: a1 },
        ],
        bookings: [
          { id: uid("b"), label: "Parents' evening slot", deadline: D(3), status: "open", note: "Try for after 4pm", owner: a1 },
        ],
        events: [
          { id: uid("e"), title: "Class assembly", date: D(1), type: "show", costume: false },
          { id: uid("e"), title: "World Book Day", date: D(6), type: "dressup", costume: true, costumeNote: "Book character" },
          { id: uid("e"), title: "Sports day", date: D(9), type: "sport", costume: false },
        ],
        parties: [
          { id: uid("pa"), host: "Noah's birthday", date: D(8), status: "rsvp", gift: false },
        ],
      },
      {
        id: c2, name: "Oliver", emoji: "🐢", color: ACCENTS[1],
        school: "Oakfield Primary", year: "Reception",
        modules: { calendar: true, money: true, lunches: true, clubs: true, bookings: true, forms: true, social: true },
        lunch: { Mon: "school", Tue: "school", Wed: "school", Thu: "school", Fri: "packed" },
        lunchBalance: 8.5, lunchThreshold: 5,
        recurring: [
          { id: uid("r"), label: "PE kit", icon: "shirt", days: ["Wed"], owner: a2 },
          { id: uid("r"), label: "Library book", icon: "book", days: ["Mon"], owner: a1 },
          { id: uid("r"), label: "Book bag", icon: "bag", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], owner: a2 },
        ],
        payments: [
          { id: uid("p"), label: "Reception trip — Farm", amount: 8, due: D(1), status: "due", owner: a1 },
        ],
        clubs: [
          { id: uid("cl"), name: "Tumble Tots", day: "Thu", time: "15:15–16:00", location: "Hall", kit: "Plimsolls", owner: a2 },
        ],
        forms: [],
        bookings: [],
        events: [
          { id: uid("e"), title: "Pyjama day", date: D(2), type: "dressup", costume: true, costumeNote: "Wear PJs + bring a teddy" },
        ],
        parties: [],
      },
    ],
    oneoffs: [
      { id: uid("o"), childId: c1, label: "£2 for cake sale", date: D(1), owner: a1, done: false },
    ],
    checks: {},
    reviewQueue: [],
  };
}

/* ---- persistence ----
   The real load/save/subscribe logic lives in ./store.js, which talks to
   Supabase (shared, live sync) when configured, or localStorage otherwise.
   App passes seed() into store.load() for first-run / "create household". */

/* ============================================================
   Small UI primitives
   ============================================================ */
function Avatar({ adult, size = 26 }) {
  if (!adult) return (
    <span title="Unassigned" style={{
      width: size, height: size, borderRadius: 999, display: "inline-flex", alignItems: "center",
      justifyContent: "center", background: T.greySoft, color: T.faint, border: `1.5px dashed ${T.line}`,
      fontSize: size * 0.42, fontWeight: 700, flexShrink: 0,
    }}>?</span>
  );
  return (
    <span title={adult.name} style={{
      width: size, height: size, borderRadius: 999, display: "inline-flex", alignItems: "center",
      justifyContent: "center", background: adult.color, color: "#fff", fontSize: size * 0.42,
      fontWeight: 700, flexShrink: 0, letterSpacing: "0.02em",
    }}>{adult.name.slice(0, 1).toUpperCase()}</span>
  );
}

function KidTile({ child, size = 30 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: 9, display: "inline-flex", alignItems: "center",
      justifyContent: "center", background: child.color + "22", fontSize: size * 0.55, flexShrink: 0,
      border: `1.5px solid ${child.color}55`,
    }}>{child.emoji || child.name.slice(0, 1)}</span>
  );
}

function Pill({ children, bg, fg, border }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999,
      background: bg, color: fg, fontSize: 11.5, fontWeight: 600, lineHeight: 1.2,
      border: border ? `1px solid ${border}` : "none", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function StatusPill({ status }) {
  const map = {
    paid: ["Paid", T.greenSoft, T.green],
    due: ["Due", T.amberSoft, T.amber],
    overdue: ["Overdue", T.redSoft, T.red],
    notdue: ["Not due", T.greySoft, T.faint],
    todo: ["To do", T.amberSoft, T.amber],
    returned: ["Returned", T.greenSoft, T.green],
    received: ["Received", T.greySoft, T.faint],
    open: ["Open", T.amberSoft, T.amber],
    booked: ["Booked", T.greenSoft, T.green],
    closing: ["Closing soon", T.redSoft, T.red],
    invited: ["Invited", T.greySoft, T.faint],
    rsvp: ["RSVP'd", T.brandSoft, T.brand],
    declined: ["Can't go", T.greySoft, T.faint],
  };
  const [label, bg, fg] = map[status] || [status, T.greySoft, T.faint];
  return <Pill bg={bg} fg={fg}>{label}</Pill>;
}

function Button({ children, onClick, variant = "primary", style, type = "button", icon: Icon }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    border: "none", borderRadius: 12, fontWeight: 600, fontSize: 15, cursor: "pointer",
    padding: "12px 16px", fontFamily: "inherit", transition: "transform .06s ease, filter .15s",
  };
  const variants = {
    primary: { background: T.brand, color: "#fff" },
    soft: { background: T.brandSoft, color: T.brand },
    ghost: { background: "transparent", color: T.muted, padding: "10px 12px" },
    danger: { background: T.redSoft, color: T.red },
    line: { background: T.card, color: T.ink, border: `1px solid ${T.line}` },
  };
  return (
    <button type={type} onClick={onClick} className="fa-btn" style={{ ...base, ...variants[variant], ...style }}>
      {Icon && <Icon size={17} strokeWidth={2.4} />}{children}
    </button>
  );
}

function IconBtn({ icon: Icon, onClick, label, color = T.muted }) {
  return (
    <button aria-label={label} onClick={onClick} className="fa-iconbtn" style={{
      border: "none", background: "transparent", color, cursor: "pointer", padding: 8,
      borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center",
    }}><Icon size={18} strokeWidth={2.2} /></button>
  );
}

function Card({ children, style, onClick, accent }) {
  return (
    <div onClick={onClick} style={{
      background: T.card, borderRadius: 16, padding: 16, border: `1px solid ${T.line}`,
      boxShadow: "0 1px 2px rgba(20,40,38,0.04)", borderLeft: accent ? `4px solid ${accent}` : undefined,
      cursor: onClick ? "pointer" : "default", ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "22px 2px 10px" }}>
      <h2 style={{ font: "600 13px Inter", letterSpacing: "0.08em", textTransform: "uppercase", color: T.faint, margin: 0 }}>{children}</h2>
      {action}
    </div>
  );
}

function Empty({ icon: Icon, title, hint, action }) {
  return (
    <div style={{ textAlign: "center", padding: "30px 18px", color: T.muted }}>
      {Icon && <Icon size={26} strokeWidth={1.8} style={{ color: T.faint }} />}
      <div style={{ font: "600 15px Bricolage Grotesque", color: T.ink, marginTop: 10 }}>{title}</div>
      {hint && <div style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

/* ---- bottom sheet modal ---- */
function Sheet({ title, onClose, children, footer }) {
  return (
    <div className="fa-overlay" onMouseDown={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(22,34,32,0.42)", zIndex: 60,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div className="fa-sheet" onMouseDown={(e) => e.stopPropagation()} style={{
        background: T.bg, width: "100%", maxWidth: 460, maxHeight: "92vh", borderRadius: "22px 22px 0 0",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px",
          borderBottom: `1px solid ${T.line}`, background: T.card,
        }}>
          <h3 style={{ font: "650 19px Bricolage Grotesque", color: T.ink, margin: 0 }}>{title}</h3>
          <IconBtn icon={X} onClick={onClose} label="Close" />
        </div>
        <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: 14, borderTop: `1px solid ${T.line}`, background: T.card, display: "flex", gap: 10 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ---- form fields ---- */
const fieldWrap = { marginBottom: 14 };
const labelStyle = { display: "block", font: "600 13px Inter", color: T.muted, marginBottom: 6 };
const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "12px 13px", borderRadius: 12, border: `1px solid ${T.line}`,
  background: T.card, font: "500 15px Inter", color: T.ink, outline: "none",
};
function Field({ label, children }) {
  return <div style={fieldWrap}><label style={labelStyle}>{label}</label>{children}</div>;
}
function TextInput(props) { return <input {...props} style={{ ...inputStyle, ...props.style }} />; }
function Segmented({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", background: T.greySoft, borderRadius: 12, padding: 3, gap: 3 }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          flex: 1, border: "none", borderRadius: 9, padding: "9px 6px", cursor: "pointer",
          font: "600 13.5px Inter", background: value === o.value ? T.card : "transparent",
          color: value === o.value ? T.ink : T.faint,
          boxShadow: value === o.value ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
        }}>{o.label}</button>
      ))}
    </div>
  );
}
function DayPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {SCHOOL_DAYS.map((d) => {
        const on = value.includes(d);
        return (
          <button key={d} onClick={() => onChange(on ? value.filter((x) => x !== d) : [...value, d])} style={{
            flex: 1, border: `1px solid ${on ? T.brand : T.line}`, background: on ? T.brand : T.card,
            color: on ? "#fff" : T.muted, borderRadius: 10, padding: "9px 0", cursor: "pointer",
            font: "600 12.5px Inter",
          }}>{d}</button>
        );
      })}
    </div>
  );
}
function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} aria-pressed={on} style={{
      width: 44, height: 26, borderRadius: 999, border: "none", cursor: "pointer", position: "relative",
      background: on ? T.brand : "#CBD4D2", transition: "background .15s", flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: 999,
        background: "#fff", transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

/* ============================================================
   Owner picker (used everywhere ownership applies)
   ============================================================ */
function OwnerRow({ adults, owner, onPick, compact }) {
  return (
    <button onClick={onPick} className="fa-owner" style={{
      display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${T.line}`,
      background: T.card, borderRadius: 999, padding: compact ? "3px 8px 3px 4px" : "5px 11px 5px 5px",
      cursor: "pointer", font: "600 12.5px Inter", color: owner ? T.ink : T.faint,
    }}>
      <Avatar adult={owner} size={compact ? 20 : 22} />
      {owner ? owner.name : "Assign"}
    </button>
  );
}

/* ============================================================
   Main App
   ============================================================ */
export default function App() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(undefined);   // undefined = checking, null = signed out
  const [household, setHousehold] = useState(store.getHouseholdCode()); // null until chosen
  const [tab, setTab] = useState("today");
  const [modal, setModal] = useState(null); // {type, data}
  const [activeChildId, setActiveChildId] = useState(null);
  const [toast, setToast] = useState(null);
  const skipNextSave = useRef(false);

  // Resolve who's signed in (cloud mode), and keep it current
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      setUser(await store.getUser());
      unsub = store.onAuth((u) => setUser(u));
    })();
    return () => unsub();
  }, []);

  // Load + subscribe whenever we have both a signed-in user and a household code
  useEffect(() => {
    if (user === undefined) return;                 // still checking auth
    if (store.needsAuth() && !user) { setLoading(false); return; } // need sign-in first
    if (!household) { setLoading(false); return; }
    let unsub = () => {};
    let cancelled = false;
    setLoading(true);
    (async () => {
      const init = await store.load(household);
      if (cancelled) return;
      if (!init) {
        // membership/household no longer reachable — send back to the gate
        store.clearHouseholdCode(); setHousehold(null); setLoading(false); return;
      }
      skipNextSave.current = true;        // don't immediately re-save what we just loaded
      setState(init);
      setActiveChildId(init.children[0]?.id || null);
      setLoading(false);
      // live updates from the other parent's device
      unsub = store.subscribe(household, (remoteState) => {
        skipNextSave.current = true;      // applying a remote change shouldn't echo back out
        setState(remoteState);
      });
    })();
    return () => { cancelled = true; unsub(); };
  }, [household, user]);

  // Persist local changes (debounced inside the store), skipping loads/remote applies
  useEffect(() => {
    if (!state || !household) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    store.save(household, state);
  }, [state, household]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 1800); };

  /* immutable update helper */
  const update = (fn) => setState((prev) => { const next = structuredClone(prev); fn(next); return next; });

  // Signed out (cloud mode) → show sign in / create account
  if (store.needsAuth() && user === null) {
    return <AuthScreen />;
  }
  if (user === undefined) {
    return <Splash label="Signing you in…" />;
  }

  // Signed in but no household chosen on this device → create or join
  if (!household) {
    return (
      <HouseholdGate
        onCreate={async (code) => { await store.createHousehold(code, seed); store.setHouseholdCode(code); setHousehold(code); }}
        onJoin={async (code) => { await store.joinHousehold(code); store.setHouseholdCode(code); setHousehold(code); }}
      />
    );
  }

  if (loading || !state) {
    return (
      <div style={{ ...shell.page, alignItems: "center", justifyContent: "center", display: "flex" }}>
        <GlobalStyle />
        <div style={{ textAlign: "center", color: T.muted }}>
          <Sun size={30} className="fa-spin" style={{ color: T.brand }} />
          <div style={{ marginTop: 10, font: "600 15px Bricolage Grotesque", color: T.ink }}>Getting things ready…</div>
        </div>
      </div>
    );
  }

  const adults = state.adults;
  const adultById = (id) => adults.find((a) => a.id === id) || null;
  const childById = (id) => state.children.find((c) => c.id === id) || null;

  /* ---------- mutators ---------- */
  const upsertChild = (c) => update((s) => {
    const i = s.children.findIndex((x) => x.id === c.id);
    if (i >= 0) s.children[i] = { ...s.children[i], ...c };
    else s.children.push({
      modules: { calendar: true, money: true, lunches: true, clubs: true, bookings: true, forms: true, social: true },
      lunch: {}, lunchBalance: 0, lunchThreshold: 5, recurring: [], payments: [], clubs: [], forms: [], bookings: [], events: [], parties: [],
      ...c,
    });
  });
  const deleteChild = (id) => update((s) => { s.children = s.children.filter((c) => c.id !== id); s.oneoffs = s.oneoffs.filter((o) => o.childId !== id); });
  const toggleModule = (childId, key) => update((s) => { const c = s.children.find((x) => x.id === childId); c.modules[key] = !c.modules[key]; });
  const setLunch = (childId, day, val) => update((s) => { s.children.find((c) => c.id === childId).lunch[day] = val; });
  const setLunchBalance = (childId, bal, thr) => update((s) => { const c = s.children.find((x) => x.id === childId); c.lunchBalance = bal; if (thr != null) c.lunchThreshold = thr; });
  const adjustBalance = (childId, delta) => update((s) => { const c = s.children.find((x) => x.id === childId); c.lunchBalance = Math.max(0, +(c.lunchBalance + delta).toFixed(2)); });

  const upsertIn = (childId, key, item) => update((s) => {
    const c = s.children.find((x) => x.id === childId); const arr = c[key];
    const i = arr.findIndex((x) => x.id === item.id);
    if (i >= 0) arr[i] = { ...arr[i], ...item }; else arr.push({ id: uid(key), ...item });
  });
  const deleteIn = (childId, key, id) => update((s) => { const c = s.children.find((x) => x.id === childId); c[key] = c[key].filter((x) => x.id !== id); });

  const upsertAdult = (a) => update((s) => {
    const i = s.adults.findIndex((x) => x.id === a.id);
    if (i >= 0) s.adults[i] = { ...s.adults[i], ...a }; else s.adults.push({ id: uid("a"), ...a });
  });
  const deleteAdult = (id) => update((s) => { s.adults = s.adults.filter((a) => a.id !== id); });

  const addOneoff = (o) => update((s) => { s.oneoffs.push({ id: uid("o"), done: false, ...o }); });
  const updateOneoff = (o) => update((s) => { const i = s.oneoffs.findIndex((x) => x.id === o.id); if (i >= 0) s.oneoffs[i] = { ...s.oneoffs[i], ...o }; });
  const deleteOneoff = (id) => update((s) => { s.oneoffs = s.oneoffs.filter((o) => o.id !== id); });

  const toggleCheck = (key) => update((s) => { s.checks[key] = !s.checks[key]; });

  const applyOwner = (target, adultId) => update((s) => {
    const c = s.children.find((x) => x.id === target.childId);
    if (target.kind === "oneoff") { const o = s.oneoffs.find((x) => x.id === target.id); if (o) o.owner = adultId; return; }
    const arr = c[target.key]; const it = arr.find((x) => x.id === target.id); if (it) it.owner = adultId;
  });

  const addReviewItems = (items) => update((s) => { s.reviewQueue.push(...items); });
  const removeReview = (id) => update((s) => { s.reviewQueue = s.reviewQueue.filter((r) => r.id !== id); });
  const confirmReview = (item) => {
    if (item.type === "payment") upsertIn(item.childId, "payments", { label: item.label, amount: item.amount || 0, due: item.date, status: "due", owner: item.owner || null });
    else if (item.type === "form") upsertIn(item.childId, "forms", { label: item.label, status: "todo", due: item.date, owner: item.owner || null });
    else upsertIn(item.childId, "events", { title: item.label, date: item.date, type: item.dressup ? "dressup" : "show", costume: !!item.dressup });
    removeReview(item.id);
    flash("Added to " + (childById(item.childId)?.name || "child"));
  };

  const resetAll = () => { const s = seed(); setState(s); setActiveChildId(s.children[0].id); setModal(null); flash("Reset to sample data"); };

  /* ---------- shared open helpers ---------- */
  const openOwner = (target) => setModal({ type: "owner", data: target });

  const ctx = {
    state, adults, adultById, childById, update, flash,
    upsertChild, deleteChild, toggleModule, setLunch, setLunchBalance, adjustBalance,
    upsertIn, deleteIn, upsertAdult, deleteAdult, addOneoff, updateOneoff, deleteOneoff,
    toggleCheck, applyOwner, openOwner, setModal, addReviewItems, removeReview, confirmReview,
    activeChildId, setActiveChildId, setTab,
    household, user, switchHousehold: () => { store.clearHouseholdCode(); setHousehold(null); setState(null); },
    signOut: async () => { store.clearHouseholdCode(); await store.signOut(); setHousehold(null); setState(null); },
  };

  const tabs = [
    { id: "today", label: "Today", icon: Home },
    { id: "week", label: "Week", icon: CalendarDays },
    { id: "kids", label: "Kids", icon: Users },
    { id: "money", label: "Money", icon: Wallet },
    { id: "more", label: "More", icon: MoreHorizontal },
  ];

  return (
    <div style={shell.page}>
      <GlobalStyle />
      <div style={shell.frame}>
        {/* header */}
        <header style={shell.header}>
          <div>
            <div style={{ font: "600 12px Inter", letterSpacing: "0.06em", textTransform: "uppercase", color: T.faint }}>
              {greeting()} · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            <div style={{ font: "700 22px Bricolage Grotesque", color: T.ink, marginTop: 1 }}>{state.settings.householdName}</div>
          </div>
          <div style={{ display: "flex" }}>
            {adults.map((a) => <span key={a.id} style={{ marginLeft: -6 }}><Avatar adult={a} size={32} /></span>)}
          </div>
        </header>

        <main style={shell.main}>
          {tab === "today" && <Today ctx={ctx} />}
          {tab === "week" && <Week ctx={ctx} />}
          {tab === "kids" && <Kids ctx={ctx} />}
          {tab === "money" && <Money ctx={ctx} />}
          {tab === "more" && <More ctx={ctx} onReset={() => setModal({ type: "reset" })} />}
        </main>

        {/* quick add FAB */}
        <button onClick={() => setModal({ type: "quickadd" })} className="fa-fab" aria-label="Quick add" style={shell.fab}>
          <Plus size={26} strokeWidth={2.6} />
        </button>

        {/* bottom nav */}
        <nav style={shell.nav}>
          {tabs.map((t) => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, border: "none", background: "transparent", cursor: "pointer", padding: "9px 0 7px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                color: on ? T.brand : T.faint,
              }}>
                <t.icon size={21} strokeWidth={on ? 2.6 : 2} />
                <span style={{ font: `${on ? 700 : 600} 10.5px Inter` }}>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* modals */}
      {modal && <Modals modal={modal} ctx={ctx} close={() => setModal(null)} onReset={resetAll} />}
      {toast && <div className="fa-toast" style={shell.toast}>{toast}</div>}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ============================================================
   Auth + onboarding shells
   ============================================================ */
function Splash({ label }) {
  return (
    <div style={{ ...shell.page, alignItems: "center", justifyContent: "center", display: "flex" }}>
      <GlobalStyle />
      <div style={{ textAlign: "center", color: T.muted }}>
        <Sun size={30} className="fa-spin" style={{ color: T.brand }} />
        <div style={{ marginTop: 10, font: "600 15px Bricolage Grotesque", color: T.ink }}>{label || "Loading…"}</div>
      </div>
    </div>
  );
}

function AuthShell({ children, sub }) {
  return (
    <div style={{ ...shell.page }}>
      <GlobalStyle />
      <div style={{ ...shell.frame, justifyContent: "center", padding: "0 22px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: T.brandSoft, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Sun size={30} color={T.brand} strokeWidth={2.2} />
          </div>
          <h1 style={{ font: "700 26px Bricolage Grotesque", color: T.ink, margin: 0 }}>Family Admin</h1>
          {sub && <p style={{ font: "500 14.5px Inter", color: T.muted, marginTop: 8, lineHeight: 1.5 }}>{sub}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const submit = async () => {
    setErr(""); setInfo("");
    if (!email.trim() || pw.length < 6) { setErr("Enter an email and a password of at least 6 characters."); return; }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { needsConfirm } = await store.signUp(email.trim(), pw);
        if (needsConfirm) setInfo("Check your email to confirm your account, then sign in.");
        // if confirmation is off, onAuthStateChange will swap to the app automatically
      } else {
        await store.signIn(email.trim(), pw);
      }
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally { setBusy(false); }
  };

  return (
    <AuthShell sub="One calm place for the school chaos — shared by both parents.">
      <Card>
        <Field label="Email">
          <TextInput type="email" autoComplete="email" value={email} placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <TextInput type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={pw} placeholder="At least 6 characters" onChange={(e) => setPw(e.target.value)} />
        </Field>
        {err && <p style={{ font: "500 13px Inter", color: T.red, margin: "0 0 10px" }}>{err}</p>}
        {info && <p style={{ font: "500 13px Inter", color: T.brand, margin: "0 0 10px" }}>{info}</p>}
        <Button style={{ width: "100%" }} icon={Check} onClick={submit}>
          {busy ? "Just a moment…" : mode === "signup" ? "Create account" : "Sign in"}
        </Button>
        <button onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setErr(""); setInfo(""); }} style={{
          width: "100%", marginTop: 12, border: "none", background: "transparent", cursor: "pointer",
          font: "600 13.5px Inter", color: T.muted,
        }}>
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </Card>
      <p style={{ font: "500 12px Inter", color: T.faint, textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
        Your data is private to your household — only people you invite with your code, signed into their own account, can see it.
      </p>
    </AuthShell>
  );
}

/* ============================================================
   Household gate — create or join, so both parents share one dataset
   ============================================================ */
function makeCode() {
  // friendly, readable household code e.g. "OAKMEADOW-4271" — large pool to avoid clashes
  const a = ["OAK", "FOX", "PINE", "BIRCH", "WREN", "MOSS", "FERN", "DOVE", "REED", "SAGE", "ELM", "HAWK", "LARK", "ROWAN", "HEATH", "VALE", "BROOK", "GLEN", "MARSH", "WILLOW"];
  const b = ["MEADOW", "FIELD", "HOLLOW", "RIDGE", "DELL", "COPSE", "BANK", "GROVE", "PATH", "GATE"];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return pick(a) + pick(b) + "-" + Math.floor(1000 + Math.random() * 9000);
}

function HouseholdGate({ onCreate, onJoin }) {
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [code, setCode] = useState("");
  const [newCode, setNewCode] = useState(makeCode);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const live = store.isCloud();

  const run = async (fn, value) => {
    setErr(""); setBusy(true);
    try { await fn(value); } catch (e) {
      const msg = e.message || "Something went wrong.";
      // if the suggested code was taken, roll a fresh one automatically
      if (/taken|duplicate/i.test(msg)) { setNewCode(makeCode()); setErr("That code was taken — here's a fresh one, tap Start again."); }
      else setErr(msg);
      setBusy(false);
    }
  };

  return (
    <AuthShell sub="Create your family's space, or join your partner's.">
      {!mode && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Button onClick={() => setMode("create")} icon={Plus}>Create a new household</Button>
          <Button variant="line" onClick={() => setMode("join")} icon={Users}>Join with a code</Button>
          {store.needsAuth() && (
            <button onClick={() => store.signOut()} style={{ marginTop: 6, border: "none", background: "transparent", cursor: "pointer", font: "600 13px Inter", color: T.faint }}>Sign out</button>
          )}
          {!live && (
            <p style={{ font: "500 12px Inter", color: T.faint, textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
              Running in single-device mode (no cloud keys set). Add Supabase keys to sync between phones — see the README.
            </p>
          )}
        </div>
      )}

      {mode === "create" && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ font: "600 13px Inter", color: T.muted }}>Your household code</div>
            <button onClick={() => { setErr(""); setNewCode(makeCode()); }} style={{ border: "none", background: "transparent", cursor: "pointer", font: "600 12.5px Inter", color: T.brand }}>↻ New code</button>
          </div>
          <div style={{ font: "800 30px Bricolage Grotesque", color: T.brand, letterSpacing: "0.05em", textAlign: "center", padding: "10px 0" }}>{newCode}</div>
          <p style={{ font: "500 13px Inter", color: T.muted, lineHeight: 1.55, margin: "6px 0 14px" }}>
            {live
              ? "Share this code with your partner. When they sign in and tap “Join with a code”, you'll both see the same items live."
              : "Cloud sync isn't configured yet, so this device keeps its own copy. Add Supabase keys (README) to sync across phones."}
          </p>
          {err && <p style={{ font: "500 13px Inter", color: T.red, margin: "0 0 10px" }}>{err}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="line" style={{ flex: 1 }} onClick={() => setMode(null)}>Back</Button>
            <Button style={{ flex: 1 }} icon={Check} onClick={() => run(onCreate, newCode)}>{busy ? "…" : "Start"}</Button>
          </div>
        </Card>
      )}

      {mode === "join" && (
        <Card>
          <Field label="Enter your household code">
            <TextInput autoFocus value={code} placeholder="e.g. OAK-4271" onChange={(e) => setCode(e.target.value.toUpperCase())} />
          </Field>
          {err && <p style={{ font: "500 13px Inter", color: T.red, margin: "0 0 10px" }}>{err}</p>}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Button variant="line" style={{ flex: 1 }} onClick={() => setMode(null)}>Back</Button>
            <Button style={{ flex: 1 }} icon={Check} onClick={() => code.trim() && run(onJoin, code.trim())}>{busy ? "…" : "Join"}</Button>
          </div>
        </Card>
      )}
    </AuthShell>
  );
}


/* ============================================================
   Needs engine — what does each kid need on a given date?
   ============================================================ */
function needsForChild(child, dateISO, checks, oneoffs) {
  const wd = wkday(parseISO(dateISO));
  const items = [];
  // recurring
  if (child.modules) {
    for (const r of child.recurring) {
      if (r.days.includes(wd)) {
        const key = `rec:${child.id}:${r.id}:${dateISO}`;
        items.push({ key, recId: r.id, label: r.label, icon: r.icon, owner: r.owner, done: !!checks[key], kind: "recurring" });
      }
    }
  }
  // packed lunch
  if (child.modules?.lunches && child.lunch?.[wd] === "packed") {
    const key = `lunch:${child.id}:${dateISO}`;
    items.push({ key, label: "Packed lunch", icon: "food", owner: null, done: !!checks[key], kind: "lunch" });
  }
  // clubs needing kit that day
  if (child.modules?.clubs) {
    for (const cl of child.clubs) {
      if (cl.day === wd && cl.kit) {
        const key = `club:${child.id}:${cl.id}:${dateISO}`;
        items.push({ key, label: `${cl.name}: ${cl.kit}`, icon: "shoe", owner: cl.owner, done: !!checks[key], kind: "club" });
      }
    }
  }
  // events / costumes that day
  if (child.modules?.calendar) {
    for (const e of child.events) {
      if (e.date === dateISO && e.costume) {
        const key = `evt:${e.id}`;
        items.push({ key, label: `${e.title}${e.costumeNote ? " — " + e.costumeNote : ""}`, icon: "star", owner: null, done: !!checks[key], kind: "event", costume: true });
      }
    }
  }
  // one-offs
  for (const o of oneoffs.filter((o) => o.childId === child.id && o.date === dateISO)) {
    items.push({ key: `one:${o.id}`, id: o.id, label: o.label, icon: "star", owner: o.owner, done: o.done, kind: "oneoff" });
  }
  return items;
}

/* collect urgent flags across household */
function urgentItems(state) {
  const out = [];
  const t = today0();
  for (const c of state.children) {
    if (c.modules?.money) {
      for (const p of c.payments) {
        if (p.status !== "paid") {
          const n = daysUntil(p.due);
          if (n < 0) out.push({ tone: "red", icon: Coins, text: `${c.name}: ${p.label} overdue (${money(p.amount)})`, child: c });
          else if (n <= 1) out.push({ tone: "amber", icon: Coins, text: `${c.name}: ${p.label} due ${fmtNice(p.due)} (${money(p.amount)})`, child: c });
        }
      }
      if (c.modules?.lunches && c.lunchBalance <= c.lunchThreshold) {
        out.push({ tone: "red", icon: Utensils, text: `${c.name}: lunch balance low (${money(c.lunchBalance)})`, child: c });
      }
    }
    if (c.modules?.bookings) {
      for (const b of c.bookings) {
        if (b.status !== "booked") {
          const n = daysUntil(b.deadline);
          if (n <= 3) out.push({ tone: n < 0 ? "red" : "amber", icon: Ticket, text: `${c.name}: ${b.label} ${n < 0 ? "deadline passed" : "closes " + fmtNice(b.deadline)}`, child: c });
        }
      }
    }
    if (c.modules?.forms) {
      for (const f of c.forms) {
        if (f.status !== "returned" && f.due) {
          const n = daysUntil(f.due);
          if (n <= 3) out.push({ tone: n < 0 ? "red" : "amber", icon: FileText, text: `${c.name}: return ${f.label} ${fmtNice(f.due)}`, child: c });
        }
      }
    }
    if (c.modules?.calendar) {
      for (const e of c.events) {
        if (e.costume) { const n = daysUntil(e.date); if (n >= 0 && n <= 7) out.push({ tone: n <= 2 ? "amber" : "grey", icon: Sparkles, text: `${c.name}: ${e.title} ${fmtNice(e.date)} — costume needed`, child: c }); }
      }
    }
  }
  const rank = { red: 0, amber: 1, grey: 2 };
  return out.sort((a, b) => rank[a.tone] - rank[b.tone]);
}

/* ============================================================
   Screen: Today
   ============================================================ */
function Today({ ctx }) {
  const { state, adultById, toggleCheck, updateOneoff, openOwner, setTab, setActiveChildId } = ctx;
  const tISO = iso(today0());
  const tomISO = iso(addDays(today0(), 1));
  const urgent = urgentItems(state);

  const NeedRow = ({ child, n }) => {
    const Icon = RECUR_ICONS[n.icon] || Sparkles;
    const owner = adultById(n.owner);
    const onToggle = () => { if (n.kind === "oneoff") updateOneoff({ id: n.id, done: !n.done }); else toggleCheck(n.key); };
    const target = n.kind === "oneoff"
      ? { kind: "oneoff", id: n.id }
      : n.kind === "recurring"
        ? { kind: "in", childId: child.id, key: "recurring", id: n.recId }
        : null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderTop: `1px solid ${T.line}` }}>
        <button onClick={onToggle} className="fa-check" style={{
          width: 24, height: 24, borderRadius: 8, border: `2px solid ${n.done ? T.green : T.line}`,
          background: n.done ? T.green : T.card, cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0,
        }}>{n.done && <Check size={15} color="#fff" strokeWidth={3} />}</button>
        <Icon size={17} style={{ color: child.color, flexShrink: 0 }} strokeWidth={2.2} />
        <span style={{ flex: 1, font: "500 14.5px Inter", color: n.done ? T.faint : T.ink, textDecoration: n.done ? "line-through" : "none" }}>{n.label}</span>
        {n.kind === "oneoff" || n.kind === "recurring"
          ? <OwnerRow adults={state.adults} owner={owner} onPick={() => target ? openOwner(target) : null} compact />
          : (owner ? <Avatar adult={owner} size={22} /> : null)}
      </div>
    );
  };

  const DayBlock = ({ label, dISO }) => (
    <>
      <SectionTitle>{label}</SectionTitle>
      {state.children.map((child) => {
        const needs = needsForChild(child, dISO, state.checks, state.oneoffs);
        const info = child.modules?.lunches && child.lunch?.[wkday(parseISO(dISO))] === "school" ? "School dinner" : null;
        const done = needs.filter((n) => n.done).length;
        return (
          <Card key={child.id} accent={child.color} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: needs.length ? 4 : 0 }}>
              <KidTile child={child} />
              <div style={{ flex: 1 }}>
                <div style={{ font: "650 16px Bricolage Grotesque", color: T.ink }}>{child.name}</div>
                <div style={{ font: "500 12px Inter", color: T.faint }}>
                  {needs.length ? `${needs.length} thing${needs.length > 1 ? "s" : ""} to sort${done ? ` · ${done} done` : ""}` : "Nothing flagged"}
                  {info && ` · ${info}`}
                </div>
              </div>
            </div>
            {needs.length === 0
              ? <div style={{ font: "500 13.5px Inter", color: T.green, padding: "6px 0 2px" }}>All set 🎉</div>
              : needs.map((n) => <NeedRow key={n.key} child={child} n={n} />)}
          </Card>
        );
      })}
    </>
  );

  return (
    <div>
      {/* urgent banner */}
      {urgent.length > 0 && (
        <Card style={{ background: T.redSoft, border: `1px solid ${T.red}33`, marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Bell size={17} color={T.red} strokeWidth={2.4} />
            <span style={{ font: "700 14px Bricolage Grotesque", color: T.red }}>Needs attention</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {urgent.slice(0, 5).map((u, i) => (
              <button key={i} onClick={() => { setActiveChildId(u.child.id); setTab(u.tone === "grey" ? "week" : "money"); }} style={{
                display: "flex", alignItems: "center", gap: 9, background: "transparent", border: "none",
                textAlign: "left", cursor: "pointer", padding: 0,
              }}>
                <u.icon size={15} color={u.tone === "red" ? T.red : u.tone === "amber" ? T.amber : T.faint} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                <span style={{ font: "500 13.5px Inter", color: T.ink, flex: 1 }}>{u.text}</span>
                <ChevronRight size={15} color={T.faint} />
              </button>
            ))}
          </div>
        </Card>
      )}

      <DayBlock label="Tomorrow's briefing" dISO={tomISO} />
      <DayBlock label="Today" dISO={tISO} />
      <div style={{ height: 16 }} />
    </div>
  );
}

/* ============================================================
   Screen: Week — calendar / key dates + who's got what
   ============================================================ */
function Week({ ctx }) {
  const { state, adultById, childById, setModal, activeChildId } = ctx;
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => iso(addDays(today0(), i))), []);

  // gather dated items per day
  const byDay = {};
  const push = (d, item) => { (byDay[d] = byDay[d] || []).push(item); };
  for (const c of state.children) {
    if (c.modules?.calendar) for (const e of c.events) push(e.date, { child: c, type: "event", title: e.title, badge: e.costume ? "Costume" : eventTypeLabel(e.type), tone: e.costume ? "amber" : "child", icon: e.costume ? Sparkles : showIcon(e.type) });
    if (c.modules?.money) for (const p of c.payments) if (p.status !== "paid") push(p.due, { child: c, type: "pay", title: `Pay: ${p.label}`, badge: money(p.amount), tone: "amber", icon: Coins, owner: p.owner });
    if (c.modules?.bookings) for (const b of c.bookings) if (b.status !== "booked") push(b.deadline, { child: c, type: "book", title: `Book: ${b.label}`, badge: "Deadline", tone: "red", icon: Ticket, owner: b.owner });
    if (c.modules?.forms) for (const f of c.forms) if (f.status !== "returned" && f.due) push(f.due, { child: c, type: "form", title: `Return: ${f.label}`, badge: "Form", tone: "grey", icon: FileText, owner: f.owner });
    for (const o of state.oneoffs.filter((o) => o.childId === c.id)) push(o.date, { child: c, type: "one", title: o.label, badge: "One-off", tone: "child", icon: Sparkles, owner: o.owner });
  }

  // who's got what (next 14 days), grouped by owner
  const byOwner = {};
  for (const d of days) for (const it of (byDay[d] || [])) {
    if (it.owner !== undefined) { const k = it.owner || "none"; (byOwner[k] = byOwner[k] || []).push({ ...it, date: d }); }
  }

  const toneColor = (it) => it.tone === "child" ? it.child.color : it.tone === "amber" ? T.amber : it.tone === "red" ? T.red : T.faint;

  return (
    <div>
      <SectionTitle action={<IconBtn icon={Plus} label="Add key date" onClick={() => setModal({ type: "event", data: { childId: activeChildId || state.children[0]?.id } })} />}>The next two weeks</SectionTitle>
      {days.map((d) => {
        const items = byDay[d];
        if (!items || items.length === 0) return null;
        return (
          <div key={d} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 2px 8px" }}>
              <span style={{ font: "700 14px Bricolage Grotesque", color: T.ink }}>{fmtNice(d)}</span>
              <span style={{ font: "500 12px Inter", color: T.faint }}>{daysUntil(d) > 1 ? new Date(parseISO(d)).toLocaleDateString("en-GB", { weekday: "long" }) : ""}</span>
            </div>
            <Card style={{ padding: "4px 14px" }}>
              {items.map((it, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: it.child.color, flexShrink: 0 }} />
                  <it.icon size={16} color={toneColor(it)} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ font: "500 14px Inter", color: T.ink }}>{it.title}</div>
                    <div style={{ font: "500 11.5px Inter", color: T.faint }}>{it.child.name}</div>
                  </div>
                  <Pill bg={T.greySoft} fg={T.muted}>{it.badge}</Pill>
                  {it.owner !== undefined && <Avatar adult={adultById(it.owner)} size={22} />}
                </div>
              ))}
            </Card>
          </div>
        );
      })}
      {days.every((d) => !byDay[d]) && <Empty icon={CalendarDays} title="A clear fortnight" hint="Dated items — events, payments, deadlines — show up here." />}

      <SectionTitle>Who's got what</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...state.adults, { id: "none", name: "Unassigned", color: T.grey }].map((a) => {
          const list = byOwner[a.id] || [];
          if (a.id === "none" && list.length === 0) return null;
          return (
            <Card key={a.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: list.length ? 8 : 0 }}>
                {a.id === "none" ? <Avatar adult={null} size={26} /> : <Avatar adult={a} size={26} />}
                <span style={{ font: "650 15px Bricolage Grotesque", color: T.ink, flex: 1 }}>{a.name}</span>
                <Pill bg={T.brandSoft} fg={T.brand}>{list.length} task{list.length !== 1 ? "s" : ""}</Pill>
              </div>
              {list.slice(0, 6).map((it, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", font: "500 13px Inter", color: T.muted }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: it.child.color }} />
                  <span style={{ flex: 1, color: T.ink }}>{it.title}</span>
                  <span style={{ color: T.faint }}>{fmtNice(it.date)}</span>
                </div>
              ))}
            </Card>
          );
        })}
      </div>
      <div style={{ height: 16 }} />
    </div>
  );
}
function eventTypeLabel(t) { return ({ show: "Event", sport: "Sport", trip: "Trip", inset: "INSET", term: "Term", dressup: "Dress-up" })[t] || "Event"; }
function showIcon(t) { return ({ sport: Footprints, trip: MapPin, dressup: Sparkles })[t] || CalendarDays; }

/* ============================================================
   Screen: Kids — profiles, modules, schedules
   ============================================================ */
function Kids({ ctx }) {
  const { state, activeChildId, setActiveChildId, setModal, adultById, setLunch, toggleModule, openOwner, deleteIn } = ctx;
  const child = state.children.find((c) => c.id === activeChildId) || state.children[0];

  const moduleList = [
    ["lunches", "Lunches", Utensils], ["money", "Payments", Wallet], ["clubs", "Clubs", Footprints],
    ["calendar", "Key dates", CalendarDays], ["bookings", "Bookings", Ticket], ["forms", "Forms", FileText], ["social", "Parties", PartyPopper],
  ];

  if (!child) return <Empty icon={Users} title="No children yet" hint="Add your first child to get started." action={<Button icon={Plus} onClick={() => setModal({ type: "child" })}>Add a child</Button>} />;

  return (
    <div>
      {/* child switcher */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "2px 0 6px", margin: "0 -4px", paddingLeft: 4 }}>
        {state.children.map((c) => {
          const on = c.id === child.id;
          return (
            <button key={c.id} onClick={() => setActiveChildId(c.id)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "7px 13px 7px 8px", borderRadius: 999,
              border: `1.5px solid ${on ? c.color : T.line}`, background: on ? c.color + "18" : T.card,
              cursor: "pointer", flexShrink: 0,
            }}>
              <KidTile child={c} size={24} />
              <span style={{ font: `${on ? 700 : 600} 14px Inter`, color: on ? T.ink : T.muted }}>{c.name}</span>
            </button>
          );
        })}
        <button onClick={() => setModal({ type: "child" })} style={{
          flexShrink: 0, border: `1.5px dashed ${T.line}`, background: T.card, borderRadius: 999,
          padding: "7px 13px", cursor: "pointer", color: T.muted, font: "600 14px Inter",
          display: "inline-flex", alignItems: "center", gap: 5,
        }}><Plus size={16} /> Add</button>
      </div>

      {/* profile card */}
      <Card accent={child.color} style={{ marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <KidTile child={child} size={46} />
          <div style={{ flex: 1 }}>
            <div style={{ font: "700 20px Bricolage Grotesque", color: T.ink }}>{child.name}</div>
            <div style={{ font: "500 13px Inter", color: T.muted }}>{[child.year, child.school].filter(Boolean).join(" · ")}</div>
          </div>
          <IconBtn icon={Pencil} label="Edit child" onClick={() => setModal({ type: "child", data: child })} />
        </div>
      </Card>

      {/* lunch schedule */}
      {child.modules.lunches && (
        <>
          <SectionTitle>Lunch by day</SectionTitle>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {SCHOOL_DAYS.map((d) => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 38, font: "600 13px Inter", color: T.muted }}>{d}</span>
                  <div style={{ flex: 1 }}>
                    <Segmented value={child.lunch[d] || "school"} onChange={(v) => setLunch(child.id, d, v)}
                      options={[{ value: "school", label: "School dinner" }, { value: "packed", label: "Packed" }]} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* key dates */}
      {child.modules.calendar && (
        <>
          <SectionTitle action={<IconBtn icon={Plus} label="Add key date" onClick={() => setModal({ type: "event", data: { childId: child.id } })} />}>Key dates</SectionTitle>
          {(!child.events || child.events.length === 0)
            ? <Empty icon={CalendarDays} title="No key dates yet" hint="Add trips, shows, sports day, dress-up days — anything with a date." />
            : <Card style={{ padding: "4px 14px" }}>
              {[...child.events].sort((a, b) => a.date.localeCompare(b.date)).map((e, i) => {
                const Icon = e.costume ? Sparkles : showIcon(e.type);
                const past = daysUntil(e.date) < 0;
                return (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderTop: i ? `1px solid ${T.line}` : "none", opacity: past ? 0.5 : 1 }}>
                    <Icon size={18} color={e.costume ? T.amber : child.color} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ font: "550 14.5px Inter", color: T.ink }}>{e.title}</div>
                      <div style={{ font: "500 12px Inter", color: T.faint }}>{fmtNice(e.date)} · {e.costume ? "Costume needed" : eventTypeLabel(e.type)}</div>
                    </div>
                    <IconBtn icon={Pencil} label="Edit" onClick={() => setModal({ type: "event", data: { childId: child.id, item: e } })} />
                    <IconBtn icon={Trash2} label="Delete" color={T.red} onClick={() => deleteIn(child.id, "events", e.id)} />
                  </div>
                );
              })}
            </Card>}
        </>
      )}

      {/* recurring items */}
      <SectionTitle action={<IconBtn icon={Plus} label="Add" onClick={() => setModal({ type: "recurring", data: { childId: child.id } })} />}>What's needed weekly</SectionTitle>
      {child.recurring.length === 0
        ? <Empty icon={Backpack} title="No weekly items" hint="Add the things that repeat — PE kit, library book, swimming." />
        : <Card style={{ padding: "4px 14px" }}>
          {child.recurring.map((r, i) => {
            const Icon = RECUR_ICONS[r.icon] || Sparkles;
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
                <Icon size={18} color={child.color} strokeWidth={2.2} />
                <div style={{ flex: 1 }}>
                  <div style={{ font: "550 14.5px Inter", color: T.ink }}>{r.label}</div>
                  <div style={{ font: "500 12px Inter", color: T.faint }}>{r.days.join(" · ")}</div>
                </div>
                <OwnerRow adults={state.adults} owner={adultById(r.owner)} onPick={() => openOwner({ kind: "in", childId: child.id, key: "recurring", id: r.id })} compact />
                <IconBtn icon={Pencil} label="Edit" onClick={() => setModal({ type: "recurring", data: { childId: child.id, item: r } })} />
              </div>
            );
          })}
        </Card>}

      {/* clubs */}
      {child.modules.clubs && (
        <>
          <SectionTitle action={<IconBtn icon={Plus} label="Add club" onClick={() => setModal({ type: "club", data: { childId: child.id } })} />}>Clubs & activities</SectionTitle>
          {child.clubs.length === 0
            ? <Empty icon={Footprints} title="No clubs yet" />
            : child.clubs.map((cl) => (
              <Card key={cl.id} style={{ marginBottom: 10 }} accent={child.color}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: "650 15px Bricolage Grotesque", color: T.ink }}>{cl.name}</div>
                    <div style={{ font: "500 12.5px Inter", color: T.muted, marginTop: 2 }}>{[cl.day, cl.time, cl.location].filter(Boolean).join(" · ")}</div>
                    {cl.kit && <div style={{ marginTop: 6 }}><Pill bg={T.brandSoft} fg={T.brand}><Backpack size={12} /> {cl.kit}</Pill></div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <OwnerRow adults={state.adults} owner={adultById(cl.owner)} onPick={() => openOwner({ kind: "in", childId: child.id, key: "clubs", id: cl.id })} compact />
                    <div>
                      <IconBtn icon={Pencil} label="Edit" onClick={() => setModal({ type: "club", data: { childId: child.id, item: cl } })} />
                      <IconBtn icon={Trash2} label="Delete" color={T.red} onClick={() => deleteIn(child.id, "clubs", cl.id)} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </>
      )}

      {/* forms */}
      {child.modules.forms && (
        <>
          <SectionTitle action={<IconBtn icon={Plus} label="Add form" onClick={() => setModal({ type: "form", data: { childId: child.id } })} />}>Forms & permissions</SectionTitle>
          {child.forms.length === 0
            ? <Empty icon={FileText} title="No forms to track" />
            : <Card style={{ padding: "4px 14px" }}>
              {child.forms.map((f, i) => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: "550 14px Inter", color: T.ink }}>{f.label}</div>
                    {f.due && <div style={{ font: "500 12px Inter", color: daysUntil(f.due) < 0 && f.status !== "returned" ? T.red : T.faint }}>Due {fmtNice(f.due)}</div>}
                  </div>
                  <button onClick={() => ctx.upsertIn(child.id, "forms", { ...f, status: f.status === "returned" ? "todo" : "returned" })} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                    <StatusPill status={f.status} />
                  </button>
                  <IconBtn icon={Pencil} label="Edit" onClick={() => setModal({ type: "form", data: { childId: child.id, item: f } })} />
                </div>
              ))}
            </Card>}
        </>
      )}

      {/* module toggles */}
      <SectionTitle>Modules for {child.name}</SectionTitle>
      <Card style={{ padding: "4px 14px" }}>
        {moduleList.map(([key, label, Icon], i) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
            <Icon size={18} color={T.muted} strokeWidth={2.1} />
            <span style={{ flex: 1, font: "550 14.5px Inter", color: T.ink }}>{label}</span>
            <Toggle on={!!child.modules[key]} onClick={() => toggleModule(child.id, key)} />
          </div>
        ))}
      </Card>
      <div style={{ marginTop: 10 }}>
        <Button variant="danger" icon={Trash2} onClick={() => { if (confirm(`Remove ${child.name} and all their items?`)) { ctx.deleteChild(child.id); setActiveChildId(state.children.find((c) => c.id !== child.id)?.id || null); } }}>Remove {child.name}</Button>
      </div>
      <div style={{ height: 16 }} />
    </div>
  );
}

/* ============================================================
   Screen: Money — payments + lunch balances
   ============================================================ */
function Money({ ctx }) {
  const { state, adultById, setModal, upsertIn, openOwner, deleteIn, adjustBalance } = ctx;
  const kids = state.children.filter((c) => c.modules?.money);
  const outstanding = kids.reduce((sum, c) => sum + c.payments.filter((p) => p.status !== "paid").reduce((s, p) => s + (+p.amount || 0), 0), 0);

  const effStatus = (p) => p.status !== "paid" && daysUntil(p.due) < 0 ? "overdue" : p.status;

  return (
    <div>
      <Card style={{ background: T.brand, border: "none", color: "#fff", marginBottom: 4 }}>
        <div style={{ font: "600 12px Inter", letterSpacing: "0.05em", textTransform: "uppercase", opacity: 0.85 }}>Outstanding this term</div>
        <div style={{ font: "800 30px Bricolage Grotesque", marginTop: 2 }}>{money(outstanding)}</div>
        <div style={{ font: "500 12.5px Inter", opacity: 0.85, marginTop: 2 }}>across {kids.length} {kids.length === 1 ? "child" : "children"} · a consolidated view, not a payment processor</div>
      </Card>

      {kids.map((child) => (
        <div key={child.id}>
          <SectionTitle action={<IconBtn icon={Plus} label="Add payment" onClick={() => setModal({ type: "payment", data: { childId: child.id } })} />}>
            <span style={{ color: child.color }}>{child.name}</span> · payments
          </SectionTitle>

          {/* lunch balance */}
          {child.modules?.lunches && (
            <Card style={{ marginBottom: 10, background: child.lunchBalance <= child.lunchThreshold ? T.redSoft : T.card, border: `1px solid ${child.lunchBalance <= child.lunchThreshold ? T.red + "33" : T.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Utensils size={18} color={child.lunchBalance <= child.lunchThreshold ? T.red : child.color} strokeWidth={2.2} />
                <div style={{ flex: 1 }}>
                  <div style={{ font: "550 14px Inter", color: T.ink }}>Lunch balance</div>
                  <div style={{ font: "500 12px Inter", color: child.lunchBalance <= child.lunchThreshold ? T.red : T.faint }}>
                    {child.lunchBalance <= child.lunchThreshold ? `Low — top up soon (alert under ${money(child.lunchThreshold)})` : `Healthy · alert under ${money(child.lunchThreshold)}`}
                  </div>
                </div>
                <div style={{ font: "800 20px Bricolage Grotesque", color: child.lunchBalance <= child.lunchThreshold ? T.red : T.ink }}>{money(child.lunchBalance)}</div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Button variant="line" style={{ flex: 1, padding: "9px 0", fontSize: 13.5 }} onClick={() => adjustBalance(child.id, -2.4)}>− Spent £2.40</Button>
                <Button variant="soft" style={{ flex: 1, padding: "9px 0", fontSize: 13.5 }} onClick={() => adjustBalance(child.id, 10)}>+ Top up £10</Button>
                <Button variant="ghost" style={{ padding: "9px 10px", fontSize: 13.5 }} onClick={() => setModal({ type: "balance", data: child })}>Set</Button>
              </div>
            </Card>
          )}

          {child.payments.length === 0
            ? <Empty icon={Coins} title="Nothing to pay" hint="Log trips, photos, fundraisers — track what's paid without missing a deadline." />
            : <Card style={{ padding: "4px 14px" }}>
              {[...child.payments].sort((a, b) => a.due.localeCompare(b.due)).map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
                  <button onClick={() => upsertIn(child.id, "payments", { ...p, status: p.status === "paid" ? "due" : "paid" })} className="fa-check" style={{
                    width: 24, height: 24, borderRadius: 8, border: `2px solid ${p.status === "paid" ? T.green : T.line}`,
                    background: p.status === "paid" ? T.green : T.card, cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>{p.status === "paid" && <Check size={15} color="#fff" strokeWidth={3} />}</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: "550 14px Inter", color: p.status === "paid" ? T.faint : T.ink, textDecoration: p.status === "paid" ? "line-through" : "none" }}>{p.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 3 }}>
                      <StatusPill status={effStatus(p)} />
                      <span style={{ font: "500 12px Inter", color: T.faint }}>{p.status === "paid" ? "Paid" : "Due " + fmtNice(p.due)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                    <span style={{ font: "700 15px Bricolage Grotesque", color: T.ink }}>{money(p.amount)}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <OwnerRow adults={state.adults} owner={adultById(p.owner)} onPick={() => openOwner({ kind: "in", childId: child.id, key: "payments", id: p.id })} compact />
                      <IconBtn icon={Pencil} label="Edit" onClick={() => setModal({ type: "payment", data: { childId: child.id, item: p } })} />
                    </div>
                  </div>
                </div>
              ))}
            </Card>}
        </div>
      ))}
      {kids.length === 0 && <Empty icon={Wallet} title="Payments turned off" hint="Enable the Payments module on a child in the Kids tab." />}
      <div style={{ height: 16 }} />
    </div>
  );
}

/* ============================================================
   Screen: More — bookings, parties, email capture, household
   ============================================================ */
function More({ ctx, onReset }) {
  const { state, adultById, setModal, upsertIn, openOwner, deleteIn } = ctx;
  const reviewCount = state.reviewQueue.length;

  const bookingKids = state.children.filter((c) => c.modules?.bookings && c.bookings.length);
  const partyKids = state.children.filter((c) => c.modules?.social && c.parties.length);

  return (
    <div>
      {/* email capture */}
      <SectionTitle>Capture from school</SectionTitle>
      <Card onClick={() => setModal({ type: "email" })} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: T.brandSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mail size={20} color={T.brand} strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ font: "650 15px Bricolage Grotesque", color: T.ink }}>Paste an email or newsletter</div>
          <div style={{ font: "500 12.5px Inter", color: T.muted }}>We pull out dates & tasks for you to review before they're added</div>
        </div>
        {reviewCount > 0 && <Pill bg={T.amberSoft} fg={T.amber}>{reviewCount} to review</Pill>}
        <ChevronRight size={18} color={T.faint} />
      </Card>

      {/* bookings */}
      <SectionTitle action={state.children[0] && <IconBtn icon={Plus} label="Add booking" onClick={() => setModal({ type: "booking", data: { childId: state.children[0].id } })} />}>Booking deadlines</SectionTitle>
      {bookingKids.length === 0
        ? <Empty icon={Ticket} title="No booking deadlines" hint="Track slots that fill up — parents' evening, holiday club, trips." />
        : bookingKids.map((c) => c.bookings.map((b) => {
          const n = daysUntil(b.deadline);
          const eff = b.status === "booked" ? "booked" : n <= 2 ? "closing" : "open";
          return (
            <Card key={b.id} accent={c.color} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ font: "650 15px Bricolage Grotesque", color: T.ink }}>{b.label}</div>
                  <div style={{ font: "500 12.5px Inter", color: T.muted, marginTop: 2 }}>{c.name} · {b.status === "booked" ? "Booked" : "Closes " + fmtNice(b.deadline)}</div>
                  {b.note && <div style={{ font: "500 12px Inter", color: T.faint, marginTop: 4, fontStyle: "italic" }}>“{b.note}”</div>}
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 8 }}>
                    <button onClick={() => upsertIn(c.id, "bookings", { ...b, status: b.status === "booked" ? "open" : "booked" })} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}><StatusPill status={eff} /></button>
                    <OwnerRow adults={state.adults} owner={adultById(b.owner)} onPick={() => openOwner({ kind: "in", childId: c.id, key: "bookings", id: b.id })} compact />
                  </div>
                </div>
                <div>
                  <IconBtn icon={Pencil} label="Edit" onClick={() => setModal({ type: "booking", data: { childId: c.id, item: b } })} />
                  <IconBtn icon={Trash2} label="Delete" color={T.red} onClick={() => deleteIn(c.id, "bookings", b.id)} />
                </div>
              </div>
            </Card>
          );
        }))}

      {/* parties */}
      <SectionTitle action={state.children[0] && <IconBtn icon={Plus} label="Add party" onClick={() => setModal({ type: "party", data: { childId: state.children[0].id } })} />}>Party invites</SectionTitle>
      {partyKids.length === 0
        ? <Empty icon={PartyPopper} title="No parties tracked" hint="Log invites so RSVPs and gifts don't slip through WhatsApp." />
        : partyKids.map((c) => c.parties.map((p) => (
          <Card key={p.id} accent={c.color} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PartyPopper size={20} color={c.color} strokeWidth={2.1} />
              <div style={{ flex: 1 }}>
                <div style={{ font: "650 15px Bricolage Grotesque", color: T.ink }}>{p.host}</div>
                <div style={{ font: "500 12.5px Inter", color: T.muted }}>{c.name} · {fmtNice(p.date)}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <button onClick={() => upsertIn(c.id, "parties", { ...p, status: p.status === "rsvp" ? "declined" : p.status === "declined" ? "invited" : "rsvp" })} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}><StatusPill status={p.status} /></button>
                <button onClick={() => upsertIn(c.id, "parties", { ...p, gift: !p.gift })} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
                  <Pill bg={p.gift ? T.greenSoft : T.greySoft} fg={p.gift ? T.green : T.faint}><ShoppingBag size={12} /> {p.gift ? "Gift sorted" : "Gift to buy"}</Pill>
                </button>
              </div>
              <IconBtn icon={Trash2} label="Delete" color={T.red} onClick={() => deleteIn(c.id, "parties", p.id)} />
            </div>
          </Card>
        )))}

      {/* household */}
      <SectionTitle>Sharing & sync</SectionTitle>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: T.brandSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Users size={20} color={T.brand} strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ font: "500 12px Inter", color: T.muted }}>Household code</div>
            <div style={{ font: "800 20px Bricolage Grotesque", color: T.brand, letterSpacing: "0.04em" }}>{ctx.household || "—"}</div>
          </div>
          <Button variant="line" style={{ padding: "9px 12px", fontSize: 13 }} onClick={() => { try { navigator.clipboard?.writeText(ctx.household); ctx.flash("Code copied"); } catch { ctx.flash(ctx.household); } }}>Copy</Button>
        </div>
        <p style={{ font: "500 12.5px Inter", color: T.faint, lineHeight: 1.55, margin: "12px 0 0" }}>
          {store.isCloud()
            ? "Your partner enters this code (Join with a code) on their phone — then every change syncs between you live."
            : "Single-device mode: this code only works on this device until cloud sync is configured (see README)."}
        </p>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <Button variant="ghost" onClick={() => { if (confirm("Switch or leave this household? You'll be asked for a code again on this device.")) ctx.switchHousehold(); }}>Switch household</Button>
          {store.isCloud() && ctx.user && (
            <Button variant="ghost" onClick={() => { if (confirm("Sign out of " + (ctx.user.email || "your account") + "?")) ctx.signOut(); }}>Sign out</Button>
          )}
        </div>
        {store.isCloud() && ctx.user?.email && (
          <div style={{ font: "500 11.5px Inter", color: T.faint, marginTop: 6 }}>Signed in as {ctx.user.email}</div>
        )}
      </Card>

      <SectionTitle action={<IconBtn icon={Plus} label="Add adult" onClick={() => setModal({ type: "adult" })} />}>Household</SectionTitle>
      <Card style={{ padding: "4px 14px" }}>
        {state.adults.map((a, i) => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
            <Avatar adult={a} size={32} />
            <div style={{ flex: 1 }}>
              <div style={{ font: "600 14.5px Inter", color: T.ink }}>{a.name}</div>
              <div style={{ font: "500 12px Inter", color: T.faint }}>Own login · sees everything · can own tasks</div>
            </div>
            <IconBtn icon={Pencil} label="Edit" onClick={() => setModal({ type: "adult", data: a })} />
            {state.adults.length > 1 && <IconBtn icon={Trash2} label="Remove" color={T.red} onClick={() => ctx.deleteAdult(a.id)} />}
          </div>
        ))}
      </Card>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <div style={{ font: "500 12px Inter", color: T.faint, lineHeight: 1.6, marginBottom: 12 }}>
          Read-only data · never sold or used to train models · encrypted at rest.<br />A calm, shared place — not another channel.
        </div>
        <Button variant="ghost" onClick={onReset}>Reset to sample data</Button>
      </div>
      <div style={{ height: 16 }} />
    </div>
  );
}

/* ============================================================
   Modal router + editors
   ============================================================ */
function Modals({ modal, ctx, close, onReset }) {
  const { type, data } = modal;
  switch (type) {
    case "quickadd": return <QuickAddSheet ctx={ctx} close={close} />;
    case "child": return <ChildEditor ctx={ctx} close={close} child={data} />;
    case "recurring": return <RecurringEditor ctx={ctx} close={close} childId={data.childId} item={data.item} />;
    case "payment": return <PaymentEditor ctx={ctx} close={close} childId={data.childId} item={data.item} />;
    case "club": return <ClubEditor ctx={ctx} close={close} childId={data.childId} item={data.item} />;
    case "form": return <FormEditor ctx={ctx} close={close} childId={data.childId} item={data.item} />;
    case "booking": return <BookingEditor ctx={ctx} close={close} childId={data.childId} item={data.item} />;
    case "event": return <EventEditor ctx={ctx} close={close} childId={data.childId} item={data.item} />;
    case "party": return <PartyEditor ctx={ctx} close={close} childId={data.childId} item={data.item} />;
    case "adult": return <AdultEditor ctx={ctx} close={close} adult={data} />;
    case "balance": return <BalanceEditor ctx={ctx} close={close} child={data} />;
    case "owner": return <OwnerSheet ctx={ctx} close={close} target={data} />;
    case "email": return <EmailCapture ctx={ctx} close={close} />;
    case "reset": return <Sheet title="Reset everything?" onClose={close} footer={<><Button variant="line" style={{ flex: 1 }} onClick={close}>Cancel</Button><Button variant="danger" style={{ flex: 1 }} onClick={onReset}>Reset</Button></>}>
      <p style={{ font: "500 14.5px Inter", color: T.muted, lineHeight: 1.6 }}>This replaces all your data with the sample household (Emma & Oliver). Useful for a fresh demo, but it can't be undone.</p>
    </Sheet>;
    default: return null;
  }
}

function OwnerSheet({ ctx, close, target }) {
  const apply = (id) => { ctx.applyOwner(target.kind === "oneoff" ? target : { childId: target.childId, key: target.key, id: target.id, kind: target.kind }, id); close(); };
  return (
    <Sheet title="Who's handling this?" onClose={close}>
      <p style={{ font: "500 13.5px Inter", color: T.muted, margin: "0 0 14px", lineHeight: 1.5 }}>One parent owns it end-to-end, so it's clear who's got it — no more silent default.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ctx.adults.map((a) => (
          <button key={a.id} onClick={() => apply(a.id)} style={rowBtn}>
            <Avatar adult={a} size={32} /><span style={{ flex: 1, textAlign: "left", font: "600 15px Inter", color: T.ink }}>{a.name}</span>
          </button>
        ))}
        <button onClick={() => apply(null)} style={rowBtn}>
          <Avatar adult={null} size={32} /><span style={{ flex: 1, textAlign: "left", font: "600 15px Inter", color: T.muted }}>Unassign</span>
        </button>
      </div>
    </Sheet>
  );
}
const rowBtn = { display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, border: `1px solid ${T.line}`, background: T.card, cursor: "pointer", width: "100%" };

/* ---- Quick add (last-minute capture) ---- */
function QuickAddSheet({ ctx, close }) {
  const { state } = ctx;
  const [label, setLabel] = useState("");
  const [childId, setChildId] = useState(state.children[0]?.id || "");
  const [when, setWhen] = useState(iso(addDays(today0(), 1)));
  const [owner, setOwner] = useState(null);
  const save = () => { if (!label.trim() || !childId) return; ctx.addOneoff({ childId, label: label.trim(), date: when, owner }); ctx.flash("Added"); close(); };
  return (
    <Sheet title="Quick add" onClose={close} footer={<Button style={{ flex: 1 }} onClick={save} icon={Check}>Add it</Button>}>
      <p style={{ font: "500 13px Inter", color: T.muted, margin: "0 0 14px" }}>For the night-before surprises — "bring £2 for cake sale."</p>
      <Field label="What's needed?"><TextInput autoFocus value={label} placeholder="e.g. £2 for the cake sale" onChange={(e) => setLabel(e.target.value)} /></Field>
      <Field label="For who?">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {state.children.map((c) => (
            <button key={c.id} onClick={() => setChildId(c.id)} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 12px 8px 8px", borderRadius: 999,
              border: `1.5px solid ${childId === c.id ? c.color : T.line}`, background: childId === c.id ? c.color + "18" : T.card, cursor: "pointer",
            }}><KidTile child={c} size={22} /><span style={{ font: "600 13.5px Inter", color: T.ink }}>{c.name}</span></button>
          ))}
        </div>
      </Field>
      <Field label="When?">
        <Segmented value={when} onChange={setWhen} options={[{ value: iso(today0()), label: "Today" }, { value: iso(addDays(today0(), 1)), label: "Tomorrow" }]} />
      </Field>
      <Field label="Who'll handle it?">
        <div style={{ display: "flex", gap: 8 }}>
          {ctx.adults.map((a) => (
            <button key={a.id} onClick={() => setOwner(owner === a.id ? null : a.id)} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "7px 12px 7px 5px", borderRadius: 999,
              border: `1.5px solid ${owner === a.id ? T.brand : T.line}`, background: owner === a.id ? T.brandSoft : T.card, cursor: "pointer",
            }}><Avatar adult={a} size={22} /><span style={{ font: "600 13.5px Inter", color: T.ink }}>{a.name}</span></button>
          ))}
        </div>
      </Field>
    </Sheet>
  );
}

/* ---- Child editor ---- */
function ChildEditor({ ctx, close, child }) {
  const [f, setF] = useState(child || { name: "", emoji: "🦊", color: ACCENTS[2 % ACCENTS.length], school: "", year: "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = () => { if (!f.name.trim()) return; const id = f.id || uid("c"); ctx.upsertChild({ ...f, id }); if (!f.id) ctx.setActiveChildId(id); close(); };
  const emojis = ["🦊", "🐢", "🐰", "🦁", "🐱", "🐶", "🦄", "🐼", "🦉", "🐸", "🐝", "⭐"];
  return (
    <Sheet title={child ? "Edit child" : "Add a child"} onClose={close} footer={<Button style={{ flex: 1 }} onClick={save} icon={Check}>{child ? "Save" : "Add child"}</Button>}>
      <Field label="Name (used everywhere)"><TextInput autoFocus value={f.name} placeholder="e.g. Emma" onChange={(e) => set("name", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Year / class"><TextInput value={f.year} placeholder="Year 3" onChange={(e) => set("year", e.target.value)} /></Field></div>
      </div>
      <Field label="School"><TextInput value={f.school} placeholder="Oakfield Primary" onChange={(e) => set("school", e.target.value)} /></Field>
      <Field label="Colour">
        <div style={{ display: "flex", gap: 10 }}>
          {ACCENTS.map((c) => (
            <button key={c} onClick={() => set("color", c)} style={{ width: 34, height: 34, borderRadius: 10, background: c, border: f.color === c ? `3px solid ${T.ink}` : `2px solid ${c}`, cursor: "pointer" }} />
          ))}
        </div>
      </Field>
      <Field label="Avatar">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {emojis.map((e) => (
            <button key={e} onClick={() => set("emoji", e)} style={{ width: 38, height: 38, borderRadius: 10, fontSize: 20, background: f.emoji === e ? f.color + "22" : T.card, border: `1.5px solid ${f.emoji === e ? f.color : T.line}`, cursor: "pointer" }}>{e}</button>
          ))}
        </div>
      </Field>
    </Sheet>
  );
}

/* ---- Recurring editor ---- */
function RecurringEditor({ ctx, close, childId, item }) {
  const [f, setF] = useState(item || { label: "", icon: "shirt", days: [], owner: null });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = () => { if (!f.label.trim() || f.days.length === 0) return; ctx.upsertIn(childId, "recurring", f); close(); };
  const icons = [["shirt", "Kit"], ["book", "Book"], ["swim", "Swim"], ["music", "Music"], ["bag", "Bag"], ["food", "Food"], ["star", "Other"]];
  return (
    <Sheet title={item ? "Edit weekly item" : "Add weekly item"} onClose={close}
      footer={<><Button style={{ flex: 1 }} onClick={save} icon={Check}>Save</Button>{item && <Button variant="danger" onClick={() => { ctx.deleteIn(childId, "recurring", item.id); close(); }} icon={Trash2}> </Button>}</>}>
      <Field label="What's needed?"><TextInput autoFocus value={f.label} placeholder="e.g. PE kit" onChange={(e) => set("label", e.target.value)} /></Field>
      <Field label="Which days?"><DayPicker value={f.days} onChange={(v) => set("days", v)} /></Field>
      <Field label="Icon">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {icons.map(([k, lbl]) => { const Icon = RECUR_ICONS[k]; return (
            <button key={k} onClick={() => set("icon", k)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 11px", borderRadius: 11, border: `1.5px solid ${f.icon === k ? T.brand : T.line}`, background: f.icon === k ? T.brandSoft : T.card, cursor: "pointer", color: T.muted }}>
              <Icon size={18} /><span style={{ font: "600 10px Inter" }}>{lbl}</span></button>
          ); })}
        </div>
      </Field>
      <Field label="Who usually does this?"><OwnerPickInline adults={ctx.adults} value={f.owner} onChange={(v) => set("owner", v)} /></Field>
    </Sheet>
  );
}

function OwnerPickInline({ adults, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {adults.map((a) => (
        <button key={a.id} onClick={() => onChange(value === a.id ? null : a.id)} style={{
          display: "flex", alignItems: "center", gap: 7, padding: "7px 12px 7px 5px", borderRadius: 999,
          border: `1.5px solid ${value === a.id ? T.brand : T.line}`, background: value === a.id ? T.brandSoft : T.card, cursor: "pointer",
        }}><Avatar adult={a} size={22} /><span style={{ font: "600 13.5px Inter", color: T.ink }}>{a.name}</span></button>
      ))}
    </div>
  );
}

/* ---- Payment editor ---- */
function PaymentEditor({ ctx, close, childId, item }) {
  const [f, setF] = useState(item || { label: "", amount: "", due: iso(addDays(today0(), 7)), status: "due", owner: null });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = () => { if (!f.label.trim()) return; ctx.upsertIn(childId, "payments", { ...f, amount: +f.amount || 0 }); close(); };
  return (
    <Sheet title={item ? "Edit payment" : "Add payment"} onClose={close}
      footer={<><Button style={{ flex: 1 }} onClick={save} icon={Check}>Save</Button>{item && <Button variant="danger" onClick={() => { ctx.deleteIn(childId, "payments", item.id); close(); }} icon={Trash2}> </Button>}</>}>
      <Field label="What's it for?"><TextInput autoFocus value={f.label} placeholder="e.g. School trip" onChange={(e) => set("label", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Amount (£)"><TextInput type="number" inputMode="decimal" value={f.amount} placeholder="12.00" onChange={(e) => set("amount", e.target.value)} /></Field></div>
        <div style={{ flex: 1.2 }}><Field label="Due date"><TextInput type="date" value={f.due} onChange={(e) => set("due", e.target.value)} /></Field></div>
      </div>
      <Field label="Status"><Segmented value={f.status} onChange={(v) => set("status", v)} options={[{ value: "notdue", label: "Not due" }, { value: "due", label: "Due" }, { value: "paid", label: "Paid" }]} /></Field>
      <Field label="Who's paying?"><OwnerPickInline adults={ctx.adults} value={f.owner} onChange={(v) => set("owner", v)} /></Field>
    </Sheet>
  );
}

/* ---- Club editor ---- */
function ClubEditor({ ctx, close, childId, item }) {
  const [f, setF] = useState(item || { name: "", day: "Mon", time: "", location: "", kit: "", owner: null });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = () => { if (!f.name.trim()) return; ctx.upsertIn(childId, "clubs", f); close(); };
  return (
    <Sheet title={item ? "Edit club" : "Add club"} onClose={close}
      footer={<><Button style={{ flex: 1 }} onClick={save} icon={Check}>Save</Button>{item && <Button variant="danger" onClick={() => { ctx.deleteIn(childId, "clubs", item.id); close(); }} icon={Trash2}> </Button>}</>}>
      <Field label="Club name"><TextInput autoFocus value={f.name} placeholder="e.g. Football club" onChange={(e) => set("name", e.target.value)} /></Field>
      <Field label="Day"><div style={{ display: "flex", gap: 6 }}>{SCHOOL_DAYS.map((d) => (
        <button key={d} onClick={() => set("day", d)} style={{ flex: 1, border: `1px solid ${f.day === d ? T.brand : T.line}`, background: f.day === d ? T.brand : T.card, color: f.day === d ? "#fff" : T.muted, borderRadius: 10, padding: "9px 0", cursor: "pointer", font: "600 12.5px Inter" }}>{d}</button>
      ))}</div></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Time"><TextInput value={f.time} placeholder="15:30–16:30" onChange={(e) => set("time", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Location"><TextInput value={f.location} placeholder="School field" onChange={(e) => set("location", e.target.value)} /></Field></div>
      </div>
      <Field label="Kit needed (shows in the daily list)"><TextInput value={f.kit} placeholder="Boots + shin pads" onChange={(e) => set("kit", e.target.value)} /></Field>
      <Field label="Drop-off / pick-up"><OwnerPickInline adults={ctx.adults} value={f.owner} onChange={(v) => set("owner", v)} /></Field>
    </Sheet>
  );
}

/* ---- Form editor ---- */
function FormEditor({ ctx, close, childId, item }) {
  const [f, setF] = useState(item || { label: "", status: "todo", due: iso(addDays(today0(), 5)), owner: null });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = () => { if (!f.label.trim()) return; ctx.upsertIn(childId, "forms", f); close(); };
  return (
    <Sheet title={item ? "Edit form" : "Add form"} onClose={close}
      footer={<><Button style={{ flex: 1 }} onClick={save} icon={Check}>Save</Button>{item && <Button variant="danger" onClick={() => { ctx.deleteIn(childId, "forms", item.id); close(); }} icon={Trash2}> </Button>}</>}>
      <Field label="Form / permission"><TextInput autoFocus value={f.label} placeholder="e.g. Trip consent form" onChange={(e) => set("label", e.target.value)} /></Field>
      <Field label="Return by"><TextInput type="date" value={f.due} onChange={(e) => set("due", e.target.value)} /></Field>
      <Field label="Status"><Segmented value={f.status} onChange={(v) => set("status", v)} options={[{ value: "received", label: "Received" }, { value: "todo", label: "To do" }, { value: "returned", label: "Returned" }]} /></Field>
      <Field label="Who's on it?"><OwnerPickInline adults={ctx.adults} value={f.owner} onChange={(v) => set("owner", v)} /></Field>
    </Sheet>
  );
}

/* ---- Booking editor ---- */
function BookingEditor({ ctx, close, childId, item }) {
  const [cid, setCid] = useState(childId);
  const [f, setF] = useState(item || { label: "", deadline: iso(addDays(today0(), 5)), status: "open", note: "", owner: null });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = () => { if (!f.label.trim()) return; ctx.upsertIn(cid, "bookings", f); close(); };
  return (
    <Sheet title={item ? "Edit booking" : "Add booking deadline"} onClose={close}
      footer={<><Button style={{ flex: 1 }} onClick={save} icon={Check}>Save</Button>{item && <Button variant="danger" onClick={() => { ctx.deleteIn(cid, "bookings", item.id); close(); }} icon={Trash2}> </Button>}</>}>
      {!item && <Field label="For who?"><ChildPickInline ctx={ctx} value={cid} onChange={setCid} /></Field>}
      <Field label="What needs booking?"><TextInput autoFocus value={f.label} placeholder="e.g. Parents' evening slot" onChange={(e) => set("label", e.target.value)} /></Field>
      <Field label="Closes / fills by"><TextInput type="date" value={f.deadline} onChange={(e) => set("deadline", e.target.value)} /></Field>
      <Field label="Note (optional)"><TextInput value={f.note} placeholder="Book same week as a friend" onChange={(e) => set("note", e.target.value)} /></Field>
      <Field label="Who's booking?"><OwnerPickInline adults={ctx.adults} value={f.owner} onChange={(v) => set("owner", v)} /></Field>
    </Sheet>
  );
}

/* ---- Key date / event editor ---- */
function EventEditor({ ctx, close, childId, item }) {
  const [cid, setCid] = useState(childId);
  const [f, setF] = useState(item || { title: "", date: iso(addDays(today0(), 21)), type: "trip", costume: false });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setType = (t) => setF((p) => ({ ...p, type: t, costume: t === "dressup" ? true : p.costume }));
  const save = () => { if (!f.title.trim()) return; ctx.upsertIn(cid, "events", f); ctx.flash(item ? "Saved" : "Key date added"); close(); };
  const types = [["trip", "Trip"], ["show", "Show / event"], ["sport", "Sports day"], ["dressup", "Dress-up day"], ["inset", "INSET day"], ["term", "Term date"]];
  return (
    <Sheet title={item ? "Edit key date" : "Add key date"} onClose={close}
      footer={<><Button style={{ flex: 1 }} onClick={save} icon={Check}>Save</Button>{item && <Button variant="danger" onClick={() => { ctx.deleteIn(cid, "events", item.id); close(); }} icon={Trash2}> </Button>}</>}>
      {!item && <Field label="For who?"><ChildPickInline ctx={ctx} value={cid} onChange={setCid} /></Field>}
      <Field label="What's happening?"><TextInput autoFocus value={f.title} placeholder="e.g. Trip to the Sealife Centre" onChange={(e) => set("title", e.target.value)} /></Field>
      <Field label="Date"><TextInput type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field>
      <Field label="Type">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {types.map(([v, lbl]) => (
            <button key={v} onClick={() => setType(v)} style={{
              border: `1.5px solid ${f.type === v ? T.brand : T.line}`, background: f.type === v ? T.brandSoft : T.card,
              color: f.type === v ? T.brand : T.muted, borderRadius: 999, padding: "8px 13px", cursor: "pointer", font: "600 12.5px Inter",
            }}>{lbl}</button>
          ))}
        </div>
      </Field>
      <Field label="Costume needed? (flags an early heads-up in the daily list)">
        <Toggle on={!!f.costume} onClick={() => set("costume", !f.costume)} />
      </Field>
    </Sheet>
  );
}

/* ---- Party editor ---- */
function PartyEditor({ ctx, close, childId, item }) {
  const [cid, setCid] = useState(childId);
  const [f, setF] = useState(item || { host: "", date: iso(addDays(today0(), 7)), status: "invited", gift: false });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = () => { if (!f.host.trim()) return; ctx.upsertIn(cid, "parties", f); close(); };
  return (
    <Sheet title={item ? "Edit party" : "Add party invite"} onClose={close}
      footer={<><Button style={{ flex: 1 }} onClick={save} icon={Check}>Save</Button>{item && <Button variant="danger" onClick={() => { ctx.deleteIn(cid, "parties", item.id); close(); }} icon={Trash2}> </Button>}</>}>
      {!item && <Field label="Who's invited?"><ChildPickInline ctx={ctx} value={cid} onChange={setCid} /></Field>}
      <Field label="Whose party?"><TextInput autoFocus value={f.host} placeholder="e.g. Noah's birthday" onChange={(e) => set("host", e.target.value)} /></Field>
      <Field label="Date"><TextInput type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field>
      <Field label="RSVP"><Segmented value={f.status} onChange={(v) => set("status", v)} options={[{ value: "invited", label: "Invited" }, { value: "rsvp", label: "Going" }, { value: "declined", label: "Can't go" }]} /></Field>
    </Sheet>
  );
}

function ChildPickInline({ ctx, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {ctx.state.children.map((c) => (
        <button key={c.id} onClick={() => onChange(c.id)} style={{
          display: "flex", alignItems: "center", gap: 7, padding: "7px 12px 7px 6px", borderRadius: 999,
          border: `1.5px solid ${value === c.id ? c.color : T.line}`, background: value === c.id ? c.color + "18" : T.card, cursor: "pointer",
        }}><KidTile child={c} size={22} /><span style={{ font: "600 13.5px Inter", color: T.ink }}>{c.name}</span></button>
      ))}
    </div>
  );
}

/* ---- Adult editor ---- */
function AdultEditor({ ctx, close, adult }) {
  const palette = ["#3A6B7A", "#7A6B9C", "#B5683E", "#4C7A4E", "#9C4F6B", "#3E5C8A"];
  const [f, setF] = useState(adult || { name: "", color: palette[ctx.adults.length % palette.length] });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = () => { if (!f.name.trim()) return; ctx.upsertAdult(f); close(); };
  return (
    <Sheet title={adult ? "Edit adult" : "Add adult / carer"} onClose={close} footer={<Button style={{ flex: 1 }} onClick={save} icon={Check}>Save</Button>}>
      <p style={{ font: "500 13px Inter", color: T.muted, margin: "0 0 14px" }}>Parents, plus optional carers — a grandparent or nanny. Each gets their own login and can own tasks.</p>
      <Field label="Name"><TextInput autoFocus value={f.name} placeholder="e.g. Sam" onChange={(e) => set("name", e.target.value)} /></Field>
      <Field label="Colour">
        <div style={{ display: "flex", gap: 10 }}>
          {palette.map((c) => <button key={c} onClick={() => set("color", c)} style={{ width: 34, height: 34, borderRadius: 999, background: c, border: f.color === c ? `3px solid ${T.ink}` : `2px solid ${c}`, cursor: "pointer" }} />)}
        </div>
      </Field>
    </Sheet>
  );
}

/* ---- Lunch balance editor ---- */
function BalanceEditor({ ctx, close, child }) {
  const [bal, setBal] = useState(String(child.lunchBalance));
  const [thr, setThr] = useState(String(child.lunchThreshold));
  const save = () => { ctx.setLunchBalance(child.id, +bal || 0, +thr || 0); close(); };
  return (
    <Sheet title={`${child.name}'s lunch balance`} onClose={close} footer={<Button style={{ flex: 1 }} onClick={save} icon={Check}>Save</Button>}>
      <Field label="Current balance (£)"><TextInput type="number" inputMode="decimal" value={bal} onChange={(e) => setBal(e.target.value)} /></Field>
      <Field label="Warn me when it drops below (£)"><TextInput type="number" inputMode="decimal" value={thr} onChange={(e) => setThr(e.target.value)} /></Field>
      <p style={{ font: "500 12.5px Inter", color: T.faint, lineHeight: 1.5 }}>A reliable low-balance reminder, because school systems often fail to send one — and no kid should go without lunch.</p>
    </Sheet>
  );
}

/* ---- Email capture with review-first extraction ---- */
function EmailCapture({ ctx, close }) {
  const { state } = ctx;
  const [text, setText] = useState("");
  const [stage, setStage] = useState(state.reviewQueue.length ? "review" : "paste");

  const extract = () => {
    const found = parseEmail(text, state.children);
    if (found.length === 0) { ctx.flash("No dates or tasks spotted"); return; }
    ctx.addReviewItems(found); setStage("review"); setText("");
  };

  return (
    <Sheet title="Capture from school" onClose={close}
      footer={stage === "paste"
        ? <Button style={{ flex: 1 }} onClick={extract} icon={Sparkles}>Find dates & tasks</Button>
        : <Button variant="line" style={{ flex: 1 }} onClick={() => setStage("paste")} icon={Plus}>Paste another</Button>}>
      {stage === "paste" ? (
        <>
          <p style={{ font: "500 13px Inter", color: T.muted, margin: "0 0 12px", lineHeight: 1.5 }}>
            Paste a newsletter or email. We'll suggest items — you review and confirm before anything is added. Nothing is auto-trusted.
          </p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={"e.g. Don't forget World Book Day on Friday — children may dress up as a book character. Trip to the farm costs £8, please pay by next Tuesday."}
            style={{ ...inputStyle, minHeight: 150, resize: "vertical", lineHeight: 1.5 }} />
          <button onClick={() => setText("Reminder: School photos this Thursday. The Year 3 trip to the Sealife Centre is £12, payable by 24th. World Book Day is next Friday — costumes welcome! Please return the consent form by Monday.")}
            style={{ marginTop: 10, border: `1px dashed ${T.line}`, background: T.card, borderRadius: 10, padding: "8px 11px", font: "600 12.5px Inter", color: T.brand, cursor: "pointer" }}>
            ✨ Try a sample email
          </button>
        </>
      ) : (
        <ReviewQueue ctx={ctx} />
      )}
    </Sheet>
  );
}

function ReviewQueue({ ctx }) {
  const { state } = ctx;
  if (state.reviewQueue.length === 0) return <Empty icon={Inbox} title="Nothing to review" hint="Paste an email to pull out suggested items." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Pill bg={T.amberSoft} fg={T.amber}>Review first</Pill>
        <span style={{ font: "500 12.5px Inter", color: T.muted }}>Confirm each item before it's trusted.</span>
      </div>
      {state.reviewQueue.map((r) => <ReviewCard key={r.id} ctx={ctx} item={r} />)}
    </div>
  );
}

function ReviewCard({ ctx, item }) {
  const [r, setR] = useState(item);
  const set = (k, v) => setR((p) => ({ ...p, [k]: v }));
  const typeIcon = { event: Sparkles, payment: Coins, form: FileText }[r.type] || Sparkles;
  const Icon = typeIcon;
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon size={17} color={T.brand} strokeWidth={2.2} />
        <TextInput value={r.label} onChange={(e) => set("label", e.target.value)} style={{ flex: 1, padding: "8px 10px", fontSize: 14 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1.1 }}>
          <Segmented value={r.type} onChange={(v) => set("type", v)} options={[{ value: "event", label: "Date" }, { value: "payment", label: "Pay" }, { value: "form", label: "Form" }]} />
        </div>
        <TextInput type="date" value={r.date} onChange={(e) => set("date", e.target.value)} style={{ flex: 1, padding: "8px 10px", fontSize: 13 }} />
      </div>
      {r.type === "payment" && <div style={{ marginBottom: 10 }}><TextInput type="number" inputMode="decimal" value={r.amount || ""} placeholder="Amount £" onChange={(e) => set("amount", +e.target.value)} style={{ padding: "9px 11px", fontSize: 14 }} /></div>}
      <div style={{ marginBottom: 12 }}>
        <div style={{ font: "600 12px Inter", color: T.muted, marginBottom: 6 }}>For who?</div>
        <ChildPickInline ctx={ctx} value={r.childId} onChange={(v) => set("childId", v)} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="soft" style={{ flex: 1 }} icon={Check} onClick={() => ctx.confirmReview(r)}>Add it</Button>
        <Button variant="ghost" icon={X} onClick={() => ctx.removeReview(r.id)}>Dismiss</Button>
      </div>
    </Card>
  );
}

/* naive but real extraction: dates, £ amounts, keywords -> candidate items */
function parseEmail(text, children) {
  if (!text.trim()) return [];
  const out = [];
  const lower = text.toLowerCase();
  const childId = children[0]?.id || "";
  const t = today0();
  const wdMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };

  const nextWeekday = (target, ahead) => {
    let d = addDays(t, 1);
    for (let i = 0; i < 21; i++) { if (d.getDay() === target) { if (!ahead || daysUntil(iso(d)) >= 7) return iso(d); } d = addDays(d, 1); }
    return iso(addDays(t, 7));
  };

  const sentences = text.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);

  for (const s of sentences) {
    const sl = s.toLowerCase();
    let date = null;
    // "next Friday" / weekday
    const wkMatch = sl.match(/\b(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
    if (wkMatch) date = nextWeekday(wdMap[wkMatch[2]], !!wkMatch[1]);
    // "24th" / "3rd June"
    const domMatch = sl.match(/\b(\d{1,2})(st|nd|rd|th)\b/);
    if (!date && domMatch) {
      const day = +domMatch[1]; const cur = new Date(t);
      let dd = new Date(cur.getFullYear(), cur.getMonth(), day);
      if (midnight(dd) < t) dd = new Date(cur.getFullYear(), cur.getMonth() + 1, day);
      date = iso(dd);
    }
    if (sl.includes("tomorrow")) date = iso(addDays(t, 1));

    const amt = s.match(/£\s?(\d+(?:\.\d{1,2})?)/);
    const isPay = /pay|cost|£|fee|deposit/.test(sl);
    const isForm = /form|consent|permission|return|sign/.test(sl);
    const isDress = /dress|costume|world book day|pyjama|pajama|wear|character/.test(sl);

    if (!date && !amt) continue;

    let type = "event";
    if (isPay || amt) type = "payment";
    else if (isForm) type = "form";

    // a short label from the sentence
    let label = s.replace(/\s+/g, " ").trim();
    if (label.length > 52) label = label.slice(0, 50).trim() + "…";

    out.push({
      id: uid("rev"), type, label, date: date || iso(addDays(t, 7)),
      amount: amt ? +amt[1] : undefined, childId, owner: null, dressup: isDress,
    });
  }
  // de-dupe near-identical
  const seen = new Set();
  return out.filter((o) => { const k = o.type + o.label.slice(0, 20); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 6);
}

/* ============================================================
   Layout shell styles + global CSS
   ============================================================ */
const shell = {
  page: { minHeight: "100vh", background: T.bg, display: "flex", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif", color: T.ink, WebkitFontSmoothing: "antialiased" },
  frame: { width: "100%", maxWidth: 460, minHeight: "100vh", background: T.bg, position: "relative", display: "flex", flexDirection: "column", boxShadow: "0 0 40px rgba(20,40,38,0.06)" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 10px", position: "sticky", top: 0, background: "rgba(238,242,240,0.9)", backdropFilter: "blur(8px)", zIndex: 10 },
  main: { flex: 1, padding: "4px 16px 96px", overflowY: "auto" },
  nav: { position: "sticky", bottom: 0, display: "flex", background: "rgba(255,255,255,0.94)", backdropFilter: "blur(10px)", borderTop: `1px solid ${T.line}`, zIndex: 20 },
  fab: { position: "fixed", bottom: 74, right: "max(18px, calc(50vw - 230px + 18px))", width: 56, height: 56, borderRadius: 999, background: T.brand, color: "#fff", border: "none", boxShadow: "0 6px 18px rgba(19,122,102,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30 },
  toast: { position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: T.ink, color: "#fff", padding: "11px 18px", borderRadius: 999, font: "600 13.5px Inter", zIndex: 80, boxShadow: "0 6px 20px rgba(0,0,0,0.25)" },
};

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@400..800&display=swap');
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      body { margin: 0; }
      input, textarea, button, select { font-family: Inter, system-ui, sans-serif; }
      input:focus, textarea:focus { border-color: ${T.brand} !important; box-shadow: 0 0 0 3px ${T.brandSoft}; }
      .fa-btn:active { transform: scale(0.97); }
      .fa-fab:active { transform: scale(0.93); }
      .fa-iconbtn:hover, .fa-owner:hover, .fa-check:hover { filter: brightness(0.97); }
      .fa-btn:hover { filter: brightness(1.04); }
      *:focus-visible { outline: 2.5px solid ${T.brand}; outline-offset: 2px; }
      .fa-overlay { animation: faFade .18s ease; }
      .fa-sheet { animation: faUp .26s cubic-bezier(.22,1,.36,1); }
      .fa-toast { animation: faUp .2s ease; }
      @keyframes faFade { from { opacity: 0 } to { opacity: 1 } }
      @keyframes faUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      .fa-spin { animation: faSpin 1.4s linear infinite; }
      @keyframes faSpin { to { transform: rotate(360deg) } }
      main::-webkit-scrollbar { width: 0; }
      @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
    `}</style>
  );
}
