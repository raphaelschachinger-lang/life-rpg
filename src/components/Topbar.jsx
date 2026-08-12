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
      style={{ background: 'var(--bg-panel)', backdropFilter: 'blur(2px)', borderBottom: '1px solid var(--line)', position: 'relative', zIndex: 1 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="w-7 h-7 flex items-center justify-center text-sm"
          style={{ border: '1px solid var(--cyan)', color: 'var(--cyan)', fontWeight: 700, borderRadius: 2 }}
        >
          L
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--text)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Life RPG
        </span>
      </div>

      {/* Chapter badge */}
      <div
        className="flex items-center gap-2 px-3 py-1 flex-shrink-0"
        style={{ background: 'var(--cyan-dim-bg)', border: '1px solid var(--line-strong)', borderRadius: 2 }}
      >
        <Shield size={12} style={{ color: 'var(--cyan)' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--cyan)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          CH. {chapter.id} — {chapter.name}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
          {chapterProgress.toFixed(0)}%
        </span>
      </div>

      <div className="flex-1" />

      {/* Patrimoine */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs" style={{ color: 'var(--text-dim)', textTransform: 'uppercase' }}>Patrimoine</span>
        <span className="text-sm font-bold" style={{ color: 'var(--cyan)' }}>
          {formatCurrency(state.patrimoine.current)}
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--line)', flexShrink: 0 }} />

      {/* XP Bar */}
      <div className="flex items-center gap-3 flex-shrink-0" style={{ minWidth: 220 }}>
        <div className="flex items-center gap-1">
          <Zap size={12} style={{ color: 'var(--cyan)' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--cyan)' }}>
            LVL {level}
          </span>
        </div>
        <div className="flex-1 relative" style={{ minWidth: 120 }}>
          <div className="progress-bar" style={{ height: 5 }}>
            <div className="progress-bar-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
          {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--line)', flexShrink: 0 }} />

      {/* Title */}
      <div
        className="px-2 py-1 text-xs font-bold flex-shrink-0"
        style={{ background: 'var(--cyan-dim-bg)', color: 'var(--cyan)', letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 2 }}
      >
        {title}
      </div>
    </div>
  );
}
