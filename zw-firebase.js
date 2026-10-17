/* Zenwice Tracker — runs the app on Firebase (login + live database) instead of Claude.
   It provides the same window.claude.use('db') / use('user') interface the app was written for. */
(function(){
  const C = window.ZW_CONFIG || {};
  firebase.initializeApp(C.firebase);
  const auth = firebase.auth(), fs = firebase.firestore();
  const owners = (C.owners || []).map(x => String(x).toLowerCase());
  const isOwnerU = u => !!u && owners.includes(String(u.email || '').toLowerCase());
  let resolveUser; const userReady = new Promise(r => resolveUser = r);
  const clean = d => JSON.parse(JSON.stringify(d === undefined ? null : d));
  const lvl = m => m.level || ((m.roles||[]).includes('LEAD') ? 'lead' : (m.roles||[]).includes('MGR') ? 'manager' : 'employee');

  /* ---------- login screen ---------- */
  const css = `#zwLogin{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#f4f6fb;font-family:Figtree,system-ui,sans-serif;padding:16px}
  #zwLogin .bx{width:100%;max-width:380px;background:#fff;border:1px solid #e3e8f2;border-radius:16px;padding:28px;box-shadow:0 12px 40px rgba(20,30,60,.08);display:flex;flex-direction:column;gap:12px}
  #zwLogin h1{margin:0;font-size:22px}#zwLogin p{margin:0;color:#5f6b80;font-size:13.5px}
  #zwLogin label{font-size:12px;font-weight:600;color:#5f6b80;display:flex;flex-direction:column;gap:5px}
  #zwLogin input{font:inherit;font-size:14px;padding:10px 12px;border:1px solid #d3ddf2;border-radius:9px;outline:none}#zwLogin input:focus{border-color:#2563eb;box-shadow:0 0 0 3px #e8efff}
  #zwLogin button{font:inherit;font-weight:600;font-size:14px;padding:11px;border-radius:9px;border:1px solid #2563eb;background:#2563eb;color:#fff;cursor:pointer}
  #zwLogin button.alt{background:#fff;color:#2563eb;border-color:#d3ddf2}#zwLogin .lnk{background:none;border:none;color:#2563eb;padding:0;font-weight:500;font-size:13px;text-align:left}
  #zwLogin .err{color:#b91c1c;font-size:13px;min-height:1em}#zwLogin .row{display:flex;justify-content:space-between;gap:8px}
  #zwLogin .logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px}
  #zwOut{margin-left:8px}`;
  const logo = '<svg viewBox="0 0 2000 1201" width="40" height="24"><path fill="#5059ad" d="M0 0H1037L461 943H1165V1201H40L573 261H0Z"/><path fill="#5059ad" d="M582 914L1102 0L1723 736V15H1999V1201H1770L1139 439L860 914Z"/></svg>';
  let mode = 'in';
  function loginHTML(){ return `<form class="bx" id="zwForm"><div class="logo">${logo}Zenwice</div>
    <h1>${mode==='in'?'Sign in':mode==='up'?'Create your account':'Reset password'}</h1>
    <p>${mode==='in'?'Use the email your account was created with.':mode==='up'?'After signing up, pick your name and the Boss approves you once.':'We will email you a reset link.'}</p>
    ${mode==='up'?'<label>Your name<input id="zwName" autocomplete="name" required></label>':''}
    <label>Email<input id="zwEmail" type="email" autocomplete="email" required></label>
    ${mode!=='reset'?`<label>Password<input id="zwPass" type="password" autocomplete="${mode==='up'?'new-password':'current-password'}" minlength="6" required></label>`:''}
    <div class="err" id="zwErr"></div>
    <button type="submit">${mode==='in'?'Sign in':mode==='up'?'Create account':'Send reset link'}</button>
    <button type="button" class="alt" id="zwGoogle">Continue with Google</button>
    <div class="row">${mode!=='in'?'<button type="button" class="lnk" data-m="in">Back to sign in</button>':'<button type="button" class="lnk" data-m="up">Create an account</button><button type="button" class="lnk" data-m="reset">Forgot password?</button>'}</div></form>`; }
  function showLogin(){ let el=document.getElementById('zwLogin'); if(!el){ el=document.createElement('div'); el.id='zwLogin'; document.body.appendChild(el); } el.innerHTML=loginHTML(); el.hidden=false; }
  function hideLogin(){ const el=document.getElementById('zwLogin'); if(el) el.hidden=true; }
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  const domOk = e => !C.allowedDomain || String(e).toLowerCase().endsWith('@'+String(C.allowedDomain).toLowerCase().replace(/^@/,''));
  const msg = e => ({'auth/invalid-credential':'Email or password is wrong.','auth/wrong-password':'Email or password is wrong.','auth/user-not-found':'No account with that email. Create one first.','auth/email-already-in-use':'That email already has an account. Sign in instead.','auth/weak-password':'Use at least 6 characters.','auth/invalid-email':'That email address looks wrong.','auth/popup-closed-by-user':'Google sign-in was closed.'}[e && e.code] || (e && e.message) || 'Something went wrong.');
  document.addEventListener('click', async e => {
    const m = e.target.closest('#zwLogin [data-m]'); if (m) { mode = m.dataset.m; showLogin(); return; }
    if (e.target.id === 'zwGoogle') { const er=document.getElementById('zwErr'); try { const r = await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); if (!domOk(r.user.email) && !isOwnerU(r.user)) { await auth.signOut(); er.textContent='Only @'+C.allowedDomain+' emails can sign in.'; } } catch (x) { er.textContent = msg(x); } }
    if (e.target.id === 'zwOut') { await auth.signOut(); location.reload(); }
  });
  document.addEventListener('submit', async e => {
    if (e.target.id !== 'zwForm') return; e.preventDefault();
    const v = id => (document.getElementById(id)?.value || '').trim(); const er = document.getElementById('zwErr'); er.textContent = '';
    try {
      if (mode === 'reset') { await auth.sendPasswordResetEmail(v('zwEmail')); er.style.color='#15803d'; er.textContent='Reset link sent. Check your inbox.'; return; }
      if (mode === 'up') { if (!domOk(v('zwEmail'))) { er.textContent='Use your @'+C.allowedDomain+' email.'; return; } const r = await auth.createUserWithEmailAndPassword(v('zwEmail'), v('zwPass')); await r.user.updateProfile({ displayName: v('zwName') }); await fs.doc('people/'+r.user.uid).set({ name: v('zwName'), email: r.user.email, at: new Date().toISOString() }, { merge: true }); }
      else await auth.signInWithEmailAndPassword(v('zwEmail'), v('zwPass'));
    } catch (x) { er.textContent = msg(x); }
  });

  let started = false;
  auth.onAuthStateChanged(async u => {
    if (!u) { if (started) location.reload(); else showLogin(); return; }
    hideLogin();
    try { await fs.doc('people/'+u.uid).set({ name: u.displayName || u.email.split('@')[0], email: u.email, at: new Date().toISOString() }, { merge: true }); } catch (e) {}
    if (!started) { started = true; resolveUser(u); addSignOut(u); }
  });
  function addSignOut(u){ const put=()=>{ const tb=document.querySelector('.topbar'); if(!tb||document.getElementById('zwOut')) return; const b=document.createElement('button'); b.id='zwOut'; b.className='btn small ghost'; b.title=u.email; b.textContent='Sign out'; tb.appendChild(b); }; put(); setInterval(put, 2000); }

  /* ---------- roles: owner's team saves are mirrored to roles/{uid} so the security rules can check levels ---------- */
  async function syncRoles(members){
    const want = {}; for (const m of members || []) if (m.uid) want[m.uid] = { level: lvl(m), name: m.name };
    const cur = await fs.collection('roles').get(); const b = fs.batch();
    cur.docs.forEach(d => { if (!want[d.id]) b.delete(d.ref); });
    Object.entries(want).forEach(([uid, v]) => b.set(fs.doc('roles/'+uid), v));
    await b.commit();
  }

  /* ---------- the db interface the app expects ---------- */
  const wrapSnapDoc = s => ({ exists: s.exists, id: s.id, data: () => s.data() });
  const db = {
    doc: path => { const r = fs.doc(path); return {
      onSnapshot: (next, err) => r.onSnapshot(s => next(wrapSnapDoc(s)), err),
      get: async () => wrapSnapDoc(await r.get()),
      set: async data => { await r.set(clean(data)); if (path === 'config/team' && isOwnerU(auth.currentUser)) await syncRoles((data || {}).members); },
      update: data => r.set(clean(data), { merge: true }),
      delete: () => r.delete()
    }; },
    collection: path => ({ onSnapshot: (next, err) => fs.collection(path).onSnapshot(s => next({ docs: s.docs.map(wrapSnapDoc) }), err) })
  };
  const user = {
    id: async () => (await userReady).uid,
    can: async () => true,
    isOwner: async () => isOwnerU(await userReady),
    canEdit: async () => { const u = await userReady; if (isOwnerU(u)) return true; try { const r = await fs.doc('roles/'+u.uid).get(); return r.exists && ['manager','lead','super'].includes(r.data().level); } catch (e) { return false; } },
    name: async () => { const u = await userReady; return u.displayName || u.email; },
    profiles: async ids => { const out = {}; await Promise.all([].concat(ids).map(async id => { try { const d = await fs.doc('people/'+id).get(); out[id] = { id, name: d.exists ? (d.data().name || d.data().email || '') : '' }; } catch (e) { out[id] = { id, name: '' }; } })); return out; },
    search: async q => { const s = await fs.collection('people').get(); q = String(q || '').toLowerCase(); return s.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => !q || (p.name + ' ' + p.email).toLowerCase().includes(q)).slice(0, 8); }
  };
  window.claude = { use: async name => { await userReady; return name === 'db' ? db : name === 'user' ? user : null; } };
})();
