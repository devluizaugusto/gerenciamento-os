import React, { useState, useCallback } from 'react';
import { ModeloImpressoraCadastro, CreateModeloData, UpdateModeloData } from '../../types';
import {
  useModelosImpressora,
  useCreateModelo,
  useUpdateModelo,
  useDeleteModelo,
} from '../../hooks/useModeloImpressora';
import { useToast } from '../../hooks/useToast';
import Toast from '../common/Toast';

// ─── Formulário de modelo ─────────────────────────────────────
interface ModeloFormProps {
  modelo?: ModeloImpressoraCadastro | null;
  onSubmit: (data: CreateModeloData | UpdateModeloData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const ModeloForm: React.FC<ModeloFormProps> = ({ modelo, onSubmit, onCancel, isLoading }) => {
  const isEditing = !!modelo;
  const [nome, setNome] = useState(modelo?.nome ?? '');
  const [descricao, setDescricao] = useState(modelo?.descricao ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nome.trim()) newErrors.nome = 'Nome do modelo é obrigatório';
    if (nome.trim().length > 100) newErrors.nome = 'Máximo de 100 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      nome: nome.trim(),
      descricao: descricao.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nome */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          🖨️ Nome do Modelo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: L3150 & L3250, L4160, L6490..."
          maxLength={100}
          className={`w-full px-4 py-3 border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-4 transition-all ${
            errors.nome
              ? 'border-red-400 ring-red-100'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
          }`}
        />
        {errors.nome && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.nome}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Este nome será exibido como identificador do modelo de impressora.
        </p>
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          📝 Descrição <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Epson EcoTank — Tinta 544, compatível com L3150 e L3250"
          maxLength={255}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base font-medium focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-100 transition-all"
        />
        <p className="mt-1 text-xs text-gray-500">Informação complementar sobre o modelo ou a tinta compatível.</p>
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
            <>{isEditing ? '💾 Salvar Alterações' : '➕ Cadastrar Modelo'}</>
          )}
        </button>
      </div>
    </form>
  );
};

// ─── Card de modelo ───────────────────────────────────────────
interface ModeloCardProps {
  modelo: ModeloImpressoraCadastro;
  onEdit: (m: ModeloImpressoraCadastro) => void;
  onDelete: (id: number) => void;
  onToggleAtivo: (m: ModeloImpressoraCadastro) => void;
}

