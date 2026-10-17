# Zenwice Tracker — deploy on your own domain

The tracker is one web page. On your own hosting it uses **Firebase** (free Google service) for
logins and the live shared database. Your hosting only serves the files.

Files in this folder:

| File | What it is |
|---|---|
| `index.html` | The tracker |
| `config.js` | Your Firebase keys and the Boss email (you edit this) |
| `zw-firebase.js` | Login screen + connection to Firebase (don't edit) |
| `firestore.rules` | Security rules: who can read and write what (paste into Firebase) |

## 1. Create the Firebase project (10 minutes, free)

1. Go to https://console.firebase.google.com and sign in with your Google account.
2. **Add project** → name it `zenwice-tracker` → you can turn Google Analytics off → **Create**.
3. Left menu **Build → Authentication → Get started**.
   - Sign-in method → enable **Email/Password**.
   - Enable **Google** too if you want "Continue with Google".
4. Left menu **Build → Firestore Database → Create database**.
   - Location: **asia-southeast1 (Singapore)**.
   - Start in **production mode**.
5. In Firestore open the **Rules** tab and replace everything with the contents of `firestore.rules`.
   - Change `vivek@zenwice.com` to your Boss email if different.
   - Click **Publish**.
6. **Project settings** (gear icon) → **Your apps** → click the web icon `</>`.
   - Register the app as "Zenwice Tracker" (no Firebase Hosting needed).
   - Copy the `firebaseConfig` values.

## 2. Fill in config.js

Open `config.js` and paste `apiKey`, `authDomain`, `projectId` and `appId`.

- **`owners`** must be the Boss email, the same one as in the rules.
- **`allowedDomain`**: optionally set it to `zenwice.com` so only company emails can create accounts.

## 3. Upload to your hosting

1. In your hosting panel (cPanel or similar), create a subdomain, for example **tracker.zenwice.com**.
2. Open **File Manager**, go to that subdomain's folder, and upload `index.html`, `config.js` and `zw-firebase.js`.
3. Make sure the subdomain has **SSL (https)**. In cPanel, use SSL/TLS Status → Run AutoSSL. Logins don't work on plain http.
4. Back in Firebase: **Authentication → Settings → Authorized domains → Add domain** → `tracker.zenwice.com`.

Open https://tracker.zenwice.com. You should see the Zenwice sign-in screen.

## 4. First login and the team

1. **Boss:** click *Create an account* with the Boss email. You get every control.
2. **Team tab** (People & team → Team):
   - Add Lead, Manager and Employees with their level.
   - Click **Save team**.
3. **Each person:**
   - Opens the link → *Create an account* → picks their name → **This is me**.
4. **Boss:** approves each request under **Team → Login requests** (the bell shows them too).

## 5. Testing all 4 roles yourself

- **Quick check:** as Boss, use **"View as"** at the top of every page. Pick the Lead, Manager or Employee to see exactly their screens (read-only).
- **Real test:** create 4 accounts (for example `vivek@`, `lead@`, `manager@`, `employee@zenwice.com`) and open each in its own window:
  - Chrome profile 1 → Boss
  - Chrome profile 2 (or Incognito) → Lead
  - Edge or Firefox → Manager
  - Your phone → Employee

  Each window stays signed in as its own person, and changes show up in the others within a second.

## Good to know

- **Free plan limits:** about 50,000 reads and 20,000 writes per day, plus 1 GB of storage. That is plenty for a 10–20 person team.
- **Data from the Claude version** does not move over automatically; the self-hosted tracker starts empty.
- **Updates:** replace `index.html` on the hosting. Data lives in Firebase, so nothing is lost.
- **Security:** people who are not approved by the Boss can sign up but see nothing except the "pick your name" screen.
