import { BADGES } from '../data/badges';

// ── Level formulas ─────────────────────────────────────────────

export function xpForLevel(n) {
  return Math.floor(10000 * (1 + 0.1 * (n - 1)));
}

export function getLevelFromXP(totalXP) {
  let level = 1;
  let xpSpent = 0;
  while (level < 100) {
    const needed = xpForLevel(level);
    if (xpSpent + needed > totalXP) break;
    xpSpent += needed;
    level++;
  }
  const xpInLevel = totalXP - xpSpent;
  const xpNeeded = xpForLevel(level);
  return { level, xpInLevel, xpNeeded };
}

export function verticalXPForLevel(n) {
  return Math.floor(2000 * (1 + 0.1 * (n - 1)));
}

export function getVerticalLevel(totalXP) {
  let level = 1;
  let xpSpent = 0;
  while (level < 50) {
    const needed = verticalXPForLevel(level);
    if (xpSpent + needed > totalXP) break;
    xpSpent += needed;
    level++;
  }
  const xpInLevel = totalXP - xpSpent;
  const xpNeeded = verticalXPForLevel(level);
  return { level, xpInLevel, xpNeeded };
}

export function getPlayerTitle(level) {
  if (level >= 100) return 'Mythique';
  if (level >= 80)  return 'Légendaire';
  if (level >= 65)  return 'Grand Maître';
  if (level >= 50)  return 'Maître';
  if (level >= 40)  return 'Élite';
  if (level >= 30)  return 'Expert';
  if (level >= 20)  return 'Vétéran';
  if (level >= 10)  return 'Initié';
  return 'Apprenti';
}

// ── Chapter system ─────────────────────────────────────────────

export const CHAPTERS = [
  { id: 1, name: 'THE FORGE',      period: '2025–2027', start: 13000,   target: 100000,    color: '#E4A94B' },
  { id: 2, name: 'THE ENGINE',     period: '2027–2031', start: 100000,  target: 1000000,   color: '#3DC98A' },
  { id: 3, name: 'CRITICAL MASS',  period: '2031–2036', start: 1000000, target: 4000000,   color: '#8B6FCA' },
  { id: 4, name: 'ENDGAME',        period: '2036–2041', start: 4000000, target: 10000000,  color: '#388BDC' },
];

export function getCurrentChapter(patrimoine) {
  if (patrimoine < 100000)  return CHAPTERS[0];
  if (patrimoine < 1000000) return CHAPTERS[1];
  if (patrimoine < 4000000) return CHAPTERS[2];
  return CHAPTERS[3];
}

export function getChapterProgress(patrimoine, chapter) {
  return Math.min(100, Math.max(0,
    ((patrimoine - chapter.start) / (chapter.target - chapter.start)) * 100
  ));
}

// ── Streak calculation ─────────────────────────────────────────

// Returns true if the given date is a "due" day for an alternate-day habit.
// Uses the frequencyStartDate as epoch: diff % 2 === 0 → due day.
export function isDueDay(dateStr, frequencyStartDate) {
  const d = new Date(dateStr);
  const ref = new Date(frequencyStartDate);
  d.setHours(0, 0, 0, 0);
  ref.setHours(0, 0, 0, 0);
  return Math.round((d - ref) / 86400000) % 2 === 0;
}

export function calculateStreakAlternate(completions, startDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().split('T')[0];

  // Find the last due day ≤ today
  let check = new Date(today);
  if (!isDueDay(todayKey, startDate)) check.setDate(check.getDate() - 1);

  // If that due day isn't done yet, look at the previous one (keep streak alive until EOD)
  if (!completions[check.toISOString().split('T')[0]]) {
    check.setDate(check.getDate() - 2);
  }

  let current = 0;
  while (true) {
    const key = check.toISOString().split('T')[0];
    if (completions[key]) {
      current++;
      check.setDate(check.getDate() - 2);
    } else {
      break;
    }
  }

  // Best streak: only consecutive due-day completions (gap of 2 calendar days)
  const dueDates = Object.keys(completions)
    .filter(k => completions[k] && isDueDay(k, startDate))
    .sort();

  let best = 0;
  let temp = 0;
  for (let i = 0; i < dueDates.length; i++) {
    if (i === 0) { temp = 1; }
    else {
      const diff = Math.round((new Date(dueDates[i]) - new Date(dueDates[i - 1])) / 86400000);
      temp = diff === 2 ? temp + 1 : 1;
    }
    if (temp > best) best = temp;
  }

  return { current, best: Math.max(best, current) };
}

export function calculateStreak(completions) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().split('T')[0];

  let current = 0;
  let check = new Date(today);
  // If today isn't done yet, start from yesterday so the streak stays alive until EOD
  if (!completions[todayKey]) {
    check.setDate(check.getDate() - 1);
  }
  while (true) {
    const key = check.toISOString().split('T')[0];
    if (completions[key]) {
      current++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }

  // Best streak via sorted keys
  const dates = Object.keys(completions).filter(k => completions[k]).sort();
  let best = 0;
  let temp = 0;
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) { temp = 1; }
    else {
      const diff = (new Date(dates[i]) - new Date(dates[i - 1])) / 86400000;
      temp = diff === 1 ? temp + 1 : 1;
    }
    if (temp > best) best = temp;
  }
  return { current, best: Math.max(best, current) };
}

// Combined streak across ALL habits at once.
// A calendar day only counts against a given habit if that habit is
// actually "due" that day — alternate-day habits (e.g. sport every other
// day) don't break the combined streak on their rest days, and a habit
// currently in vacation mode is skipped entirely.
function isGlobalDayComplete(habits, dateKey) {
  return Object.values(habits).every(h => {
    if (h.vacationMode) return true;
    if (h.frequency === 'alternate' && !isDueDay(dateKey, h.frequencyStartDate)) return true;
    return !!h.completions[dateKey];
  });
}

