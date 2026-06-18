import { supabase } from "./supabaseClient";

/*
 * store.js — all persistence + auth the app needs, behind one small surface.
 *
 *  Cloud mode (Supabase keys set):
 *    • Users sign in with email + password (Supabase Auth).
 *    • Each household is one row in `households`; you only have access if you're
 *      a member (enforced by Row Level Security — see supabase-schema.sql).
 *    • Supabase Realtime streams a household's changes to every member's device.
 *
 *  Local mode (no keys):
 *    • No accounts; data lives in localStorage on this one device. Lets the app
 *      run instantly for development. Nothing syncs.
 *
 * State is stored as one JSON blob per household (last-write-wins). Fine for a
 * two-person household; see README "Hardening" for the per-table upgrade.
 */

const HH_KEY = "familyAdmin:household";
const LS_PREFIX = "familyAdmin:data:";
const SAVE_DEBOUNCE = 400;
const clientId = Math.random().toString(36).slice(2); // ignore our own realtime echoes
let saveTimer = null;

export const store = {
  isCloud() { return !!supabase; },
  needsAuth() { return !!supabase; },

  /* ---- auth ---- */
  async getUser() {
    if (!supabase) return { id: "local", email: "this device" };
    const { data } = await supabase.auth.getUser();
    return data.user || null;
  },
  async uid() {
    if (!supabase) return "local";
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  },
  onAuth(cb) {
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session?.user || null));
    return () => { try { data.subscription.unsubscribe(); } catch { /* ignore */ } };
  },
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // session is non-null only if email confirmation is off
    return { user: data.user, needsConfirm: !data.session };
  },
  async signOut() {
    if (supabase) { try { await supabase.auth.signOut(); } catch { /* ignore */ } }
  },

  /* ---- household code (kept on this device) ---- */
  getHouseholdCode() { try { return localStorage.getItem(HH_KEY); } catch { return null; } },
  setHouseholdCode(code) { try { localStorage.setItem(HH_KEY, code); } catch { /* ignore */ } },
  clearHouseholdCode() { try { localStorage.removeItem(HH_KEY); } catch { /* ignore */ } },

  /* ---- create a brand-new household (and join it as first member) ---- */
  async createHousehold(code, seed) {
    const fresh = seed();
    if (supabase) {
      const { error: e1 } = await supabase.from("households").insert({
        id: code, state: fresh, writer: clientId, updated_at: new Date().toISOString(),
      });
      if (e1) throw new Error(e1.message.includes("duplicate") ? "That code is taken — try another." : e1.message);
      const userId = await this.uid();
      const { error: e2 } = await supabase.from("household_members").insert({ household_id: code, user_id: userId });
      if (e2) throw new Error(e2.message);
      return fresh;
    }
    try { localStorage.setItem(LS_PREFIX + code, JSON.stringify(fresh)); } catch { /* ignore */ }
    return fresh;
  },

  /* ---- join an existing household by code ---- */
  async joinHousehold(code) {
    if (supabase) {
      // adding our membership row; the FK means a wrong code is rejected
      const userId = await this.uid();
      const { error } = await supabase.from("household_members").insert({ household_id: code, user_id: userId });
      if (error && !/duplicate/i.test(error.message)) {
        throw new Error(/foreign key/i.test(error.message)
          ? "No household with that code. Check it with whoever created it."
          : error.message);
      }
      const state = await this.load(code);
      if (!state) throw new Error("Couldn't load that household.");
      return state;
    }
    // local mode: nothing to join across devices — load or start fresh
    return this.load(code);
  },

  /* ---- load an existing household's state (no creation) ---- */
  async load(code) {
    if (supabase) {
      const { data, error } = await supabase
        .from("households").select("state").eq("id", code).maybeSingle();
      if (error) { console.error("load failed:", error); return null; }
      return data ? data.state : null;
    }
    try { const raw = localStorage.getItem(LS_PREFIX + code); if (raw) return JSON.parse(raw); } catch { /* ignore */ }
    return null;
  },

  /* ---- save (debounced) ---- */
  save(code, state) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      if (supabase) {
        const { error } = await supabase.from("households").update({
          state, writer: clientId, updated_at: new Date().toISOString(),
        }).eq("id", code);
        if (error) console.error("save failed:", error);
        return;
      }
      try { localStorage.setItem(LS_PREFIX + code, JSON.stringify(state)); } catch { /* ignore */ }
    }, SAVE_DEBOUNCE);
  },

  /* ---- live updates from other members' devices (cloud only) ---- */
  subscribe(code, onRemote) {
    if (!supabase) return () => {};
    const channel = supabase
      .channel("hh:" + code)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "households", filter: "id=eq." + code },
        (payload) => {
          const row = payload.new;
          if (!row || !row.state) return;
          if (row.writer === clientId) return; // our own write echoing back
          onRemote(row.state);
        })
      .subscribe();
    return () => { try { supabase.removeChannel(channel); } catch { /* ignore */ } };
  },
};
