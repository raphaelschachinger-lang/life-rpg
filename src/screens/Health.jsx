import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getVerticalLevel, formatDate } from '../utils/gameLogic';
import { Heart, Flame, Edit2 } from 'lucide-react';

const HABIT_KEYS = ['sport', 'noSmoke', 'noAlcohol', 'reading', 'noSocial', 'noJunkFood'];
const DAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const STREAK_BONUSES = {
  sport:     [{ days: 7, xp: 50 }, { days: 30, xp: 150 }],
  noSmoke:   [{ days: 7, xp: 100 }, { days: 30, xp: 300 }, { days: 90, xp: 500 }],
  noAlcohol: [{ days: 7, xp: 50 }, { days: 30, xp: 200 }],
  reading:   [{ days: 7, xp: 50 }, { days: 30, xp: 150 }],
  noSocial:  [{ days: 7, xp: 100 }, { days: 30, xp: 300 }],
  noJunkFood: [{ days: 7, xp: 100 }, { days: 30, xp: 300 }],
};

function getCurrentWeekGrid(completions) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().split('T')[0];
    return { label: DAYS_SHORT[i], date: key, done: !!completions[key] };
  });
}

function HabitCard({ habitKey, habit, vacationMode, onToggleVacation, onToggleDay }) {
  const grid = getCurrentWeekGrid(habit.completions);
  const todayISO = new Date().toISOString().split('T')[0];
  const doneThisWeek = grid.filter(d => d.done).length;
  const scoreColor = doneThisWeek >= 6 ? '#3DC98A' : doneThisWeek >= 4 ? '#E4A94B' : '#E05C5C';
  const nextBonus = STREAK_BONUSES[habitKey]?.find(b => b.days > habit.currentStreak);
  const isVacationSuspended = habitKey === 'noAlcohol' && vacationMode;

  return (
    <div className="card" style={{ borderTop: `2px solid ${habit.color}` }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{habit.name}</span>
            {isVacationSuspended && (
              <span className="pill" style={{ background: 'rgba(228,169,75,0.15)', color: '#E4A94B', fontSize: 9 }}>
                MODE VACANCES
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            +{habit.xpPerDay} XP/jour
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Flame size={12} style={{ color: habit.currentStreak > 0 ? habit.color : 'var(--muted2)' }} />
            <span
              className="font-mono font-bold text-lg"
              style={{ color: habit.currentStreak > 0 ? habit.color : 'var(--muted2)' }}
            >
              {habit.currentStreak}j
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted2)' }}>
            best: {habit.bestStreak}j
          </p>
        </div>
      </div>

      {/* Week grid */}
      <div className="flex gap-2 mb-3">
        {grid.map((d, i) => {
          const isPast = d.date <= todayISO;
          return (
            <div
              key={i}
              onClick={() => isPast && onToggleDay(d.date)}
              className="flex items-center justify-center text-xs font-mono font-bold"
              style={{
                flex: 1, height: 32, borderRadius: 6,
                background: d.done ? habit.color : 'var(--navy-700)',
                color: d.done ? '#000' : 'var(--muted2)',
                border: `1px solid ${d.done ? habit.color : 'var(--border)'}`,
                fontSize: 10,
                cursor: isPast ? 'pointer' : 'default',
                opacity: isPast ? 1 : 0.35,
                transition: 'transform 0.1s, opacity 0.15s',
              }}
              onMouseEnter={e => { if (isPast) e.currentTarget.style.transform = 'scale(1.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {d.label}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="progress-bar" style={{ width: 80 }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${(doneThisWeek / 7) * 100}%`, background: scoreColor }}
            />
          </div>
          <span className="text-xs font-mono" style={{ color: scoreColor }}>
            {doneThisWeek}/7
          </span>
        </div>

        {nextBonus && (
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Prochain bonus: <span className="font-mono" style={{ color: '#3DC98A' }}>+{nextBonus.xp} XP</span>
            {' '}à {nextBonus.days}j
          </span>
        )}

        {habitKey === 'noAlcohol' && (
          <button
            className="btn btn-ghost text-xs"
            style={{ padding: '2px 8px', fontSize: 11 }}
            onClick={onToggleVacation}
          >
            {vacationMode ? 'Fin vacances' : '🏖️ Vacances'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Health() {
  const { state, dispatch } = useGame();
  const { level: vLevel, xpInLevel, xpNeeded } = getVerticalLevel(state.stats.health.totalXP);
  const { habits } = state;
  const vacationMode = habits.noAlcohol.vacationMode;

  // Calculate weekly health score
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  let totalPossible = 0;
  let totalDone = 0;
  HABIT_KEYS.forEach(k => {
    const h = habits[k];
    const isVacation = k === 'noAlcohol' && vacationMode;
    weekDates.forEach(date => {
      if (!isVacation) {
        totalPossible++;
        if (h.completions[date]) totalDone++;
      }
    });
  });

  const weeklyScore = totalPossible > 0 ? (totalDone / totalPossible) * 100 : 0;
  const scoreColor = weeklyScore >= 80 ? '#3DC98A' : weeklyScore >= 50 ? '#E4A94B' : '#E05C5C';

  // Total streak stats
  const allStreaks = HABIT_KEYS.map(k => habits[k].currentStreak);
  const minStreak = Math.min(...allStreaks);
  const totalHabitDays = HABIT_KEYS.reduce((s, k) => s + habits[k].totalDays, 0);

  return (
    <div className="fade-up" style={{ maxWidth: 900 }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Health & Habits</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Vertical Health · Niveau {vLevel}</p>
      </div>

      {/* Level bar */}
      <div className="card mb-6" style={{ padding: '12px 16px', borderTop: '2px solid #E05C5C' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold" style={{ color: '#E05C5C' }}>Health Niveau {vLevel}</span>
          <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
            {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
          </span>
        </div>
        <div className="progress-bar" style={{ height: 6, borderRadius: 3 }}>
          <div className="progress-bar-fill"
            style={{ width: `${Math.min(100, (xpInLevel / xpNeeded) * 100)}%`, background: '#E05C5C' }} />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card" style={{ borderTop: '2px solid #E05C5C' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Score semaine</p>
          <p className="font-mono font-bold text-2xl" style={{ color: scoreColor }}>
            {weeklyScore.toFixed(0)}%
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{totalDone}/{totalPossible} jours</p>
        </div>
        <div className="card" style={{ borderTop: '2px solid #E05C5C' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Streak minimum</p>
          <p className="font-mono font-bold text-2xl" style={{ color: minStreak > 0 ? '#3DC98A' : '#E05C5C' }}>
            {minStreak}j
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>toutes habitudes</p>
        </div>
        <div className="card" style={{ borderTop: '2px solid #E05C5C' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Jours validés total</p>
          <p className="font-mono font-bold text-2xl" style={{ color: 'var(--text)' }}>
            {totalHabitDays}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>toutes habitudes</p>
        </div>
        <div className="card" style={{ borderTop: '2px solid #E05C5C' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Mode vacances</p>
          <p className="font-mono font-bold text-lg" style={{ color: vacationMode ? '#E4A94B' : 'var(--muted2)' }}>
            {vacationMode ? '🏖️ Actif' : 'Inactif'}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>alcool suspendu</p>
        </div>
      </div>

      {/* Weekly score bar */}
      <div className="card card-red mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Score santé hebdomadaire</span>
          <span className="font-mono font-bold text-xl" style={{ color: scoreColor }}>
            {weeklyScore.toFixed(0)}%
          </span>
        </div>
        <div className="progress-bar" style={{ height: 12, borderRadius: 6 }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${weeklyScore}%`, background: scoreColor, borderRadius: 6 }}
          />
        </div>
        <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--muted)' }}>
          <span style={{ color: '#E05C5C' }}>Rouge &lt;50%</span>
          <span style={{ color: '#E4A94B' }}>Orange 50–79%</span>
          <span style={{ color: '#3DC98A' }}>Vert ≥80%</span>
        </div>
      </div>

      {/* Habits grid */}
      <div className="grid grid-cols-2 gap-4">
        {HABIT_KEYS.map(k => (
          <HabitCard
            key={k}
            habitKey={k}
            habit={habits[k]}
            vacationMode={vacationMode}
            onToggleVacation={() => dispatch({ type: 'TOGGLE_VACATION_MODE' })}
            onToggleDay={date => dispatch({ type: 'TOGGLE_HABIT_DAY', habitKey: k, date })}
          />
        ))}
      </div>

      {/* Streak milestone info */}
      <div className="card mt-6">
        <h3 className="text-xs font-mono font-bold mb-3" style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}>
          MILESTONES DE STREAK
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {HABIT_KEYS.map(k => {
            const h = habits[k];
            const bonuses = STREAK_BONUSES[k] || [];
            return (
              <div key={k} style={{ borderLeft: `2px solid ${h.color}`, paddingLeft: 10 }}>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>{h.name}</p>
                <div className="flex flex-col gap-1">
                  {bonuses.map(b => (
                    <div key={b.days} className="flex items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{
                          background: h.currentStreak >= b.days ? h.color : 'var(--navy-600)',
                          fontSize: 8,
                        }}
                      >
                        {h.currentStreak >= b.days ? '✓' : ''}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>{b.days}j</span>
                      <span className="text-xs font-mono" style={{ color: '#3DC98A' }}>+{b.xp}XP</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
