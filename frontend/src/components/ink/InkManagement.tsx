import React, { useState, useMemo, useCallback, lazy, Suspense, useEffect } from 'react';
import { EstoqueTinta, SaidaTinta, CreateEstoqueData, UpdateEstoqueData, CreateSaidaData, UpdateSaidaData } from '../../types';
import Modal from '../common/Modal';
import {
  useEstoqueTintas,
  useCreateEstoque,
  useUpdateEstoque,
  useDeleteEstoque,
  useSaidasTinta,
  useCreateSaida,
  useUpdateSaida,
  useEstornarSaida,
} from '../../hooks/useTinta';
import { useModelosImpressora } from '../../hooks/useModeloImpressora';
import { useToast } from '../../hooks/useToast';
import Toast from '../common/Toast';

const InkSaidaForm   = lazy(() => import('./InkSaidaForm'));
const InkEstoqueForm = lazy(() => import('./InkEstoqueForm'));
const PrinterModelManager = lazy(() => import('./PrinterModelManager'));

// ─── Static lists ─────────────────────────────────────────────────────────────
const UNIDADES = [
  'URUCUBA','MENDES','GAMELEIRA','JUA','LAGOA AZUL','RIBEIRO DO MEL','SANTANA',
  'SANTA CRUZ','ALEGRIA','REDENTOR','JOAO ERNESTO','CONGAL','SANTA TEREZINHA',
  'SANTO ANTONIO','N. SRA DE FATIMA','CONVALES','SAO SEBASTIAO','OTACIO DE LEMOS',
  'PONTO CERTO','CTA','CER','CEO','POLICLINICA','SAMU','HOSPITAL DE CAMPANHA',
  'VISA','VIGILANCIA AMBIENTAL','CAPS','RESIDENCIA TERAPEUTICA',
  'UNIDADE DE ACOLHIMENTO','SEDE DA SECRETARIA','CAF','LABORATÓRIO','CAPS III DAS PONTES',
].sort();

const SETORES = [
  'VACINA','MEDICO','DENTISTA','ENFERMEIRA','RECEPÇÃO','SALA ADM',
  'VIGILÂNCIA EPIDEMIOLOGICA','REGULAÇÃO','RH','ATENÇÃO BÁSICA','UBS',
  'GABINETE','PNI','OUVIDORIA','ADMINISTRAÇÃO','TELECARDIO','FINCANCEIRO/ADM',
].sort();

// ─── Color map ────────────────────────────────────────────────────────────────
// Preto: dot/bar usa bg-black com borda para ser visível no card branco
const COR_MAP: Record<string, { dot: string; bar: string; badge: string; stripe: string }> = {
  Preto:   {
    dot:    'bg-gray-900 ring-2 ring-gray-300',
    bar:    'bg-gray-900',
    badge:  'bg-gray-900 text-white border-gray-700',
    stripe: 'bg-gray-900',
  },
  Ciano:   {
    dot:    'bg-cyan-500',
    bar:    'bg-cyan-500',
    badge:  'bg-cyan-50 text-cyan-700 border-cyan-200',
    stripe: 'bg-cyan-500',
  },
  Magenta: {
    dot:    'bg-pink-500',
    bar:    'bg-pink-500',
    badge:  'bg-pink-50 text-pink-700 border-pink-200',
    stripe: 'bg-pink-500',
  },
  Amarelo: {
    dot:    'bg-yellow-400',
    bar:    'bg-yellow-400',
    badge:  'bg-yellow-50 text-yellow-700 border-yellow-200',
    stripe: 'bg-yellow-400',
  },
};
const getCor = (cor: string) =>
  COR_MAP[cor] ?? {
    dot:    'bg-primary',
    bar:    'bg-primary',
    badge:  'bg-red-50 text-red-700 border-red-200',
    stripe: 'bg-primary',
  };

const fmt = (isoOrBr: string): string => {
  if (!isoOrBr) return '—';
  if (isoOrBr.includes('/')) return isoOrBr;
  const [y, m, d] = isoOrBr.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

const toISODate = (isoOrBr: string): string => {
  if (!isoOrBr) return '';
  if (isoOrBr.includes('T')) return isoOrBr.split('T')[0];
  if (isoOrBr.includes('/')) {
    const [d, m, y] = isoOrBr.split('/');
    return `${y}-${m}-${d}`;
  }
  return isoOrBr;
};

const Spinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
  </div>
);

