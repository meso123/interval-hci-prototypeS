import { useState, useEffect } from 'react';
import {
  ChevronRight, Clock, Dumbbell, Play, Pause, ArrowLeft,
  Flame, Target, Zap, Home, User, BarChart3, X, Sparkles,
  BookOpen, Trophy, Heart, Battery, BatteryLow, BatteryFull,
} from 'lucide-react';

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,300..900;9..144,1,300..900&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  .font-display { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; letter-spacing: -0.02em; }
  .font-body { font-family: 'DM Sans', system-ui, sans-serif; letter-spacing: -0.01em; }
  .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
`;

const C = {
  bg: '#F4F0E8', ink: '#0F0F0E', muted: '#8A857C', soft: '#E8E2D5',
  lime: '#D4FF00', coral: '#FF5733', white: '#FFFFFF', amber: '#F5A623',
};

const MOCK_SCHEDULE = [
  { day: 'Mon', classes: [{ s: '09:00', e: '11:00', n: 'HCI Lecture' }, { s: '14:00', e: '16:00', n: 'Project Lab' }] },
  { day: 'Tue', classes: [{ s: '10:00', e: '11:30', n: 'Stats Tutorial' }] },
  { day: 'Wed', classes: [{ s: '09:00', e: '11:00', n: 'HCI Lecture' }, { s: '13:00', e: '14:30', n: 'Group Meeting' }] },
  { day: 'Thu', classes: [{ s: '11:00', e: '13:00', n: 'Seminar' }] },
  { day: 'Fri', classes: [{ s: '09:00', e: '10:30', n: 'Workshop' }] },
];

const WORKOUTS_90 = [
  { id: 'w1', name: 'Full Body Flow', duration: 75, intensity: 'Moderate', equipment: 'Barbell + Bench', focus: 'Full body', exercises: 6, calories: 420, energy: ['ok', 'great'] },
  { id: 'w2', name: 'Push Day · Chest + Shoulders', duration: 85, intensity: 'High', equipment: 'Dumbbells + Bench', focus: 'Push', exercises: 7, calories: 480, energy: ['great'] },
  { id: 'w3', name: 'Cardio + Core', duration: 60, intensity: 'High', equipment: 'Bodyweight + Mat', focus: 'Conditioning', exercises: 8, calories: 510, energy: ['great'] },
  { id: 'w4', name: 'Light Mobility Flow', duration: 45, intensity: 'Low', equipment: 'Mat', focus: 'Recovery', exercises: 6, calories: 180, energy: ['tired', 'ok'] },
];

const WORKOUTS_SHORT = [
  { id: 's1', name: 'Desk Break Reset', duration: 12, intensity: 'Low', equipment: 'Bodyweight', focus: 'Mobility', exercises: 5, calories: 65, energy: ['tired', 'ok', 'great'] },
  { id: 's2', name: 'Quick Core', duration: 15, intensity: 'Moderate', equipment: 'Mat', focus: 'Core', exercises: 5, calories: 110, energy: ['ok', 'great'] },
  { id: 's3', name: 'Study Break Stretch', duration: 10, intensity: 'Low', equipment: 'Bodyweight', focus: 'Recovery', exercises: 4, calories: 40, energy: ['tired', 'ok', 'great'] },
];

const EXERCISES = [
  { name: 'Goblet Squat', sets: '4 × 10', rest: 60, cue: 'Chest up, knees tracking over toes' },
  { name: 'Romanian Deadlift', sets: '3 × 10', rest: 75, cue: 'Hinge at hips, neutral spine' },
  { name: 'Dumbbell Bench Press', sets: '4 × 8', rest: 90, cue: 'Shoulders packed, controlled descent' },
  { name: 'Bent-Over Row', sets: '3 × 10', rest: 60, cue: 'Squeeze shoulder blades at the top' },
  { name: 'Plank Hold', sets: '3 × 45s', rest: 45, cue: "Brace core, don't drop hips" },
  { name: "Farmer's Carry", sets: '3 × 40m', rest: 60, cue: 'Upright posture, grip firm' },
];

const FRIENDS = [
  { name: 'Mazen', initial: 'M', streak: 0, sessions: 0, isYou: true },
  { name: 'Ayham', initial: 'A', streak: 5, sessions: 18 },
  { name: 'Ali', initial: 'AL', streak: 3, sessions: 12 },
  { name: 'Takwa', initial: 'T', streak: 7, sessions: 24 },
];

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
}

function getTodayLabel() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function IntervalApp() {
  const [screen, setScreen] = useState('welcome');
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [streak, setStreak] = useState(0);
  const [examMode, setExamMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [energyLevel, setEnergyLevel] = useState(null); // 'tired' | 'ok' | 'great'
  const [skipped, setSkipped] = useState(false);

  const go = (s) => { window.scrollTo(0, 0); setScreen(s); };

  const friends = FRIENDS.map(f => f.isYou ? { ...f, streak, sessions: streak * 6 } : f)
    .sort((a, b) => b.streak - a.streak);

  return (
    <div className="min-h-screen font-body" style={{ background: C.bg, color: C.ink }}>
      <style dangerouslySetInnerHTML={{ __html: FONT_STYLE }} />
      <div className="max-w-md mx-auto relative" style={{ minHeight: '100vh' }}>
        {screen === 'welcome'      && <Welcome onNext={() => go('schedule')} />}
        {screen === 'schedule'     && <ScheduleSetup onNext={() => go('profileSetup')} onBack={() => go('welcome')} />}
        {screen === 'profileSetup' && <ProfileSetup onNext={(name) => { setUserName(name); go('energyCheck'); }} />}
        {screen === 'energyCheck'  && <EnergyCheck userName={userName} onNext={(e) => { setEnergyLevel(e); go('home'); }} />}
        {screen === 'home'         && <HomeScreen userName={userName} streak={streak} examMode={examMode} energyLevel={energyLevel} skipped={skipped} onToggleExamMode={() => setExamMode(e => !e)} onPickWorkout={() => go('workoutList')} onSkip={() => { setSkipped(true); go('skipFlow'); }} onProgress={() => go('progress')} onWorkouts={() => go('workoutList')} onProfile={() => go('profile')} onLeaderboard={() => go('leaderboard')} />}
        {screen === 'skipFlow'     && <SkipFlow userName={userName} onHome={() => { setSkipped(false); go('home'); }} onWorkouts={() => go('workoutList')} />}
        {screen === 'workoutList'  && <WorkoutList examMode={examMode} energyLevel={energyLevel} onPick={(w) => { setSelectedWorkout(w); go('workoutDetail'); }} onBack={() => go('home')} onProgress={() => go('progress')} onProfile={() => go('profile')} onLeaderboard={() => go('leaderboard')} />}
        {screen === 'workoutDetail' && selectedWorkout && <WorkoutDetail workout={selectedWorkout} onStart={() => { setExerciseIdx(0); go('active'); }} onBack={() => go('workoutList')} />}
        {screen === 'active'       && selectedWorkout && <ActiveWorkout idx={exerciseIdx} setIdx={setExerciseIdx} onDone={() => { setStreak(s => s + 1); setSkipped(false); go('complete'); }} onExit={() => go('home')} />}
        {screen === 'complete'     && selectedWorkout && <Complete workout={selectedWorkout} streak={streak + 1} onProgress={() => go('progress')} onHome={() => go('home')} />}
        {screen === 'progress'     && <Progress streak={streak} onBack={() => go('home')} onWorkouts={() => go('workoutList')} onProfile={() => go('profile')} onLeaderboard={() => go('leaderboard')} />}
        {screen === 'leaderboard'  && <Leaderboard friends={friends} userName={userName} onBack={() => go('home')} onWorkouts={() => go('workoutList')} onProgress={() => go('progress')} onProfile={() => go('profile')} />}
        {screen === 'profile'      && <Profile userName={userName} setUserName={setUserName} streak={streak} examMode={examMode} onToggleExamMode={() => setExamMode(e => !e)} onBack={() => go('home')} onWorkouts={() => go('workoutList')} onProgress={() => go('progress')} onLeaderboard={() => go('leaderboard')} />}
      </div>
    </div>
  );
}

// ─── WELCOME ─────────────────────────────────────────────────────────────────

function Welcome({ onNext }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: C.bg }}>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right, #0F0F0E 1px, transparent 1px), linear-gradient(to bottom, #0F0F0E 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="relative flex-1 flex flex-col px-6 pt-16 pb-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: C.lime }} />
          <span className="font-mono text-[11px] tracking-wider uppercase" style={{ color: C.muted }}>v0.1 · prototype</span>
        </div>
        <div className="mt-auto">
          <h1 className="font-display text-[76px] leading-[0.88] font-light tracking-tight">Fit<br /><em style={{ fontStyle: 'italic' }}>between</em><br />classes.</h1>
          <p className="mt-6 text-[15px] leading-relaxed max-w-[300px]" style={{ color: C.muted }}>Interval finds the gym windows in your university timetable and matches a workout that actually fits.</p>
        </div>
        <button onClick={onNext} className="mt-12 w-full py-4 rounded-full font-medium text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition" style={{ background: C.ink, color: C.bg }}>
          Get started <ChevronRight size={18} />
        </button>
        <p className="mt-4 text-center text-[12px]" style={{ color: C.muted }}>Built for UoB Dubai · HCI 2026</p>
      </div>
    </div>
  );
}

// ─── SCHEDULE SETUP ──────────────────────────────────────────────────────────

function ScheduleSetup({ onNext, onBack }) {
  const [input, setInput] = useState('');
  const [imported, setImported] = useState(false);
  return (
    <div className="min-h-screen px-6 pt-12 pb-8">
      <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={20} /></button>
      <div className="mt-4">
        <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>Step 1 of 3</p>
        <h2 className="font-display text-[40px] leading-[1.05] mt-3 font-light">Bring in your<br />timetable.</h2>
        <p className="mt-4 text-[14px] leading-relaxed" style={{ color: C.muted }}>Paste from Canvas / Exchange, or use a sample week.</p>
      </div>
      <div className="mt-8">
        <div className="rounded-2xl p-4 border" style={{ background: C.soft, borderColor: '#0F0F0E12' }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={"Mon 09:00-11:00 HCI Lecture\nTue 10:00-11:30 Stats..."} className="w-full h-32 bg-transparent outline-none resize-none text-[14px] font-mono" />
        </div>
        <button onClick={() => { setImported(true); setInput('Sample week loaded'); }} className="mt-3 text-[13px] underline underline-offset-4" style={{ color: C.muted }}>Use sample week instead →</button>
      </div>
      {(imported || input.length > 0) && (
        <div className="mt-8">
          <p className="font-mono text-[11px] uppercase tracking-wider mb-3" style={{ color: C.muted }}>Preview · This week</p>
          <div className="space-y-2">
            {MOCK_SCHEDULE.map((day) => (
              <div key={day.day} className="flex items-start gap-4 py-2">
                <span className="font-mono text-[12px] w-10 pt-1" style={{ color: C.muted }}>{day.day}</span>
                <div className="flex-1 flex flex-wrap gap-1.5">
                  {day.classes.map((c, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ background: '#0F0F0E0A' }}>{c.s}–{c.e} · {c.n}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <button onClick={onNext} disabled={!imported && input.length === 0} className="mt-10 w-full py-4 rounded-full font-medium text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-40" style={{ background: C.ink, color: C.bg }}>
        Find my gym windows <ChevronRight size={18} />
      </button>
    </div>
  );
}

// ─── PROFILE SETUP ───────────────────────────────────────────────────────────

function ProfileSetup({ onNext }) {
  const [name, setName] = useState('');
  return (
    <div className="min-h-screen px-6 pt-12 pb-8 flex flex-col">
      <div className="mt-4">
        <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>Step 2 of 3</p>
        <h2 className="font-display text-[40px] leading-[1.05] mt-3 font-light">What should<br />we call you?</h2>
        <p className="mt-4 text-[14px] leading-relaxed" style={{ color: C.muted }}>Just your first name. Used to personalise your dashboard.</p>
      </div>
      <div className="mt-8">
        <div className="rounded-2xl px-5 py-4 border transition-all" style={{ background: C.soft, borderColor: name.length > 0 ? C.ink : '#0F0F0E12' }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onNext(name.trim() || 'Athlete')}
            placeholder="e.g. Mazen"
            autoFocus
            className="w-full bg-transparent outline-none text-[28px] font-display font-light"
            style={{ color: C.ink }}
          />
        </div>
        {name.length > 0 && (
          <p className="mt-3 text-[13px]" style={{ color: C.muted }}>Your dashboard will say <em>"{getGreeting()}, {name}."</em></p>
        )}
      </div>
      <div className="mt-auto pt-10 space-y-3">
        <button onClick={() => onNext(name.trim() || 'Athlete')} className="w-full py-4 rounded-full font-medium text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition" style={{ background: C.ink, color: C.bg }}>
          {name.trim() ? `Let's go, ${name.trim()} →` : "Let's go"} <ChevronRight size={18} />
        </button>
        <button onClick={() => onNext('Athlete')} className="w-full py-2 text-[13px]" style={{ color: C.muted }}>Skip</button>
      </div>
    </div>
  );
}

