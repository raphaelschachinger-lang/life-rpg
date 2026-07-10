import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  getLevelFromXP, calculateStreak, calculateStreakAlternate, checkBadgeUnlocks,
  updateHabitsFromReview, getCurrentWeekDates, todayISO, isDueDay, applyTraitAnswers,
} from '../utils/gameLogic';

const STORAGE_KEY = 'life-rpg-v1';

const HABIT_DEFAULTS = () => ({
  completions: {}, currentStreak: 0, bestStreak: 0, totalDays: 0
});

export const DEFAULT_STATE = {
  ui: { currentScreen: 'dashboard' },
  player: {
    name: 'Player',
    totalXP: 0,
    birthYear: 2001,
    createdAt: todayISO(),
    frugalMonthAchieved: false,
  },
  patrimoine: {
    current: 13000,
    history: [{ date: todayISO(), value: 13000, note: 'Point de départ' }],
  },
  stats: {
    realEstate: { totalXP: 0 },
    trading:    { totalXP: 0 },
    markets:    { totalXP: 0 },
    health:     { totalXP: 0 },
  },
  habits: {
    sport:     { ...HABIT_DEFAULTS(), name: 'Sport', xpPerDay: 10, color: '#3DC98A', frequency: 'alternate', frequencyStartDate: '2026-06-29' },
    noSmoke:   { ...HABIT_DEFAULTS(), name: 'Zéro cigarette', xpPerDay: 15, color: '#388BDC' },
    noAlcohol: { ...HABIT_DEFAULTS(), name: 'Zéro alcool', xpPerDay: 10, color: '#8B6FCA', vacationMode: false },
    reading:   { ...HABIT_DEFAULTS(), name: 'Lecture', xpPerDay: 10, color: '#E4A94B' },
    noSocial:  { ...HABIT_DEFAULTS(), name: 'Zéro réseaux sociaux', xpPerDay: 15, color: '#2EC4B6' },
    noJunkFood: { ...HABIT_DEFAULTS(), name: 'No Junk Food', xpPerDay: 15, color: '#E05C5C' },
  },
  trading: {
    weeklyLogs: [],
    propfirms: [],
    consecutivePositiveMonths: 0,
    bestMonthlyProfit: 0,
    managesThirdParty: false,
  },
  realEstate: {
    properties: [],
    weeklyActions: [],
  },
  markets: {
    pea: { openDate: null, currentValue: 0, totalInvested: 0 },
    cto: { currentValue: 0, totalInvested: 0 },
    dca: { monthlyAmount: 300, history: [] },
    emergencyFund: 0,
    consecutiveDCAMonths: 0,
  },
  badges: {},
  weeklyReviews: [],
  loot: {},
  traits: {
    discernement: {
      id: 'discernement', name: 'Discernement', base_value: 85, current_value: 85,
      sources: { ocean_facets: ['intellect', 'imagination', 'prudence', 'ordre', 'efficacite_perso'], via_ranks: [1, 3, 4, 10, 14] },
      last_updated: null,
    },
    integrite: {
      id: 'integrite', name: 'Intégrité', base_value: 86, current_value: 86,
      sources: { ocean_facets: ['moralite', 'fiabilite', 'cooperation'], via_ranks: [5, 6, 8] },
      last_updated: null,
    },
    discipline: {
      id: 'discipline', name: 'Discipline', base_value: 57, current_value: 57,
      sources: { ocean_facets: ['auto_discipline', 'immoderation_inv'], via_ranks: [11, 20] },
      last_updated: null,
    },
    lien_social: {
      id: 'lien_social', name: 'Lien social', base_value: 50, current_value: 50,
      sources: { ocean_facets: ['gregarisme', 'amitie', 'confiance', 'empathie', 'altruisme'], via_ranks: [13, 16, 17] },
      last_updated: null,
    },
    serenite: {
      id: 'serenite', name: 'Sérénité', base_value: 52, current_value: 52,
      sources: { ocean_facets: ['anxiete_inv', 'timidite_sociale_inv', 'depression_inv', 'hostilite_coleriquee_inv', 'vulnerabilite_inv'], via_ranks: [9, 15, 21] },
      last_updated: null,
    },
    audace: {
      id: 'audace', name: 'Audace', base_value: 56, current_value: 56,
      sources: { ocean_facets: ['aventurisme', 'recherche_excitation', 'assertivite'], via_ranks: [12, 23] },
      last_updated: null,
    },
  },
};

