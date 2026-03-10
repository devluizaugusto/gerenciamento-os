import React, { useState, useEffect } from 'react';
import { EstoqueTinta, ModeloImpressora, CreateEstoqueData, UpdateEstoqueData } from '../../types';

interface InkEstoqueFormProps {
  estoque?: EstoqueTinta | null;
  onSubmit: (data: CreateEstoqueData | UpdateEstoqueData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const MODELOS: ModeloImpressora[] = ['L3150 & L3250'];

const CORES_PADRAO = [
  { cor: 'Preto',   codigo: '544' },
  { cor: 'Ciano',   codigo: '544' },
  { cor: 'Magenta', codigo: '544' },
  { cor: 'Amarelo', codigo: '544' },
];

const COR_COLORS: Record<string, string> = {
  Preto:   'bg-gray-900 text-white',
  Ciano:   'bg-cyan-500 text-white',
  Magenta: 'bg-pink-600 text-white',
  Amarelo: 'bg-yellow-400 text-yellow-900',
};

const InkEstoqueForm: React.FC<InkEstoqueFormProps> = ({ estoque, onSubmit, onCancel, isLoading }) => {
  const isEditing = !!estoque;

  const [modelo, setModelo] = useState<ModeloImpressora>(estoque?.modelo_impressora ?? 'L3150 & L3250');
  const [corTinta, setCorTinta] = useState<string>(estoque?.cor_tinta ?? 'Preto');
  const [codigoTinta, setCodigoTinta] = useState<string>(estoque?.codigo_tinta ?? '544');
  const [quantidadeAtual, setQuantidadeAtual] = useState<string>(
    estoque ? String(estoque.quantidade_atual) : '0'
  );
  const [quantidadeMinima, setQuantidadeMinima] = useState<string>(
    estoque ? String(estoque.quantidade_minima) : '2'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync código when cor changes (autofill for known inks)
  useEffect(() => {
    const found = CORES_PADRAO.find((c) => c.cor === corTinta);
    if (found && !isEditing) {
      setCodigoTinta(found.codigo);
    }
  }, [corTinta, isEditing]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Modelo */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          🖨️ Modelo da Impressora
        </label>
        <div className="flex gap-3">
          <div className="flex-1 py-3 px-4 rounded-xl font-bold text-sm border-2 bg-blue-600 text-white border-blue-600 shadow-md text-center">
            Epson L3150 &amp; L3250
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">As tintas 544 são compatíveis com ambos os modelos.</p>
      </div>

      {/* Cor */}
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
                onClick={() => {
                  setCorTinta(c.cor);
                }}
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
                {isSelected && <span className="ml-auto text-green-600">✓</span>}
              </button>
            );
          })}
        </div>
        {/* Custom cor input */}
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

      {/* Código */}
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
          placeholder="Ex: 544, T544, 664..."
        />
        {errors.codigoTinta && (
          <p className="mt-1 text-sm text-red-600">⚠️ {errors.codigoTinta}</p>
        )}
      </div>

      {/* Quantidade Atual */}
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

      {/* Quantidade Mínima */}
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
          disabled={isLoading}
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
