import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  getLevelFromXP, getPlayerTitle, getCurrentChapter, getChapterProgress,
  formatCurrency, getMultiplier, formatDate,
} from '../utils/gameLogic';
import { BADGES } from '../data/badges';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Shield, Zap, Star, ClipboardList, Trophy, AlertCircle } from 'lucide-react';

const PRINCIPLES = [
  'Séquentialité stricte — Chaque phase se déverrouille par un jalon réel.',
  'Réinvestissement total — Zéro upgrade de train de vie avant 30 ans.',
  'Trois verticals, trois espaces — Immo, Trading, Financier.',
  'Fonds d\'urgence intouchable — 9 000€ minimum en permanence.',
  'Révision annuelle — Vérifier position réelle vs jalons.',
];

function StatCard({ title, value, sub, color, icon: Icon }) {
  return (
    <div className="card" style={{ borderTop: `2px solid ${color}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs" style={{ color: 'var(--muted)', fontWeight: 500 }}>{title}</span>
        {Icon && <Icon size={14} style={{ color }} />}
      </div>
      <div className="font-mono text-xl font-bold" style={{ color }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{sub}</div>}
    </div>
  );
}

function HabitRow({ habit, data }) {
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().split('T')[0];
    return { label: weekDays[i], done: !!data.completions[key] };
  });

  const doneCount = days.filter(d => d.done).length;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 flex-shrink-0" style={{ width: 160 }}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: data.color }} />
        <span className="text-xs truncate" style={{ color: 'var(--text)' }}>{data.name}</span>
      </div>
      <div className="flex gap-1">
        {days.map((d, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-xs font-mono"
            style={{
              width: 22, height: 22, borderRadius: '50%',
              background: d.done ? data.color : 'var(--navy-700)',
              color: d.done ? '#000' : 'var(--muted2)',
              fontSize: 9, fontWeight: 700,
            }}
          >
            {d.label}
          </div>
        ))}
      </div>
      <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--muted)', minWidth: 28 }}>
        {doneCount}/7
      </span>
      <span className="text-xs font-mono flex-shrink-0" style={{ color: data.color }}>
        🔥{data.currentStreak}j
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { state, dispatch } = useGame();
  const { level, xpInLevel, xpNeeded } = getLevelFromXP(state.player.totalXP);
  const title = getPlayerTitle(level);
  const chapter = getCurrentChapter(state.patrimoine.current);
  const chapterPct = getChapterProgress(state.patrimoine.current, chapter);
  const multiplier = getMultiplier(state.patrimoine.current, 13000);
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(state.player.name);

  const recentBadges = Object.entries(state.badges)
    .sort((a, b) => new Date(b[1].unlockedAt) - new Date(a[1].unlockedAt))
    .slice(0, 3)
    .map(([id, data]) => ({ ...BADGES[id], ...data }));

  const patrimoineChart = state.patrimoine.history.slice(-12).map(h => ({
    date: h.date,
    value: h.value,
  }));

  const xpPct = Math.min(100, (xpInLevel / xpNeeded) * 100);

  // Check if review done this week
  const today = new Date();
  const weekNum = Math.floor(today.getTime() / (7 * 24 * 60 * 60 * 1000));
  const reviewDoneThisWeek = state.weeklyReviews.some(r => {
    const rDate = new Date(r.date);
    const rWeek = Math.floor(rDate.getTime() / (7 * 24 * 60 * 60 * 1000));
    return rWeek === weekNum;
  });

  const unlockedLootCount = Object.keys(state.loot).length;

  return (
    <div className="fade-up" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {editName ? (
            <form onSubmit={e => {
              e.preventDefault();
              dispatch({ type: 'SET_PLAYER_NAME', name: nameInput });
              setEditName(false);
            }} className="flex gap-2 items-center">
              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="text-xl font-bold"
                style={{ background: 'var(--navy-700)', border: '1px solid var(--border2)', borderRadius: 6, padding: '4px 10px', color: 'var(--text)', fontFamily: 'inherit', width: 200 }}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }}>OK</button>
            </form>
          ) : (
            <h1
              className="text-2xl font-bold cursor-pointer"
              style={{ color: 'var(--text)' }}
              onClick={() => setEditName(true)}
              title="Cliquer pour modifier"
            >
              {state.player.name}
            </h1>
          )}
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {title} · {state.player.totalXP.toLocaleString()} XP total · {Object.keys(state.badges).length} badges
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>En jeu depuis</p>
          <p className="text-sm font-mono" style={{ color: 'var(--text)' }}>{formatDate(state.player.createdAt)}</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Patrimoine net"
          value={formatCurrency(state.patrimoine.current)}
          sub={`×${multiplier} depuis le départ`}
          color="#E4A94B"
          icon={TrendingUp}
        />
        <StatCard
          title="Chapitre actuel"
          value={`Ch.${chapter.id} — ${chapter.name}`}
          sub={`${chapterPct.toFixed(1)}% vers ${formatCurrency(chapter.target)}`}
          color={chapter.color}
          icon={Shield}
        />
        <StatCard
          title="XP & Niveau"
          value={`LVL ${level}`}
          sub={`${xpInLevel.toLocaleString()} / ${xpNeeded.toLocaleString()} XP`}
          color="#388BDC"
          icon={Zap}
        />
        <StatCard
          title="Badges débloqués"
          value={Object.keys(state.badges).length}
          sub={`sur 49 badges`}
          color="#E4A94B"
          icon={Trophy}
        />
      </div>

      {/* XP bar */}
      <div className="card mb-6" style={{ padding: '12px 16px' }}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>LVL {level}</span>
          <div className="flex-1 progress-bar" style={{ height: 8, borderRadius: 4 }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, #388BDC, #2EC4B6)' }}
            />
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>LVL {level + 1}</span>
        </div>
        <div className="flex justify-between text-xs font-mono" style={{ color: 'var(--muted)' }}>
          <span>{xpInLevel.toLocaleString()} XP</span>
          <span>encore {(xpNeeded - xpInLevel).toLocaleString()} XP pour monter</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Patrimoine chart */}
        <div className="card card-gold col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Historique patrimoine</h3>
            <span className="text-xs font-mono" style={{ color: '#E4A94B' }}>
              {formatCurrency(chapter.target)} objectif
            </span>
          </div>
          {patrimoineChart.length > 1 ? (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={patrimoineChart}>
                <defs>
                  <linearGradient id="pgGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E4A94B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E4A94B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#4E6A88', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#4E6A88', fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => formatCurrency(v)} width={55} />
                <Tooltip
                  contentStyle={{ background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 6 }}
                  labelStyle={{ color: 'var(--muted)', fontSize: 11 }}
                  formatter={v => [formatCurrency(v), 'Patrimoine']}
                />
                <Area type="monotone" dataKey="value" stroke="#E4A94B" fill="url(#pgGold)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-36" style={{ color: 'var(--muted2)', fontSize: 13 }}>
              Les données apparaîtront après vos premières Weekly Reviews.
            </div>
          )}
        </div>

        {/* Chapter progress */}
        <div className="card" style={{ borderTop: `2px solid ${chapter.color}` }}>
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>
            Chapitre {chapter.id}
          </h3>
          <p className="font-serif text-lg font-bold mb-3" style={{ color: chapter.color }}>
            {chapter.name}
          </p>
          <div className="text-xs mb-1 flex justify-between" style={{ color: 'var(--muted)' }}>
            <span>{formatCurrency(state.patrimoine.current)}</span>
            <span>{formatCurrency(chapter.target)}</span>
          </div>
          <div className="progress-bar mb-3" style={{ height: 8, borderRadius: 4 }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${chapterPct}%`, background: chapter.color }}
            />
          </div>
          <p className="text-xs font-mono mb-4" style={{ color: chapter.color }}>
            {chapterPct.toFixed(2)}% accompli
          </p>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            <p className="font-semibold mb-1" style={{ color: 'var(--text)', fontSize: 11 }}>BOSS FINAL</p>
            <p className="font-mono font-bold" style={{ color: chapter.color, fontSize: 16 }}>
              {formatCurrency(chapter.target)}
            </p>
            <p className="mt-1">{chapter.period}</p>
          </div>
        </div>
      </div>

      {/* Habits this week */}
      <div className="card card-red mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Habitudes cette semaine</h3>
          <button
            className="btn btn-ghost text-xs"
            style={{ padding: '4px 10px' }}
            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'health' })}
          >
            Voir détails →
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {Object.entries(state.habits).map(([key, habit]) => (
            <HabitRow key={key} habit={key} data={habit} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Weekly Review CTA */}
        <div className={`card ${reviewDoneThisWeek ? 'card-blue' : ''}`}
          style={!reviewDoneThisWeek ? { borderTop: '2px solid #2EC4B6', animation: 'pulseGold 2s ease infinite' } : {}}>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={16} style={{ color: reviewDoneThisWeek ? '#388BDC' : '#2EC4B6' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Weekly Review</h3>
          </div>
          {reviewDoneThisWeek ? (
            <div>
              <p className="text-sm" style={{ color: '#3DC98A' }}>✓ Complétée cette semaine</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                {state.weeklyReviews.length} reviews au total
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>
                Pas encore faite cette semaine
              </p>
              <button
                className="btn btn-primary w-full"
                onClick={() => dispatch({ type: 'NAVIGATE', screen: 'review' })}
                style={{ background: '#2EC4B6', width: '100%' }}
              >
                Démarrer la review →
              </button>
            </div>
          )}
        </div>

        {/* Recent badges */}
        <div className="card card-gold">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} style={{ color: '#E4A94B' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Badges récents</h3>
          </div>
          {recentBadges.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--muted2)' }}>
              Aucun badge encore — faites votre première Weekly Review !
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentBadges.map(b => (
                <div key={b.id} className="flex items-center gap-2">
                  <span className="text-base">{b.icon}</span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{b.name}</p>
                    <p className="text-xs" style={{ color: '#E4A94B', fontFamily: 'JetBrains Mono' }}>+{b.xp} XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active alerts */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} style={{ color: '#E05C5C' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Statut</h3>
          </div>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="status-dot" style={{ background: state.markets.emergencyFund >= 9000 ? '#3DC98A' : '#E05C5C' }} />
              <span style={{ color: 'var(--text)' }}>Fonds urgence</span>
              <span className="font-mono ml-auto" style={{ color: state.markets.emergencyFund >= 9000 ? '#3DC98A' : '#E05C5C' }}>
                {formatCurrency(state.markets.emergencyFund)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-dot" style={{ background: state.markets.pea.openDate ? '#3DC98A' : '#E4A94B' }} />
              <span style={{ color: 'var(--text)' }}>PEA</span>
              <span className="ml-auto text-xs" style={{ color: state.markets.pea.openDate ? '#3DC98A' : '#E4A94B' }}>
                {state.markets.pea.openDate ? 'Actif' : 'À ouvrir'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-dot" style={{ background: state.trading.consecutivePositiveMonths > 0 ? '#3DC98A' : 'var(--muted2)' }} />
              <span style={{ color: 'var(--text)' }}>Trading streak</span>
              <span className="font-mono ml-auto" style={{ color: '#3DC98A' }}>
                {state.trading.consecutivePositiveMonths}M
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-dot" style={{ background: state.trading.propfirms.filter(p => p.status === 'funded').length > 0 ? '#3DC98A' : 'var(--muted2)' }} />
              <span style={{ color: 'var(--text)' }}>Propfirms funded</span>
              <span className="font-mono ml-auto" style={{ color: '#3DC98A' }}>
                {state.trading.propfirms.filter(p => p.status === 'funded').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Principles */}
      <div className="card" style={{ borderTop: '2px solid var(--border2)' }}>
        <h3 className="text-xs font-mono font-bold mb-3" style={{ color: 'var(--muted)', letterSpacing: '0.12em' }}>
          PRINCIPES NON NÉGOCIABLES
        </h3>
        <div className="flex flex-col gap-2">
          {PRINCIPLES.map((p, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="font-mono font-bold flex-shrink-0" style={{ color: '#388BDC' }}>
                {String(i + 1).padStart(2, '0')}.
              </span>
              <span style={{ color: 'var(--muted)' }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