export function calculateGlobalStreak(habits) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().split('T')[0];

  let check = new Date(today);
  // If today isn't fully done yet, start from yesterday so the streak stays alive until EOD
  if (!isGlobalDayComplete(habits, todayKey)) {
    check.setDate(check.getDate() - 1);
  }

  let current = 0;
  while (true) {
    const key = check.toISOString().split('T')[0];
    if (isGlobalDayComplete(habits, key)) {
      current++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }

  // Best streak: walk day-by-day from the earliest completion to today.
  const allDates = Object.values(habits)
    .flatMap(h => Object.keys(h.completions).filter(k => h.completions[k]));
  let best = current;
  if (allDates.length > 0) {
    const earliest = allDates.sort()[0];
    let d = new Date(earliest);
    d.setHours(0, 0, 0, 0);
    let temp = 0;
    while (d <= today) {
      const key = d.toISOString().split('T')[0];
      if (isGlobalDayComplete(habits, key)) {
        temp++;
        if (temp > best) best = temp;
      } else {
        temp = 0;
      }
      d.setDate(d.getDate() + 1);
    }
  }

  return { current, best };
}

// ── Weekly XP calculation ──────────────────────────────────────

export const REAL_ESTATE_ACTION_XP = {
  visit:    200,
  contact:   50,
  chantier:  80,
  rendement: 30,
  offre:    300,
  compromis: 500,
};

export function calculateWeeklyXP(form) {
  const breakdown = [];

  // Base
  breakdown.push({ label: 'Weekly Review complété', xp: 100 });

  // Trading
  if (form.trading.traded) {
    breakdown.push({ label: 'Semaine de trading loggée', xp: 50 });
    if (form.trading.mmRespected) {
      breakdown.push({ label: 'Money management respecté', xp: 30 });
    }
  }

  // Real Estate
  if (form.realEstate.actionTaken && form.realEstate.actionType) {
    const xp = REAL_ESTATE_ACTION_XP[form.realEstate.actionType] || 0;
    if (xp > 0) {
      const labels = {
        visit: 'Visite de bien',
        contact: 'Contact agence/particulier',
        chantier: 'Point chantier',
        rendement: 'Calcul rendement locatif',
        offre: 'Offre faite',
        compromis: 'Compromis signé',
      };
      breakdown.push({ label: `Immo: ${labels[form.realEstate.actionType]}`, xp });
    }
  }

  // DCA
  if (form.markets.dcaDone) {
    breakdown.push({ label: 'DCA mensuel effectué', xp: 80 });
  }

  const total = breakdown.reduce((s, b) => s + b.xp, 0);
  return { total, breakdown, perfectWeek: false };
}

// ── Character traits (weekly self-assessment → incremental gain) ──

const TRAIT_GAIN_STEP = 3; // amplitude per point of deviation from 3 (status quo)

// gain = (réponse - 3) * pas ; new_value = current + max(gain,0) * (1 - current/100)
// Never punitive: an answer below 3 never lowers the trait (spec §5.3).
export function calculateTraitGain(answer, currentValue) {
  const gain = (answer - 3) * TRAIT_GAIN_STEP;
  return Math.max(gain, 0) * (1 - currentValue / 100);
}

export function applyTraitAnswers(traits, answers, date) {
  const updated = { ...traits };
  Object.entries(answers || {}).forEach(([traitId, answer]) => {
    const trait = updated[traitId];
    if (!trait) return;
    const gain = calculateTraitGain(answer, trait.current_value);
    updated[traitId] = {
      ...trait,
      current_value: Math.min(100, trait.current_value + gain),
      last_updated: date,
    };
  });
  return updated;
}

// ── Badge checking ─────────────────────────────────────────────

export function checkBadgeUnlocks(gameState, existingBadges) {
  const now = new Date();
  const { level } = getLevelFromXP(gameState.player.totalXP);
  const newBadges = [];
  // Exposed to badge `check` fns as `s.globalStreak` — the combined streak
  // across all habits, respecting each habit's own due-day frequency.
  const stateForChecks = { ...gameState, globalStreak: calculateGlobalStreak(gameState.habits) };

  Object.values(BADGES).forEach(badge => {
    if (existingBadges[badge.id]) return; // already unlocked
    try {
      const unlocked = badge.check(stateForChecks, now, level);
      if (unlocked) newBadges.push(badge);
    } catch (_) {}
  });

  return newBadges;
}

// ── Date helpers ───────────────────────────────────────────────

export function getCurrentWeekDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export function formatCurrency(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M€`;
  if (value >= 1_000)     return `${(value / 1000).toFixed(0)}K€`;
  return `${value.toLocaleString('fr-FR')}€`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function getMultiplier(current, start) {
  return (current / start).toFixed(1);
}

// Update habits completions from a weekly review form
export function updateHabitsFromReview(habits, reviewHabits, weekDates) {
  const updated = {};
  Object.entries(habits).forEach(([habitId, habit]) => {
    const dayValues = reviewHabits[habitId] || [];
    const completions = { ...habit.completions };
    weekDates.forEach((date, i) => {
      completions[date] = !!dayValues[i];
    });
    const { current, best } = calculateStreak(completions);
    const totalDays = Object.values(completions).filter(Boolean).length;
    updated[habitId] = {
      ...habit,
      completions,
      currentStreak: current,
      bestStreak: Math.max(habit.bestStreak || 0, best),
      totalDays,
    };
  });
  return updated;
}