// ─── ENERGY CHECK-IN ─────────────────────────────────────────────────────────

function EnergyCheck({ userName, onNext }) {
  const [selected, setSelected] = useState(null);

  const options = [
    { id: 'tired', label: 'Tired', sub: 'Light session only', icon: BatteryLow, color: C.coral },
    { id: 'ok', label: 'OK', sub: 'Regular session', icon: Battery, color: C.amber },
    { id: 'great', label: 'Feeling great', sub: 'Go hard', icon: BatteryFull, color: C.lime },
  ];

  return (
    <div className="min-h-screen px-6 pt-12 pb-8 flex flex-col">
      <div className="mt-4">
        <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>Step 3 of 3</p>
        <h2 className="font-display text-[40px] leading-[1.05] mt-3 font-light">How are you<br />feeling today?</h2>
        <p className="mt-4 text-[14px] leading-relaxed" style={{ color: C.muted }}>
          {userName ? `We'll match your workout to your energy, ${userName}.` : "We'll match your workout to your energy."}
        </p>
      </div>

      <div className="mt-10 space-y-3">
        {options.map((o) => {
          const Icon = o.icon;
          const isSelected = selected === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setSelected(o.id)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition active:scale-[0.99]"
              style={{
                background: isSelected ? C.ink : C.soft,
                borderColor: isSelected ? C.ink : 'transparent',
                color: isSelected ? C.bg : C.ink,
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: isSelected ? '#F4F0E822' : o.color + '33' }}>
                <Icon size={18} style={{ color: isSelected ? o.color : o.color }} />
              </div>
              <div className="text-left">
                <p className="text-[15px] font-medium">{o.label}</p>
                <p className="text-[12px]" style={{ color: isSelected ? '#F4F0E888' : C.muted }}>{o.sub}</p>
              </div>
              {isSelected && (
                <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: C.lime }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#0F0F0E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-10 space-y-3">
        <button
          onClick={() => onNext(selected || 'ok')}
          className="w-full py-4 rounded-full font-medium text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition"
          style={{ background: selected ? C.ink : '#0F0F0E55', color: C.bg }}
        >
          {selected ? 'Show my workouts' : 'Pick one to continue'} <ChevronRight size={18} />
        </button>
        <button onClick={() => onNext('ok')} className="w-full py-2 text-[13px]" style={{ color: C.muted }}>Skip</button>
      </div>
    </div>
  );
}

// ─── SKIP FLOW ───────────────────────────────────────────────────────────────

function SkipFlow({ userName, onHome, onWorkouts }) {
  const nextWindows = [
    { day: 'Tomorrow', time: '11:30 – 13:30', len: '120 min', label: 'Best slot' },
    { day: 'Wed', time: '14:30 – 17:00', len: '150 min', label: '' },
    { day: 'Fri', time: '10:30 – 13:00', len: '150 min', label: '' },
  ];

  return (
    <div className="min-h-screen px-6 pt-16 pb-10 flex flex-col">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ background: C.coral }} />
          <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>Session skipped</span>
        </div>

        <h1 className="font-display text-[48px] leading-[0.95] font-light">
          That's<br /><em style={{ fontStyle: 'italic' }}>okay.</em>
        </h1>

        <p className="mt-5 text-[15px] leading-relaxed" style={{ color: C.muted }}>
          {userName ? `${userName}, rest` : 'Rest'} is part of the routine too. Here's when your next window opens up.
        </p>

        <div className="mt-8">
          <p className="font-mono text-[11px] uppercase tracking-wider mb-3" style={{ color: C.muted }}>Your next gym windows</p>
          <div className="space-y-2">
            {nextWindows.map((w, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-4 rounded-2xl" style={{ background: i === 0 ? C.ink : C.soft, color: i === 0 ? C.bg : C.ink }}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] font-semibold w-16" style={{ color: i === 0 ? '#F4F0E888' : C.muted }}>{w.day}</span>
                  <span className="text-[14px]">{w.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  {w.label && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: C.lime, color: C.ink }}>{w.label}</span>}
                  <span className="font-mono text-[11px]" style={{ color: i === 0 ? '#F4F0E888' : C.muted }}>{w.len}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl p-5" style={{ background: C.white, border: '1px solid #0F0F0E15' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: C.coral }} />
            <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>Reminder</p>
          </div>
          <p className="mt-2 text-[14px] leading-relaxed">Even a 10-minute walk counts. Movement reduces stress — and your next full window is tomorrow.</p>
        </div>
      </div>

      <div className="space-y-3 mt-8">
        <button onClick={onWorkouts} className="w-full py-4 rounded-full font-medium text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition" style={{ background: C.ink, color: C.bg }}>
          Actually, show me short workouts <ChevronRight size={18} />
        </button>
        <button onClick={onHome} className="w-full py-3 text-[14px]" style={{ color: C.muted }}>Back home</button>
      </div>
    </div>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────

function HomeScreen({ userName, streak, examMode, energyLevel, skipped, onToggleExamMode, onPickWorkout, onSkip, onProgress, onWorkouts, onProfile, onLeaderboard }) {
  const initial = (userName || 'A')[0].toUpperCase();
  const streakAtRisk = streak > 0 && !skipped;

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-12 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>{getTodayLabel()}</p>
          <h2 className="font-display text-[32px] leading-tight mt-1 font-light">
            {getGreeting()}, <em style={{ fontStyle: 'italic' }}>{userName || 'Athlete'}</em>.
          </h2>
        </div>
        <button onClick={onProfile} className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold" style={{ background: C.ink, color: C.bg }}>
          {initial}
        </button>
      </div>

      {/* Energy level badge */}
      {energyLevel && (
        <div className="px-6 mt-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full font-mono"
            style={{ background: energyLevel === 'great' ? C.lime + '33' : energyLevel === 'ok' ? C.amber + '33' : C.coral + '22', color: energyLevel === 'great' ? '#4A6600' : energyLevel === 'ok' ? '#7A4A00' : '#7A2000' }}>
            {energyLevel === 'great' ? '⚡ Feeling great' : energyLevel === 'ok' ? '🔋 Energy OK' : '😴 Low energy'} · workouts filtered
          </span>
        </div>
      )}

      {/* Streak rescue banner */}
      {streakAtRisk && streak >= 2 && (
        <div className="px-6 mt-4">
          <button onClick={onPickWorkout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl active:scale-[0.99] transition"
            style={{ background: C.coral + '18', border: `1.5px solid ${C.coral}44` }}>
            <Flame size={16} style={{ color: C.coral }} />
            <div className="text-left flex-1">
              <p className="text-[13px] font-medium" style={{ color: '#7A2000' }}>Streak at risk — {streak} days</p>
              <p className="text-[11px]" style={{ color: '#7A2000' }}>Quick 8-min workout to keep it going</p>
            </div>
            <ChevronRight size={14} style={{ color: C.coral }} />
          </button>
        </div>
      )}

      {/* Exam mode toggle */}
      <div className="px-6 mt-4">
        <button onClick={onToggleExamMode} className="w-full flex items-center justify-between px-4 py-3 rounded-2xl active:scale-[0.99] transition"
          style={{ background: examMode ? C.amber + '22' : C.soft, border: `1.5px solid ${examMode ? C.amber : 'transparent'}` }}>
          <div className="flex items-center gap-3">
            <BookOpen size={16} style={{ color: examMode ? C.amber : C.muted }} />
            <div className="text-left">
              <p className="text-[13px] font-medium" style={{ color: examMode ? '#A0620A' : C.ink }}>Exam mode</p>
              <p className="text-[11px]" style={{ color: examMode ? '#A0620A' : C.muted }}>
                {examMode ? 'On · showing workouts under 20 min' : 'Off · tap to enable during exam week'}
              </p>
            </div>
          </div>
          <div className="relative w-10 h-5 rounded-full transition-all" style={{ background: examMode ? C.amber : '#0F0F0E33' }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: examMode ? '22px' : '2px' }} />
          </div>
        </button>
      </div>

      {/* Gym window card */}
      <div className="px-6 mt-5">
        <p className="font-mono text-[11px] uppercase tracking-wider mb-3" style={{ color: C.muted }}>
          {examMode ? "Today's quick window" : "Today's gym window"}
        </p>
        <div className="rounded-3xl p-6 relative overflow-hidden" style={{ background: examMode ? '#1A1400' : C.ink, color: C.bg }}>
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full" style={{ background: examMode ? C.amber : C.lime, opacity: 0.9 }} />
          <div className="relative">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[56px] leading-none font-light">14:30</span>
              <span className="text-[16px]" style={{ color: '#F4F0E899' }}>– {examMode ? '14:45' : '16:00'}</span>
            </div>
            <p className="mt-2 text-[13px]" style={{ color: '#F4F0E899' }}>
              {examMode ? '15-min window · a quick reset between study blocks' : '90-min window · between Project Lab and your free evening'}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Zap size={14} style={{ color: examMode ? C.amber : C.lime }} />
              <span className="text-[12px]">{examMode ? 'Recommended: Desk Break Reset' : 'Recommended: Full Body Flow'}</span>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={onPickWorkout} className="flex-1 py-3.5 rounded-full font-medium text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition"
                style={{ background: examMode ? C.amber : C.lime, color: C.ink }}>
                {examMode ? 'Quick workout' : 'Pick a workout'} <ChevronRight size={16} />
              </button>
              <button onClick={onSkip} className="px-5 py-3.5 rounded-full font-medium text-[14px] active:scale-[0.98] transition"
                style={{ background: '#F4F0E822', color: C.bg }}>
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>

      {examMode && (
        <div className="px-6 mt-4">
          <div className="rounded-2xl p-4" style={{ background: C.amber + '15', border: `1px solid ${C.amber}33` }}>
            <p className="text-[13px] leading-relaxed" style={{ color: '#7A4A00' }}>
              <strong>Exam week?</strong> Interval has capped workouts to 20 min and prioritised desk stretches and mobility. Staying active — even briefly — helps reduce stress and improve recall.
            </p>
          </div>
        </div>
      )}

      {!examMode && (
        <div className="px-6 mt-8">
          <p className="font-mono text-[11px] uppercase tracking-wider mb-3" style={{ color: C.muted }}>Other windows this week</p>
          <div className="space-y-2">
            {[{ day: 'Tue', time: '11:30 – 13:30', len: '120 min' }, { day: 'Wed', time: '14:30 – 17:00', len: '150 min' }, { day: 'Fri', time: '10:30 – 13:00', len: '150 min' }].map((w, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-4 rounded-2xl" style={{ background: C.soft }}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] font-semibold w-8" style={{ color: C.muted }}>{w.day}</span>
                  <span className="text-[14px]">{w.time}</span>
                </div>
                <span className="font-mono text-[11px]" style={{ color: C.muted }}>{w.len}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 mt-6">
        <button onClick={onProgress} className="w-full text-left rounded-2xl p-4 flex items-center justify-between" style={{ background: C.soft }}>
          <div className="flex items-center gap-3">
            <Flame size={18} style={{ color: C.coral }} />
            <div>
              <p className="text-[14px] font-medium">{streak > 0 ? `${streak}-day streak` : 'Start your streak'}</p>
              <p className="text-[11px]" style={{ color: C.muted }}>{streak > 0 ? `${streak} sessions strong · keep going` : 'Complete a workout to begin'}</p>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: C.muted }} />
        </button>
      </div>

      <BottomNav active="home" onHome={() => {}} onWorkouts={onWorkouts} onProgress={onProgress} onProfile={onProfile} onLeaderboard={onLeaderboard} />
    </div>
  );
}

// ─── WORKOUT LIST ─────────────────────────────────────────────────────────────

function WorkoutList({ examMode, energyLevel, onPick, onBack, onProgress, onProfile, onLeaderboard }) {
  const [filter, setFilter] = useState(examMode ? 'short' : 'all');

  const allWorkouts = filter === 'short' ? WORKOUTS_SHORT : WORKOUTS_90;
  const filtered = energyLevel
    ? allWorkouts.filter(w => !w.energy || w.energy.includes(energyLevel))
    : allWorkouts;

  return (
    <div className="min-h-screen px-6 pt-12 pb-24">
      <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={20} /></button>
      <div className="mt-4">
        <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>
          {examMode ? 'Exam mode · quick sessions only' : energyLevel === 'tired' ? 'Low energy · lighter options shown' : 'For your 90-min window'}
        </p>
        <h2 className="font-display text-[32px] leading-tight mt-1 font-light">What are we<br />training today?</h2>
      </div>

      {examMode && (
        <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: C.amber + '18' }}>
          <BookOpen size={13} style={{ color: C.amber }} />
          <p className="text-[12px]" style={{ color: '#7A4A00' }}>Exam mode on — showing workouts under 20 min</p>
        </div>
      )}

      {energyLevel && !examMode && (
        <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: energyLevel === 'great' ? C.lime + '22' : energyLevel === 'ok' ? C.amber + '18' : C.coral + '18' }}>
          <span className="text-[12px]" style={{ color: energyLevel === 'great' ? '#4A6600' : energyLevel === 'ok' ? '#7A4A00' : '#7A2000' }}>
            {energyLevel === 'tired' ? '😴 Showing lighter sessions for your energy level' : energyLevel === 'ok' ? '🔋 Showing regular sessions' : '⚡ All workouts unlocked — go hard'}
          </span>
        </div>
      )}

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {[{ id: 'all', label: 'Full workouts' }, { id: 'short', label: 'Under 20 min' }, { id: 'push', label: 'Push' }, { id: 'pull', label: 'Pull' }, { id: 'legs', label: 'Legs' }].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className="flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-medium border transition active:scale-[0.97]"
            style={{ background: filter === f.id ? C.ink : 'transparent', color: filter === f.id ? C.bg : C.ink, borderColor: filter === f.id ? C.ink : '#0F0F0E22', opacity: examMode && f.id !== 'short' ? 0.4 : 1 }}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <div className="py-10 text-center" style={{ color: C.muted }}>
            <p className="text-[14px]">No workouts match your current filters.</p>
            <button onClick={() => setFilter('short')} className="mt-3 text-[13px] underline underline-offset-2">Try short sessions</button>
          </div>
        )}
        {filtered.map((w) => (
          <button key={w.id} onClick={() => onPick(w)} className="w-full text-left rounded-2xl p-5 border active:scale-[0.99] transition" style={{ background: C.white, borderColor: '#0F0F0E15' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: C.muted }}>{w.focus}</p>
                <h3 className="font-display text-[22px] leading-tight mt-1 font-medium">{w.name}</h3>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: examMode ? C.amber + '33' : C.lime }}>
                <Dumbbell size={18} style={{ color: C.ink }} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-[12px]" style={{ color: C.muted }}>
              <span className="flex items-center gap-1.5"><Clock size={13} />{w.duration} min</span>
              <span className="flex items-center gap-1.5"><Target size={13} />{w.intensity}</span>
              <span>{w.exercises} ex.</span>
            </div>
            <p className="mt-2 text-[12px]" style={{ color: C.muted }}>{w.equipment}</p>
          </button>
        ))}
      </div>
      <BottomNav active="workouts" onHome={onBack} onWorkouts={() => {}} onProgress={onProgress} onProfile={onProfile} onLeaderboard={onLeaderboard} />
    </div>
  );
}

// ─── WORKOUT DETAIL ───────────────────────────────────────────────────────────

function WorkoutDetail({ workout, onStart, onBack }) {
  return (
    <div className="min-h-screen pb-32">
      <div className="px-6 pt-12 pb-8" style={{ background: C.ink, color: C.bg }}>
        <button onClick={onBack} className="p-2 -ml-2" style={{ color: C.bg }}><ArrowLeft size={20} /></button>
        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#F4F0E888' }}>{workout.focus}</p>
          <h2 className="font-display text-[42px] leading-[1.02] mt-2 font-light">{workout.name}</h2>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Duration" value={`${workout.duration}m`} />
          <Stat label="Exercises" value={workout.exercises} />
          <Stat label="Calories" value={`~${workout.calories}`} />
        </div>
      </div>
      <div className="px-6 mt-8">
        <p className="font-mono text-[11px] uppercase tracking-wider mb-4" style={{ color: C.muted }}>What you'll do</p>
        <div className="space-y-2">
          {EXERCISES.slice(0, workout.exercises).map((e, i) => (
            <div key={i} className="flex items-center gap-4 py-3 px-4 rounded-2xl" style={{ background: C.soft }}>
              <span className="font-mono text-[13px] font-semibold w-6" style={{ color: C.muted }}>{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1">
                <p className="text-[14px] font-medium">{e.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>{e.sets} · {e.rest}s rest</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 mt-6">
        <p className="font-mono text-[11px] uppercase tracking-wider mb-3" style={{ color: C.muted }}>You'll need</p>
        <p className="text-[14px]">{workout.equipment}</p>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: `linear-gradient(to top, ${C.bg} 70%, transparent)` }}>
        <div className="max-w-md mx-auto">
          <button onClick={onStart} className="w-full py-4 rounded-full font-medium text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition" style={{ background: C.lime, color: C.ink }}>
            <Play size={16} fill={C.ink} /> Start workout
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl p-3" style={{ background: '#F4F0E812', border: '1px solid #F4F0E822' }}>
      <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#F4F0E888' }}>{label}</p>
      <p className="font-display text-[20px] font-light mt-1">{value}</p>
    </div>
  );
}

// ─── ACTIVE WORKOUT ───────────────────────────────────────────────────────────

function ActiveWorkout({ idx, setIdx, onDone, onExit }) {
  const [timer, setTimer] = useState(EXERCISES[0].rest);
  const [running, setRunning] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const current = EXERCISES[idx];
  const progress = ((idx + 1) / EXERCISES.length) * 100;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTimer((x) => (x > 0 ? x - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const next = () => {
    if (idx < EXERCISES.length - 1) { setIdx(idx + 1); setTimer(EXERCISES[idx + 1].rest); setRunning(false); }
    else { onDone(); }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.ink, color: C.bg }}>
      {showExitDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full rounded-3xl p-6" style={{ background: C.bg, color: C.ink }}>
            <h3 className="font-display text-[24px] font-light">Exit workout?</h3>
            <p className="mt-2 text-[14px]" style={{ color: C.muted }}>Your progress will be lost. This cannot be undone.</p>
            <div className="mt-6 space-y-3">
              <button onClick={onExit} className="w-full py-4 rounded-full font-medium text-[15px]" style={{ background: C.coral, color: C.white }}>Yes, exit</button>
              <button onClick={() => setShowExitDialog(false)} className="w-full py-4 rounded-full font-medium text-[15px] border" style={{ borderColor: '#0F0F0E22' }}>Keep going</button>
            </div>
          </div>
        </div>
      )}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between">
        <button onClick={() => setShowExitDialog(true)} style={{ color: C.bg }}><X size={20} /></button>
        <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#F4F0E888' }}>Exercise {idx + 1} of {EXERCISES.length}</p>
        <div className="w-8" />
      </div>
      <div className="px-6">
        <div className="h-1 rounded-full overflow-hidden" style={{ background: '#F4F0E822' }}>
          <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: C.lime }} />
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.lime }}>Working set</p>
        <h2 className="font-display text-[52px] leading-[1.05] mt-4 font-light">{current.name}</h2>
        <p className="mt-3 text-[14px]" style={{ color: '#F4F0E888' }}>{current.sets}</p>
        <p className="mt-6 text-[13px] px-8" style={{ color: '#F4F0E8CC' }}>"{current.cue}"</p>
        <div className="mt-10 font-mono text-[96px] leading-none font-light" style={{ color: running ? C.lime : C.bg }}>
          {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
        </div>
      </div>
      <div className="px-6 pb-10 flex items-center gap-3">
        <button onClick={() => setRunning((r) => !r)} className="flex-1 py-4 rounded-full font-medium text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition"
          style={{ background: running ? '#F4F0E822' : C.lime, color: running ? C.bg : C.ink }}>
          {running ? <><Pause size={16} /> Pause</> : <><Play size={16} fill={C.ink} /> Start</>}
        </button>
        <button onClick={next} className="px-6 py-4 rounded-full font-medium text-[15px] active:scale-[0.98] transition" style={{ background: '#F4F0E822', color: C.bg }}>
          {idx === EXERCISES.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}

// ─── COMPLETE ─────────────────────────────────────────────────────────────────

function Complete({ workout, streak, onProgress, onHome }) {
  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-10 relative overflow-hidden">
      <div className="absolute top-20 -left-10 w-32 h-32 rounded-full opacity-20" style={{ background: C.lime }} />
      <div className="absolute top-40 -right-8 w-24 h-24 rounded-full opacity-30" style={{ background: C.coral }} />
      <div className="relative flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: C.lime }} />
          <span className="font-mono text-[11px] tracking-wider uppercase" style={{ color: C.muted }}>Session logged</span>
        </div>
        <h1 className="font-display text-[64px] leading-[0.95] mt-4 font-light">Nice<br /><em style={{ fontStyle: 'italic' }}>work.</em></h1>
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-4" style={{ background: C.soft }}>
            <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: C.muted }}>Duration</p>
            <p className="font-display text-[24px] font-light mt-1">{workout.duration}m</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: C.soft }}>
            <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: C.muted }}>Calories</p>
            <p className="font-display text-[24px] font-light mt-1">~{workout.calories}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: C.ink, color: C.bg }}>
            <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#F4F0E888' }}>Streak</p>
            <p className="font-display text-[24px] font-light mt-1" style={{ color: C.lime }}>{streak}d 🔥</p>
          </div>
        </div>
        <div className="mt-6 rounded-2xl p-5" style={{ background: C.white, border: '1px solid #0F0F0E15' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: C.coral }} />
            <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>Insight</p>
          </div>
          <p className="mt-2 text-[14px] leading-relaxed">
            {streak === 1
              ? "First session done. That's the hardest one."
              : `${streak} sessions in a row. Keep the momentum going.`}
          </p>
        </div>
      </div>
      <div className="relative mt-8 space-y-3">
        <button onClick={onProgress} className="w-full py-4 rounded-full font-medium text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition" style={{ background: C.ink, color: C.bg }}>
          See my progress <ChevronRight size={18} />
        </button>
        <button onClick={onHome} className="w-full py-3 text-[14px]" style={{ color: C.muted }}>Back home</button>
      </div>
    </div>
  );
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────