const ModeloCard: React.FC<ModeloCardProps> = ({ modelo, onEdit, onDelete, onToggleAtivo }) => {
  const qtd = modelo._count?.estoques ?? 0;
  return (
    <div className={`bg-white rounded-2xl shadow border-2 transition-all ${
      modelo.ativo ? 'border-blue-200 hover:shadow-md hover:-translate-y-0.5' : 'border-gray-200 opacity-60'
    }`}>
      <div className={`rounded-t-xl px-5 py-4 flex items-center justify-between ${
        modelo.ativo ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gray-400'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🖨️</span>
          <div>
            <p className="font-bold text-base text-white">{modelo.nome}</p>
            {modelo.descricao && (
              <p className="text-xs text-white/80 mt-0.5">{modelo.descricao}</p>
            )}
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          modelo.ativo ? 'bg-white/20 text-white' : 'bg-white/30 text-white'
        }`}>
          {modelo.ativo ? '✅ Ativo' : '⛔ Inativo'}
        </span>
      </div>

      <div className="p-4">
        {/* Info */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Tintas Cadastradas</p>
            <p className="text-2xl font-black text-blue-700">{qtd}</p>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onEdit(modelo)}
            className="flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-all"
            title="Editar modelo"
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => onToggleAtivo(modelo)}
            className={`flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-bold rounded-xl border transition-all ${
              modelo.ativo
                ? 'text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
            }`}
            title={modelo.ativo ? 'Desativar modelo' : 'Ativar modelo'}
          >
            {modelo.ativo ? '⛔ Desativar' : '✅ Ativar'}
          </button>
          <button
            onClick={() => onDelete(modelo.id)}
            disabled={qtd > 0}
            className="flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title={qtd > 0 ? `Não é possível remover: ${qtd} tinta(s) associada(s)` : 'Remover modelo'}
          >
            🗑️ Remover
          </button>
        </div>
        {qtd > 0 && (
          <p className="mt-2 text-xs text-gray-400 text-center">
            💡 Remova as tintas associadas para excluir este modelo.
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Componente Principal ─────────────────────────────────────
interface PrinterModelManagerProps {
  onClose: () => void;
}

const PrinterModelManager: React.FC<PrinterModelManagerProps> = ({ onClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState<ModeloImpressoraCadastro | null>(null);

  const { data: modelos = [], isLoading, error, refetch } = useModelosImpressora();
  const createMutation = useCreateModelo();
  const updateMutation = useUpdateModelo();
  const deleteMutation = useDeleteModelo();

  const { toasts, removeToast, success, error: errorToast } = useToast();

  const handleOpenCreate = useCallback(() => {
    setSelectedModelo(null);
    setShowForm(true);
  }, []);

  const handleOpenEdit = useCallback((modelo: ModeloImpressoraCadastro) => {
    setSelectedModelo(modelo);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setSelectedModelo(null);
  }, []);

  const handleSubmit = useCallback(async (data: CreateModeloData | UpdateModeloData) => {
    try {
      if (selectedModelo) {
        await updateMutation.mutateAsync({ id: selectedModelo.id, data });
        success(`💾 Modelo "${selectedModelo.nome}" atualizado com sucesso!`);
      } else {
        const created = await createMutation.mutateAsync(data as CreateModeloData);
        success(`➕ Modelo "${created.nome}" cadastrado com sucesso!`);
      }
      handleCloseForm();
    } catch (err: any) {
      errorToast(err.response?.data?.error || '❌ Erro ao salvar modelo');
    }
  }, [selectedModelo, createMutation, updateMutation, success, errorToast, handleCloseForm]);

  const handleDelete = useCallback(async (id: number) => {
    const modelo = modelos.find((m) => m.id === id);
    if (!window.confirm(`Tem certeza que deseja remover o modelo "${modelo?.nome}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      success('🗑️ Modelo removido com sucesso!');
    } catch (err: any) {
      errorToast(err.response?.data?.error || '❌ Erro ao remover modelo');
    }
  }, [modelos, deleteMutation, success, errorToast]);

  const handleToggleAtivo = useCallback(async (modelo: ModeloImpressoraCadastro) => {
    const acao = modelo.ativo ? 'desativar' : 'ativar';
    if (!window.confirm(`Deseja ${acao} o modelo "${modelo.nome}"?`)) return;
    try {
      await updateMutation.mutateAsync({ id: modelo.id, data: { ativo: !modelo.ativo } });
      success(`${modelo.ativo ? '⛔' : '✅'} Modelo "${modelo.nome}" ${modelo.ativo ? 'desativado' : 'ativado'}!`);
    } catch (err: any) {
      errorToast(err.response?.data?.error || `❌ Erro ao ${acao} modelo`);
    }
  }, [updateMutation, success, errorToast]);

  return (
    <div className="min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-gray-500">
            {modelos.length} modelo{modelos.length !== 1 ? 's' : ''} cadastrado{modelos.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md text-sm"
          >
            ➕ Novo Modelo
          </button>
        )}
      </div>

      {/* Formulário inline */}
      {showForm && (
        <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🖨️</span>
            {selectedModelo ? `Editar: ${selectedModelo.nome}` : 'Cadastrar Novo Modelo'}
          </h4>
          <ModeloForm
            modelo={selectedModelo}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-5xl mb-4">⏳</div>
          <p className="text-gray-500">Carregando modelos...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 text-center">
          <p className="text-red-600 font-semibold mb-2">❌ Erro ao carregar modelos</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors">
            🔄 Tentar Novamente
          </button>
        </div>
      )}

      {/* Lista de modelos */}
      {!isLoading && !error && (
        <>
          {modelos.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🖨️</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum modelo cadastrado</h3>
              <p className="text-gray-500 mb-5">Cadastre o primeiro modelo de impressora para gerenciar as tintas.</p>
              <button
                onClick={handleOpenCreate}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                ➕ Cadastrar Primeiro Modelo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[60vh] pb-2 pr-1">
              {modelos.map((modelo) => (
                <ModeloCard
                  key={modelo.id}
                  modelo={modelo}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  onToggleAtivo={handleToggleAtivo}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Botão fechar */}
      <div className="flex justify-end mt-5 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Fechar
        </button>
      </div>

      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

export default PrinterModelManager;
