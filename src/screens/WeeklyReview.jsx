import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { calculateWeeklyXP, getCurrentWeekDates, formatDate, checkBadgeUnlocks } from '../utils/gameLogic';
import { BADGES } from '../data/badges';
import { ChevronRight, ChevronLeft, Check, Zap } from 'lucide-react';

const RE_ACTIONS = [
  { value: 'visit',     label: 'Visite de bien',                  xp: 200 },
  { value: 'contact',   label: 'Contact agence / particulier',    xp: 50  },
  { value: 'chantier',  label: 'Point chantier',                  xp: 80  },
  { value: 'rendement', label: 'Calcul rendement locatif',        xp: 30  },
  { value: 'offre',     label: 'Offre faite',                     xp: 300 },
  { value: 'compromis', label: 'Compromis signé',                 xp: 500 },
];

function StepIndicator({ step, total }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
            style={{
              background: i + 1 <= step ? '#388BDC' : 'var(--navy-700)',
              color: i + 1 <= step ? '#fff' : 'var(--muted2)',
              border: i + 1 === step ? '2px solid #388BDC' : '1px solid var(--border)',
            }}
          >
            {i + 1 < step ? <Check size={12} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className="flex-1 h-px"
              style={{ background: i + 1 < step ? '#388BDC' : 'var(--border)', maxWidth: 40 }}
            />
          )}
        </React.Fragment>
      ))}
      <span className="text-xs ml-2" style={{ color: 'var(--muted)' }}>
        Étape {step} / {total}
      </span>
    </div>
  );
}

function HabitGrid({ habitKey, habitName, color, values, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 flex-shrink-0" style={{ width: 190 }}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="text-sm" style={{ color: 'var(--text)' }}>{habitName}</span>
      </div>
      <div className="flex gap-2">
        {DAYS.map((day, i) => (
          <button
            key={i}
            type="button"
            className={`toggle-day ${values[i] ? 'checked' : ''}`}
            style={values[i] ? { background: color, borderColor: color } : {}}
            onClick={() => {
              const next = [...values];
              next[i] = !next[i];
              onChange(next);
            }}
          >
            {day}
          </button>
        ))}
      </div>
      <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
        {values.filter(Boolean).length}/7
      </span>
    </div>
  );
}

// Animated XP counter
function XPCounter({ target }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const duration = 1200;
    const frame = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [target]);
  return <span>{displayed.toLocaleString()}</span>;
}