function Progress({ streak, onBack, onWorkouts, onProfile, onLeaderboard }) {
  const weekData = [
    { day: 'M', attended: true, minutes: 75 },
    { day: 'T', attended: false, minutes: 0 },
    { day: 'W', attended: true, minutes: 60 },
    { day: 'T', attended: false, minutes: 0 },
    { day: 'F', attended: true, minutes: 85 },
    { day: 'S', attended: false, minutes: 0 },
    { day: 'S', attended: streak > 0, minutes: streak > 0 ? 75 : 0, today: true },
  ];
  const totalMins = weekData.reduce((sum, d) => sum + d.minutes, 0);
  const attended = weekData.filter(d => d.attended).length;

  return (
    <div className="min-h-screen px-6 pt-12 pb-24">
      <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={20} /></button>
      <div className="mt-4">
        <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>This week</p>
        <h2 className="font-display text-[40px] leading-tight mt-1 font-light"><em style={{ fontStyle: 'italic' }}>Consistency</em><br />report.</h2>
      </div>
      <div className="mt-8 rounded-3xl p-6" style={{ background: C.ink, color: C.bg }}>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#F4F0E888' }}>Week {getWeekNumber()}</p>
            <p className="font-display text-[44px] font-light leading-none mt-2"><span style={{ color: C.lime }}>{attended}</span> / {weekData.length}</p>
            <p className="text-[12px] mt-1" style={{ color: '#F4F0E888' }}>windows attended</p>
          </div>
          <div className="text-right">
            <p className="font-display text-[28px] font-light">{streak}d</p>
            <p className="text-[11px]" style={{ color: '#F4F0E888' }}>current streak</p>
          </div>
        </div>
        <div className="mt-6 flex items-end justify-between gap-2">
          {weekData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-md" style={{ height: d.minutes > 0 ? `${(d.minutes / 90) * 60}px` : '4px', background: d.today ? C.lime : d.attended ? '#F4F0E8' : '#F4F0E822', minHeight: '4px' }} />
              <span className="font-mono text-[11px]" style={{ color: d.today ? C.lime : '#F4F0E888' }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: C.soft }}>
          <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: C.muted }}>Total this week</p>
          <p className="font-display text-[28px] font-light mt-1">{totalMins}m</p>
          <p className="text-[11px] mt-1" style={{ color: C.muted }}>{attended} of {weekData.length} windows hit</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: C.soft }}>
          <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: C.muted }}>Current streak</p>
          <p className="font-display text-[28px] font-light mt-1">{streak}d</p>
          <p className="text-[11px] mt-1" style={{ color: C.muted }}>{streak > 0 ? 'keep it going' : 'start today'}</p>
        </div>
      </div>
      <div className="mt-6 rounded-2xl p-5" style={{ background: C.white, border: '1px solid #0F0F0E15' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: C.coral }} />
          <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>Pattern detected</p>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed">You miss gym on days with back-to-back lectures. Try a <strong>15-min desk reset</strong> on those days instead.</p>
      </div>
      <BottomNav active="progress" onHome={onBack} onWorkouts={onWorkouts} onProgress={() => {}} onProfile={onProfile} onLeaderboard={onLeaderboard} />
    </div>
  );
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────

