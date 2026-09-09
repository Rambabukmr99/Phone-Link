import React, { Component, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const images = [
  ['https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=82', 'This could be us... maybe.'],
  ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=82', 'Coffee + good conversation'],
  ['https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=82', 'Okay, this one looks romantic.'],
  ['https://images.unsplash.com/photo-1519671282429-b44660ead0a7?auto=format&fit=crop&w=900&q=82', 'Potential date location 👀'],
  ['https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=900&q=82', 'A little picnic energy'],
  ['https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=82', 'Save this sky for later']
];
const vibes = ['Coffee & deep talks', 'Food & fun', 'Movie & snacks', 'Walk & talk', 'Ice cream adventure', 'Games & chaos', 'Romantic evening', 'Surprise me'];
const vibeIcons = ['☕', '🍕', '🎬', '🌆', '🍦', '🎮', '🌹', '✨'];
const moods = ['Chill', 'Chaotic', 'Romantic', 'Fancy', 'Crazy', 'Cozy'];
const noLabels = ['NO 😭', 'Really?', 'Are you sure?', 'Think again 👀', 'Last chance', "Don't do this 😭", 'Okay okay...'];
const noMessages = [
  ['Wait... what? 😳', 'Are you sure about that?'],
  ['Hmm... accidental click? 😂', 'Your finger seems to have a problem with YES.'],
  ['Okay, let’s think about this logically...', 'Analysis complete: you should reconsider. 😂'],
  ["I'm not saying you should say YES...", '...but YES is right there. 👀❤️'],
  ['Okay, you are making this difficult. 😭', 'The NO button has filed a formal complaint.'],
  ['Fine. Increasing negotiation skills.', 'Reasons to say YES: coffee, food, bad jokes, nice memories.']
];
const today = new Date();
const minDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

function App() {
  const [step, setStep] = useState('intro');
  const [introLine, setIntroLine] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [modal, setModal] = useState(false);
  const [secret, setSecret] = useState(false);
  const [secretTimerKey, setSecretTimerKey] = useState(0);
  const [compatibility, setCompatibility] = useState(0);
  const [details, setDetails] = useState({ date: '', time: '', location: '', vibes: [], mood: '', message: '', herEmail: '', herPhone: '', consent: false });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (step !== 'intro') return undefined;
    if (introLine === 2) { const timer = setTimeout(() => setStep('hero'), 1500); return () => clearTimeout(timer); }
    const timer = setTimeout(() => setIntroLine((line) => line + 1), 1200);
    return () => clearTimeout(timer);
  }, [step, introLine]);
  useEffect(() => {
    if (!secretTimerKey) return undefined;
    const timer = setTimeout(() => setSecret(false), 1000);
    return () => clearTimeout(timer);
  }, [secretTimerKey]);

  const update = (key, value) => setDetails((current) => ({ ...current, [key]: value }));
  const yes = () => {
    setStep('celebrate');
    let value = 0;
    const timer = setInterval(() => { value += 5; setCompatibility(value); if (value >= 100) clearInterval(timer); }, 45);
  };
  const no = () => { if (noCount >= 6) setModal(true); else setNoCount((count) => count + 1); };
  const toggleVibe = (vibe) => update('vibes', details.vibes.includes(vibe) ? details.vibes.filter((item) => item !== vibe) : [...details.vibes, vibe]);
  const submit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch('https://formsubmit.co/ajax/ramcomp3099@mail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ _subject: "❤️ IT'S A DATE! SHE SAID YES! 🥳", _cc: details.herEmail, _template: 'table', date: formatDate(details.date), time: formatTime(details.time), location: details.location, vibe: details.vibes.join(' · '), mood: details.mood, message: details.message || 'No message', confirmed: 'YES ❤️', guest_phone: details.herPhone, timestamp: new Date().toISOString() }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || 'Confirmation failed');
      setSent(Boolean(result.delivered));
      setStep('balloons');
      setTimeout(() => setStep('final'), 5200);
    } catch { setSubmitError('I could not send the confirmation yet. Please try again.'); } finally { setSubmitting(false); }
  };
  const next = (nextStep, key) => details[key] && setStep(nextStep);
  const openSecret = () => { setSecret(true); setSecretTimerKey(Date.now()); };

  if (step === 'intro') return <Intro skip={() => setStep('hero')} line={introLine} />;
  return <main className="app-shell">
    <div className="grain" aria-hidden="true" />
    <div className="ambient-symbols" aria-hidden="true"><span>✦</span><span>♡</span><span>✧</span><span>·</span><span>♡</span></div>
    <header className="topbar"><button className="brand" onClick={openSecret} aria-label="Open secret heart">♡</button><span>date.exe · a very important question</span><span className="step-count">{step === 'hero' ? '01' : '02'} / 07</span></header>
    {step === 'hero' && <Hero yes={yes} no={no} noCount={noCount} setSecret={openSecret} />}
    {step === 'celebrate' && <Celebration compatibility={compatibility} continuePlanning={() => setStep('date')} />}
    {step === 'date' && <Planner eyebrow="chapter one · the day" title="When should we make this official? ❤️" copy="Pick a day that works for you. Choose wisely... this could be the beginning of a very good story. 👀"><label className="field-label" htmlFor="date">Your excellent choice</label><input className="input" id="date" type="date" min={minDate} value={details.date} onChange={(event) => update('date', event.target.value)} /><p className="success-copy">{details.date && 'Perfect choice. 😌'}</p><Next disabled={!details.date} onClick={() => next('time', 'date')} text="Next → time ⏰" /></Planner>}
    {step === 'time' && <Planner eyebrow="chapter two · the hour" title="What time should our adventure begin?" copy="Excellent. I’ll try very hard not to be late. 😂"><label className="field-label">Pick a mood for the clock</label><div className="option-grid four">{[['☀️', '09:00', 'Morning'], ['🌤️', '13:00', 'Afternoon'], ['🌇', '18:00', 'Evening'], ['🌙', '20:00', 'Night']].map(([icon, value, label]) => <button className={`option ${details.time === value ? 'selected' : ''}`} key={value} onClick={() => update('time', value)}><span>{icon}</span>{label}</button>)}</div><label className="field-label time-label" htmlFor="time">Or choose the exact time</label><input className="input" id="time" type="time" value={details.time} onChange={(event) => update('time', event.target.value)} /><Next disabled={!details.time} onClick={() => next('location', 'time')} text="Next → location 📍" /></Planner>}
    {step === 'location' && <Planner eyebrow="chapter three · the scene" title="Where should we meet? 📍" copy="Pick somewhere we can pretend we know what we’re doing. 😂"><div className="option-grid location-grid">{[['☕', 'Café'], ['🍕', 'Restaurant'], ['🌳', 'Park'], ['🎬', 'Cinema'], ['🛍️', 'Mall'], ['🌆', 'Somewhere scenic']].map(([icon, label]) => <button className={`option ${details.location === label ? 'selected' : ''}`} key={label} onClick={() => update('location', label)}><span>{icon}</span>{label}</button>)}</div><label className="field-label time-label" htmlFor="location">Or enter a custom location</label><input className="input" id="location" placeholder="A place with good potential..." value={details.location} onChange={(event) => update('location', event.target.value)} /><Next disabled={!details.location} onClick={() => next('vibe', 'location')} text="Next → our vibe ✨" /></Planner>}
    {step === 'vibe' && <Planner eyebrow="chapter four · the plot" title="Choose our vibe. 👀" copy="Multiple answers are allowed, because range is attractive."><div className="vibe-grid">{vibes.map((vibe, index) => <button className={`vibe-card ${details.vibes.includes(vibe) ? 'selected' : ''}`} key={vibe} onClick={() => toggleVibe(vibe)}><span>{vibeIcons[index]}</span>{vibe}</button>)}</div><Next disabled={!details.vibes.length} onClick={() => next('mood', 'vibes')} text="Next → the mood" /></Planner>}
    {step === 'mood' && <Planner eyebrow="chapter five · the atmosphere" title="What’s the mood?" copy="This information will be used for absolutely scientific purposes. 😌"><div className="mood-grid">{moods.map((mood, index) => <button className={`mood-card ${details.mood === mood ? 'selected' : ''}`} key={mood} onClick={() => update('mood', mood)}><span>{['😌', '😂', '❤️', '✨', '🤪', '☕'][index]}</span>{mood}</button>)}</div><Next disabled={!details.mood} onClick={() => next('message', 'mood')} text="Next → one last thought" /></Planner>}
    {step === 'message' && <Planner eyebrow="chapter six · a tiny note" title="Anything you want me to know?" copy="Optional, but a good note can increase date potential by at least 37%."><label className="field-label" htmlFor="message">A message for the planner</label><textarea className="input textarea" id="message" maxLength="200" placeholder="e.g. I’m hungry, surprise me, don’t be late 😂" value={details.message} onChange={(event) => update('message', event.target.value)} /><p className="character-count">{details.message.length} / 200</p><div className="contact-box"><p className="field-label">Send the date card to you too</p><input className="input" type="email" placeholder="Your email address" value={details.herEmail} onChange={(event) => update('herEmail', event.target.value)} /><input className="input contact-input" type="tel" inputMode="tel" placeholder="Your phone number with country code" value={details.herPhone} onChange={(event) => update('herPhone', event.target.value)} /><label className="consent"><input type="checkbox" checked={details.consent} onChange={(event) => update('consent', event.target.checked)} /> I agree to receive these date details.</label></div><Next disabled={!details.herEmail || !details.herPhone || !details.consent} onClick={() => setStep('confirm')} text="Review our date →" /></Planner>}
    {step === 'final' && <Final details={details} sent={sent} />}
      {step === 'balloons' && <BalloonCelebration />}
      {step === 'confirm' && <Planner eyebrow="final check · no funny business" title="Are we officially making this a date? ❤️" copy="Screenshot this. This is officially evidence. 😌❤️"><DateCard details={details} />{submitError && <p className="error-copy" role="alert">{submitError}</p>}<Next disabled={submitting} onClick={submit} text={submitting ? 'Sending confirmation...' : 'YES, CONFIRM IT ❤️'} /><button className="back-button" onClick={() => setStep('date')}>Wait, I want to change something</button></Planner>}
    {modal && <NoModal count={noCount} close={() => setModal(false)} yes={() => { setModal(false); yes(); }} decline={() => { setModal(false); setStep('declined'); }} />}
    {step === 'declined' && <section className="center-stage page-in"><div className="declined-heart">♡</div><h1>Okay ❤️</h1><p className="subtitle">I respect your decision.<br />Thanks for playing along! 😊</p><button className="back-button" onClick={() => setStep('hero')}>Replay the question</button></section>}
    {secret && <div className="toast page-in" role="status" onClick={() => setSecret(false)}><strong>♥</strong><span>You found the secret button. 👀❤️<small>Okay... you’re officially cute.</small></span></div>}
  </main>;
}

