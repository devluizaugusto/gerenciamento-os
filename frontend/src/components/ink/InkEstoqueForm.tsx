import React, { useState, useEffect } from 'react';
import { EstoqueTinta, CreateEstoqueData, UpdateEstoqueData } from '../../types';
import { useModelosImpressora } from '../../hooks/useModeloImpressora';

interface InkEstoqueFormProps {
  estoque?: EstoqueTinta | null;
  onSubmit: (data: CreateEstoqueData | UpdateEstoqueData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const CORES_PADRAO = [
  { cor: 'Preto',   icone: '⬛' },
  { cor: 'Ciano',   icone: '🔵' },
  { cor: 'Magenta', icone: '🟣' },
  { cor: 'Amarelo', icone: '🟡' },
];

const COR_COLORS: Record<string, string> = {
  Preto:   'bg-gray-900 text-white',
  Ciano:   'bg-cyan-500 text-white',
  Magenta: 'bg-pink-600 text-white',
  Amarelo: 'bg-yellow-400 text-yellow-900',
};

const InkEstoqueForm: React.FC<InkEstoqueFormProps> = ({ estoque, onSubmit, onCancel, isLoading }) => {
  const isEditing = !!estoque;

  // ── Buscar modelos ativos ──
  const { data: modelos = [], isLoading: modelosLoading } = useModelosImpressora(true);

  const [modelo, setModelo] = useState<string>(estoque?.modelo_impressora ?? '');
  const [corTinta, setCorTinta] = useState<string>(estoque?.cor_tinta ?? 'Preto');
  const [codigoTinta, setCodigoTinta] = useState<string>(estoque?.codigo_tinta ?? '');
  const [quantidadeAtual, setQuantidadeAtual] = useState<string>(
    estoque ? String(estoque.quantidade_atual) : '0'
  );
  const [quantidadeMinima, setQuantidadeMinima] = useState<string>(
    estoque ? String(estoque.quantidade_minima) : '2'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pré-seleciona o primeiro modelo quando a lista carrega (apenas criação)
  useEffect(() => {
    if (!isEditing && !modelo && modelos.length > 0) {
      setModelo(modelos[0].nome);
    }
  }, [modelos, isEditing, modelo]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!modelo.trim()) newErrors.modelo = 'Selecione um modelo de impressora';
    if (!corTinta.trim()) newErrors.corTinta = 'Cor da tinta é obrigatória';
    if (!codigoTinta.trim()) newErrors.codigoTinta = 'Código da tinta é obrigatório';
    const qty = parseInt(quantidadeAtual);
    if (isNaN(qty) || qty < 0) newErrors.quantidadeAtual = 'Quantidade deve ser 0 ou mais';
    const qtyMin = parseInt(quantidadeMinima);
    if (isNaN(qtyMin) || qtyMin < 0) newErrors.quantidadeMinima = 'Quantidade mínima deve ser 0 ou mais';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      modelo_impressora: modelo,
      cor_tinta: corTinta,
      codigo_tinta: codigoTinta,
      quantidade_atual: parseInt(quantidadeAtual),
      quantidade_minima: parseInt(quantidadeMinima),
    };
    await onSubmit(data);
  };

  const modeloSelecionado = modelos.find((m) => m.nome === modelo);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Modelo da Impressora ── */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          🖨️ Modelo da Impressora <span className="text-red-500">*</span>
        </label>

        {modelosLoading ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
            <span className="text-sm text-gray-500">Carregando modelos...</span>
          </div>
        ) : modelos.length === 0 ? (
          <div className="px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
            <p className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
              ⚠️ Nenhum modelo ativo encontrado.
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Acesse "Gerenciar Modelos" para cadastrar modelos de impressora antes de adicionar tintas.
            </p>
          </div>
        ) : (
          <>
            {/* Grid de botões de modelo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              {modelos.map((m) => {
                const isSelected = modelo === m.nome;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => !isEditing && setModelo(m.nome)}
                    disabled={isEditing}
                    className={`py-3 px-4 rounded-xl font-semibold text-sm border-2 transition-all flex items-center gap-2 text-left ${
                      isEditing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                    } ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300 ring-offset-1'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">🖨️</span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate font-bold">{m.nome}</span>
                      {m.descricao && (
                        <span className={`block text-xs truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                          {m.descricao}
                        </span>
                      )}
                    </span>
                    {isSelected && <span className="flex-shrink-0 text-white font-black">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Descrição do modelo selecionado */}
            {modeloSelecionado?.descricao && (
              <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                <span>ℹ️</span> {modeloSelecionado.descricao}
              </p>
            )}

            {isEditing && (
              <p className="mt-1 text-xs text-gray-500">Modelo não pode ser alterado após criação.</p>
            )}
          </>
        )}

