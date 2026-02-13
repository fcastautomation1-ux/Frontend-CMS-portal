# Permission Policy (Least Privilege)

This project now uses a **lazy authorization** approach:
- No forced permission request at login.
- Users are prompted only when they use a feature that needs that scope.

## Current OAuth Scopes (and why they are needed)

Defined in `appsscript.json`:

1. `https://www.googleapis.com/auth/script.external_request`
   - Needed for Supabase and OAuth HTTP calls (`UrlFetchApp`).

2. `https://www.googleapis.com/auth/drive`
   - Needed for Drive module: browse, create, move, delete, sharing, search (`DriveApp`).

3. `https://www.googleapis.com/auth/spreadsheets`
   - Needed for spreadsheet create/open operations (`SpreadsheetApp`).

4. `https://www.googleapis.com/auth/documents`
   - Needed for Google Docs creation (`DocumentApp`).

5. `https://www.googleapis.com/auth/presentations`
   - Needed for Slides creation (`SlidesApp`).

6. `https://www.googleapis.com/auth/script.send_mail`
   - Minimum mail scope for notification emails (`MailApp`).

## Why users think permissions are "too much"

Google groups sensitive scopes on consent screen (especially Drive), so the message can look broad.
This is expected when the app supports Drive management features.

## How to reduce permissions further

You can only reduce scopes by reducing features:

- Remove email notifications -> remove `script.send_mail`.
- Remove Docs/Slides creation -> remove `documents` / `presentations`.
- Remove spreadsheet creation/open -> remove `spreadsheets`.
- Remove Drive manager features -> remove `drive`.

## Best practice for production

- Keep `executeAs` as `USER_DEPLOYING` if you want centralized authorization.
- Restrict web app access (avoid broad public access unless required).
- Maintain a short "Why we need permissions" note for users/admin reviewers.