function Leaderboard({ friends, userName, onBack, onWorkouts, onProgress, onProfile }) {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen px-6 pt-12 pb-24">
      <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={20} /></button>
      <div className="mt-4">
        <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>This week</p>
        <h2 className="font-display text-[40px] leading-tight mt-1 font-light">Friend<br /><em style={{ fontStyle: 'italic' }}>rankings.</em></h2>
      </div>

      <div className="mt-8 space-y-3">
        {friends.map((f, i) => (
          <div key={f.name} className="flex items-center gap-4 py-4 px-4 rounded-2xl"
            style={{ background: f.isYou ? C.ink : C.soft, color: f.isYou ? C.bg : C.ink }}>
            <span className="text-[20px] w-8 text-center">{medals[i] || `${i + 1}`}</span>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-semibold flex-shrink-0"
              style={{ background: f.isYou ? '#F4F0E822' : C.ink, color: f.isYou ? C.bg : C.bg }}>
              {f.initial}
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-medium">{f.name} {f.isYou && <span className="text-[11px] font-normal" style={{ color: f.isYou ? '#F4F0E888' : C.muted }}>(you)</span>}</p>
              <p className="text-[11px]" style={{ color: f.isYou ? '#F4F0E888' : C.muted }}>{f.sessions} sessions total</p>
            </div>
            <div className="text-right">
              <p className="font-display text-[22px] font-light" style={{ color: f.isYou ? C.lime : C.ink }}>{f.streak}d</p>
              <p className="font-mono text-[10px]" style={{ color: f.isYou ? '#F4F0E888' : C.muted }}>streak</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl p-5" style={{ background: C.white, border: '1px solid #0F0F0E15' }}>
        <div className="flex items-center gap-2">
          <Trophy size={14} style={{ color: C.amber }} />
          <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>Challenge</p>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed">
          Takwa is leading with a 7-day streak. Complete today's workout to close the gap.
        </p>
      </div>

      <BottomNav active="leaderboard" onHome={onBack} onWorkouts={onWorkouts} onProgress={onProgress} onProfile={onProfile} onLeaderboard={() => {}} />
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

function Profile({ userName, setUserName, streak, examMode, onToggleExamMode, onBack, onWorkouts, onProgress, onLeaderboard }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(userName);
  const initial = (userName || 'A')[0].toUpperCase();
  const totalSessions = Math.max(streak * 6, 1);
  const thisMonth = Math.min(streak * 2, 14);
  const bestWeek = Math.min(streak + 2, 5);

  const stats = [
    { label: 'Sessions', value: `${totalSessions}` },
    { label: 'Streak', value: `${streak}d` },
    { label: 'This month', value: `${thisMonth}` },
    { label: 'Best week', value: `${bestWeek}` },
  ];
  const prefs = [
    { label: 'Preferred time', value: 'Afternoon' },
    { label: 'Min window', value: '45 min' },
    { label: 'University', value: 'UoB Dubai' },
    { label: 'Year', value: 'Final year' },
  ];

  return (
    <div className="min-h-screen px-6 pt-12 pb-24">
      <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={20} /></button>
      <div className="mt-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-[22px] font-semibold" style={{ background: C.ink, color: C.bg }}>{initial}</div>
        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input value={draft} onChange={(e) => setDraft(e.target.value)}
                className="flex-1 bg-transparent outline-none border-b text-[22px] font-display font-light"
                style={{ borderColor: C.ink }} autoFocus />
              <button onClick={() => { setUserName(draft.trim() || 'Athlete'); setEditing(false); }}
                className="text-[12px] px-3 py-1 rounded-full font-medium" style={{ background: C.ink, color: C.bg }}>
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="font-display text-[28px] font-light leading-tight">{userName || 'Athlete'}</h2>
              <button onClick={() => { setDraft(userName); setEditing(true); }} className="text-[11px] underline underline-offset-2" style={{ color: C.muted }}>Edit</button>
            </div>
          )}
          <p className="text-[13px] mt-0.5" style={{ color: C.muted }}>student@uobdubai.ac.uk</p>
        </div>
      </div>
      <div className="mt-8">
        <p className="font-mono text-[11px] uppercase tracking-wider mb-3" style={{ color: C.muted }}>All-time stats</p>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ background: i === 1 ? C.ink : C.soft, color: i === 1 ? C.bg : C.ink }}>
              <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: i === 1 ? '#F4F0E888' : C.muted }}>{s.label}</p>
              <p className="font-display text-[32px] font-light mt-1" style={{ color: i === 1 ? C.lime : C.ink }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <p className="font-mono text-[11px] uppercase tracking-wider mb-3" style={{ color: C.muted }}>Preferences</p>
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: '#0F0F0E12' }}>
          {prefs.map((p, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: '#0F0F0E08', background: C.white }}>
              <span className="text-[14px]" style={{ color: C.muted }}>{p.label}</span>
              <span className="text-[14px] font-medium">{p.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3.5" style={{ background: examMode ? C.amber + '10' : C.white }}>
            <div>
              <span className="text-[14px]" style={{ color: C.muted }}>Exam mode</span>
              <p className="text-[11px]" style={{ color: examMode ? C.amber : C.muted }}>{examMode ? 'On · short sessions only' : 'Off'}</p>
            </div>
            <button onClick={onToggleExamMode} className="relative w-10 h-5 rounded-full transition-all" style={{ background: examMode ? C.amber : '#0F0F0E33' }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: examMode ? '22px' : '2px' }} />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-2xl p-4 border" style={{ borderColor: '#0F0F0E12', background: C.soft }}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>Your timetable</p>
          <button className="text-[12px] underline underline-offset-2" style={{ color: C.muted }}>Edit</button>
        </div>
        {MOCK_SCHEDULE.slice(0, 3).map((day) => (
          <div key={day.day} className="flex items-center gap-3 py-1.5">
            <span className="font-mono text-[11px] w-8" style={{ color: C.muted }}>{day.day}</span>
            <div className="flex flex-wrap gap-1">
              {day.classes.map((c, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: '#0F0F0E0A' }}>{c.s}–{c.e}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <BottomNav active="profile" onHome={onBack} onWorkouts={onWorkouts} onProgress={onProgress} onProfile={() => {}} onLeaderboard={onLeaderboard} />
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

function BottomNav({ active, onHome, onWorkouts, onProgress, onProfile, onLeaderboard }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t" style={{ background: C.bg, borderColor: '#0F0F0E15' }}>
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-around">
        <NavBtn icon={Home}      label="Today"    active={active === 'home'}        onClick={onHome} />
        <NavBtn icon={Dumbbell}  label="Workouts" active={active === 'workouts'}    onClick={onWorkouts} />
        <NavBtn icon={BarChart3} label="Progress" active={active === 'progress'}    onClick={onProgress} />
        <NavBtn icon={Trophy}    label="Friends"  active={active === 'leaderboard'} onClick={onLeaderboard} />
        <NavBtn icon={User}      label="You"      active={active === 'profile'}     onClick={onProfile} />
      </div>
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 py-1 active:scale-[0.92] transition">
      <Icon size={18} style={{ color: active ? C.ink : C.muted }} strokeWidth={active ? 2.2 : 1.8} />
      <span className="text-[10px]" style={{ color: active ? C.ink : C.muted }}>{label}</span>
    </button>
  );
}