        {errors.modelo && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.modelo}
          </p>
        )}
      </div>

      {/* ── Cor da Tinta ── */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          🎨 Cor da Tinta <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CORES_PADRAO.map((c) => {
            const colorClass = COR_COLORS[c.cor] ?? 'bg-blue-500 text-white';
            const isSelected = corTinta === c.cor;
            return (
              <button
                key={c.cor}
                type="button"
                onClick={() => setCorTinta(c.cor)}
                disabled={isEditing}
                className={`py-2.5 px-4 rounded-xl font-semibold text-sm border-2 transition-all flex items-center gap-2 ${
                  isEditing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  isSelected
                    ? 'border-gray-800 shadow-md ring-2 ring-gray-400 ring-offset-1'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <span className={`w-4 h-4 rounded-full ${colorClass.split(' ')[0]} flex-shrink-0`} />
                <span className="text-gray-800">{c.cor}</span>
                {isSelected && <span className="ml-auto text-green-600 font-bold">✓</span>}
              </button>
            );
          })}
        </div>
        {/* Input manual para cor personalizada */}
        <input
          type="text"
          value={corTinta}
          onChange={(e) => setCorTinta(e.target.value)}
          disabled={isEditing}
          placeholder="Ou digite a cor manualmente..."
          className={`mt-2 w-full px-4 py-2 border-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-100 transition-all ${
            errors.corTinta ? 'border-red-400' : 'border-gray-300'
          } ${isEditing ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
        />
        {errors.corTinta && (
          <p className="mt-1 text-sm text-red-600">⚠️ {errors.corTinta}</p>
        )}
        {isEditing && (
          <p className="mt-1 text-xs text-gray-500">Cor não pode ser alterada após criação.</p>
        )}
      </div>

      {/* ── Código da Tinta ── */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          🏷️ Código da Tinta <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={codigoTinta}
          onChange={(e) => setCodigoTinta(e.target.value)}
          disabled={isEditing}
          className={`w-full px-4 py-3 border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-4 transition-all ${
            errors.codigoTinta ? 'border-red-400 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
          } ${isEditing ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
          placeholder="Ex: 544, T544, 664, 673..."
        />
        {errors.codigoTinta && (
          <p className="mt-1 text-sm text-red-600">⚠️ {errors.codigoTinta}</p>
        )}
        {!isEditing && (
          <p className="mt-1 text-xs text-gray-500">Código de referência da tinta (ex: 544 para Epson EcoTank).</p>
        )}
      </div>

      {/* ── Quantidade Atual ── */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          📦 {isEditing ? 'Ajustar Quantidade em Estoque' : 'Quantidade Inicial em Estoque'}{' '}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0"
          value={quantidadeAtual}
          onChange={(e) => setQuantidadeAtual(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') e.preventDefault();
          }}
          onWheel={(e) => e.currentTarget.blur()}
          className={`w-full px-4 py-3 border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-4 transition-all ${
            errors.quantidadeAtual ? 'border-red-400 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
          }`}
          placeholder="0"
        />
        {errors.quantidadeAtual && (
          <p className="mt-1 text-sm text-red-600">⚠️ {errors.quantidadeAtual}</p>
        )}
        {isEditing && (
          <p className="mt-1 text-xs text-blue-600">
            💡 Use para registrar entrada de tinta ou ajustar o saldo atual.
          </p>
        )}
      </div>

      {/* ── Quantidade Mínima ── */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          ⚠️ Quantidade Mínima para Alerta
        </label>
        <input
          type="number"
          min="0"
          value={quantidadeMinima}
          onChange={(e) => setQuantidadeMinima(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') e.preventDefault();
          }}
          onWheel={(e) => e.currentTarget.blur()}
          className={`w-full px-4 py-3 border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-4 transition-all ${
            errors.quantidadeMinima ? 'border-red-400 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
          }`}
          placeholder="2"
        />
        {errors.quantidadeMinima && (
          <p className="mt-1 text-sm text-red-600">⚠️ {errors.quantidadeMinima}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          O sistema irá alertar quando o estoque atingir ou ficar abaixo deste valor.
        </p>
      </div>

      {/* ── Botões ── */}
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
          disabled={isLoading || (modelos.length === 0 && !isEditing)}
          className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Salvando...
            </>
          ) : (
            <>{isEditing ? '💾 Salvar Alterações' : '➕ Cadastrar Tinta'}</>
          )}
        </button>
      </div>
    </form>
  );
};

export default InkEstoqueForm;