function ResultsScreen({ xpResult, newBadges, onDone }) {
  return (
    <div className="fade-up text-center" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div
        className="rounded-xl p-8 mb-6"
        style={{ background: 'var(--navy-800)', border: '1px solid var(--border2)' }}
      >
        <div className="text-6xl mb-4">⚡</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          Weekly Review terminée!
        </h2>
        <div
          className="font-mono font-bold mb-2"
          style={{ fontSize: 48, color: '#388BDC' }}
        >
          +<XPCounter target={xpResult.total} /> XP
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          {xpResult.perfectWeek ? '🔥 Semaine parfaite! Bonus appliqué.' : 'Continue comme ça!'}
        </p>

        {/* XP breakdown */}
        <div
          className="text-left rounded-lg p-4 mb-6"
          style={{ background: 'var(--navy-700)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs font-mono font-bold mb-3" style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}>
            DÉTAIL XP
          </p>
          <div className="flex flex-col gap-2">
            {xpResult.breakdown.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span style={{ color: 'var(--text)' }}>{item.label}</span>
                <span className="font-mono font-bold" style={{ color: '#3DC98A' }}>+{item.xp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* New badges */}
        {newBadges.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-mono font-bold mb-3" style={{ color: '#E4A94B', letterSpacing: '0.1em' }}>
              🏆 BADGES DÉBLOQUÉS
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {newBadges.map(b => (
                <div
                  key={b.id}
                  className="px-3 py-2 rounded-lg pulse-gold"
                  style={{ background: 'var(--gold-dim)', border: '1px solid #E4A94B40' }}
                >
                  <span className="text-2xl block text-center mb-1">{b.icon}</span>
                  <p className="text-xs font-bold text-center" style={{ color: '#E4A94B' }}>{b.name}</p>
                  <p className="text-xs font-mono text-center" style={{ color: '#3DC98A' }}>+{b.xp} XP</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <button className="btn btn-primary" onClick={onDone} style={{ minWidth: 200 }}>
        Retour au Dashboard
      </button>
    </div>
  );
}

export default function WeeklyReview() {
  const { state, dispatch } = useGame();
  const weekDates = getCurrentWeekDates();
  const todayISO = new Date().toISOString().split('T')[0];

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    date: todayISO,
    patrimoine: { value: state.patrimoine.current, note: '' },
    trading: { traded: false, result: 0, mmRespected: false, tradesCount: 0 },
    realEstate: { actionTaken: false, actionType: '', notes: '' },
    markets: {
      dcaDone: false,
      peaValue: state.markets.pea.currentValue,
      ctoValue: state.markets.cto.currentValue,
    },
    weekScore: 7,
    comment: '',
  });

  const [results, setResults] = useState(null);
  const [newBadges, setNewBadges] = useState([]);

  // Check if review already done this week
  const weekNum = Math.floor(new Date().getTime() / (7 * 24 * 60 * 60 * 1000));
  const reviewDone = state.weeklyReviews.some(r => {
    const rDate = new Date(r.date);
    return Math.floor(rDate.getTime() / (7 * 24 * 60 * 60 * 1000)) === weekNum;
  });

  const handleSubmit = () => {
    const xpResult = calculateWeeklyXP(form);

    // Find which badges would be newly unlocked
    const tempState = {
      ...state,
      patrimoine: { ...state.patrimoine, current: form.patrimoine.value },
      weeklyReviews: [...state.weeklyReviews, form],
    };
    const unlocked = checkBadgeUnlocks(tempState, state.badges);

    dispatch({
      type: 'COMPLETE_WEEKLY_REVIEW',
      form,
      weekDates,
      xpResult,
    });

    setNewBadges(unlocked);
    setResults(xpResult);
    setStep(8);
  };

  if (reviewDone && step === 1) {
    return (
      <div className="fade-up" style={{ maxWidth: 560 }}>
        <div className="card card-blue text-center py-8">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
            Review déjà complétée cette semaine
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
            Revenez la semaine prochaine. Total : {state.weeklyReviews.length} reviews.
          </p>
          <button
            className="btn btn-ghost"
            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'dashboard' })}
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (step === 8 && results) {
    return (
      <ResultsScreen
        xpResult={results}
        newBadges={newBadges}
        onDone={() => dispatch({ type: 'NAVIGATE', screen: 'dashboard' })}
      />
    );
  }

  const TOTAL_STEPS = 5;

  const updateForm = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="fade-up" style={{ maxWidth: 680 }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Weekly Review</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Semaine du {formatDate(weekDates[0])} au {formatDate(weekDates[6])}
        </p>
      </div>

      <StepIndicator step={step} total={TOTAL_STEPS} />

      <div className="card mb-6">
        {/* Step 1: Patrimoine */}
        {step === 1 && (
          <div className="fade-up">
            <h2 className="text-base font-bold mb-1" style={{ color: '#E4A94B' }}>💰 Patrimoine</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
              Valeur nette actuelle de votre patrimoine.
            </p>
            <div className="mb-4">
              <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--muted)' }}>
                Patrimoine net actuel (€)
              </label>
              <input
                type="number"
                value={form.patrimoine.value}
                onChange={e => updateForm('patrimoine', { ...form.patrimoine, value: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--muted)' }}>
                Note explicative (optionnel)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: vendu des ETF, loyer reçu..."
                value={form.patrimoine.note}
                onChange={e => updateForm('patrimoine', { ...form.patrimoine, note: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 2: Trading */}
        {step === 2 && (
          <div className="fade-up">
            <h2 className="text-base font-bold mb-1" style={{ color: '#3DC98A' }}>📈 Trading</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
              Résumé de votre semaine de trading.
            </p>
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                className={`btn ${form.trading.traded ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => updateForm('trading', { ...form.trading, traded: true })}
              >
                ✓ J'ai tradé cette semaine
              </button>
              <button
                type="button"
                className={`btn ${!form.trading.traded ? 'btn-primary' : 'btn-ghost'}`}
                style={!form.trading.traded ? { background: 'var(--muted)' } : {}}
                onClick={() => updateForm('trading', { ...form.trading, traded: false })}
              >
                Pas de trading
              </button>
            </div>

            {form.trading.traded && (
              <div className="flex flex-col gap-4 fade-up">
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--muted)' }}>
                    Résultat de la semaine (€)
                  </label>
                  <input
                    type="number"
                    value={form.trading.result}
                    onChange={e => updateForm('trading', { ...form.trading, result: Number(e.target.value) })}
                    style={{ borderColor: form.trading.result >= 0 ? '#3DC98A' : '#E05C5C' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--muted)' }}>
                    Nombre de trades passés
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.trading.tradesCount}
                    onChange={e => updateForm('trading', { ...form.trading, tradesCount: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className={`btn ${form.trading.mmRespected ? 'btn-primary' : 'btn-ghost'}`}
                    style={form.trading.mmRespected ? { background: '#3DC98A' } : {}}
                    onClick={() => updateForm('trading', { ...form.trading, mmRespected: !form.trading.mmRespected })}
                  >
                    {form.trading.mmRespected ? '✓' : '○'} Money management respecté
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Real Estate */}
        {step === 3 && (
          <div className="fade-up">
            <h2 className="text-base font-bold mb-1" style={{ color: '#E4A94B' }}>🏠 Real Estate</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
              Action immobilière cette semaine ?
            </p>
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                className={`btn ${form.realEstate.actionTaken ? 'btn-gold' : 'btn-ghost'}`}
                onClick={() => updateForm('realEstate', { ...form.realEstate, actionTaken: true })}
              >
                Oui, j'ai agi
              </button>
              <button
                type="button"
                className={`btn ${!form.realEstate.actionTaken ? 'btn-primary' : 'btn-ghost'}`}
                style={!form.realEstate.actionTaken ? { background: 'var(--muted)' } : {}}
                onClick={() => updateForm('realEstate', { ...form.realEstate, actionTaken: false, actionType: '' })}
              >
                Rien cette semaine
              </button>
            </div>

            {form.realEstate.actionTaken && (
              <div className="flex flex-col gap-4 fade-up">
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--muted)' }}>
                    Type d'action
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {RE_ACTIONS.map(a => (
                      <button
                        key={a.value}
                        type="button"
                        className="btn btn-ghost text-left"
                        style={form.realEstate.actionType === a.value
                          ? { borderColor: '#E4A94B', color: '#E4A94B', background: 'var(--gold-dim)' }
                          : { fontSize: 12 }
                        }
                        onClick={() => updateForm('realEstate', { ...form.realEstate, actionType: a.value })}
                      >
                        <span className="flex items-center justify-between w-full">
                          <span>{a.label}</span>
                          <span className="font-mono text-xs" style={{ color: '#3DC98A' }}>+{a.xp}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--muted)' }}>
                    Notes (optionnel)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Détails de l'action..."
                    value={form.realEstate.notes}
                    onChange={e => updateForm('realEstate', { ...form.realEstate, notes: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Markets */}
        {step === 4 && (
          <div className="fade-up">
            <h2 className="text-base font-bold mb-1" style={{ color: '#8B6FCA' }}>📊 Financial Markets</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
              Mise à jour de vos placements financiers.
            </p>
            <div className="flex flex-col gap-4">
              {/* DCA */}
              <div
                className="p-3 rounded-lg"
                style={{ background: 'var(--navy-700)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>DCA Mensuel</span>
                  <span className="text-xs font-mono" style={{ color: '#8B6FCA' }}>
                    {state.markets.dca.monthlyAmount}€ programmés
                  </span>
                </div>
                <button
                  type="button"
                  className={`btn w-full ${form.markets.dcaDone ? 'btn-primary' : 'btn-ghost'}`}
                  style={form.markets.dcaDone ? { background: '#8B6FCA', width: '100%' } : { width: '100%' }}
                  onClick={() => updateForm('markets', { ...form.markets, dcaDone: !form.markets.dcaDone })}
                >
                  {form.markets.dcaDone ? '✓ DCA effectué ce mois (+80 XP)' : 'DCA effectué ce mois ?'}
                </button>
              </div>
              {/* PEA */}
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--muted)' }}>
                  Valeur actuelle PEA (€)
                </label>
                <input
                  type="number"
                  value={form.markets.peaValue}
                  onChange={e => updateForm('markets', { ...form.markets, peaValue: Number(e.target.value) })}
                />
              </div>
              {/* CTO */}
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--muted)' }}>
                  Valeur actuelle CTO (€)
                </label>
                <input
                  type="number"
                  value={form.markets.ctoValue}
                  onChange={e => updateForm('markets', { ...form.markets, ctoValue: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Week score */}
        {step === 5 && (
          <div className="fade-up">
            <h2 className="text-base font-bold mb-1" style={{ color: '#388BDC' }}>⭐ Score de la semaine</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
              Comment évaluez-vous votre semaine ?
            </p>

            {/* Score slider */}
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--muted)' }}>
                <span>1 — Mauvaise</span>
                <span style={{ color: '#388BDC', fontSize: 24, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                  {form.weekScore}
                </span>
                <span>10 — Excellente</span>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => updateForm('weekScore', n)}
                    className="flex-1 py-2 rounded text-sm font-mono font-bold transition-all"
                    style={{
                      background: n <= form.weekScore
                        ? `rgba(56,139,220,${0.3 + n * 0.07})`
                        : 'var(--navy-700)',
                      color: n <= form.weekScore ? '#388BDC' : 'var(--muted2)',
                      border: n === form.weekScore ? '1px solid #388BDC' : '1px solid var(--border)',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--muted)' }}>
                Commentaire libre (optionnel)
              </label>
              <textarea
                rows={4}
                placeholder="Ce qui s'est passé, ce que je veux améliorer..."
                value={form.comment}
                onChange={e => updateForm('comment', e.target.value)}
              />
            </div>

            {/* XP Preview */}
            <div
              className="mt-4 p-3 rounded-lg"
              style={{ background: 'var(--blue-dim)', border: '1px solid rgba(56,139,220,0.3)' }}
            >
              <p className="text-xs font-mono font-bold mb-2" style={{ color: '#388BDC' }}>
                APERÇU XP CETTE REVIEW
              </p>
              <div className="flex flex-col gap-1">
                {calculateWeeklyXP(form).breakdown.map((b, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span style={{ color: 'var(--muted)' }}>{b.label}</span>
                    <span className="font-mono" style={{ color: '#3DC98A' }}>+{b.xp}</span>
                  </div>
                ))}
                <div
                  className="flex justify-between text-sm font-bold pt-2 mt-1"
                  style={{ borderTop: '1px solid var(--border)', color: '#388BDC' }}
                >
                  <span>TOTAL</span>
                  <span className="font-mono">+{calculateWeeklyXP(form).total} XP</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          className="btn btn-ghost flex items-center gap-2"
          onClick={() => step > 1 ? setStep(s => s - 1) : dispatch({ type: 'NAVIGATE', screen: 'dashboard' })}
        >
          <ChevronLeft size={14} /> {step > 1 ? 'Précédent' : 'Annuler'}
        </button>
        {step < TOTAL_STEPS ? (
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={() => setStep(s => s + 1)}
          >
            Suivant <ChevronRight size={14} />
          </button>
        ) : (
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={handleSubmit}
            style={{ background: '#3DC98A' }}
          >
            <Zap size={14} /> Valider la review
          </button>
        )}
      </div>
    </div>
  );
}
