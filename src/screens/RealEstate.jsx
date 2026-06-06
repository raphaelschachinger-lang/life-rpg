import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { formatCurrency, formatDate, getVerticalLevel } from '../utils/gameLogic';
import { Plus, Home, TrendingUp, X, Edit2, Check } from 'lucide-react';

const STATUS_CONFIG = {
  searching:  { label: 'En recherche',   color: '#6B8BAD' },
  offer:      { label: 'Offre faite',    color: '#E4A94B' },
  compromis:  { label: 'Compromis',      color: '#388BDC' },
  owned:      { label: 'Propriétaire',   color: '#3DC98A' },
  sold:       { label: 'Vendu',          color: '#8B6FCA' },
  lost:       { label: 'Perdu',          color: '#E05C5C' },
};

const ACTION_XP = {
  searching: 0, offer: 300, compromis: 500, owned: 500, sold: 600,
};

function PropertyCard({ property, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...property });

  const netProfit = (form.salePrice || 0) - (form.purchasePrice || 0) - (form.renovationBudget || 0);
  const cfg = STATUS_CONFIG[property.status] || STATUS_CONFIG.searching;

  const handleSave = () => {
    const xpMap = {
      offer: property.status !== 'offer' ? 300 : 0,
      compromis: property.status !== 'compromis' ? 500 : 0,
      owned: property.status !== 'owned' ? 500 : 0,
      sold: property.status !== 'sold' ? 600 : 0,
    };
    const xp = xpMap[form.status] || 0;
    const visited = form.status !== 'searching' ? true : form.visited;

    const updates = {
      ...form,
      visited,
      offerAccepted: ['compromis', 'owned', 'sold'].includes(form.status),
      notaryActSigned: ['owned', 'sold'].includes(form.status),
      netProfit: form.status === 'sold' ? netProfit : 0,
    };

    onUpdate(property.id, updates, xp);
    setEditing(false);
  };

  return (
    <div
      className="card"
      style={{ borderTop: `2px solid ${cfg.color}`, marginBottom: 16 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Home size={14} style={{ color: cfg.color }} />
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
              {property.name}
            </span>
            <span
              className="pill"
              style={{
                background: `${cfg.color}20`,
                color: cfg.color,
              }}
            >
              {cfg.label}
            </span>
          </div>
          {property.address && (
            <p className="text-xs" style={{ color: 'var(--muted)', marginLeft: 22 }}>
              {property.address}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setEditing(!editing)}>
            <Edit2 size={12} />
          </button>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', color: '#E05C5C' }} onClick={() => onRemove(property.id)}>
            <X size={12} />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-3 fade-up">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Nom</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Adresse</label>
              <input value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Prix d'achat (€)</label>
              <input type="number" value={form.purchasePrice || 0} onChange={e => setForm(f => ({ ...f, purchasePrice: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Budget rénovation (€)</label>
              <input type="number" value={form.renovationBudget || 0} onChange={e => setForm(f => ({ ...f, renovationBudget: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Valeur actuelle (€)</label>
              <input type="number" value={form.currentValue || 0} onChange={e => setForm(f => ({ ...f, currentValue: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>
                {form.type === 'flip' ? 'Prix de vente cible (€)' : 'Cash-flow mensuel net (€)'}
              </label>
              {form.type === 'flip'
                ? <input type="number" value={form.salePrice || 0} onChange={e => setForm(f => ({ ...f, salePrice: Number(e.target.value) }))} />
                : <input type="number" value={form.cashflow || 0} onChange={e => setForm(f => ({ ...f, cashflow: Number(e.target.value) }))} />
              }
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="flip">Flip (achat-revente)</option>
                <option value="rental">Locatif</option>
              </select>
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Statut</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Notes</label>
            <textarea rows={2} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary flex items-center gap-1" onClick={handleSave}>
              <Check size={12} /> Sauvegarder
            </button>
            <button className="btn btn-ghost" onClick={() => { setForm({ ...property }); setEditing(false); }}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Type</p>
              <p className="text-sm font-mono font-bold" style={{ color: 'var(--text)' }}>
                {property.type === 'flip' ? 'Flip' : 'Locatif'}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Prix d'achat</p>
              <p className="text-sm font-mono font-bold" style={{ color: 'var(--text)' }}>
                {formatCurrency(property.purchasePrice || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Rénovation</p>
              <p className="text-sm font-mono font-bold" style={{ color: 'var(--text)' }}>
                {formatCurrency(property.renovationBudget || 0)}
              </p>
            </div>
            {property.type === 'flip' ? (
              <>
                <div>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Prix de vente</p>
                  <p className="text-sm font-mono font-bold" style={{ color: 'var(--text)' }}>
                    {formatCurrency(property.salePrice || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Profit net estimé</p>
                  <p
                    className="text-sm font-mono font-bold"
                    style={{ color: (property.salePrice || 0) - (property.purchasePrice || 0) - (property.renovationBudget || 0) >= 0 ? '#3DC98A' : '#E05C5C' }}
                  >
                    {formatCurrency((property.salePrice || 0) - (property.purchasePrice || 0) - (property.renovationBudget || 0))}
                  </p>
                </div>
              </>
            ) : (
              <div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Cash-flow mensuel</p>
                <p
                  className="text-sm font-mono font-bold"
                  style={{ color: (property.cashflow || 0) >= 0 ? '#3DC98A' : '#E05C5C' }}
                >
                  {formatCurrency(property.cashflow || 0)}/mois
                </p>
              </div>
            )}
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Valeur actuelle</p>
              <p className="text-sm font-mono font-bold" style={{ color: '#E4A94B' }}>
                {formatCurrency(property.currentValue || 0)}
              </p>
            </div>
          </div>
          {property.notes && (
            <p className="text-xs mt-3 p-2 rounded" style={{ background: 'var(--navy-700)', color: 'var(--muted)' }}>
              {property.notes}
            </p>
          )}
          <div className="flex gap-3 mt-3">
            {property.visited && <span className="text-xs" style={{ color: '#3DC98A' }}>✓ Visité</span>}
            {property.offerAccepted && <span className="text-xs" style={{ color: '#388BDC' }}>✓ Offre acceptée</span>}
            {property.notaryActSigned && <span className="text-xs" style={{ color: '#8B6FCA' }}>✓ Acte notarié</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function AddPropertyModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: '', address: '', type: 'flip' });
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(5,13,26,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      }}
    >
      <div className="card" style={{ width: 420, borderTop: '2px solid #E4A94B' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Ajouter un bien</h3>
          <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={onClose}><X size={14} /></button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Nom du bien</label>
            <input placeholder="Ex: Bien Montauban" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Adresse</label>
            <input placeholder="Ville, quartier..." value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="flip">Flip (achat-revente)</option>
              <option value="rental">Locatif</option>
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            <button className="btn btn-gold flex-1" onClick={() => { if (form.name) { onAdd(form); onClose(); } }}>
              Ajouter
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RealEstate() {
  const { state, dispatch } = useGame();
  const [showAdd, setShowAdd] = useState(false);

  const { level: vLevel, xpInLevel, xpNeeded } = getVerticalLevel(state.stats.realEstate.totalXP);

  const totalBrut = state.realEstate.properties.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalCashflow = state.realEstate.properties.reduce((s, p) => s + (p.cashflow || 0), 0);
  const ownedCount = state.realEstate.properties.filter(p => p.status === 'owned').length;

  return (
    <div className="fade-up" style={{ maxWidth: 900 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Real Estate</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Vertical Immo · Niveau {vLevel}
          </p>
        </div>
        <button
          className="btn btn-gold flex items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          <Plus size={14} /> Ajouter un bien
        </button>
      </div>

      {/* Vertical level bar */}
      <div className="card card-gold mb-6" style={{ padding: '12px 16px' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold" style={{ color: '#E4A94B' }}>
            Immo Niveau {vLevel}
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
            {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
          </span>
        </div>
        <div className="progress-bar" style={{ height: 6, borderRadius: 3 }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(100, (xpInLevel / xpNeeded) * 100)}%`, background: '#E4A94B' }}
          />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Biens actifs', value: ownedCount, color: '#E4A94B' },
          { label: 'Portefeuille brut', value: formatCurrency(totalBrut), color: '#E4A94B' },
          { label: 'Cash-flow net/mois', value: `${totalCashflow >= 0 ? '+' : ''}${formatCurrency(totalCashflow)}`, color: totalCashflow >= 0 ? '#3DC98A' : '#E05C5C' },
          { label: 'Total biens', value: state.realEstate.properties.length, color: 'var(--text)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card card-gold">
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className="font-mono text-lg font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Properties list */}
      {state.realEstate.properties.length === 0 ? (
        <div
          className="card text-center py-12"
          style={{ borderTop: '2px solid #E4A94B' }}
        >
          <Home size={32} style={{ color: 'var(--muted2)', margin: '0 auto 12px' }} />
          <p className="text-sm mb-1" style={{ color: 'var(--muted)' }}>Aucun bien enregistré</p>
          <p className="text-xs mb-4" style={{ color: 'var(--muted2)' }}>
            Ajoutez votre premier bien pour commencer le suivi.
          </p>
          <button className="btn btn-gold" onClick={() => setShowAdd(true)}>
            <Plus size={14} style={{ display: 'inline', marginRight: 6 }} />
            Ajouter un bien
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--muted)' }}>
            BIENS ({state.realEstate.properties.length})
          </h2>
          {state.realEstate.properties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onUpdate={(id, updates, xp) => dispatch({ type: 'UPDATE_PROPERTY', id, updates, xp })}
              onRemove={(id) => {
                if (window.confirm('Supprimer ce bien ?')) {
                  dispatch({ type: 'REMOVE_PROPERTY', id });
                }
              }}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddPropertyModal
          onAdd={property => dispatch({ type: 'ADD_PROPERTY', property })}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
