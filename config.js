window.ZW_CONFIG = {
  firebase: {
    apiKey: "AIzaSyBsF0eAzCdflVh76PKi2_oAoCecIza3als",
    authDomain: "zenwice.firebaseapp.com",
    projectId: "zenwice",
    appId: "1:375125280411:web:4e0c4b0a212ea4bbcba83e"
  },
  owners: ["vivek@zenwice.com"],
  allowedDomain: ""
};
```[span_9](start_span)[span_9](end_span)[span_10](start_span)[span_10](end_span)

---

### 2. Hard Refresh Your Browser (Cache Issue)
Browsers often cache old JavaScript files (`config.js`)[span_11](start_span)[span_11](end_span)[span_12](start_span)[span_12](end_span). If you pushed the updated file but didn't force-refresh:
* Open your app in the browser.
* Press **`Ctrl + F5`** (or **`Ctrl + Shift + R`**) on Windows to clear the cache for that page.
* Alternatively, test opening the site in an **Incognito / Private window**.

---

### 3. Verify the Push to GitHub
If you edited `config.js` locally in your `Downloads` folder, double-check that you actually committed and pushed the saved file to GitHub[span_13](start_span)[span_13](end_span)[span_14](start_span)[span_14](end_span):
1. Go to your GitHub repository in your browser.
2. Click on `config.js`[span_15](start_span)[span_15](end_span).
3. Check if the file on GitHub shows `"AIzaSyBsF0eAzCdflVh76PKi2_oAoCecIza3als"`[span_16](start_span)[span_16](end_span). If it still says `"PASTE_API_KEY"`, edit and save it directly on GitHub[span_17](start_span)[span_17](end_span).

---

Once `config.js` is updated on GitHub and Vercel finishes redeploying, hit **`Ctrl + F5`** on your login screen and click **Create account** again[span_18](start_span)[span_18](end_span)!
