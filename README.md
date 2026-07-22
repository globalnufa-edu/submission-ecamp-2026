# Global Voice Camp 2026 — Registration Site

A playful, passport-themed landing page + registration form for Global Voice Camp.

## Files

```
global-voice-camp/
├── index.html      — landing page + registration form
├── faq.html         — interactive FAQ page
├── css/
│   ├── style.css    — shared styles (colors, fonts, nav, animations, responsive rules)
│   └── faq.css       — FAQ-page-specific styles
├── js/
│   ├── script.js     — countdown, multi-step form, interactive tribe map, submission
│   └── faq.js         — FAQ search, category filter, accordion
└── images/           — put your real camp photos here
```

HTML pages stay in the root folder on purpose — that keeps clean URLs like
`yoursite.com/faq.html` when deployed as a static site.

## 1. Deploy to Vercel

**Option A — GitHub (recommended):**
1. Push this whole folder to a new GitHub repo
2. Go to vercel.com → New Project → Import from GitHub → select the repo
3. Vercel auto-detects it as a static site and deploys — done
4. Every future `git push` auto-redeploys

**Option B — Instant deploy without Git:**
1. Install the CLI once: `npm i -g vercel`
2. From inside this folder, run: `vercel --prod`
3. Follow the prompts — you'll get a live URL

## 2. Connect the form to collect real registrations

Open `js/script.js` and find the `CONFIG` object near the top. Pick ONE option:

**Option A — Google Form** (simplest, no code)
1. Create a Google Form with matching fields (Full Name, School, Grade, Age, Gender, Parent Name, Parent Phone, Parent Email, Health Notes, Tribe Preference)
2. In the Form, click ⋮ → **Get pre-filled link**, fill dummy answers, click **Get Link**, and copy it
3. The link contains `entry.XXXXXXXXX=value` for each field — match those IDs into `CONFIG.formEntryMap`
4. Copy your Form ID from the URL and set `CONFIG.formActionUrl` to:
   `https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse`

**Option B — Google Apps Script + Sheet** (more control, needs a bit of setup)
1. Create a Google Sheet with a tab named `Registrations`
2. Extensions → Apps Script, paste:
   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registrations');
     var data = JSON.parse(e.postData.contents);
     sheet.appendRow([data.submittedAt, data.fullName, data.school, data.grade, data.age, data.gender, data.parentName, data.parentPhone, data.parentEmail, data.tribePref, data.medical]);
     return ContentService.createTextOutput(JSON.stringify({status:'success'})).setMimeType(ContentService.MimeType.JSON);
   }
   ```
3. Deploy → New deployment → Web app → Execute as **Me**, Access: **Anyone**
4. Copy the deployed URL into `CONFIG.appsScriptUrl`

If `formActionUrl` is filled in, it's used automatically. Leave it empty to fall back to `appsScriptUrl`.

## 3. Add your own photos & video

In `index.html`, find the `<!-- GALLERY / FIELD NOTES -->` section:
- Replace each `src="https://placehold.co/..."` with your real photo path, e.g. `src="images/day1.jpg"` after dropping the file into the `images/` folder
- Replace `data-video="REPLACE_WITH_YOUTUBE_ID"` with your real YouTube video ID

## 4. Adjust dates & pricing

- Early bird countdown target: `CONFIG.earlyBirdDeadline` in `js/script.js`
- Camp dates and pricing: search `index.html` for "Dec 18–21, 2026" and "Rp 3,150,000" / "Rp 3,750,000"

## 5. Before going live

- Replace the placeholder WhatsApp number in `faq.html` (`wa.me/6281234567890`) with your real number
