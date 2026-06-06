import React from 'react';
import { useGame } from '../context/GameContext';
import { getLevelFromXP, getPlayerTitle, getCurrentChapter, getChapterProgress, formatCurrency } from '../utils/gameLogic';
import { Zap, Shield } from 'lucide-react';

export default function Topbar() {
  const { state } = useGame();
  const { level, xpInLevel, xpNeeded } = getLevelFromXP(state.player.totalXP);
  const title = getPlayerTitle(level);
  const chapter = getCurrentChapter(state.patrimoine.current);
  const chapterProgress = getChapterProgress(state.patrimoine.current, chapter);
  const xpPct = Math.min(100, (xpInLevel / xpNeeded) * 100);

  return (
    <div
      className="flex items-center gap-4 px-5 h-14 flex-shrink-0"
      style={{ background: 'var(--navy-800)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="w-7 h-7 rounded flex items-center justify-center text-sm"
          style={{ background: 'var(--blue)', color: '#fff', fontFamily: 'JetBrains Mono', fontWeight: 700 }}
        >
          L
        </div>
        <span className="font-mono text-sm font-bold" style={{ color: 'var(--text)', letterSpacing: '0.1em' }}>
          LIFE RPG
        </span>
      </div>

      {/* Chapter badge */}
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full flex-shrink-0"
        style={{ background: `${chapter.color}18`, border: `1px solid ${chapter.color}40` }}
      >
        <Shield size={12} style={{ color: chapter.color }} />
        <span className="text-xs font-mono font-bold" style={{ color: chapter.color, letterSpacing: '0.08em' }}>
          CH. {chapter.id} — {chapter.name}
        </span>
        <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
          {chapterProgress.toFixed(0)}%
        </span>
      </div>

      <div className="flex-1" />

      {/* Patrimoine */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs" style={{ color: 'var(--muted)' }}>Patrimoine</span>
        <span className="font-mono text-sm font-bold" style={{ color: '#E4A94B' }}>
          {formatCurrency(state.patrimoine.current)}
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border)', flexShrink: 0 }} />

      {/* XP Bar */}
      <div className="flex items-center gap-3 flex-shrink-0" style={{ minWidth: 220 }}>
        <div className="flex items-center gap-1">
          <Zap size={12} style={{ color: '#388BDC' }} />
          <span className="font-mono text-xs font-bold" style={{ color: '#388BDC' }}>
            LVL {level}
          </span>
        </div>
        <div className="flex-1 relative" style={{ minWidth: 120 }}>
          <div className="progress-bar" style={{ height: 6, borderRadius: 3 }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, #388BDC, #2EC4B6)' }}
            />
          </div>
        </div>
        <span className="font-mono text-xs" style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border)', flexShrink: 0 }} />

      {/* Title */}
      <div
        className="px-2 py-1 rounded text-xs font-mono font-bold flex-shrink-0"
        style={{ background: 'var(--blue-dim)', color: '#388BDC', letterSpacing: '0.06em' }}
      >
        {title.toUpperCase()}
      </div>
    </div>
  );
}