function Intro({ line, skip }) { return <main className="intro"><div className="intro-glow" /><div className="intro-copy"><span className="intro-kicker">a tiny cinematic experience</span><h1>{['Hey... 👀', 'I have something important to ask you.', 'Actually... VERY important. ❤️'][line]}</h1><div className="intro-dots"><i /><i /><i /></div></div><button className="skip" onClick={skip}>Skip intro →</button></main>; }
function Hero({ yes, no, noCount, setSecret }) { return <section className="hero page-in"><div className="hero-visual"><div className="hero-image" /><span className="image-tag">somewhere between a thought<br />and a very good idea ✦</span><button className="secret-heart" onClick={setSecret} aria-label="Secret heart">♡</button></div><div className="hero-copy"><p className="eyebrow">a very important question</p><h1>So... there’s something<br />I’ve been meaning to <em>ask you.</em></h1><p className="question">Will you go on a<br /><span>date with me?</span> ❤️</p><p className="subtitle">Don’t worry, there’s no wrong answer... 👀</p><div className="hero-actions"><button className="button primary" onClick={yes}>YES, LET’S GO <span>♥</span></button><button className="button secondary no-button" style={{ transform: `translate(${noCount ? noCount % 2 ? '6px' : '-4px' : '0'}, ${noCount ? '-2px' : '0'}) scale(${Math.max(.84, 1 - noCount * .025)})` }} onClick={no}>{noLabels[Math.min(noCount, noLabels.length - 1)]}</button></div><p className="tiny-note">No pressure. One cute question. ✦</p></div><Gallery /></section>; }
function Gallery() { return <div className="gallery"><div className="gallery-header"><span>visual evidence</span><small>swipe →</small></div><div className="gallery-track">{images.map(([src, caption]) => <figure key={src}><img src={src} loading="lazy" alt={caption} /><figcaption>{caption}</figcaption></figure>)}</div></div>; }
function Celebration({ compatibility, continuePlanning }) { return <section className="center-stage celebration page-in"><div className="confetti" aria-hidden="true">✦　♥　✧　♥　✦</div><p className="eyebrow">compatibility detected</p><h1>{compatibility < 100 ? 'Wait...' : 'SHE SAID YES! ❤️🥳'}</h1><p className="subtitle">{compatibility < 100 ? `Checking compatibility... ${compatibility}%` : 'I knew you were going to make the right decision. 😌'}</p><div className="meter"><span style={{ width: `${compatibility}%` }} /></div>{compatibility === 100 && <><p className="tiny-note">Date.exe successfully installed.</p><button className="button primary" onClick={continuePlanning}>Plan our date →</button></>}</section>; }
function BalloonCelebration() { const balloons = ['YES ❤️', 'DATE! 🎉', 'YAY!', '🥳', '❤️', 'Finally! 😂']; const [count, setCount] = useState(3); useEffect(() => { const timer = setInterval(() => setCount((value) => value > 1 ? value - 1 : 1), 1000); return () => clearInterval(timer); }, []); return <section className="balloon-stage page-in" aria-live="polite"><div className="celebration-wash" /><div className="countdown"><span className="count-number">{count}</span><p>get ready...</p></div><div className="balloon-field">{balloons.map((label, index) => <div className={`balloon balloon-${index + 1}`} key={label}><span>{label}</span><i /></div>)}</div><div className="burst-particles" aria-hidden="true">✦　♥　✧　•　♥　✦　•　✧　♥</div><div className="celebration-title"><p>the answer has been officially processed</p><h1>IT’S A DATE! <span>❤️</span></h1><small>Okay... this just got officially exciting. 😌❤️</small></div></section>; }
function Planner({ eyebrow, title, copy, children }) { return <section className="form-stage page-in"><div className="form-inner"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="subtitle">{copy}</p><div className="form-content">{children}</div></div><div className="side-note">calculating date potential...<br /><span>♥</span></div></section>; }
function Next({ disabled, onClick, text }) { return <button className="button primary continue" disabled={disabled} onClick={onClick}>{text}</button>; }
function NoModal({ count, close, yes, decline }) { const message = noMessages[Math.min(count - 1, noMessages.length - 1)]; return <div className="modal-backdrop"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="no-title"><span className="modal-icon">{count >= 6 ? '🧠' : '🥺'}</span><h2 id="no-title">{message[0]}</h2><p>{message[1]}</p>{count >= 6 && <div className="reasons"><span>☕ Coffee</span><span>🍕 Good food</span><span>😂 Bad jokes</span><span>🌆 Nice evening</span><span>❤️ Great memories</span></div>}<div className="modal-actions"><button className="button primary" onClick={yes}>YES ❤️</button><button className="button secondary" onClick={count >= 6 ? decline : close}>{count >= 6 ? 'I’m REALLY sure 😭' : 'NO, I’m sure'}</button></div></div></div>; }
function DateCard({ details }) { return <div className="date-card"><div className="card-kicker">♥ our date</div><h2>It’s looking good.</h2><div className="summary"><Summary label="DATE" value={formatDate(details.date)} /><Summary label="TIME" value={formatTime(details.time)} /><Summary label="LOCATION" value={details.location} /><Summary label="VIBE" value={(details.vibes || []).join(' · ')} /><Summary label="MOOD" value={details.mood} />{details.message && <Summary label="NOTE" value={details.message} />}</div></div>; }
function Summary({ label, value }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
function Final({ details, sent }) { return <section className="center-stage final-stage page-in"><div className="confetti" aria-hidden="true">✦　♥　✧　♥　✦</div><p className="eyebrow">officially official</p><h1>It’s a date! <span>❤️🥳</span></h1><p className="subtitle">Okay... now I actually have to plan something good. 😂</p><DateCard details={details} /><p className="tiny-note">{sent ? 'The evidence has been sent. See you there. ✦' : 'Still officially a date. Notification delivery is catching up. ✦'}</p><button className="button secondary" onClick={() => window.print()}>Save our date ♥</button></section>; }
function formatDate(value) { return value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`)) : 'Choose a date'; }
function formatTime(value) { return value ? new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(new Date(`2020-01-01T${value}`)) : 'Choose a time'; }

class AppErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? <main className="error-screen"><h1>One tiny glitch. ❤️</h1><p>Please refresh and try the date planner again.</p><button className="button primary" onClick={() => window.location.reload()}>Refresh invitation</button></main> : this.props.children; }
}

createRoot(document.getElementById('root')).render(<AppErrorBoundary><App /></AppErrorBoundary>);