function migrateState(saved) {
  // noPorn → noJunkFood (only migrate user data, not habit metadata)
  if (saved.habits?.noPorn && !saved.habits?.noJunkFood) {
    const { completions = {}, bestStreak = 0, totalDays = 0 } = saved.habits.noPorn;
    saved.habits.noJunkFood = { completions, currentStreak: 0, bestStreak, totalDays };
    delete saved.habits.noPorn;
  }
  // Strip config fields from all habits — name/xpPerDay/color/vacationMode come from DEFAULT_STATE
  if (saved.habits) {
    Object.keys(saved.habits).forEach(key => {
      const h = saved.habits[key];
      if (h) { delete h.name; delete h.xpPerDay; delete h.color; delete h.frequency; delete h.frequencyStartDate; }
    });
  }
  // Recalculate streaks for all habits (fix for stored stale streak values)
  if (saved.habits) {
    Object.keys(saved.habits).forEach(key => {
      const habit = saved.habits[key];
      if (habit?.completions) {
        const { current, best } = calculateStreak(habit.completions);
        habit.currentStreak = current;
        habit.bestStreak = Math.max(best, habit.bestStreak || 0);
      }
    });
  }
  return saved;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const saved = migrateState(JSON.parse(raw));
    const merged = deepMerge(DEFAULT_STATE, saved);
    // Recalculate streaks for alternate habits after merge (frequency is now available)
    Object.keys(merged.habits).forEach(key => {
      const habit = merged.habits[key];
      if (habit?.frequency === 'alternate' && habit?.completions && habit?.frequencyStartDate) {
        const { current, best } = calculateStreakAlternate(habit.completions, habit.frequencyStartDate);
        habit.currentStreak = current;
        habit.bestStreak = Math.max(best, habit.bestStreak || 0);
      }
    });
    return merged;
  } catch {
    return DEFAULT_STATE;
  }
}

