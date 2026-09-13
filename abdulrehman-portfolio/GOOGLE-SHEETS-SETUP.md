# Wiring the contact form to Google Sheets

## 1. Create the sheet
1. Make a new Google Sheet, name it whatever (e.g. "Portfolio Leads").
2. In row 1, add headers: `Timestamp | Name | Contact | Project Type | Message`

## 2. Add the Apps Script
1. In the sheet, go to **Extensions → Apps Script**.
2. Delete any starter code and paste this:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads");
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.contact || "",
    data.projectType || "",
    data.message || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Deploy → New deployment**.
4. Type: **Web app**.
5. Execute as: **Me**. Who has access: **Anyone**.
6. Click Deploy, authorize it (you'll get a Google warning since it's your own unverified script — click Advanced → Go to project).
7. Copy the **Web app URL** it gives you (ends in `/exec`).

## 3. Paste the URL into the site
Open `script.js`, find this line near the top:

```javascript
const LEAD_FORM_ENDPOINT = "PASTE_YOUR_APPS_SCRIPT_URL_HERE";
```

Replace it with your `/exec` URL. Save, redeploy the site.

## Notes
- The form submits with `mode: "no-cors"`, so the browser can't read the response — you won't get a real success/failure signal back, just "did the request go out." Good enough for a low-traffic lead form; not something to build critical logic on.
- Every time you edit the Apps Script code, you need to create a **new deployment** (or manage the existing one) for changes to take effect — editing the code alone doesn't update a live `/exec` URL.
- If leads stop showing up, the most common cause is the deployment's access got reset to "Only myself" — check Deploy → Manage deployments.
