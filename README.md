# أَشْعَارِي

Static site, no build step. Upload the whole folder to Netlify (drag & drop) or any static host.

- `index.html`    page structure
- `css/style.css` all styling (light/dark themes)
- `js/theme.js`   picks light/dark from the device before first paint
- `js/config.js`  Firebase config (poems are stored in Firestore, collection `poems`)
- `js/fonts.js`   built-in scripts (khatt) list
- `js/seed.js`    the two starter poems shown while the database is empty
- `js/app.js`     the app: poems, editor, login, image download, import/export
- `js/whatsapp.js` WhatsApp button
- `firestore.rules` paste into Firebase console > Firestore > Rules > Publish (only the owner email can write)
- `fonts/`        place for your own font files

Script order in index.html matters: config, fonts, seed, then app.