function deepMerge(defaults, overrides) {
  const result = { ...defaults };
  Object.keys(overrides).forEach(key => {
    if (
      overrides[key] !== null &&
      typeof overrides[key] === 'object' &&
      !Array.isArray(overrides[key]) &&
      typeof defaults[key] === 'object' &&
      !Array.isArray(defaults[key])
    ) {
      result[key] = deepMerge(defaults[key] || {}, overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  });
  return result;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ── Reducer ────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    case 'NAVIGATE':
      return { ...state, ui: { ...state.ui, currentScreen: action.screen } };

    case 'SET_PLAYER_NAME':
      return { ...state, player: { ...state.player, name: action.name } };

    case 'SET_BIRTH_YEAR':
      return { ...state, player: { ...state.player, birthYear: action.year } };

    case 'ADD_XP': {
      const { xp, vertical } = action;
      const newTotalXP = state.player.totalXP + xp;
      const newStats = vertical
        ? { ...state.stats, [vertical]: { totalXP: state.stats[vertical].totalXP + xp } }
        : state.stats;
      return {
        ...state,
        player: { ...state.player, totalXP: newTotalXP },
        stats: newStats,
      };
    }

    case 'COMPLETE_WEEKLY_REVIEW': {
      const { form, xpResult, weekDates } = action;

      // Habits are now tracked daily — keep current state as-is
      const updatedHabits = state.habits;

      // Update patrimoine history
      let patrimoineHistory = [...state.patrimoine.history];
      const lastEntry = patrimoineHistory[patrimoineHistory.length - 1];
      if (!lastEntry || lastEntry.value !== form.patrimoine.value) {
        patrimoineHistory.push({
          date: form.date,
          value: form.patrimoine.value,
          note: form.patrimoine.note || '',
        });
      }

      // Update trading logs
      let updatedTrading = { ...state.trading };
      if (form.trading.traded) {
        updatedTrading.weeklyLogs = [...updatedTrading.weeklyLogs, {
          date: form.date,
          result: form.trading.result,
          mmRespected: form.trading.mmRespected,
          tradesCount: form.trading.tradesCount,
          traded: true,
        }];
        // Recalculate best monthly profit (simple approximation by week)
        const weeklyProfit = form.trading.result;
        if (weeklyProfit > (updatedTrading.bestMonthlyProfit || 0)) {
          updatedTrading.bestMonthlyProfit = weeklyProfit;
        }
      }

      // Update markets
      let updatedMarkets = { ...state.markets };
      if (form.markets.peaValue !== undefined) {
        updatedMarkets.pea = { ...updatedMarkets.pea, currentValue: form.markets.peaValue };
      }
      if (form.markets.ctoValue !== undefined) {
        updatedMarkets.cto = { ...updatedMarkets.cto, currentValue: form.markets.ctoValue };
      }
      if (form.markets.dcaDone) {
        updatedMarkets.dca = {
          ...updatedMarkets.dca,
          history: [...updatedMarkets.dca.history, { date: form.date, amount: updatedMarkets.dca.monthlyAmount }],
        };
        updatedMarkets.consecutiveDCAMonths = (updatedMarkets.consecutiveDCAMonths || 0) + 1;
        updatedMarkets.pea = {
          ...updatedMarkets.pea,
          totalInvested: updatedMarkets.pea.totalInvested + updatedMarkets.dca.monthlyAmount,
        };
      }

      // New total XP
      const newTotalXP = state.player.totalXP + xpResult.total;

      // Update character traits from self-assessment (never recalculated from scratch)
      const updatedTraits = applyTraitAnswers(state.traits, form.character, form.date);

      // Check badge unlocks with updated state
      const tempState = {
        ...state,
        habits: updatedHabits,
        patrimoine: { current: form.patrimoine.value, history: patrimoineHistory },
        trading: updatedTrading,
        markets: updatedMarkets,
        traits: updatedTraits,
        player: { ...state.player, totalXP: newTotalXP },
        weeklyReviews: [...state.weeklyReviews, { ...form, submittedAt: new Date().toISOString(), xpGained: xpResult.total }],
      };

      const newBadges = checkBadgeUnlocks(tempState, state.badges);
      const updatedBadges = { ...state.badges };
      let badgeXP = 0;
      newBadges.forEach(b => {
        updatedBadges[b.id] = { unlockedAt: todayISO(), xpGranted: b.xp };
        badgeXP += b.xp;
      });

      return {
        ...state,
        habits: updatedHabits,
        patrimoine: { current: form.patrimoine.value, history: patrimoineHistory },
        trading: updatedTrading,
        markets: updatedMarkets,
        traits: updatedTraits,
        player: { ...state.player, totalXP: newTotalXP + badgeXP },
        weeklyReviews: [...state.weeklyReviews, {
          ...form,
          submittedAt: new Date().toISOString(),
          xpGained: xpResult.total + badgeXP,
          newBadges: newBadges.map(b => b.id),
        }],
        badges: updatedBadges,
      };
    }

    case 'ADD_PROPERTY': {
      const property = {
        id: Date.now().toString(),
        name: action.property.name || 'Nouveau bien',
        type: action.property.type || 'flip',
        address: action.property.address || '',
        purchasePrice: 0,
        renovationBudget: 0,
        currentValue: 0,
        targetSalePrice: 0,
        netProfit: 0,
        cashflow: 0,
        status: 'searching',
        visited: false,
        offerAccepted: false,
        notaryActSigned: false,
        notes: '',
        createdAt: todayISO(),
        ...action.property,
      };
      const newState = {
        ...state,
        realEstate: { ...state.realEstate, properties: [...state.realEstate.properties, property] },
      };
      const newBadges = checkBadgeUnlocks(newState, state.badges);
      const updatedBadges = { ...state.badges };
      let badgeXP = 0;
      newBadges.forEach(b => { updatedBadges[b.id] = { unlockedAt: todayISO(), xpGranted: b.xp }; badgeXP += b.xp; });
      const xpGained = (action.xp || 0) + badgeXP;
      return {
        ...newState,
        badges: updatedBadges,
        player: { ...state.player, totalXP: state.player.totalXP + xpGained },
        stats: { ...state.stats, realEstate: { totalXP: state.stats.realEstate.totalXP + xpGained } },
      };
    }

    case 'REMOVE_PROPERTY': {
      return {
        ...state,
        realEstate: {
          ...state.realEstate,
          properties: state.realEstate.properties.filter(p => p.id !== action.id),
        },
      };
    }

    case 'UPDATE_PROPERTY': {
      const updated = state.realEstate.properties.map(p =>
        p.id === action.id ? { ...p, ...action.updates } : p
      );
      const newState = { ...state, realEstate: { ...state.realEstate, properties: updated } };
      const newBadges = checkBadgeUnlocks(newState, state.badges);
      const updatedBadges = { ...state.badges };
      let badgeXP = 0;
      newBadges.forEach(b => { updatedBadges[b.id] = { unlockedAt: todayISO(), xpGranted: b.xp }; badgeXP += b.xp; });
      const xpGained = (action.xp || 0) + badgeXP;
      return {
        ...newState,
        badges: updatedBadges,
        player: { ...state.player, totalXP: state.player.totalXP + xpGained },
        stats: xpGained > 0 ? { ...state.stats, realEstate: { totalXP: state.stats.realEstate.totalXP + xpGained } } : state.stats,
      };
    }

    case 'ADD_PROPFIRM': {
      const pf = { id: Date.now().toString(), name: '', capital: 0, maxDrawdown: 10, pnl: 0, status: 'challenge', ...action.propfirm };
      return { ...state, trading: { ...state.trading, propfirms: [...state.trading.propfirms, pf] } };
    }

    case 'UPDATE_PROPFIRM': {
      const pfs = state.trading.propfirms.map(p => p.id === action.id ? { ...p, ...action.updates } : p);
      const newState = { ...state, trading: { ...state.trading, propfirms: pfs } };
      const newBadges = checkBadgeUnlocks(newState, state.badges);
      const updatedBadges = { ...state.badges };
      let badgeXP = 0;
      newBadges.forEach(b => { updatedBadges[b.id] = { unlockedAt: todayISO(), xpGranted: b.xp }; badgeXP += b.xp; });
      return {
        ...newState,
        badges: updatedBadges,
        player: { ...state.player, totalXP: state.player.totalXP + badgeXP },
      };
    }

    case 'REMOVE_PROPFIRM': {
      return {
        ...state,
        trading: { ...state.trading, propfirms: state.trading.propfirms.filter(p => p.id !== action.id) }
      };
    }

    case 'UPDATE_MARKETS': {
      const updatedMarkets = { ...state.markets, ...action.updates };
      if (action.updates.pea) updatedMarkets.pea = { ...state.markets.pea, ...action.updates.pea };
      if (action.updates.cto) updatedMarkets.cto = { ...state.markets.cto, ...action.updates.cto };
      if (action.updates.dca) updatedMarkets.dca = { ...state.markets.dca, ...action.updates.dca };
      const newState = { ...state, markets: updatedMarkets };
      const newBadges = checkBadgeUnlocks(newState, state.badges);
      const updatedBadges = { ...state.badges };
      let badgeXP = 0;
      newBadges.forEach(b => { updatedBadges[b.id] = { unlockedAt: todayISO(), xpGranted: b.xp }; badgeXP += b.xp; });
      const xpGained = (action.xp || 0) + badgeXP;
      return {
        ...newState,
        badges: updatedBadges,
        player: { ...state.player, totalXP: state.player.totalXP + xpGained },
        stats: xpGained > 0 ? { ...state.stats, markets: { totalXP: state.stats.markets.totalXP + xpGained } } : state.stats,
      };
    }

    case 'OPEN_PEA': {
      const newMarkets = {
        ...state.markets,
        pea: { ...state.markets.pea, openDate: todayISO(), currentValue: action.amount || 0, totalInvested: action.amount || 0 },
      };
      const newState = { ...state, markets: newMarkets };
      const newBadges = checkBadgeUnlocks(newState, state.badges);
      const updatedBadges = { ...state.badges };
      let badgeXP = 0;
      newBadges.forEach(b => { updatedBadges[b.id] = { unlockedAt: todayISO(), xpGranted: b.xp }; badgeXP += b.xp; });
      const xpGained = 300 + badgeXP; // GDD: ouvrir compte = 200 XP, PEA quest = 300 XP
      return {
        ...newState,
        badges: updatedBadges,
        player: { ...state.player, totalXP: state.player.totalXP + xpGained },
        stats: { ...state.stats, markets: { totalXP: state.stats.markets.totalXP + xpGained } },
      };
    }

    case 'CLAIM_LOOT': {
      const updatedLoot = {
        ...state.loot,
        [action.id]: { claimedAt: todayISO(), note: action.note || '' },
      };
      return { ...state, loot: updatedLoot };
    }

    case 'UPDATE_PATRIMOINE': {
      const newHistory = [...state.patrimoine.history, { date: todayISO(), value: action.value, note: action.note || '' }];
      const newState = { ...state, patrimoine: { current: action.value, history: newHistory } };
      const newBadges = checkBadgeUnlocks(newState, state.badges);
      const updatedBadges = { ...state.badges };
      let badgeXP = 0;
      newBadges.forEach(b => { updatedBadges[b.id] = { unlockedAt: todayISO(), xpGranted: b.xp }; badgeXP += b.xp; });
      return {
        ...newState,
        badges: updatedBadges,
        player: { ...state.player, totalXP: state.player.totalXP + badgeXP },
      };
    }

    case 'TOGGLE_HABIT_DAY': {
      const { habitKey, date } = action;
      const habit = state.habits[habitKey];
      const wasCompleted = !!habit.completions[date];
      const newCompletions = { ...habit.completions };

      if (wasCompleted) {
        delete newCompletions[date];
      } else {
        newCompletions[date] = true;
      }

      const { current, best } = habit.frequency === 'alternate'
        ? calculateStreakAlternate(newCompletions, habit.frequencyStartDate)
        : calculateStreak(newCompletions);
      const totalDays = habit.frequency === 'alternate'
        ? Object.keys(newCompletions).filter(k => newCompletions[k] && isDueDay(k, habit.frequencyStartDate)).length
        : Object.values(newCompletions).filter(Boolean).length;
      const xpDelta = wasCompleted ? -habit.xpPerDay : habit.xpPerDay;

      return {
        ...state,
        habits: {
          ...state.habits,
          [habitKey]: {
            ...habit,
            completions: newCompletions,
            currentStreak: current,
            bestStreak: Math.max(best, habit.bestStreak),
            totalDays,
          },
        },
        player: { ...state.player, totalXP: Math.max(0, state.player.totalXP + xpDelta) },
        stats: {
          ...state.stats,
          health: { totalXP: Math.max(0, state.stats.health.totalXP + xpDelta) },
        },
      };
    }

    case 'RECHECK_BADGES': {
      const newBadges = checkBadgeUnlocks(state, state.badges);
      if (newBadges.length === 0) return state;
      const updatedBadges = { ...state.badges };
      let badgeXP = 0;
      newBadges.forEach(b => { updatedBadges[b.id] = { unlockedAt: todayISO(), xpGranted: b.xp }; badgeXP += b.xp; });
      return {
        ...state,
        badges: updatedBadges,
        player: { ...state.player, totalXP: state.player.totalXP + badgeXP },
      };
    }

    case 'TOGGLE_VACATION_MODE': {
      return {
        ...state,
        habits: {
          ...state.habits,
          noAlcohol: { ...state.habits.noAlcohol, vacationMode: !state.habits.noAlcohol.vacationMode },
        },
      };
    }

    case 'UPDATE_CONSECUTIVE_MONTHS': {
      return {
        ...state,
        trading: { ...state.trading, consecutivePositiveMonths: action.value }
      };
    }

    case 'RESET_STATE':
      return DEFAULT_STATE;

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
