# Admin portal setup (edit site text without touching code)

## 1. Get a Supabase project
If you don't already have one for this: go to supabase.com → New project.
(You can reuse an existing one — it just creates two new tables.)

## 2. Run the SQL
1. In your Supabase project, open **SQL Editor → New query**.
2. Paste the contents of `supabase-setup.sql` (in this folder).
3. Before running, change the password on this line:
   ```sql
   values (1, crypt('change-this-password', gen_salt('bf')))
   ```
   to whatever you want your admin password to be.
4. Run it.

## 3. Get your API keys
In Supabase: **Project Settings → API**. You need:
- **Project URL** (looks like `https://xxxxx.supabase.co`)
- **anon public** key (long string starting with `eyJ...`)

## 4. Paste them into the site
Open these two files and replace the placeholders in both:

**`content.js`** (loads text into the live pages):
```javascript
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";
```

**`admin.html`** (the editor, near the bottom `<script>` tag):
```javascript
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";
```

Redeploy the site. Go to `yourdomain.com/admin.html`, log in with the password you set, edit, save.

## What's editable
Hero paragraph, all 3 about paragraphs, the services intro, and all 4 service titles/descriptions. That's it for now — headings with rotating words or icons weren't wired up, since swapping those safely means touching HTML structure, not just text.

## On the security model
You chose a simple shared password over full login, which is the right call for a solo portfolio — but worth understanding exactly what that buys you:
- The **anon key is public** — anyone can view it in your page source. That's normal for Supabase and fine, because:
- Direct writes to `site_content` are blocked for anon at the database level (no RLS policy allows it).
- The **only** way to change content is through the `admin_update_content` function, which checks your password against a hash stored in a table anon can't even read.
- So someone with your anon key can read your site text (already public anyway) but can't silently rewrite it — they'd need the actual password, same as your admin page.
- This is meaningfully weaker than real auth (no sessions, no rate-limiting on password attempts, password sent over the wire on each save) — acceptable for editing your own portfolio copy, not something to reuse for anything with real stakes.

## Adding more editable fields later
Add `data-content-key="whatever_key"` to any element in the HTML, add a matching row to `site_content` (via SQL or through a new field you add to `admin.html`), and it'll pick it up automatically.
