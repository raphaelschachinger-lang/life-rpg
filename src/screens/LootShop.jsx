import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { LOOT_ITEMS, isLootUnlocked } from '../data/loot';
import { getLevelFromXP, formatCurrency, formatDate } from '../utils/gameLogic';
import { Gift, Lock, Check, X } from 'lucide-react';

function ClaimModal({ item, onConfirm, onClose }) {
  const [note, setNote] = useState('');
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(5,13,26,0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div className="card pulse-gold" style={{ width: 440, borderTop: '2px solid #E4A94B' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Réclamer la récompense</h3>
          <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={onClose}><X size={14} /></button>
        </div>

        <div
          className="p-4 rounded-lg mb-4 text-center"
          style={{ background: 'var(--gold-dim)', border: '1px solid rgba(228,169,75,0.3)' }}
        >
          <div className="text-4xl mb-2">{item.icon}</div>
          <h4 className="font-bold mb-1" style={{ color: '#E4A94B' }}>{item.label}</h4>
          {item.budget && (
            <p className="font-mono text-sm" style={{ color: 'var(--text)' }}>
              Budget max: <strong>{formatCurrency(item.budget)}</strong>
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--muted)' }}>
            Comment comptez-vous utiliser cette récompense ? (optionnel)
          </label>
          <textarea
            rows={3}
            placeholder="Détails, date prévue, retour d'expérience..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            className="btn btn-gold flex-1 flex items-center justify-center gap-2"
            onClick={() => { onConfirm(note); onClose(); }}
          >
            <Check size={14} /> Confirmer
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

function LootCard({ item, unlocked, claimed, claimData, onClaim }) {
  const [showClaim, setShowClaim] = useState(false);

  return (
    <div
      className="card"
      style={{
        borderTop: `2px solid ${claimed ? '#3DC98A' : unlocked ? '#E4A94B' : 'var(--border)'}`,
        opacity: claimed ? 0.7 : 1,
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow effect for unlocked */}
      {unlocked && !claimed && (
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, #E4A94B, transparent)',
            animation: 'pulseGold 2s ease infinite',
          }}
        />
      )}

      <div className="flex items-start gap-3 mb-3">
        <div
          className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg"
          style={{
            background: claimed ? 'rgba(61,201,138,0.1)' : unlocked ? 'var(--gold-dim)' : 'var(--navy-700)',
            border: `1px solid ${claimed ? '#3DC98A40' : unlocked ? '#E4A94B40' : 'var(--border)'}`,
          }}
        >
          {item.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3
              className="text-sm font-bold"
              style={{ color: claimed ? '#3DC98A' : unlocked ? '#E4A94B' : 'var(--muted2)' }}
            >
              {item.label}
            </h3>
            {claimed && <Check size={12} style={{ color: '#3DC98A' }} />}
            {!unlocked && <Lock size={11} style={{ color: 'var(--muted2)' }} />}
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{item.trigger}</p>
        </div>
      </div>

      {item.budget && (
        <div
          className="inline-block px-2 py-1 rounded text-xs font-mono font-bold mb-3"
          style={{
            background: unlocked ? 'var(--gold-dim)' : 'var(--navy-700)',
            color: unlocked ? '#E4A94B' : 'var(--muted2)',
          }}
        >
          Budget max: {formatCurrency(item.budget)}
        </div>
      )}
      {!item.budget && (
        <div
          className="inline-block px-2 py-1 rounded text-xs font-mono font-bold mb-3"
          style={{ background: 'var(--navy-700)', color: 'var(--muted)' }}
        >
          Budget libre
        </div>
      )}

      {claimed ? (
        <div
          className="p-2 rounded text-xs"
          style={{ background: 'rgba(61,201,138,0.08)', border: '1px solid rgba(61,201,138,0.2)' }}
        >
          <p style={{ color: '#3DC98A', marginBottom: 2 }}>✓ Réclamée le {formatDate(claimData.claimedAt)}</p>
          {claimData.note && (
            <p style={{ color: 'var(--muted)' }}>{claimData.note}</p>
          )}
        </div>
      ) : unlocked ? (
        <button
          className="btn btn-gold w-full flex items-center justify-center gap-2"
          style={{ width: '100%', animation: 'pulseGold 2s ease infinite' }}
          onClick={() => setShowClaim(true)}
        >
          <Gift size={13} /> Réclamer
        </button>
      ) : (
        <div
          className="p-2 rounded text-xs"
          style={{ background: 'var(--navy-700)', border: '1px solid var(--border)' }}
        >
          <Lock size={11} style={{ color: 'var(--muted2)', display: 'inline', marginRight: 6 }} />
          <span style={{ color: 'var(--muted2)' }}>Condition: {item.trigger}</span>
        </div>
      )}

      {showClaim && (
        <ClaimModal
          item={item}
          onConfirm={(note) => onClaim(item.id, note)}
          onClose={() => setShowClaim(false)}
        />
      )}
    </div>
  );
}

export default function LootShop() {
  const { state, dispatch } = useGame();
  const { level } = getLevelFromXP(state.player.totalXP);

  const unlockedItems = LOOT_ITEMS.filter(item => isLootUnlocked(item, state, level));
  const claimedItems = LOOT_ITEMS.filter(item => state.loot[item.id]);
  const pendingItems = unlockedItems.filter(item => !state.loot[item.id]);

  // Sort: pending unlocked first, then unlocked+claimed, then locked
  const sorted = [...LOOT_ITEMS].sort((a, b) => {
    const aUnlocked = isLootUnlocked(a, state, level);
    const bUnlocked = isLootUnlocked(b, state, level);
    const aClaimed = !!state.loot[a.id];
    const bClaimed = !!state.loot[b.id];

    if (!aClaimed && aUnlocked && (bClaimed || !bUnlocked)) return -1;
    if (!bClaimed && bUnlocked && (aClaimed || !aUnlocked)) return 1;
    if (aClaimed && !bClaimed) return 1;
    if (!aClaimed && bClaimed) return -1;
    return 0;
  });

  return (
    <div className="fade-up" style={{ maxWidth: 900 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Loot Shop</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Récompenses méritées — ruptures contrôlées du réinvestissement total
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-lg" style={{ color: '#E4A94B' }}>
            {pendingItems.length}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>à réclamer</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Disponibles', value: pendingItems.length, color: '#E4A94B', icon: '🎁' },
          { label: 'Réclamées', value: claimedItems.length, color: '#3DC98A', icon: '✓' },
          { label: 'Verrouillées', value: LOOT_ITEMS.length - unlockedItems.length, color: 'var(--muted)', icon: '🔒' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="card card-gold">
            <div className="flex items-center gap-2 mb-1">
              <span>{icon}</span>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{label}</p>
            </div>
            <p className="font-mono text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {pendingItems.length > 0 && (
        <div
          className="card mb-6 pulse-gold"
          style={{ borderTop: '2px solid #E4A94B', background: 'var(--gold-dim)' }}
        >
          <div className="flex items-center gap-3">
            <Gift size={20} style={{ color: '#E4A94B' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: '#E4A94B' }}>
                {pendingItems.length} récompense{pendingItems.length > 1 ? 's' : ''} prête{pendingItems.length > 1 ? 's' : ''} à réclamer !
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Vous avez mérité ces récompenses. Profitez-en.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loot grid */}
      <div className="grid grid-cols-3 gap-4">
        {sorted.map(item => (
          <LootCard
            key={item.id}
            item={item}
            unlocked={isLootUnlocked(item, state, level)}
            claimed={!!state.loot[item.id]}
            claimData={state.loot[item.id]}
            onClaim={(id, note) => dispatch({ type: 'CLAIM_LOOT', id, note })}
          />
        ))}
      </div>

      {/* Principles reminder */}
      <div
        className="mt-6 p-4 rounded-lg text-xs"
        style={{ background: 'var(--navy-700)', border: '1px solid var(--border)', color: 'var(--muted)' }}
      >
        <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>📖 Principe #2</p>
        <p>
          Réinvestissement total — Zéro upgrade de train de vie avant 30 ans.
          Chaque euro exceptionnel va dans le patrimoine.
          Ces récompenses sont les seules exceptions autorisées.
        </p>
      </div>
    </div>
  );
}
