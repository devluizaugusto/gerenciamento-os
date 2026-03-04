import React, { useState } from 'react';
import { EstoqueTinta } from '../../types';

interface InkSaidaFormProps {
  estoque: EstoqueTinta;
  onSubmit: (data: {
    estoque_id: number;
    quantidade: number;
    unidade: string;
    setor: string;
    responsavel: string;
    observacao?: string | null;
    data_saida: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const COR_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Preto:    { bg: 'bg-gray-900',   text: 'text-white',       dot: 'bg-gray-900' },
  Ciano:    { bg: 'bg-cyan-500',   text: 'text-white',       dot: 'bg-cyan-500' },
  Magenta:  { bg: 'bg-pink-600',   text: 'text-white',       dot: 'bg-pink-600' },
  Amarelo:  { bg: 'bg-yellow-400', text: 'text-yellow-900',  dot: 'bg-yellow-400' },
};

// ─── Listas predefinidas (igual ao ServiceOrderForm) ──────────
const UNIDADES_PREDEFINIDAS = [
  'URUCUBA', 'MENDES', 'GAMELEIRA', 'JUA', 'LAGOA AZUL',
  'RIBEIRO DO MEL', 'SANTANA', 'SANTA CRUZ', 'ALEGRIA', 'REDENTOR',
  'JOAO ERNESTO', 'CONGAL', 'SANTA TEREZINHA', 'SANTO ANTONIO',
  'N. SRA DE FATIMA', 'CONVALES', 'SAO SEBASTIAO', 'OTACIO DE LEMOS',
  'PONTO CERTO', 'CTA', 'CER', 'CEO', 'POLICLINICA', 'SAMU',
  'HOSPITAL DE CAMPANHA', 'VISA', 'VIGILANCIA AMBIENTAL', 'CAPS',
  'RESIDENCIA TERAPEUTICA', 'UNIDADE DE ACOLHIMENTO', 'SEDE DA SECRETARIA',
  'CAF', 'LABORATÓRIO', 'CAPS III DAS PONTES'
].sort();

const SETORES_PREDEFINIDOS = [
  'VACINA', 'MEDICO', 'DENTISTA', 'ENFERMEIRA', 'RECEPÇÃO',
  'SALA ADM', 'VIGILÂNCIA EPIDEMIOLOGICA', 'REGULAÇÃO', 'RH',
  'ATENÇÃO BÁSICA', 'UBS', 'GABINETE', 'PNI', 'OUVIDORIA',
  'ADMINISTRAÇÃO', 'TELECARDIO', 'FINCANCEIRO/ADM'
].sort();

const getTodayISO = () => new Date().toISOString().split('T')[0];

const InkSaidaForm: React.FC<InkSaidaFormProps> = ({ estoque, onSubmit, onCancel, isLoading }) => {
  const corStyle = COR_COLORS[estoque.cor_tinta] ?? { bg: 'bg-primary', text: 'text-white', dot: 'bg-primary' };

  const [quantidade, setQuantidade] = useState<string>('1');
  const [unidade, setUnidade] = useState<string>('');
  const [showUnidadeInput, setShowUnidadeInput] = useState(false);
  const [setor, setSetor] = useState<string>('');
  const [showSetorInput, setShowSetorInput] = useState(false);
  const [responsavel, setResponsavel] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');
  const [dataSaida, setDataSaida] = useState<string>(getTodayISO());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const saldoAposRetirada = estoque.quantidade_atual - (parseInt(quantidade) || 0);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const qty = parseInt(quantidade);
    if (!quantidade || isNaN(qty) || qty < 1) {
      newErrors.quantidade = 'Quantidade deve ser pelo menos 1';
    } else if (qty > estoque.quantidade_atual) {
      newErrors.quantidade = `Máximo disponível: ${estoque.quantidade_atual}`;
    }
    if (!unidade.trim()) newErrors.unidade = 'Unidade é obrigatória';
    if (!setor.trim()) newErrors.setor = 'Setor é obrigatório';
    if (!responsavel.trim()) newErrors.responsavel = 'Responsável é obrigatório';
    if (!dataSaida) newErrors.dataSaida = 'Data de saída é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      estoque_id: estoque.id,
      quantidade: parseInt(quantidade),
      unidade: unidade.trim(),
      setor: setor.trim(),
      responsavel: responsavel.trim(),
      observacao: observacao.trim() || null,
      data_saida: dataSaida,
    });
  };

  const handleUnidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__custom__') {
      setShowUnidadeInput(true);
      setUnidade('');
    } else {
      setShowUnidadeInput(false);
      setUnidade(value);
    }
  };

  const handleSetorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__custom__') {
      setShowSetorInput(true);
      setSetor('');
    } else {
      setShowSetorInput(false);
      setSetor(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Info do estoque */}
      <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full ${corStyle.bg} flex items-center justify-center shadow-md flex-shrink-0`}>
          <span className={`text-xs font-bold ${corStyle.text}`}>
            {estoque.cor_tinta.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800 text-base">
            {estoque.cor_tinta} — Epson {estoque.modelo_impressora}
          </p>
          <p className="text-sm text-gray-500">Código: {estoque.codigo_tinta}</p>
          <p className="text-sm font-semibold text-gray-700 mt-1">
            Estoque atual:{' '}
            <span className={`font-bold ${estoque.quantidade_atual <= estoque.quantidade_minima ? 'text-red-600' : 'text-green-700'}`}>
              {estoque.quantidade_atual} unidade{estoque.quantidade_atual !== 1 ? 's' : ''}
            </span>
          </p>
        </div>
      </div>

      {/* Quantidade */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          🔢 Quantidade a Retirar <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          max={estoque.quantidade_atual}
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') e.preventDefault();
          }}
          onWheel={(e) => e.currentTarget.blur()}
          className={`w-full px-4 py-3 border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-4 transition-all ${
            errors.quantidade
              ? 'border-red-400 ring-red-100'
              : 'border-gray-300 focus:border-primary focus:ring-red-100'
          }`}
          placeholder="Ex: 1"
        />
        {errors.quantidade && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.quantidade}
          </p>
        )}
        {/* Prévia do saldo */}
        {!errors.quantidade && parseInt(quantidade) > 0 && (
          <div className={`mt-2 flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg ${
            saldoAposRetirada <= estoque.quantidade_minima
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            <span>{saldoAposRetirada <= estoque.quantidade_minima ? '⚠️' : '✅'}</span>
            Saldo após retirada:{' '}
            <span className="font-bold">{saldoAposRetirada} unidade{saldoAposRetirada !== 1 ? 's' : ''}</span>
            {saldoAposRetirada <= estoque.quantidade_minima && (
              <span className="ml-1 text-red-600">(abaixo do mínimo!)</span>
            )}
          </div>
        )}
      </div>

      {/* Unidade */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          🏥 Unidade Solicitante <span className="text-red-500">*</span>
        </label>
        {showUnidadeInput ? (
          <div className="space-y-2">
            <input
              type="text"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value.toUpperCase())}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-4 transition-all ${
                errors.unidade
                  ? 'border-red-400 ring-red-100'
                  : 'border-gray-300 focus:border-primary focus:ring-red-100'
              }`}
              placeholder="Digite a unidade"
            />
            <button
              type="button"
              onClick={() => {
                setShowUnidadeInput(false);
                setUnidade('');
              }}
              className="text-sm text-primary hover:text-primary-hover hover:underline flex items-center gap-1"
            >
              ← Voltar para lista de unidades
            </button>
          </div>
        ) : (
          <select
            value={unidade}
            onChange={handleUnidadeChange}
            className={`w-full px-4 py-3 border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-4 transition-all cursor-pointer ${
              errors.unidade
                ? 'border-red-400 ring-red-100'
                : 'border-gray-300 focus:border-primary focus:ring-red-100'
            }`}
          >
            <option value="">Selecione uma unidade</option>
            {UNIDADES_PREDEFINIDAS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
            <option value="__custom__">➕ Adicionar outra unidade</option>
          </select>
        )}
        {errors.unidade && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.unidade}
          </p>
        )}
      </div>

      {/* Setor */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          🏢 Setor Solicitante <span className="text-red-500">*</span>
        </label>
        {showSetorInput ? (
          <div className="space-y-2">
            <input
              type="text"
              value={setor}
              onChange={(e) => setSetor(e.target.value.toUpperCase())}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-4 transition-all ${
                errors.setor
                  ? 'border-red-400 ring-red-100'
                  : 'border-gray-300 focus:border-primary focus:ring-red-100'
              }`}
              placeholder="Digite o setor"
            />
            <button
              type="button"
              onClick={() => {
                setShowSetorInput(false);
                setSetor('');
              }}
              className="text-sm text-primary hover:text-primary-hover hover:underline flex items-center gap-1"
            >
              ← Voltar para lista de setores
            </button>
          </div>
        ) : (
          <select
            value={setor}
            onChange={handleSetorChange}
            className={`w-full px-4 py-3 border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-4 transition-all cursor-pointer ${
              errors.setor
                ? 'border-red-400 ring-red-100'
                : 'border-gray-300 focus:border-primary focus:ring-red-100'
            }`}
          >
            <option value="">Selecione um setor</option>
            {SETORES_PREDEFINIDOS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="__custom__">➕ Adicionar outro setor</option>
          </select>
        )}
        {errors.setor && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.setor}
          </p>
        )}
      </div>

      {/* Responsável */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          👤 Responsável pela Retirada <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-4 transition-all ${
            errors.responsavel
              ? 'border-red-400 ring-red-100'
              : 'border-gray-300 focus:border-primary focus:ring-red-100'
          }`}
          placeholder="Nome completo do responsável"
        />
        {errors.responsavel && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.responsavel}
          </p>
        )}
      </div>

      {/* Data da saída */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          📅 Data da Saída <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={dataSaida}
          onChange={(e) => setDataSaida(e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-4 transition-all ${
            errors.dataSaida
              ? 'border-red-400 ring-red-100'
              : 'border-gray-300 focus:border-primary focus:ring-red-100'
          }`}
        />
        {errors.dataSaida && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.dataSaida}
          </p>
        )}
      </div>

      {/* Observação */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          📝 Observação <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base font-medium focus:outline-none focus:ring-4 focus:border-primary focus:ring-red-100 transition-all resize-none"
          placeholder="Alguma observação adicional sobre esta retirada..."
        />
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || estoque.quantidade_atual === 0}
          className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-br from-primary-hover via-primary to-primary-light rounded-xl hover:from-primary-hover hover:to-primary-hover transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Registrando...
            </>
          ) : (
            <>🖨️ Registrar Saída</>
          )}
        </button>
      </div>
    </form>
  );
};

export default InkSaidaForm;