// ─── EstoqueCard ──────────────────────────────────────────────────────────────
interface EstoqueCardProps {
  estoque: EstoqueTinta;
  onSaida: (e: EstoqueTinta) => void;
  onEdit: (e: EstoqueTinta) => void;
  onDelete: (id: number) => void;
  onViewHistory: (e: EstoqueTinta) => void;
}

const EstoqueCard: React.FC<EstoqueCardProps> = ({ estoque, onSaida, onEdit, onDelete, onViewHistory }) => {
  const cor = getCor(estoque.cor_tinta);
  const isOut      = estoque.quantidade_atual === 0;
  const isCritical = !isOut && estoque.quantidade_atual <= estoque.quantidade_minima;

  // Quantidade total de saídas (usa _count do backend se disponível)
  const totalSaidas = estoque._count?.saidas ?? estoque.saidas?.length ?? 0;

  // Barra de percentual: usa quantidade_minima como referência de "mínimo" e calcula
  // o nível relativo. Máximo visual = quantidade_minima * 5 (cap em 100%).
  // Se quantidade_atual == 0 → 0%. Se quantidade_atual == minima → 20%. Se >= minima*5 → 100%.
  const maxRef = Math.max(estoque.quantidade_minima * 5, estoque.quantidade_atual, 1);
  const pct = estoque.quantidade_atual === 0
    ? 0
    : Math.max(2, Math.min(100, Math.round((estoque.quantidade_atual / maxRef) * 100)));

  const barColor = isOut
    ? 'bg-red-500'
    : isCritical
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  return (
    <div className={`card flex flex-col hover:-translate-y-0.5 ${isOut ? 'border-red-300' : isCritical ? 'border-amber-300' : ''}`}>
      {/* Color stripe — usa a cor real como inline style para garantir que Preto apareça */}
      <div
        className="h-1.5 w-full rounded-t-xl"
        style={{
          background: estoque.cor_tinta === 'Preto'   ? '#111827' :
                      estoque.cor_tinta === 'Ciano'   ? '#06b6d4' :
                      estoque.cor_tinta === 'Magenta' ? '#ec4899' :
                      estoque.cor_tinta === 'Amarelo' ? '#facc15' : '#e11d48',
        }}
      />

      {/* Top */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          {/* Dot com borda externa para garantir visibilidade do preto */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 shadow-sm"
            style={{
              background: estoque.cor_tinta === 'Preto'   ? '#111827' :
                          estoque.cor_tinta === 'Ciano'   ? '#06b6d4' :
                          estoque.cor_tinta === 'Magenta' ? '#ec4899' :
                          estoque.cor_tinta === 'Amarelo' ? '#facc15' : '#e11d48',
            }}
          >
            <span className={`font-black text-xs leading-none ${estoque.cor_tinta === 'Amarelo' ? 'text-yellow-900' : 'text-white'}`}>
              {estoque.cor_tinta.slice(0, 1)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 leading-tight">{estoque.cor_tinta}</p>
            <p className="text-[11px] text-slate-400">{estoque.codigo_tinta}</p>
          </div>
        </div>
        <span className={`badge border text-[10px] max-w-[100px] truncate ${cor.badge}`} title={estoque.modelo_impressora}>
          {estoque.modelo_impressora}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex-1 flex flex-col gap-3">
        {/* Alert banner */}
        {isOut && (
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            Sem estoque
          </div>
        )}
        {isCritical && (
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            Estoque crítico
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            {
              label: 'Disponível',
              value: estoque.quantidade_atual,
              cls: isOut ? 'text-red-600' : isCritical ? 'text-amber-600' : 'text-emerald-600',
            },
            { label: 'Mínimo',  value: estoque.quantidade_minima, cls: 'text-slate-500' },
            { label: 'Saídas',  value: totalSaidas,               cls: 'text-primary' },
          ].map(m => (
            <div key={m.label} className="bg-slate-50 rounded-lg py-2 px-1 border border-slate-100">
              <p className={`text-xl font-extrabold leading-none mb-0.5 ${m.cls}`}>{m.value}</p>
              <p className="text-[10px] text-slate-400 font-medium">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Nível de estoque</span>
            <span className={isOut ? 'text-red-500 font-bold' : isCritical ? 'text-amber-500 font-bold' : 'text-emerald-600 font-semibold'}>
              {pct}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-300 mt-0.5">
            <span>0</span>
            <span>mín: {estoque.quantidade_minima}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <button onClick={() => onSaida(estoque)} disabled={isOut}
          className="btn btn-primary text-xs py-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
          </svg>
          Saída
        </button>
        <button onClick={() => onViewHistory(estoque)}
          className="btn btn-outline text-xs py-2 text-slate-600">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          Histórico
        </button>
        <button onClick={() => onEdit(estoque)}
          className="btn btn-edit text-xs py-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Entrada/Editar
        </button>
        <button onClick={() => onDelete(estoque.id)}
          className="btn btn-delete text-xs py-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Remover
        </button>
      </div>
    </div>
  );
};

// ─── EstornoModal ─────────────────────────────────────────────────────────────
interface EstornoModalProps {
  saida: SaidaTinta;
  isLoading: boolean;
  onConfirm: (quantidade: number) => void;
  onCancel: () => void;
}

const EstornoModal: React.FC<EstornoModalProps> = ({ saida, isLoading, onConfirm, onCancel }) => {
  const [qtd, setQtd] = useState(saida.quantidade);
  const cor = getCor(saida.estoque?.cor_tinta ?? '');

  useEffect(() => { setQtd(saida.quantidade); }, [saida.quantidade]);

  const isTotal = qtd === saida.quantidade;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Estornar Saída</h3>
              <p className="text-xs text-slate-500 mt-0.5">Informe quantas unidades deseja devolver ao estoque</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Tinta</span>
            <span className={`badge border ${cor.badge}`}>{saida.estoque?.cor_tinta ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Modelo</span>
            <span className="font-medium text-slate-700 truncate max-w-[160px]">{saida.estoque?.modelo_impressora ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Unidade</span>
            <span className="font-medium text-slate-700">{saida.unidade || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Data</span>
            <span className="font-medium text-slate-700">{fmt(saida.data_saida)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 mt-0.5">
            <span className="text-slate-500">Qtd. original da saída</span>
            <span className="font-bold text-red-600">−{saida.quantidade}</span>
          </div>
        </div>

        <div>
          <label className="label mb-1.5">Quantidade a estornar</label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setQtd(v => Math.max(1, v - 1))} disabled={qtd <= 1}
              className="w-9 h-9 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
              </svg>
            </button>
            <input type="number" min={1} max={saida.quantidade} value={qtd}
              onChange={e => { const v = Math.max(1, Math.min(saida.quantidade, Number(e.target.value))); setQtd(isNaN(v) ? 1 : v); }}
              className="input text-center font-bold text-lg flex-1" />
            <button type="button" onClick={() => setQtd(v => Math.min(saida.quantidade, v + 1))} disabled={qtd >= saida.quantidade}
              className="w-9 h-9 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 text-center">
            {isTotal
              ? 'Estorno total — o registro será removido do histórico'
              : `Estorno parcial — ${saida.quantidade - qtd} unidade(s) permanecerão no histórico`}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={onCancel} disabled={isLoading} className="btn btn-outline flex-1 text-xs py-2.5">Cancelar</button>
          <button onClick={() => onConfirm(qtd)} disabled={isLoading}
            className="btn flex-1 text-xs py-2.5 bg-amber-500 hover:bg-amber-600 text-white border-amber-500 font-semibold disabled:opacity-60">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Estornando…
              </span>
            ) : `Estornar ${qtd} un.`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── EditarSaidaModal ─────────────────────────────────────────────────────────
interface EditarSaidaModalProps {
  saida: SaidaTinta;
  isLoading: boolean;
  onConfirm: (data: UpdateSaidaData) => void;
  onCancel: () => void;
}

const EditarSaidaModal: React.FC<EditarSaidaModalProps> = ({ saida, isLoading, onConfirm, onCancel }) => {
  const cor = getCor(saida.estoque?.cor_tinta ?? '');

  const [quantidade,  setQuantidade]  = useState(String(saida.quantidade));
  const [unidade,     setUnidade]     = useState(saida.unidade || '');
  const [setor,       setSetor]       = useState(saida.setor || '');
  const [responsavel, setResponsavel] = useState(saida.responsavel || '');
  const [observacao,  setObservacao]  = useState(saida.observacao || '');
  const [dataSaida,   setDataSaida]   = useState(toISODate(saida.data_saida));
  const [showUnidadeInput, setShowUnidadeInput] = useState(!UNIDADES.includes(saida.unidade));
  const [showSetorInput,   setShowSetorInput]   = useState(!SETORES.includes(saida.setor));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    const qty = parseInt(quantidade);
    if (!quantidade || isNaN(qty) || qty < 1) e.quantidade = 'Mínimo 1';
    if (!unidade.trim())    e.unidade    = 'Obrigatório';
    if (!setor.trim())      e.setor      = 'Obrigatório';
    if (!responsavel.trim()) e.responsavel = 'Obrigatório';
    if (!dataSaida)         e.dataSaida  = 'Obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onConfirm({
      quantidade:  parseInt(quantidade),
      unidade:     unidade.trim(),
      setor:       setor.trim(),
      responsavel: responsavel.trim(),
      observacao:  observacao.trim() || null,
      data_saida:  dataSaida,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Editar Registro de Saída</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`badge border text-[10px] ${cor.badge}`}>{saida.estoque?.cor_tinta ?? '—'}</span>
                <span className="text-xs text-slate-400">{saida.estoque?.modelo_impressora ?? '—'}</span>
              </div>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

          {/* Quantidade */}
          <div>
            <label className="label mb-1">Quantidade <span className="text-red-500">*</span></label>
            <input type="number" min={1} value={quantidade}
              onChange={e => setQuantidade(e.target.value)}
              className={`input ${errors.quantidade ? 'border-red-400' : ''}`} />
            {errors.quantidade && <p className="text-xs text-red-500 mt-0.5">{errors.quantidade}</p>}
          </div>

          {/* Data */}
          <div>
            <label className="label mb-1">Data da Saída <span className="text-red-500">*</span></label>
            <input type="date" value={dataSaida} onChange={e => setDataSaida(e.target.value)}
              className={`input ${errors.dataSaida ? 'border-red-400' : ''}`} />
            {errors.dataSaida && <p className="text-xs text-red-500 mt-0.5">{errors.dataSaida}</p>}
          </div>

          {/* Unidade */}
          <div>
            <label className="label mb-1">Unidade <span className="text-red-500">*</span></label>
            {showUnidadeInput ? (
              <div className="space-y-1.5">
                <input type="text" value={unidade} onChange={e => setUnidade(e.target.value.toUpperCase())}
                  className={`input ${errors.unidade ? 'border-red-400' : ''}`} placeholder="Digite a unidade" />
                <button type="button" onClick={() => { setShowUnidadeInput(false); setUnidade(''); }}
                  className="text-xs text-primary hover:underline">← Voltar para lista</button>
              </div>
            ) : (
              <select value={unidade}
                onChange={e => {
                  if (e.target.value === '__custom__') { setShowUnidadeInput(true); setUnidade(''); }
                  else setUnidade(e.target.value);
                }}
                className={`input ${errors.unidade ? 'border-red-400' : ''}`}>
                <option value="">Selecione...</option>
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                <option value="__custom__">➕ Outra unidade</option>
              </select>
            )}
            {errors.unidade && <p className="text-xs text-red-500 mt-0.5">{errors.unidade}</p>}
          </div>

          {/* Setor */}
          <div>
            <label className="label mb-1">Setor <span className="text-red-500">*</span></label>
            {showSetorInput ? (
              <div className="space-y-1.5">
                <input type="text" value={setor} onChange={e => setSetor(e.target.value.toUpperCase())}
                  className={`input ${errors.setor ? 'border-red-400' : ''}`} placeholder="Digite o setor" />
                <button type="button" onClick={() => { setShowSetorInput(false); setSetor(''); }}
                  className="text-xs text-primary hover:underline">← Voltar para lista</button>
              </div>
            ) : (
              <select value={setor}
                onChange={e => {
                  if (e.target.value === '__custom__') { setShowSetorInput(true); setSetor(''); }
                  else setSetor(e.target.value);
                }}
                className={`input ${errors.setor ? 'border-red-400' : ''}`}>
                <option value="">Selecione...</option>
                {SETORES.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="__custom__">➕ Outro setor</option>
              </select>
            )}
            {errors.setor && <p className="text-xs text-red-500 mt-0.5">{errors.setor}</p>}
          </div>

          {/* Responsável */}
          <div>
            <label className="label mb-1">Responsável <span className="text-red-500">*</span></label>
            <input type="text" value={responsavel} onChange={e => setResponsavel(e.target.value)}
              className={`input ${errors.responsavel ? 'border-red-400' : ''}`} placeholder="Nome do responsável" />
            {errors.responsavel && <p className="text-xs text-red-500 mt-0.5">{errors.responsavel}</p>}
          </div>

          {/* Observação */}
          <div>
            <label className="label mb-1">Observação <span className="text-slate-400 font-normal">(opcional)</span></label>
            <textarea value={observacao} onChange={e => setObservacao(e.target.value)}
              rows={2} className="input resize-none" placeholder="Observação adicional..." />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onCancel} disabled={isLoading}
              className="btn btn-outline flex-1 text-xs py-2.5">Cancelar</button>
            <button type="submit" disabled={isLoading}
              className="btn btn-primary flex-1 text-xs py-2.5">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Salvando…
                </span>
              ) : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── SaidaRow ─────────────────────────────────────────────────────────────────
interface SaidaRowProps {
  saida: SaidaTinta;
  onEstornar: (saida: SaidaTinta) => void;
  onEditar: (saida: SaidaTinta) => void;
}

const SaidaRow: React.FC<SaidaRowProps> = ({ saida, onEstornar, onEditar }) => {
  const cor = getCor(saida.estoque?.cor_tinta ?? '');
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{fmt(saida.data_saida)}</td>
      <td className="px-4 py-3">
        <span className={`badge border ${cor.badge}`}>{saida.estoque?.cor_tinta ?? '—'}</span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 max-w-[120px] truncate" title={saida.estoque?.modelo_impressora}>
        {saida.estoque?.modelo_impressora ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{saida.unidade || '—'}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{saida.setor}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{saida.responsavel}</td>
      <td className="px-4 py-3 text-center">
        <span className="badge badge-red">−{saida.quantidade}</span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-400 max-w-[160px] truncate" title={saida.observacao ?? ''}>
        {saida.observacao || <span className="italic">—</span>}
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onEditar(saida)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
            title="Editar registro"
          >
            Editar
          </button>
          <button
            onClick={() => onEstornar(saida)}
            className="text-xs font-semibold text-amber-600 hover:text-amber-800 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg transition-colors"
            title="Estornar saída"
          >
            Estornar
          </button>
        </div>
      </td>
    </tr>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const InkManagement: React.FC = () => {
  const [activeTab,         setActiveTab]         = useState<'estoque' | 'historico'>('estoque');
  const [modeloFilter,      setModeloFilter]      = useState('todos');
  const [histModeloFilter,  setHistModeloFilter]  = useState('todos');
  const [histUnidadeFilter, setHistUnidadeFilter] = useState('');
  const [histSetorFilter,   setHistSetorFilter]   = useState('');
  const [histDataSaida,     setHistDataSaida]     = useState('');

  const [showModal,       setShowModal]       = useState(false);
  const [modalMode,       setModalMode]       = useState<'saida'|'estoque_create'|'estoque_edit'|'gerenciar_modelos'|null>(null);
  const [selectedEstoque, setSelectedEstoque] = useState<EstoqueTinta|null>(null);

  const [estornoSaida,  setEstornoSaida]  = useState<SaidaTinta|null>(null);
  const [editarSaida,   setEditarSaida]   = useState<SaidaTinta|null>(null);

  const { data: estoques = [], isLoading: estoqueLoading, error: estoqueError, refetch: refetchEstoque } = useEstoqueTintas();
  const { data: modelos  = [] } = useModelosImpressora();

  const saidasFilters = useMemo(() => ({
    modelo:   histModeloFilter !== 'todos' ? histModeloFilter : undefined,
    unidade:  histUnidadeFilter || undefined,
    setor:    histSetorFilter || undefined,
    dataInicio: histDataSaida || undefined,
  }), [histModeloFilter, histUnidadeFilter, histSetorFilter, histDataSaida]);

  const { data: saidas = [], isLoading: saidasLoading, refetch: refetchSaidas } = useSaidasTinta(saidasFilters);

  const createEstoqueMutation = useCreateEstoque();
  const updateEstoqueMutation = useUpdateEstoque();
  const deleteEstoqueMutation = useDeleteEstoque();
  const createSaidaMutation   = useCreateSaida();
  const updateSaidaMutation   = useUpdateSaida();
  const estornarSaidaMutation = useEstornarSaida();

  const { toasts, removeToast, success, error: errorToast } = useToast();

  const filteredEstoque = useMemo(() =>
    modeloFilter === 'todos' ? estoques : estoques.filter(e => e.modelo_impressora === modeloFilter),
    [estoques, modeloFilter]);

  const criticalCount = useMemo(() => estoques.filter(e => e.quantidade_atual <= e.quantidade_minima).length, [estoques]);

  const contagemPorModelo = useMemo(() => {
    const map: Record<string, number> = {};
    estoques.forEach(e => { map[e.modelo_impressora] = (map[e.modelo_impressora] ?? 0) + 1; });
    return map;
  }, [estoques]);

  const modelosParaFiltro = useMemo(() => {
    const s = new Set([...modelos.map(m => m.nome), ...estoques.map(e => e.modelo_impressora)]);
    return Array.from(s).sort();
  }, [estoques, modelos]);

  const closeModal = useCallback(() => { setShowModal(false); setModalMode(null); setSelectedEstoque(null); }, []);

  const handleOpenSaida   = useCallback((e: EstoqueTinta) => { setSelectedEstoque(e); setModalMode('saida');         setShowModal(true); }, []);
  const handleOpenEdit    = useCallback((e: EstoqueTinta) => { setSelectedEstoque(e); setModalMode('estoque_edit');  setShowModal(true); }, []);
  const handleOpenCreate  = useCallback(() => { setSelectedEstoque(null); setModalMode('estoque_create'); setShowModal(true); }, []);
  const handleOpenModelos = useCallback(() => { setModalMode('gerenciar_modelos'); setShowModal(true); }, []);
  const handleViewHistory = useCallback((e: EstoqueTinta) => { setActiveTab('historico'); setHistModeloFilter(e.modelo_impressora); }, []);

  const handleSubmitSaida = useCallback(async (data: CreateSaidaData) => {
    try {
      await createSaidaMutation.mutateAsync(data);
      const est = selectedEstoque!;
      success(`Saída de ${data.quantidade}× ${est.cor_tinta} registrada para "${data.setor}"`);
      closeModal();
    } catch (err: any) { errorToast(err.response?.data?.error || 'Erro ao registrar saída'); }
  }, [createSaidaMutation, selectedEstoque, success, errorToast, closeModal]);

  const handleSubmitEstoque = useCallback(async (data: CreateEstoqueData | UpdateEstoqueData) => {
    try {
      if (modalMode === 'estoque_edit' && selectedEstoque) {
        await updateEstoqueMutation.mutateAsync({ id: selectedEstoque.id, data });
        success('Estoque atualizado!');
      } else {
        await createEstoqueMutation.mutateAsync(data as CreateEstoqueData);
        success('Tinta cadastrada no estoque!');
      }
      closeModal();
    } catch (err: any) { errorToast(err.response?.data?.error || 'Erro ao salvar'); }
  }, [modalMode, selectedEstoque, createEstoqueMutation, updateEstoqueMutation, success, errorToast, closeModal]);

  const handleDeleteEstoque = useCallback(async (id: number) => {
    if (!window.confirm('Remover este item? Todas as saídas serão excluídas.')) return;
    try { await deleteEstoqueMutation.mutateAsync(id); success('Item removido!'); }
    catch (err: any) { errorToast(err.response?.data?.error || 'Erro ao remover'); }
  }, [deleteEstoqueMutation, success, errorToast]);

  const handleOpenEstorno = useCallback((saida: SaidaTinta) => { setEstornoSaida(saida); }, []);

  const handleConfirmEstorno = useCallback(async (quantidade: number) => {
    if (!estornoSaida) return;
    try {
      await estornarSaidaMutation.mutateAsync({ id: estornoSaida.id, quantidade });
      success(
        quantidade === estornoSaida.quantidade
          ? `Estorno total de ${quantidade} unidade(s) realizado!`
          : `Estorno parcial de ${quantidade} unidade(s) realizado!`
      );
      setEstornoSaida(null);
      refetchSaidas();
    } catch (err: any) {
      errorToast(err.response?.data?.error || 'Erro ao estornar');
    }
  }, [estornoSaida, estornarSaidaMutation, success, errorToast, refetchSaidas]);

  const handleOpenEditar  = useCallback((saida: SaidaTinta) => { setEditarSaida(saida); }, []);

  const handleConfirmEditar = useCallback(async (data: UpdateSaidaData) => {
    if (!editarSaida) return;
    try {
      await updateSaidaMutation.mutateAsync({ id: editarSaida.id, data });
      success('Registro de saída atualizado!');
      setEditarSaida(null);
      refetchSaidas();
    } catch (err: any) {
      errorToast(err.response?.data?.error || 'Erro ao editar saída');
    }
  }, [editarSaida, updateSaidaMutation, success, errorToast, refetchSaidas]);

  const closeEstorno = useCallback(() => setEstornoSaida(null), []);
  const closeEditar  = useCallback(() => setEditarSaida(null),  []);

  const modalTitle = useMemo(() => {
    if (modalMode === 'saida' && selectedEstoque) return `Registrar Saída — ${selectedEstoque.cor_tinta} (${selectedEstoque.modelo_impressora})`;
    if (modalMode === 'estoque_edit' && selectedEstoque) return `Editar — ${selectedEstoque.cor_tinta} (${selectedEstoque.modelo_impressora})`;
    if (modalMode === 'estoque_create') return 'Cadastrar Nova Tinta';
    if (modalMode === 'gerenciar_modelos') return 'Gerenciar Modelos de Impressora';
    return '';
  }, [modalMode, selectedEstoque]);

  const renderModal = useCallback(() => {
    if (modalMode === 'saida' && selectedEstoque)
      return <Suspense fallback={<Spinner />}><InkSaidaForm estoque={selectedEstoque} onSubmit={handleSubmitSaida} onCancel={closeModal} isLoading={createSaidaMutation.isPending} /></Suspense>;
    if (modalMode === 'estoque_create' || modalMode === 'estoque_edit')
      return <Suspense fallback={<Spinner />}><InkEstoqueForm estoque={modalMode === 'estoque_edit' ? selectedEstoque : null} onSubmit={handleSubmitEstoque} onCancel={closeModal} isLoading={createEstoqueMutation.isPending || updateEstoqueMutation.isPending} /></Suspense>;
    if (modalMode === 'gerenciar_modelos')
      return <Suspense fallback={<Spinner />}><PrinterModelManager onClose={closeModal} /></Suspense>;
    return null;
  }, [modalMode, selectedEstoque, handleSubmitSaida, handleSubmitEstoque, closeModal, createSaidaMutation.isPending, createEstoqueMutation.isPending, updateEstoqueMutation.isPending]);

  return (
    <div className="page-inner pb-10">

      {/* ── Page toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-800">Estoque de Tintas</h2>
          <p className="text-xs text-slate-500">Gerencie o estoque e as saídas de tintas Epson</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleOpenModelos} className="btn btn-outline text-xs py-2 gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Modelos
          </button>
          <button onClick={handleOpenCreate} className="btn btn-primary text-xs py-2 gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
            Nova Tinta
          </button>
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Tintas cadastradas', value: estoques.length, sub: 'no estoque',
            icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7"/></svg>,
            accent: 'text-slate-600 bg-slate-50 border-slate-200' },
          { label: 'Modelos', value: modelos.length, sub: 'cadastrados',
            icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>,
            accent: 'text-blue-600 bg-blue-50 border-blue-200' },
          { label: 'Estoque crítico', value: criticalCount, sub: 'abaixo do mínimo',
            icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>,
            accent: criticalCount > 0 ? 'text-red-600 bg-red-50 border-red-200' : 'text-slate-400 bg-slate-50 border-slate-200' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</span>
              <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${s.accent}`}>{s.icon}</div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 leading-none mb-1">{s.value}</p>
            <p className="text-xs text-slate-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="tab-bar">
        <button onClick={() => setActiveTab('estoque')} className={`tab-item ${activeTab === 'estoque' ? 'active' : ''}`}>
          Estoque
        </button>
        <button onClick={() => setActiveTab('historico')} className={`tab-item ${activeTab === 'historico' ? 'active' : ''}`}>
          Histórico de Saídas
        </button>
      </div>

      {/* ══ TAB: ESTOQUE ══════════════════════════════════════════════════════════ */}
      {activeTab === 'estoque' && (
        <>
          <div className="flex gap-2 flex-wrap mb-5">
            <button onClick={() => setModeloFilter('todos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                modeloFilter === 'todos'
                  ? 'bg-slate-800 border-slate-800 text-white'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
              }`}>
              Todos ({estoques.length})
            </button>
            {modelosParaFiltro.map(nome => (
              <button key={nome} onClick={() => setModeloFilter(nome)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  modeloFilter === nome
                    ? 'bg-slate-800 border-slate-800 text-white'
                    : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                }`}>
                {nome} ({contagemPorModelo[nome] ?? 0})
              </button>
            ))}
          </div>

          {estoqueLoading && <Spinner />}
          {estoqueError && (
            <div className="card p-6 text-center border-red-200">
              <p className="text-sm font-semibold text-red-600 mb-3">Erro ao carregar estoque</p>
              <button onClick={() => refetchEstoque()} className="btn btn-primary text-xs">Tentar Novamente</button>
            </div>
          )}

          {!estoqueLoading && !estoqueError && (
            filteredEstoque.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7"/>
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700 mb-1">Nenhuma tinta cadastrada</p>
                <p className="text-xs text-slate-500 mb-4">
                  {modeloFilter !== 'todos' ? `Nenhuma tinta para "${modeloFilter}"` : 'Clique em "Nova Tinta" para começar.'}
                </p>
                <div className="flex gap-2">
                  <button onClick={handleOpenCreate} className="btn btn-primary text-xs">Nova Tinta</button>
                  {modelos.length === 0 && <button onClick={handleOpenModelos} className="btn btn-outline text-xs">Cadastrar Modelo</button>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEstoque.map(e => (
                  <EstoqueCard key={e.id} estoque={e}
                    onSaida={handleOpenSaida} onEdit={handleOpenEdit}
                    onDelete={handleDeleteEstoque} onViewHistory={handleViewHistory} />
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* ══ TAB: HISTÓRICO ════════════════════════════════════════════════════════ */}
      {activeTab === 'historico' && (
        <>
          <div className="filter-bar mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">Filtros</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{saidas.length}</span> registro{saidas.length !== 1 ? 's' : ''}
                </span>
                <button onClick={() => { setHistModeloFilter('todos'); setHistUnidadeFilter(''); setHistSetorFilter(''); setHistDataSaida(''); }}
                  className="text-xs text-slate-500 hover:text-slate-700 underline">
                  Limpar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="label">Modelo</label>
                <select value={histModeloFilter} onChange={e => setHistModeloFilter(e.target.value)} className="input">
                  <option value="todos">Todos</option>
                  {modelosParaFiltro.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Unidade</label>
                <select value={histUnidadeFilter} onChange={e => setHistUnidadeFilter(e.target.value)} className="input">
                  <option value="">Todas</option>
                  {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Setor</label>
                <select value={histSetorFilter} onChange={e => setHistSetorFilter(e.target.value)} className="input">
                  <option value="">Todos</option>
                  {SETORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Data de Saída</label>
                <input type="date" value={histDataSaida} onChange={e => setHistDataSaida(e.target.value)} className="input" />
              </div>
            </div>
          </div>

          {saidasLoading ? <Spinner /> : saidas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700 mb-1">Nenhuma saída registrada</p>
              <p className="text-xs text-slate-500">As saídas de tinta aparecerão aqui.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <div className="overflow-x-auto table-scroll">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['Data','Cor','Modelo','Unidade','Setor','Responsável','Qtd','Observação','Ações'].map(h => (
                        <th key={h} className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {saidas.map(s => (
                      <SaidaRow key={s.id} saida={s}
                        onEstornar={handleOpenEstorno}
                        onEditar={handleOpenEditar} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex gap-6 text-xs text-slate-500">
                <span>Registros: <strong className="text-slate-700">{saidas.length}</strong></span>
                <span>Total saído: <strong className="text-slate-700">{saidas.reduce((a,s)=>a+s.quantidade,0)} unidades</strong></span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal principal */}
      <Modal isOpen={showModal} onClose={closeModal} title={modalTitle}>
        {renderModal()}
      </Modal>

      {/* Modal de Estorno */}
      {estornoSaida && (
        <EstornoModal
          saida={estornoSaida}
          isLoading={estornarSaidaMutation.isPending}
          onConfirm={handleConfirmEstorno}
          onCancel={closeEstorno}
        />
      )}

      {/* Modal de Editar Saída */}
      {editarSaida && (
        <EditarSaidaModal
          saida={editarSaida}
          isLoading={updateSaidaMutation.isPending}
          onConfirm={handleConfirmEditar}
          onCancel={closeEditar}
        />
      )}

      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />)}
    </div>
  );
};

export default InkManagement;
