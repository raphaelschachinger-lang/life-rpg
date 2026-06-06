export const BADGES = {
  // ── Real Estate ──────────────────────────────────────────────
  'immo-premier-pas': {
    id: 'immo-premier-pas', name: 'Premier pas', category: 'realEstate',
    description: 'Visiter son premier bien immobilier',
    rarity: 'initie', xp: 100, icon: '🏠',
    check: s => s.realEstate.properties.some(p => p.visited),
  },
  'immo-chasseur': {
    id: 'immo-chasseur', name: 'Chasseur', category: 'realEstate',
    description: "Faire une offre acceptée",
    rarity: 'initie', xp: 200, icon: '🎯',
    check: s => s.realEstate.properties.some(p => p.offerAccepted),
  },
  'immo-proprio': {
    id: 'immo-proprio', name: 'Proprio', category: 'realEstate',
    description: "Signer son premier acte notarié",
    rarity: 'veteran', xp: 500, icon: '🔑',
    check: s => s.realEstate.properties.some(p => p.notaryActSigned),
  },
  'immo-flipper': {
    id: 'immo-flipper', name: 'Flipper', category: 'realEstate',
    description: "Revendre avec +20K€ net",
    rarity: 'veteran', xp: 800, icon: '💰',
    check: s => s.realEstate.properties.some(p => p.status === 'sold' && p.netProfit >= 20000),
  },
  'immo-grand-flipper': {
    id: 'immo-grand-flipper', name: 'Grand Flipper', category: 'realEstate',
    description: "Flip à +40K€ net",
    rarity: 'elite', xp: 1500, icon: '💎',
    check: s => s.realEstate.properties.some(p => p.status === 'sold' && p.netProfit >= 40000),
  },
  'immo-cash-machine': {
    id: 'immo-cash-machine', name: 'Cash Machine', category: 'realEstate',
    description: "Cash-flow net positif global",
    rarity: 'elite', xp: 1200, icon: '🏦',
    check: s => s.realEstate.properties.reduce((sum, p) => sum + (p.cashflow || 0), 0) > 0,
  },
  'immo-seigneur': {
    id: 'immo-seigneur', name: 'Seigneur foncier', category: 'realEstate',
    description: "Posséder 5 biens simultanément",
    rarity: 'legendaire', xp: 3000, icon: '👑',
    check: s => s.realEstate.properties.filter(p => p.status === 'owned').length >= 5,
  },
  'immo-titan': {
    id: 'immo-titan', name: 'Titan de l\'immo', category: 'realEstate',
    description: "Portefeuille brut > 1M€",
    rarity: 'mythique', xp: 5000, icon: '🌆',
    check: s => s.realEstate.properties.reduce((sum, p) => sum + (p.currentValue || 0), 0) >= 1000000,
  },

  // ── Trading ───────────────────────────────────────────────────
  'trade-first-green': {
    id: 'trade-first-green', name: 'First Green', category: 'trading',
    description: "Première semaine positive",
    rarity: 'initie', xp: 100, icon: '📈',
    check: s => s.trading.weeklyLogs.some(l => l.result > 0),
  },
  'trade-discipline': {
    id: 'trade-discipline', name: 'Discipline', category: 'trading',
    description: "30j de money management strict",
    rarity: 'initie', xp: 200, icon: '🎯',
    check: s => {
      let count = 0;
      for (const l of [...s.trading.weeklyLogs].reverse()) {
        if (l.mmRespected) count += 7; else break;
      }
      return count >= 30;
    },
  },
  'trade-streak-3': {
    id: 'trade-streak-3', name: 'Streak ×3', category: 'trading',
    description: "3 mois consécutifs positifs",
    rarity: 'veteran', xp: 500, icon: '🔥',
    check: s => s.trading.consecutivePositiveMonths >= 3,
  },
  'trade-the-six': {
    id: 'trade-the-six', name: 'The Six', category: 'trading',
    description: "6 mois consécutifs positifs",
    rarity: 'veteran', xp: 1000, icon: '⚡',
    check: s => s.trading.consecutivePositiveMonths >= 6,
  },
  'trade-funded': {
    id: 'trade-funded', name: 'Funded', category: 'trading',
    description: "Challenge FTMO 200K validé",
    rarity: 'elite', xp: 2000, icon: '🏆',
    check: s => s.trading.propfirms.some(p => p.status === 'funded'),
  },
  'trade-multi-funded': {
    id: 'trade-multi-funded', name: 'Multi-funded', category: 'trading',
    description: "3 propfirms actives simultanément",
    rarity: 'elite', xp: 2500, icon: '💼',
    check: s => s.trading.propfirms.filter(p => p.status === 'funded').length >= 3,
  },
  'trade-10k': {
    id: 'trade-10k', name: '10K/mois', category: 'trading',
    description: "10 000€ de profit en 1 mois",
    rarity: 'legendaire', xp: 4000, icon: '💵',
    check: s => s.trading.bestMonthlyProfit >= 10000,
  },
  'trade-gerant': {
    id: 'trade-gerant', name: 'Le Gérant', category: 'trading',
    description: "Gérer le capital de tiers (CIF)",
    rarity: 'mythique', xp: 6000, icon: '🎩',
    check: s => s.trading.managesThirdParty === true,
  },

  // ── Financial Markets ─────────────────────────────────────────
  'mkt-investisseur': {
    id: 'mkt-investisseur', name: "L'Investisseur", category: 'markets',
    description: "Ouvrir son PEA",
    rarity: 'initie', xp: 150, icon: '📊',
    check: s => !!s.markets.pea.openDate,
  },
  'mkt-dca-warrior': {
    id: 'mkt-dca-warrior', name: 'DCA Warrior', category: 'markets',
    description: "12 mois de DCA sans interruption",
    rarity: 'initie', xp: 300, icon: '🔄',
    check: s => s.markets.consecutiveDCAMonths >= 12,
  },
  'mkt-10k': {
    id: 'mkt-10k', name: '10K investi', category: 'markets',
    description: "10 000€ versés dans le PEA",
    rarity: 'veteran', xp: 500, icon: '💹',
    check: s => s.markets.pea.totalInvested >= 10000,
  },
  'mkt-pea-plafond': {
    id: 'mkt-pea-plafond', name: 'PEA Plafond', category: 'markets',
    description: "150K€ versés (plafond légal)",
    rarity: 'elite', xp: 2000, icon: '🎯',
    check: s => s.markets.pea.totalInvested >= 150000,
  },
  'mkt-half-million': {
    id: 'mkt-half-million', name: 'Half Million', category: 'markets',
    description: "CTO > 500 000€",
    rarity: 'legendaire', xp: 4000, icon: '🌟',
    check: s => s.markets.cto.currentValue >= 500000,
  },
  'mkt-compounder': {
    id: 'mkt-compounder', name: 'Le Compounder', category: 'markets',
    description: "Portefeuille total > 1M€",
    rarity: 'mythique', xp: 5000, icon: '♾️',
    check: s => (s.markets.pea.currentValue + s.markets.cto.currentValue) >= 1000000,
  },

  // ── Health ────────────────────────────────────────────────────
  'health-sport-7': {
    id: 'health-sport-7', name: '7j streak sport', category: 'health',
    description: "7 jours de sport consécutifs",
    rarity: 'initie', xp: 100, icon: '💪',
    check: s => s.habits.sport.currentStreak >= 7,
  },
  'health-lecteur': {
    id: 'health-lecteur', name: 'Lecteur', category: 'health',
    description: "7j de lecture consécutifs",
    rarity: 'initie', xp: 100, icon: '📚',
    check: s => s.habits.reading.currentStreak >= 7,
  },
  'health-clean-week': {
    id: 'health-clean-week', name: 'Clean Week', category: 'health',
    description: "Toutes les habitudes 7j parfaits",
    rarity: 'veteran', xp: 300, icon: '✨',
    check: s => Object.values(s.habits).every(h => h.currentStreak >= 7),
  },
  'health-30-smoke': {
    id: 'health-30-smoke', name: '30j sans fumer', category: 'health',
    description: "30 jours sans cigarette",
    rarity: 'veteran', xp: 500, icon: '🚭',
    check: s => s.habits.noSmoke.currentStreak >= 30,
  },
  'health-libere': {
    id: 'health-libere', name: 'Libéré', category: 'health',
    description: "90 jours sans cigarette",
    rarity: 'elite', xp: 1000, icon: '🕊️',
    check: s => s.habits.noSmoke.currentStreak >= 90,
  },
  'health-no-feed': {
    id: 'health-no-feed', name: 'No Feed', category: 'health',
    description: "30j sans réseaux sociaux",
    rarity: 'veteran', xp: 400, icon: '📵',
    check: s => s.habits.noSocial.currentStreak >= 30,
  },
  'health-moine': {
    id: 'health-moine', name: 'Moine', category: 'health',
    description: "90j sans pornographie",
    rarity: 'elite', xp: 1000, icon: '🧘',
    check: s => s.habits.noPorn.currentStreak >= 90,
  },
  'health-iron': {
    id: 'health-iron', name: 'Iron Health', category: 'health',
    description: "365j de toutes les habitudes",
    rarity: 'mythique', xp: 5000, icon: '⚔️',
    check: s => Object.values(s.habits).every(h => h.bestStreak >= 365),
  },

  // ── Global ────────────────────────────────────────────────────
  'global-premier-pas': {
    id: 'global-premier-pas', name: 'Premier pas', category: 'global',
    description: "Compléter sa première Weekly Review",
    rarity: 'initie', xp: 150, icon: '🎮',
    check: s => s.weeklyReviews.length >= 1,
  },
  'global-fonds': {
    id: 'global-fonds', name: 'Fonds sanctuaire', category: 'global',
    description: "9 000€ d'urgence intouchables",
    rarity: 'veteran', xp: 500, icon: '🛡️',
    check: s => s.markets.emergencyFund >= 9000,
  },
  'global-forge': {
    id: 'global-forge', name: 'The Forge terminée', category: 'global',
    description: "Chapitre I — 100K€ atteints",
    rarity: 'elite', xp: 3000, icon: '⚒️',
    check: s => s.patrimoine.current >= 100000,
  },
  'global-engine': {
    id: 'global-engine', name: 'The Engine', category: 'global',
    description: "Chapitre II — 1M€ atteints",
    rarity: 'legendaire', xp: 6000, icon: '🚂',
    check: s => s.patrimoine.current >= 1000000,
  },
  'global-masse': {
    id: 'global-masse', name: 'Masse critique', category: 'global',
    description: "Chapitre III — 4M€ atteints",
    rarity: 'mythique', xp: 10000, icon: '💥',
    check: s => s.patrimoine.current >= 4000000,
  },
  'global-endgame': {
    id: 'global-endgame', name: 'ENDGAME', category: 'global',
    description: "10 000 000€ — objectif terminal",
    rarity: 'mythique', xp: 20000, icon: '🌌',
    check: s => s.patrimoine.current >= 10000000,
  },

  // ── Timed ─────────────────────────────────────────────────────
  'timed-young-gun': {
    id: 'timed-young-gun', name: 'Young Gun', category: 'timed',
    description: "1er flip avant 26 ans",
    expiresAtAge: 26, rarity: 'elite', xp: 2000, icon: '⏱️',
    check: (s, now) => {
      const age = now.getFullYear() - s.player.birthYear;
      return age < 26 && s.realEstate.properties.some(p => p.status === 'sold');
    },
  },
  'timed-precoce': {
    id: 'timed-precoce', name: 'Précoce', category: 'timed',
    description: "100K€ avant 27 ans",
    expiresAtAge: 27, rarity: 'elite', xp: 2500, icon: '🌅',
    check: (s, now) => {
      const age = now.getFullYear() - s.player.birthYear;
      return age < 27 && s.patrimoine.current >= 100000;
    },
  },
  'timed-million-early': {
    id: 'timed-million-early', name: 'Million Club Early', category: 'timed',
    description: "1M€ avant 30 ans",
    expiresAtAge: 30, rarity: 'legendaire', xp: 5000, icon: '🏅',
    check: (s, now) => {
      const age = now.getFullYear() - s.player.birthYear;
      return age < 30 && s.patrimoine.current >= 1000000;
    },
  },
  'timed-pea-rapide': {
    id: 'timed-pea-rapide', name: 'PEA Rapide', category: 'timed',
    description: "PEA ouvert en 2025",
    expiresDate: '2025-12-31', rarity: 'veteran', xp: 500, icon: '⚡',
    check: (s, now) => {
      if (!s.markets.pea.openDate) return false;
      return s.markets.pea.openDate.startsWith('2025');
    },
  },
  'timed-new-year': {
    id: 'timed-new-year', name: 'New Year, New Life', category: 'timed',
    description: "Weekly Review le 1er janvier",
    rarity: 'initie', xp: 300, icon: '🎉',
    check: (s) => {
      return s.weeklyReviews.some(r => {
        const d = new Date(r.date);
        return d.getMonth() === 0 && d.getDate() === 1;
      });
    },
  },
  'timed-consistency': {
    id: 'timed-consistency', name: 'Consistency King', category: 'timed',
    description: "52 Weekly Reviews sur 52 semaines",
    rarity: 'legendaire', xp: 3000, icon: '👑',
    check: s => s.weeklyReviews.length >= 52,
  },

  // ── Secret ────────────────────────────────────────────────────
  'secret-sobre': {
    id: 'secret-sobre', name: 'Le Sobre', category: 'secret',
    hint: 'Lié à une discipline nocturne',
    rarity: 'secret', xp: 999, icon: '🌙',
    check: s => s.habits.noAlcohol.currentStreak >= 180,
  },
  'secret-eveille': {
    id: 'secret-eveille', name: "L'Éveillé", category: 'secret',
    hint: 'Lié à la lumière du matin',
    rarity: 'secret', xp: 999, icon: '☀️',
    check: s => s.weeklyReviews.some(r => {
      if (!r.submittedAt) return false;
      const h = new Date(r.submittedAt).getHours();
      return h < 8;
    }),
  },
  'secret-contrarian': {
    id: 'secret-contrarian', name: 'Le Contrarian', category: 'secret',
    hint: 'Lié à une décision courageuse',
    rarity: 'secret', xp: 999, icon: '⚡',
    check: s => {
      const logs = s.trading.weeklyLogs;
      for (let i = 0; i < logs.length - 1; i++) {
        if (logs[i].result < -0.20 * (logs[i].capital || 10000) && logs[i + 1].traded) return true;
      }
      return false;
    },
  },
  'secret-bibliophile': {
    id: 'secret-bibliophile', name: 'Le Bibliophile', category: 'secret',
    hint: 'Lié à la connaissance',
    rarity: 'secret', xp: 999, icon: '📖',
    check: s => s.habits.reading.currentStreak >= 100,
  },
  'secret-refus': {
    id: 'secret-refus', name: 'Le Refus', category: 'secret',
    hint: 'Lié à un non courageux',
    rarity: 'secret', xp: 999, icon: '🚫',
    check: s => s.player.frugalMonthAchieved === true,
  },
  'secret-iron-will': {
    id: 'secret-iron-will', name: 'Iron Will', category: 'secret',
    hint: 'Seul le temps le révèle',
    rarity: 'secret', xp: 1500, icon: '🔩',
    check: s => Object.values(s.habits).every(h => h.bestStreak >= 365),
  },
  'secret-oracle': {
    id: 'secret-oracle', name: 'The Oracle', category: 'secret',
    hint: 'Seul le Chapitre IV le révèle',
    rarity: 'secret', xp: 2000, icon: '🔮',
    check: (s, _now, level) => level >= 80,
  },
};

export const BADGE_LIST = Object.values(BADGES);

export const BADGE_CATEGORIES = [
  { id: 'realEstate', label: 'Real Estate', color: '#E4A94B' },
  { id: 'trading',    label: 'Trading',     color: '#3DC98A' },
  { id: 'markets',    label: 'Markets',     color: '#8B6FCA' },
  { id: 'health',     label: 'Health',      color: '#E05C5C' },
  { id: 'global',     label: 'Global',      color: '#388BDC' },
  { id: 'timed',      label: 'Temporels',   color: '#E05C5C' },
  { id: 'secret',     label: 'Secrets',     color: '#2EC4B6' },
];

export const RARITY_ORDER = ['initie', 'veteran', 'elite', 'legendaire', 'mythique', 'timed', 'secret'];
