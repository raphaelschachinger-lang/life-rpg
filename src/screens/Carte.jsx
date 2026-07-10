import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getLevelFromXP, getMilestoneStatus } from '../utils/gameLogic';
import { MILESTONES } from '../data/milestones';
import { Star, Flag, Check, MapPin, Map, Search } from 'lucide-react';

const THEMATIC_COLOR = '#E4A94B';
const GENERIC_COLOR = '#388BDC';
const DONE_COLOR = '#3DC98A';

const STATUS_LABEL = { not_started: 'À venir', in_progress: 'En cours', done: 'Terminé' };
const NEXT_STATUS = { not_started: 'in_progress', in_progress: 'done', done: 'not_started' };

function nodeColor(milestone, status) {
  if (status === 'done') return DONE_COLOR;
  if (status === 'not_started') return 'var(--muted2)';
  return milestone.type === 'thematic' ? THEMATIC_COLOR : GENERIC_COLOR;
}

function MilestoneNode({ milestone, status, onClick, size = 36 }) {
  const Icon = milestone.type === 'thematic' ? Star : Flag;
  const color = nodeColor(milestone, status);
  const clickable = milestone.type === 'thematic';
  return (
    <button
      type="button"
      className={status === 'in_progress' ? 'pulse-node' : ''}
      onClick={clickable ? onClick : undefined}
      title={clickable ? `${milestone.title} — cliquer pour changer le statut (${STATUS_LABEL[status]})` : `${milestone.title} (${STATUS_LABEL[status]})`}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: status === 'not_started' ? 'var(--navy-700)' : `${color}22`,
        border: `2px solid ${color}`,
        color,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.15s',
      }}
    >
      {status === 'done' ? <Check size={size * 0.5} /> : <Icon size={size * 0.42} />}
    </button>
  );
}

