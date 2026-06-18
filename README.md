# Family Admin

One calm, shared place for two parents to manage school admin — daily "what's needed", payments, lunches, clubs, key dates, forms, bookings, parties, and a review-first email capture. Built as a mobile-first React app.

The headline feature: **both parents share one live dataset.** When your partner marks a trip paid on their phone, it appears on yours within a second — no refresh.

---

## How sharing works (read this first)

The app stores the whole household in the cloud (Supabase) and streams changes to every connected device in real time. Each person signs into their own account, and you connect two phones to the same data using a **household code**:

1. You sign up, then **Create a new household** → it shows a code like `OAK-4271`.
2. Your partner signs up on their phone, then **Join with a code** → enters `OAK-4271`.
3. You're now both reading and writing the same data, live — and only the two of you can see it.

You can always find/copy your code later under the **More** tab → **Sharing & sync**.

**Without Supabase keys, the app still runs** — but in single-device mode (localStorage), where each phone keeps its own separate copy and nothing syncs. So to get the shared experience, do the Supabase step below.

---

## 1. Get it on GitHub

From this folder:

```bash
git init
git add .
git commit -m "Family Admin – initial version"
git branch -M main
git remote add origin https://github.com/<your-username>/family-admin.git
git push -u origin main
```

(`node_modules`, `dist`, and `.env` are gitignored, so your keys never get committed.)

## 2. Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173). It'll run in single-device mode until you add Supabase keys.

## 3. Turn on live sync + privacy (Supabase — free)

1. Create a free project at https://supabase.com.
2. In the project: **SQL Editor → New query**, paste the contents of `supabase-schema.sql`, and **Run**. This creates the `households` and `household_members` tables, enables realtime, and sets the member-only access rules (Row Level Security).
3. **Auth → Providers → Email** is on by default — that's all you need. For a smooth trial, you can turn **off** "Confirm email" (under that same Email provider) so accounts work the instant you create them. Turn it back **on** before any real launch so people must verify their address.
4. Get your keys: **Project Settings → API**. Copy the **Project URL** and the **anon public** key.
5. Locally: copy `.env.example` to `.env` and fill them in:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
6. Restart `npm run dev`. You'll now get a sign-in screen. Test the whole thing: in one browser, create an account → create a household (note the code). In a second browser (or incognito), create a *different* account → join with that code → add an item. It appears in both, live. Crucially, an account that hasn't joined the code sees nothing.

### How privacy works now
Each household's data is locked to its **members**. To read or change it you must (a) be signed into your own account, and (b) have joined that household's code. The public `anon` key on its own grants access to nothing — the database rules reject any request from a non-member. So even though the key ships in the app (as it must for any browser app), your family's data isn't exposed by it.

## 4. Deploy to your domain

Easiest is **Vercel** (Netlify is near-identical):

1. Go to https://vercel.com, **Add New → Project**, import your GitHub repo.
2. Vercel auto-detects Vite. Framework preset: **Vite**. Build command `npm run build`, output dir `dist` (defaults are correct).
3. **Environment Variables** — add the same two keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). This is essential: the `.env` file isn't deployed, so production reads them from here.
4. **Deploy.** You'll get a `*.vercel.app` URL.
5. **Your domain:** Project → **Settings → Domains → Add**, enter your domain, and follow the DNS records it gives you (add them at your registrar). It provisions HTTPS automatically.

Then just open your domain on both phones and connect them with one household code.

> Tip: on a phone, open the site and use the browser's **Add to Home Screen** to get an app-like icon.

---

## What's real vs. simulated

- **Email capture** parses pasted text with keyword/pattern matching (dates, £ amounts, form/costume words) into a review queue you confirm. It's a genuine, working extraction — just rule-based, not AI. Swapping in a model later doesn't change the review UX.
- **Calendar** lives in-app. There's no Google/iCal sync yet (that's a real integration to add later).
- Everything else (checklists, payments, lunch balances, ownership, modules) is fully functional and persisted.

## Hardening (good to know before real launch)

Auth and member-only access are now built in. A few smaller things to be aware of:

- **Email confirmation.** Turn it back on (Auth → Providers → Email → "Confirm email") before launch so people must verify their address. It's only suggested off to make the trial frictionless.
- **Joining is code-based.** Anyone with an account *and* your household code can join. For two people sharing one private code that's fine; for wider use, swap the open join for invite tokens (a one-time code you generate per invite) so a guessed household code can't let someone in.
- **Concurrency.** State is saved as one JSON blob (last-write-wins). If you find edits occasionally overwriting each other, the fix is to normalise the data into per-item tables (children, payments, events, …) so two people can edit different things simultaneously. Bigger job, not needed for a two-person trial.
- **Realtime + RLS.** Live updates run over Supabase Realtime; because you're signed in, the same member-only rules apply to the stream. If realtime ever delivers nothing, check that the `households` table is in the `supabase_realtime` publication (the schema adds it).

## Stack

Vite + React 18, lucide-react icons, Supabase (Postgres + Auth + Realtime). No CSS framework — styles are inline with a small theme object at the top of `src/App.jsx`.
