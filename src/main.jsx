import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Plus, Trash2, GripVertical, ExternalLink, LogOut, Save, Link2, Palette, UserRound } from 'lucide-react';
import './styles.css';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const firebaseReady = Object.values(firebaseConfig).every(Boolean);
const app = firebaseReady ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

const starter = [{ id: crypto.randomUUID(), title: 'My website', url: 'https://example.com' }, { id: crypto.randomUUID(), title: 'Instagram', url: 'https://instagram.com' }];
const defaults = { displayName: 'Your Name', bio: 'Creator · Designer · Developer', username: '', background: '#0b0d12', button: '#ffffff', buttonText: '#111318', font: 'Inter', radius: 16 };

async function usernameAvailable(username, uid) {
  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9_\.\-]{3,30}$/.test(normalized)) return false;
  const snap = await getDoc(doc(db, 'usernames', normalized));
  return !snap.exists() || snap.data().uid === uid;
}

async function saveProfile(uid, profile, links) {
  const username = profile.username.trim().toLowerCase();
  if (!(await usernameAvailable(username, uid))) throw new Error('Dieser Benutzername ist bereits vergeben.');
  await setDoc(doc(db, 'usernames', username), { uid });
  await setDoc(doc(db, 'profiles', uid), { ...profile, username, links, updatedAt: Date.now() });
}

function AuthPanel({ onDone }) {
  const [mode, setMode] = useState('login'); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const submit = async e => { e.preventDefault(); setError(''); try { if (mode === 'login') await signInWithEmailAndPassword(auth, email, password); else await createUserWithEmailAndPassword(auth, email, password); onDone(); } catch (x) { setError(x.message); } };
  return <div className="auth-wrap"><div className="auth-card"><div className="brand-mark">L</div><h1>{mode === 'login' ? 'Willkommen zurück' : 'Account erstellen'}</h1><p className="muted">Erstelle deine persönliche Link-Seite.</p><button className="google" onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>Mit Google fortfahren</button><div className="divider"><span>oder</span></div><form onSubmit={submit}><input type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} required /><input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} minLength="6" required /><button className="primary" type="submit">{mode === 'login' ? 'Anmelden' : 'Registrieren'}</button></form>{error && <p className="error">{error}</p>}<button className="text-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Noch kein Account? Registrieren' : 'Bereits registriert? Anmelden'}</button></div></div>;
}

function Editor() {
  const [user, setUser] = useState(null); const [profile, setProfile] = useState(defaults); const [links, setLinks] = useState(starter); const [saved, setSaved] = useState(false); const [loading, setLoading] = useState(true); const navigate = useNavigate();
  useEffect(() => onAuthStateChanged(auth, async u => { setUser(u); if (!u) { setLoading(false); return; } const snap = await getDoc(doc(db, 'profiles', u.uid)); if (snap.exists()) { const d = snap.data(); setProfile({ ...defaults, ...d }); setLinks(d.links || []); } setLoading(false); }), []);
  if (loading) return <div className="center">Lädt …</div>; if (!user) return <AuthPanel onDone={() => {}} />;
  const updateLink = (id, key, value) => setLinks(ls => ls.map(l => l.id === id ? { ...l, [key]: value } : l));
  const save = async () => { try { await saveProfile(user.uid, profile, links); setSaved(true); setTimeout(() => setSaved(false), 1800); } catch (e) { alert(e.message); } };
  return <div className="app"><header><div className="logo">Linkspace</div><div className="header-actions"><Link className="preview-link" to={profile.username ? `/${profile.username}` : '#'} target="_blank"><ExternalLink size={15}/> Vorschau</Link><button className="save" onClick={save}><Save size={15}/> {saved ? 'Gespeichert' : 'Speichern'}</button><button className="icon-btn" onClick={() => signOut(auth)} title="Abmelden"><LogOut size={16}/></button></div></header><main className="workspace"><section className="controls"><div className="section-title"><div><span className="eyebrow">WORKSPACE</span><h2>Deine Seite</h2></div></div><div className="panel"><h3><UserRound size={16}/> Profil</h3><label>Anzeigename<input value={profile.displayName} onChange={e => setProfile({ ...profile, displayName: e.target.value })}/></label><label>Bio<textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })}/></label><label>Benutzername<div className="username-input"><span>/</span><input value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })} placeholder="deinname"/></div></label></div><div className="panel"><div className="panel-head"><h3><Link2 size={16}/> Links</h3><button className="add" onClick={() => setLinks([...links, { id: crypto.randomUUID(), title: 'Neuer Link', url: 'https://' }])}><Plus size={15}/> Link hinzufügen</button></div><div className="link-editor">{links.map((l, i) => <div className="link-row" key={l.id}><GripVertical className="grip" size={17}/><div className="link-fields"><input value={l.title} onChange={e => updateLink(l.id, 'title', e.target.value)}/><input value={l.url} onChange={e => updateLink(l.id, 'url', e.target.value)} placeholder="https://…"/></div><button className="danger" onClick={() => setLinks(links.filter(x => x.id !== l.id))}><Trash2 size={15}/></button></div>)}</div></div><div className="panel"><h3><Palette size={16}/> Erscheinungsbild</h3><div className="color-grid"><label>Hintergrund<input type="color" value={profile.background} onChange={e => setProfile({...profile, background:e.target.value})}/></label><label>Buttons<input type="color" value={profile.button} onChange={e => setProfile({...profile, button:e.target.value})}/></label></div><label>Schrift<select value={profile.font} onChange={e => setProfile({...profile,font:e.target.value})}><option>Inter</option><option>system-ui</option><option>Georgia</option></select></label></div></section><section className="preview-area"><div className="preview-label">LIVE PREVIEW</div><div className="phone"><Profile profile={profile} links={links} editor/></div></section></main></div>;
}

function Profile({ profile, links, editor=false }) { return <div className="profile" style={{ background: profile.background, fontFamily: profile.font }}><div className="profile-content"><div className="avatar">{(profile.displayName || 'Y').slice(0,1).toUpperCase()}</div><h1>{profile.displayName || 'Your Name'}</h1><p>{profile.bio}</p><div className="public-links">{links.map(l => <a key={l.id} href={l.url} target="_blank" rel="noreferrer" style={{background: profile.button, color: profile.buttonText, borderRadius: profile.radius}}>{l.title}<ExternalLink size={14}/></a>)}</div><span className="powered">Linkspace</span></div></div> }

function PublicProfile() { const { username } = useParams(); const [data, setData] = useState(null); const [missing,setMissing] = useState(false); useEffect(() => { (async()=>{ if(!db)return; const s=await getDoc(doc(db,'usernames',username.toLowerCase())); if(!s.exists()){setMissing(true);return;} const p=await getDoc(doc(db,'profiles',s.data().uid)); setData(p.exists()?p.data():null); })(); },[username]); if(missing) return <div className="center">Profil nicht gefunden.</div>; if(!data) return <div className="center">Lädt …</div>; return <Profile profile={{...defaults,...data}} links={data.links||[]} /> }
function App(){return <Routes><Route path="/" element={<Editor/>}/><Route path="/:username" element={<PublicProfile/>}/></Routes>}
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
