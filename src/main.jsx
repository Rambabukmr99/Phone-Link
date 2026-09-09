import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const noLines = [
  'Are you sure? 🥺',
  'Hmm... maybe think about that again. 😌',
  "I'm starting to think you're testing me. 😂",
  'Okay okay... one more chance. 🥹',
  'The NO button is getting nervous now. 😂',
  'Be honest... YES is looking good, right? 👀'
];
const noLabels = ['NO 😭', 'Are you sure?', 'Really? 🥺', 'Think again!', 'One more chance?', "Don't break my heart 💔", 'Last chance!'];
const vibes = ['Coffee & conversations', 'Food & fun', 'Movie date', 'Long walk & talks', 'Ice cream adventure', 'Games & chaos', 'Surprise me'];
const today = new Date();
const minDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

function App() {
  const [step, setStep] = useState('hero');
  const [noCount, setNoCount] = useState(0);
  const [compatibility, setCompatibility] = useState(0);
  const [details, setDetails] = useState({ date: '', time: '', location: '', dateType: '' });
  const [showNoModal, setShowNoModal] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (key, value) => setDetails((current) => ({ ...current, [key]: value }));
  const sayYes = () => {
    setStep('compatibility');
    let value = 0;
    const timer = setInterval(() => { value += 5; setCompatibility(value); if (value >= 100) { clearInterval(timer); setTimeout(() => setStep('date'), 500); } }, 55);
  };
  const sayNo = () => { if (noCount >= 6) setShowNoModal(true); else setNoCount((count) => count + 1); };
  const submit = async () => {
    setStep('final');
    try { await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/date-confirmation`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details) }); setSent(true); } catch { setSent(false); }
  };
  const canContinue = (key) => Boolean(details[key]);

  return <main className="app-shell">
    <div className="grain" aria-hidden="true" />
    <div className="floating-symbols" aria-hidden="true"><span>✦</span><span>♡</span><span>✦</span><span>·</span><span>♡</span></div>
    <header className="topbar"><span className="logo-mark">♡</span><span>the important question</span><span className="topbar-count">{step === 'hero' ? '01' : step === 'final' ? '06' : '0' + Math.min(['date', 'time', 'location', 'vibe', 'confirm'].indexOf(step) + 2, 6)} / 06</span></header>

    {step === 'hero' && <section className="hero page-in"><div className="hero-copy"><p className="eyebrow">A tiny invitation, with excellent intentions</p><h1>Will you go on<br /><em>a date</em> with me?</h1><p className="subtitle">I have a very important question for you...<br />and please think carefully. <span>😌</span></p><div className="hero-actions"><button className="button primary" onClick={sayYes}>YES, obviously! <span>♥</span></button><button className="button secondary no-button" style={{ transform: `translate(${noCount ? (noCount % 2 ? 7 : -5) : 0}px, ${noCount ? -2 : 0}px) scale(${Math.max(0.82, 1 - noCount * .025)})` }} onClick={sayNo}>{noLabels[Math.min(noCount, noLabels.length - 1)]}</button></div><p className="tiny-note">No pressure. One very cute question. ✦</p></div><Gallery /></section>}
    {step === 'compatibility' && <section className="center-stage page-in"><p className="eyebrow">running the important calculations</p><div className="compat-heart">♥</div><h1>Checking compatibility<span className="dots">...</span></h1><div className="meter"><span style={{ width: `${compatibility}%` }} /></div><div className="meter-label"><span>chemistry</span><strong>{compatibility}%</strong></div></section>}
    {step === 'date' && <FormShell eyebrow="chapter one · the calendar" title="When are you free for our little adventure? ❤️" copy="No pressure... but this is an important decision. 😌"><label className="field-label" htmlFor="date">Pick a day</label><input id="date" className="input" type="date" min={minDate} value={details.date} onChange={(e) => update('date', e.target.value)} /><Continue disabled={!canContinue('date')} onClick={() => setStep('time')} text="Next · time ⏰" /></FormShell>}
    {step === 'time' && <FormShell eyebrow="chapter two · the hour" title="What time should I steal you for a few hours? 😌" copy="I'll try my best not to be late. Promise. 👀"><label className="field-label" htmlFor="time">Choose your time</label><input id="time" className="input" type="time" value={details.time} onChange={(e) => update('time', e.target.value)} /><div className="choice-row">{['09:00', '13:00', '18:00', '20:00'].map((time, index) => <button key={time} className={`mini-choice ${details.time === time ? 'selected' : ''}`} onClick={() => update('time', time)}>{['☕ morning', '🍕 afternoon', '🌆 evening', '🌙 night'][index]}</button>)}</div><Continue disabled={!canContinue('time')} onClick={() => setStep('location')} text="Next · location 📍" /></FormShell>}
    {step === 'location' && <FormShell eyebrow="chapter three · the scene" title="Where should our adventure begin? 📍❤️" copy="Pick somewhere we can pretend we know what we're doing. 😂"><label className="field-label" htmlFor="location">A place with good potential</label><input id="location" className="input" placeholder="Enter a café, park, or secret spot..." value={details.location} onChange={(e) => update('location', e.target.value)} /><div className="choice-row">{['Café', 'Restaurant', 'Park', 'Movie'].map((place) => <button key={place} className={`mini-choice ${details.location === place ? 'selected' : ''}`} onClick={() => update('location', place)}>{place}</button>)}</div><Continue disabled={!canContinue('location')} onClick={() => setStep('vibe')} text="Next · the vibe ✨" /></FormShell>}
    {step === 'vibe' && <FormShell eyebrow="chapter four · the plot" title="And what kind of date are we talking about? 👀" copy="Choose your adventure. Multiple answers are allowed, because range is attractive."><div className="vibe-grid">{vibes.map((vibe, index) => <button key={vibe} className={`vibe-card ${details.dateType.includes(vibe) ? 'selected' : ''}`} onClick={() => update('dateType', details.dateType === vibe ? '' : vibe)}><span>{['☕', '🍕', '🎬', '🌆', '🍦', '🎮', '❤️'][index]}</span>{vibe}</button>)}</div><Continue disabled={!canContinue('dateType')} onClick={() => setStep('confirm')} text="Review our date →" /></FormShell>}
    {step === 'confirm' && <FormShell eyebrow="final check · no funny business" title="Looks like we have a date! ❤️" copy="Screenshot this. This is officially evidence. 😌❤️"><div className="summary"><div><span>DATE</span><strong>{formatDate(details.date)}</strong></div><div><span>TIME</span><strong>{formatTime(details.time)}</strong></div><div><span>LOCATION</span><strong>{details.location}</strong></div><div><span>THE VIBE</span><strong>{details.dateType}</strong></div></div><Continue onClick={submit} text="Confirm date ❤️" /><button className="back-button" onClick={() => setStep('date')}>Wait... I want to change something</button></FormShell>}
    {step === 'final' && <section className="center-stage final-stage page-in"><div className="confetti" aria-hidden="true">✦　♥　✧　♥　✦</div><p className="eyebrow">officially official</p><h1>It's a date! <span>❤️</span></h1><p className="subtitle">Okay, now I have to actually plan something impressive. 😂</p><div className="final-card"><p>{formatDate(details.date)} · {formatTime(details.time)}</p><strong>{details.location}</strong><span>{details.dateType}</span></div><p className="tiny-note">{sent ? 'The evidence has been sent. See you there. ✦' : 'It is still officially a date. The notification will catch up soon. ✦'}</p></section>}

    {showNoModal && <div className="modal-backdrop"><div className="modal" role="dialog" aria-modal="true"><span className="modal-icon">🥹</span><h2>Okay okay... I respect your decision.</h2><p>But before you leave... are you <em>really</em> sure?</p><div className="modal-actions"><button className="button primary" onClick={() => { setShowNoModal(false); sayYes(); }}>Okay fine, YES ❤️</button><button className="button secondary" onClick={() => { setShowNoModal(false); setStep('declined'); }}>I'm REALLY sure 😭</button></div></div></div>}
    {step === 'declined' && <section className="center-stage page-in"><div className="compat-heart muted">♡</div><h1>Okay ❤️</h1><p className="subtitle">I respect your decision.<br />Thanks for playing along! 😊</p><button className="back-button" onClick={() => setStep('hero')}>Replay the question</button></section>}
  </main>;
}

function Gallery() { return <div className="gallery"><div className="gallery-note">a little<br /><em>something</em><br />to smile at</div><div className="photo photo-main"><img src="/20251205_233546.jpg" alt="A smiling portrait" /><span>the person asking ✦</span></div><div className="photo photo-small"><div>♡</div><span>good vibes<br />only</span></div><div className="stamp">99%<small>compatible</small></div></div>; }
function FormShell({ eyebrow, title, copy, children }) { return <section className="form-stage page-in"><div className="form-inner"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="subtitle">{copy}</p><div className="form-content">{children}</div></div><div className="side-note">Date loading...<br /><span>♥</span></div></section>; }
function Continue({ disabled, onClick, text }) { return <button className="button primary continue" disabled={disabled} onClick={onClick}>{text}</button>; }
function formatDate(value) { return value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`)) : 'Choose a date'; }
function formatTime(value) { return value ? new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(new Date(`2020-01-01T${value}`)) : 'Choose a time'; }

createRoot(document.getElementById('root')).render(<App />);