function MacroView({ sorted, state, currentLevel, maxLevel, cycleStatus }) {
  const currentPct = Math.min(100, (currentLevel / maxLevel) * 100);
  return (
    <div className="card" style={{ padding: '48px 32px 64px' }}>
      <div style={{ position: 'relative', height: 2 }}>
        {/* Path — parcouru (plein) puis à venir (pointillé) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: `${currentPct}%`, height: 2, background: 'var(--blue)' }} />
        <div style={{ position: 'absolute', top: 0, left: `${currentPct}%`, right: 0, height: 0, borderTop: '2px dashed var(--border2)' }} />

        {/* Position actuelle */}
        <div
          style={{ position: 'absolute', top: 0, left: `${currentPct}%`, transform: 'translate(-50%, -100%)', textAlign: 'center', marginBottom: 8 }}
        >
          <div className="flex flex-col items-center" style={{ marginBottom: 6 }}>
            <span className="text-xs font-mono font-bold" style={{ color: 'var(--blue)', whiteSpace: 'nowrap' }}>
              Toi · Niveau {currentLevel}
            </span>
            <MapPin size={20} style={{ color: 'var(--blue)' }} />
          </div>
        </div>

        {/* Jalons */}
        {sorted.map((m, i) => {
          const pct = Math.min(100, (m.target_level / maxLevel) * 100);
          const status = getMilestoneStatus(m, state.milestones, currentLevel);
          const labelBelow = i % 2 === 1;
          return (
            <div
              key={m.id}
              style={{ position: 'absolute', top: 0, left: `${pct}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="flex flex-col items-center" style={{ gap: 6 }}>
                {!labelBelow && (
                  <div style={{ textAlign: 'center', marginBottom: 4, minWidth: 90 }}>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text)', whiteSpace: 'nowrap' }}>{m.title}</p>
                    {m.subtitle && <p className="text-xs" style={{ color: 'var(--muted2)', fontSize: 10 }}>{m.subtitle}</p>}
                  </div>
                )}
                <MilestoneNode milestone={m} status={status} onClick={() => cycleStatus(m.id)} />
                {labelBelow && (
                  <div style={{ textAlign: 'center', marginTop: 4, minWidth: 90 }}>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text)', whiteSpace: 'nowrap' }}>{m.title}</p>
                    {m.subtitle && <p className="text-xs" style={{ color: 'var(--muted2)', fontSize: 10 }}>{m.subtitle}</p>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mt-16 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Star size={14} style={{ color: THEMATIC_COLOR }} /> <span className="text-xs" style={{ color: 'var(--muted)' }}>Jalon thématique</span>
        </div>
        <div className="flex items-center gap-2">
          <Flag size={14} style={{ color: GENERIC_COLOR }} /> <span className="text-xs" style={{ color: 'var(--muted)' }}>Jalon générique</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={14} style={{ color: DONE_COLOR }} /> <span className="text-xs" style={{ color: 'var(--muted)' }}>Terminé</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="pulse-node" style={{ width: 10, height: 10, borderRadius: '50%', background: THEMATIC_COLOR, color: THEMATIC_COLOR, display: 'inline-block' }} />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>En cours</span>
        </div>
      </div>
    </div>
  );
}

function ZoomView({ sorted, state, currentLevel, cycleStatus }) {
  const range = 5;
  const start = Math.max(1, currentLevel - range);
  const end = currentLevel + range;
  const levels = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const nearbyThematic = sorted.filter(m => m.type === 'thematic');

  return (
    <div className="card" style={{ padding: 24 }}>
      <p className="text-xs font-mono mb-4" style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}>
        CHAPITRE ACTUEL · NIVEAU {start} À {end}
      </p>
      <div className="flex gap-2 mb-8 flex-wrap">
        {levels.map(lvl => {
          const milestone = sorted.find(m => m.target_level === lvl);
          const isCurrent = lvl === currentLevel;
          const status = milestone ? getMilestoneStatus(milestone, state.milestones, currentLevel) : null;
          const color = milestone ? nodeColor(milestone, status) : (lvl <= currentLevel ? 'var(--blue)' : 'var(--muted2)');
          return (
            <div key={lvl} className="flex flex-col items-center" style={{ gap: 4, minWidth: 44 }}>
              <button
                type="button"
                onClick={milestone?.type === 'thematic' ? () => cycleStatus(milestone.id) : undefined}
                title={milestone ? `${milestone.title}${milestone.subtitle ? ' — ' + milestone.subtitle : ''}` : `Niveau ${lvl}`}
                className={status === 'in_progress' ? 'pulse-node' : ''}
                style={{
                  width: isCurrent ? 40 : 32, height: isCurrent ? 40 : 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCurrent ? 'var(--blue)' : (lvl <= currentLevel ? 'var(--blue-dim)' : 'var(--navy-700)'),
                  border: milestone ? `2px solid ${color}` : `1px solid ${lvl <= currentLevel ? 'var(--blue)' : 'var(--border)'}`,
                  color: isCurrent ? '#fff' : color,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, fontWeight: 700,
                  cursor: milestone?.type === 'thematic' ? 'pointer' : 'default',
                }}
              >
                {milestone ? (milestone.type === 'thematic' ? <Star size={14} /> : <Flag size={14} />) : lvl}
              </button>
              {milestone && (
                <span className="text-xs text-center" style={{ color: 'var(--muted2)', fontSize: 9, maxWidth: 60 }}>
                  {milestone.title}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs font-mono mb-3" style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}>
        JALONS THÉMATIQUES
      </p>
      <div className="flex flex-col gap-2">
        {nearbyThematic.map(m => {
          const status = getMilestoneStatus(m, state.milestones, currentLevel);
          const color = nodeColor(m, status);
          return (
            <div
              key={m.id}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: 'var(--navy-700)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <MilestoneNode milestone={m} status={status} onClick={() => cycleStatus(m.id)} size={28} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{m.title}</p>
                  <p className="text-xs" style={{ color: 'var(--muted2)' }}>{m.subtitle} · Niveau visé {m.target_level}</p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost text-xs"
                style={{ color, borderColor: `${color}60` }}
                onClick={() => cycleStatus(m.id)}
              >
                {STATUS_LABEL[status]}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Carte() {
  const { state, dispatch } = useGame();
  const { level: currentLevel, xpInLevel, xpNeeded } = getLevelFromXP(state.player.totalXP);
  const [view, setView] = useState('macro');

  const sorted = [...MILESTONES].sort((a, b) => a.target_level - b.target_level);
  const maxLevel = Math.max(currentLevel, ...sorted.map(m => m.target_level)) + 3;

  const cycleStatus = (id) => {
    const current = state.milestones[id]?.status || 'not_started';
    dispatch({ type: 'SET_MILESTONE_STATUS', id, status: NEXT_STATUS[current] });
  };

  const pct = Math.min(100, (xpInLevel / xpNeeded) * 100);

  return (
    <div className="fade-up" style={{ maxWidth: 1000 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Carte de progression</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Niveau {currentLevel} · {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP vers le niveau suivant
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={`btn flex items-center gap-2 text-xs ${view === 'macro' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('macro')}
          >
            <Map size={13} /> Vue macro
          </button>
          <button
            className={`btn flex items-center gap-2 text-xs ${view === 'zoom' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('zoom')}
          >
            <Search size={13} /> Vue zoom
          </button>
        </div>
      </div>

      <div className="progress-bar mb-6" style={{ height: 6, borderRadius: 3 }}>
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'var(--blue)' }} />
      </div>

      {view === 'macro' ? (
        <MacroView sorted={sorted} state={state} currentLevel={currentLevel} maxLevel={maxLevel} cycleStatus={cycleStatus} />
      ) : (
        <ZoomView sorted={sorted} state={state} currentLevel={currentLevel} cycleStatus={cycleStatus} />
      )}
    </div>
  );
}
