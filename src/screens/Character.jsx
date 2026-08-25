import React from 'react';
import { useGame } from '../context/GameContext';
import { TRAIT_ORDER, TRAITS_META } from '../data/traits';
import { formatDate } from '../utils/gameLogic';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer, Tooltip,
} from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="rounded-lg p-3 text-xs"
      style={{ background: 'var(--navy-800)', border: '1px solid var(--border2)' }}
    >
      <p className="font-bold mb-1" style={{ color: 'var(--text)' }}>{payload[0].payload.trait}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name} : {p.value.toFixed(1)}
        </p>
      ))}
    </div>
  );
}

export default function Character() {
  const { state } = useGame();
  const traits = state.traits;

  const radarData = TRAIT_ORDER.map(id => ({
    trait: TRAITS_META[id].name,
    base: traits[id].base_value,
    current: traits[id].current_value,
  }));

  const totalGain = TRAIT_ORDER.reduce((sum, id) => sum + (traits[id].current_value - traits[id].base_value), 0);

  return (
    <div className="fade-up" style={{ maxWidth: 1000 }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Personnage</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          6 traits calculés depuis Big Five (IPIP-NEO) et VIA Character Strengths, ajustés chaque semaine par auto-évaluation.
        </p>
      </div>

      {/* Radar chart */}
      <div className="card mb-6" style={{ padding: 24 }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono" style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}>
            DÉPART VS ACTUEL
          </span>
          <span
            className="text-xs mono font-bold"
            style={{ color: totalGain > 0 ? 'var(--accent)' : 'var(--muted)' }}
          >
            {totalGain > 0 ? `+${totalGain.toFixed(1)} pts cumulés` : 'Aucune progression pour le moment'}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={420}>
          <RadarChart data={radarData} outerRadius="70%">
            <PolarGrid stroke="var(--border2)" />
            <PolarAngleAxis dataKey="trait" tick={{ fill: 'var(--text)', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--muted2)', fontSize: 10 }} />
            <Radar name="Départ" dataKey="base" stroke="var(--muted2)" fill="var(--muted2)" fillOpacity={0.08} strokeDasharray="4 3" />
            <Radar name="Actuel" dataKey="current" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.25} strokeWidth={2} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Trait detail cards */}
      <div className="grid grid-cols-2 gap-4">
        {TRAIT_ORDER.map(id => {
          const meta = TRAITS_META[id];
          const trait = traits[id];
          const delta = trait.current_value - trait.base_value;
          return (
            <div key={id} className="card">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{meta.name}</span>
                  <span className="text-xs ml-2" style={{ color: 'var(--muted2)' }}>{meta.subtitle}</span>
                </div>
                <span className="mono text-lg font-bold" style={{ color: meta.color }}>
                  {trait.current_value.toFixed(1)}
                </span>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{meta.definition}</p>

              <div className="progress-bar mb-2" style={{ height: 4 }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${trait.current_value}%`, background: meta.color }}
                />
              </div>
              <div className="flex justify-between text-xs mb-3" style={{ color: 'var(--muted2)' }}>
                <span>Départ : {trait.base_value}</span>
                <span style={{ color: delta > 0 ? 'var(--accent)' : 'var(--muted2)' }}>
                  {delta > 0 ? `+${delta.toFixed(1)}` : 'stable'}
                </span>
              </div>

              <p className="text-xs" style={{ color: 'var(--muted2)', lineHeight: 1.5 }}>
                {meta.composition}
              </p>
              {trait.last_updated && (
                <p className="text-xs mt-2" style={{ color: 'var(--muted2)', fontSize: 10 }}>
                  Dernière mise à jour : {formatDate(trait.last_updated)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
