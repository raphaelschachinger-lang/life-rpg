import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { BADGES, BADGE_CATEGORIES, RARITY_ORDER } from '../data/badges';
import { getLevelFromXP, formatDate } from '../utils/gameLogic';
import { Lock, Trophy, Filter } from 'lucide-react';

const RARITY_LABELS = {
  initie:    { label: 'Initié',    cls: 'pill-initie' },
  veteran:   { label: 'Vétéran',  cls: 'pill-veteran' },
  elite:     { label: 'Élite',    cls: 'pill-elite' },
  legendaire:{ label: 'Légendaire',cls: 'pill-legend' },
  mythique:  { label: 'Mythique', cls: 'pill-mythic' },
  timed:     { label: 'Temporel', cls: 'pill-timed' },
  secret:    { label: 'Secret',   cls: 'pill-secret' },
};

function BadgeCard({ badge, unlocked, unlockedData }) {
  const isSecret = badge.category === 'secret';
  const rl = RARITY_LABELS[badge.rarity] || RARITY_LABELS.initie;

  if (!unlocked && isSecret) {
    return (
      <div
        className="card"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', padding: 16,
          borderTop: '2px solid #2EC4B6',
          opacity: 0.7,
        }}
      >
        <div className="text-3xl mb-2" style={{ filter: 'grayscale(1)', opacity: 0.4 }}>???</div>
        <span className="pill pill-secret mb-2">Secret</span>
        <p className="text-xs italic" style={{ color: '#2EC4B6' }}>{badge.hint}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted2)' }}>???</p>
      </div>
    );
  }

  return (
    <div
      className={unlocked ? 'card pulse-gold' : 'card'}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: 16,
        borderTop: `2px solid ${unlocked ? (BADGE_CATEGORIES.find(c => c.id === badge.category)?.color || '#388BDC') : 'var(--border)'}`,
        opacity: unlocked ? 1 : 0.4,
        transition: 'all 0.2s',
      }}
    >
      <div
        className="text-3xl mb-2"
        style={{ filter: unlocked ? 'none' : 'grayscale(1) opacity(0.5)' }}
      >
        {badge.icon}
      </div>
      <span className={`pill ${rl.cls} mb-2`}>{rl.label}</span>
      <p className="text-xs font-bold mb-1" style={{ color: unlocked ? 'var(--text)' : 'var(--muted2)' }}>
        {badge.name}
      </p>
      <p className="text-xs mb-2" style={{ color: 'var(--muted2)', lineHeight: 1.4 }}>
        {badge.description}
      </p>
      {unlocked ? (
        <div>
          <p className="font-mono text-xs font-bold" style={{ color: '#3DC98A' }}>+{badge.xp} XP</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted2)', fontSize: 10 }}>
            {formatDate(unlockedData.unlockedAt)}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Lock size={10} style={{ color: 'var(--muted2)' }} />
          <span className="font-mono text-xs" style={{ color: 'var(--muted2)' }}>+{badge.xp} XP</span>
        </div>
      )}
    </div>
  );
}

export default function Achievements() {
  const { state } = useGame();
  const { level } = getLevelFromXP(state.player.totalXP);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const unlockedCount = Object.keys(state.badges).length;
  const totalBadges = Object.keys(BADGES).length;
  const totalXPFromBadges = Object.entries(state.badges).reduce((sum, [id, data]) => {
    return sum + (data.xpGranted || BADGES[id]?.xp || 0);
  }, 0);

  const filteredBadges = Object.values(BADGES).filter(badge => {
    if (filterCategory !== 'all' && badge.category !== filterCategory) return false;
    if (filterStatus === 'unlocked' && !state.badges[badge.id]) return false;
    if (filterStatus === 'locked' && state.badges[badge.id]) return false;
    return true;
  });

  // Sort: unlocked first, then by rarity
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    const aUnlocked = !!state.badges[a.id];
    const bUnlocked = !!state.badges[b.id];
    if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked;
    return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
  });

  return (
    <div className="fade-up" style={{ maxWidth: 1000 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Achievements</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {unlockedCount} / {totalBadges} badges débloqués · {totalXPFromBadges.toLocaleString()} XP gagnés
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Débloqués', value: unlockedCount, color: '#E4A94B', icon: '🏆' },
          { label: 'Restants', value: totalBadges - unlockedCount, color: 'var(--muted)', icon: '🔒' },
          { label: 'XP badges', value: `${totalXPFromBadges.toLocaleString()}`, color: '#3DC98A', icon: '⚡' },
          { label: 'Progression', value: `${Math.round((unlockedCount / totalBadges) * 100)}%`, color: '#388BDC', icon: '📊' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="card card-gold">
            <div className="flex items-center gap-2 mb-1">
              <span>{icon}</span>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{label}</p>
            </div>
            <p className="font-mono text-xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>PROGRESSION GLOBALE</span>
          <span className="text-xs font-mono" style={{ color: '#E4A94B' }}>
            {unlockedCount}/{totalBadges}
          </span>
        </div>
        <div className="progress-bar" style={{ height: 8, borderRadius: 4 }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${(unlockedCount / totalBadges) * 100}%`,
              background: 'linear-gradient(90deg, #E4A94B, #3DC98A)',
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-1">
          <Filter size={12} style={{ color: 'var(--muted)' }} />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Catégorie:</span>
        </div>
        {[{ id: 'all', label: 'Tous', color: 'var(--text)' }, ...BADGE_CATEGORIES].map(cat => (
          <button
            key={cat.id}
            className="btn btn-ghost text-xs"
            style={{
              padding: '3px 10px',
              ...(filterCategory === cat.id
                ? { background: `${cat.color}20`, color: cat.color, borderColor: `${cat.color}60` }
                : {}),
            }}
            onClick={() => setFilterCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}

        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />

        {[
          { id: 'all', label: 'Tous' },
          { id: 'unlocked', label: 'Débloqués' },
          { id: 'locked', label: 'Verrouillés' },
        ].map(f => (
          <button
            key={f.id}
            className="btn btn-ghost text-xs"
            style={{
              padding: '3px 10px',
              ...(filterStatus === f.id
                ? { background: 'var(--blue-dim)', color: '#388BDC', borderColor: 'rgba(56,139,220,0.4)' }
                : {}),
            }}
            onClick={() => setFilterStatus(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* By category — only if "all" filter */}
      {filterCategory === 'all' ? (
        BADGE_CATEGORIES.map(cat => {
          const catBadges = sortedBadges.filter(b => b.category === cat.id);
          if (catBadges.length === 0) return null;
          const catUnlocked = catBadges.filter(b => state.badges[b.id]).length;
          return (
            <div key={cat.id} className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-px flex-1"
                  style={{ background: `linear-gradient(90deg, ${cat.color}40, transparent)` }}
                />
                <h2 className="text-xs font-mono font-bold" style={{ color: cat.color, letterSpacing: '0.12em' }}>
                  {cat.label.toUpperCase()} ({catUnlocked}/{catBadges.length})
                </h2>
                <div className="h-px" style={{ width: 20, background: `${cat.color}40` }} />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {catBadges.map(badge => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    unlocked={!!state.badges[badge.id]}
                    unlockedData={state.badges[badge.id]}
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {sortedBadges.map(badge => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              unlocked={!!state.badges[badge.id]}
              unlockedData={state.badges[badge.id]}
            />
          ))}
        </div>
      )}

      {sortedBadges.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
          <Trophy size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <p>Aucun badge dans cette sélection.</p>
        </div>
      )}
    </div>
  );
}
