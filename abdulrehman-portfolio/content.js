// content.js — loads editable text from Supabase into any element
// marked with data-content-key. If Supabase isn't configured yet, or the
// fetch fails, the page just keeps whatever text is already hardcoded in
// the HTML, so the site never breaks because of this.

const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";

(function () {
  if (SUPABASE_URL.indexOf("PASTE_YOUR") === 0) return; // not set up yet

  fetch(SUPABASE_URL + "/rest/v1/site_content?select=key,value", {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY
    }
  })
    .then(function (res) { return res.json(); })
    .then(function (rows) {
      if (!Array.isArray(rows)) return;
      const map = {};
      rows.forEach(function (row) { map[row.key] = row.value; });

      document.querySelectorAll("[data-content-key]").forEach(function (el) {
        const key = el.getAttribute("data-content-key");
        if (map[key] !== undefined) el.textContent = map[key];
      });
    })
    .catch(function () {
      // silent — hardcoded HTML text stays as the fallback
    });
})();
