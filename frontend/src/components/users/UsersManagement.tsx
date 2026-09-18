import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../common/Toast';
import { useToast } from '../../hooks/useToast';

type Role = 'admin' | 'tecnico' | 'visualizador';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
  role_label?: string;
  ativo: boolean;
  ultimo_login?: string | null;
  created_at: string;
}

const ROLE_OPTIONS: { value: Role; label: string; desc: string; color: string }[] = [
  {
    value: 'admin',
    label: 'Administrador',
    desc: 'Acesso total: criar, editar, excluir e gerenciar usuários',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  {
    value: 'tecnico',
    label: 'Técnico',
    desc: 'Criar e editar OS, tintas, trocas. Não pode excluir.',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    value: 'visualizador',
    label: 'Visualizador',
    desc: 'Somente leitura. Não pode criar, editar ou excluir.',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
  },
];

const roleBadge = (role: string) => {
  const opt = ROLE_OPTIONS.find(r => r.value === role);
  return opt ? opt.color : 'bg-slate-100 text-slate-600 border-slate-200';
};

const roleLabel = (role: string) => {
  return ROLE_OPTIONS.find(r => r.value === role)?.label ?? role;
};

const fmt = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

interface FormState {
  nome: string;
  email: string;
  senha: string;
  role: Role;
  ativo: boolean;
}

const initialForm: FormState = { nome: '', email: '', senha: '', role: 'tecnico', ativo: true };

const UsersManagement: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user: me } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const { toasts, removeToast, success, error: errorToast } = useToast();

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authAPI.listarUsuarios();
      setUsuarios(data);
    } catch {
      errorToast('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [errorToast]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(initialForm);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (u: Usuario) => {
    setEditingUser(u);
    setForm({ nome: u.nome, email: u.email, senha: '', role: u.role, ativo: u.ativo });
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.nome.trim()) e.nome = 'Obrigatório' as any;
    if (!editingUser && !form.email.trim()) e.email = 'Obrigatório' as any;
    if (!editingUser && !form.senha.trim()) e.senha = 'Obrigatório' as any;
    if (form.senha && form.senha.length < 6) e.senha = 'Mínimo 6 caracteres' as any;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingUser) {
        const updateData: any = { nome: form.nome, role: form.role, ativo: form.ativo };
        if (form.email) updateData.email = form.email;
        if (form.senha) updateData.senha = form.senha;
        await authAPI.atualizarUsuario(editingUser.id, updateData);
        success(`Usuário "${form.nome}" atualizado!`);
      } else {
        await authAPI.criarUsuario({ nome: form.nome, email: form.email, senha: form.senha, role: form.role });
        success(`Usuário "${form.nome}" criado com sucesso!`);
      }
      setShowForm(false);
      fetchUsuarios();
    } catch (err: any) {
      errorToast(err.response?.data?.error || 'Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: Usuario) => {
    if (u.id === me?.id) { errorToast('Você não pode excluir sua própria conta'); return; }
    if (!window.confirm(`Excluir o usuário "${u.nome}"? Esta ação é irreversível.`)) return;
    try {
      await authAPI.deletarUsuario(u.id);
      success(`Usuário "${u.nome}" excluído!`);
      fetchUsuarios();
    } catch (err: any) {
      errorToast(err.response?.data?.error || 'Erro ao excluir usuário');
    }
  };

  const handleToggleAtivo = async (u: Usuario) => {
    if (u.id === me?.id) { errorToast('Você não pode desativar sua própria conta'); return; }
    try {
      await authAPI.atualizarUsuario(u.id, { ativo: !u.ativo });
      success(u.ativo ? `"${u.nome}" desativado` : `"${u.nome}" ativado`);
      fetchUsuarios();
    } catch (err: any) {
      errorToast(err.response?.data?.error || 'Erro ao atualizar status');
    }
  };

  return (
    <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {usuarios.length} {usuarios.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary text-xs py-2 gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Novo Usuário
        </button>
      </div>

      {/* Permissões - Legenda */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {ROLE_OPTIONS.map(r => (
          <div key={r.value} className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 ${r.color}`}>
            <div className="mt-0.5">
              {r.value === 'admin' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
              {r.value === 'tecnico' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              )}
              {r.value === 'visualizador' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold leading-tight">{r.label}</p>
              <p className="text-[10px] opacity-80 mt-0.5 leading-snug">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            {editingUser ? `Editar: ${editingUser.nome}` : 'Novo Usuário'}
          </h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label mb-1">Nome <span className="text-red-500">*</span></label>
              <input type="text" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                className={`input ${errors.nome ? 'border-red-400' : ''}`} placeholder="Nome completo" />
              {errors.nome && <p className="text-xs text-red-500 mt-0.5">{errors.nome}</p>}
            </div>
            <div>
              <label className="label mb-1">
                E-mail {!editingUser && <span className="text-red-500">*</span>}
                {editingUser && <span className="text-slate-400 font-normal">(deixe em branco para não alterar)</span>}
              </label>
              <input type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={`input ${errors.email ? 'border-red-400' : ''}`}
                placeholder={editingUser ? editingUser.email : 'usuario@email.com'} />
              {errors.email && <p className="text-xs text-red-500 mt-0.5">{String(errors.email)}</p>}
            </div>
            <div>
              <label className="label mb-1">
                Senha {!editingUser && <span className="text-red-500">*</span>}
                {editingUser && <span className="text-slate-400 font-normal">(deixe em branco para não alterar)</span>}
              </label>
              <input type="password" value={form.senha}
                onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                className={`input ${errors.senha ? 'border-red-400' : ''}`}
                placeholder={editingUser ? '••••••••' : 'Mínimo 6 caracteres'} />
              {errors.senha && <p className="text-xs text-red-500 mt-0.5">{String(errors.senha)}</p>}
            </div>
            <div>
              <label className="label mb-1">Perfil de Acesso <span className="text-red-500">*</span></label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))} className="input">
                {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {editingUser && (
              <div className="sm:col-span-2 flex items-center gap-3">
                <label className="label mb-0">Status da conta:</label>
                <button type="button" onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${form.ativo ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <span className={`inline-block w-4 h-4 transform rounded-full bg-white shadow transition-transform duration-200 ${form.ativo ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`text-xs font-semibold ${form.ativo ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {form.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            )}
            <div className="sm:col-span-2 flex gap-2 pt-1">
              <button type="button" onClick={() => setShowForm(false)} disabled={saving}
                className="btn btn-outline flex-1 text-xs py-2.5">Cancelar</button>
              <button type="submit" disabled={saving} className="btn btn-primary flex-1 text-xs py-2.5">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Salvando…
                  </span>
                ) : editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {usuarios.map(u => (
            <div key={u.id} className={`flex items-center gap-3 bg-white rounded-xl border px-4 py-3 transition-all
              ${!u.ativo ? 'opacity-60 border-slate-200' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0
                ${u.role === 'admin' ? 'bg-purple-500' : u.role === 'tecnico' ? 'bg-blue-500' : 'bg-slate-400'}`}>
                {u.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-800 truncate">{u.nome}</p>
                  {u.id === me?.id && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">você</span>
                  )}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadge(u.role)}`}>
                    {roleLabel(u.role)}
                  </span>
                  {!u.ativo && (
                    <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      Inativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">{u.email}</p>
                {u.ultimo_login && (
                  <p className="text-[10px] text-slate-300 mt-0.5">Último login: {fmt(u.ultimo_login)}</p>
                )}
              </div>
              {/* Actions */}
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => handleToggleAtivo(u)} disabled={u.id === me?.id}
                  title={u.ativo ? 'Desativar' : 'Ativar'}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                    ${u.ativo ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                  {u.ativo ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
                </button>
                <button onClick={() => openEdit(u)} title="Editar"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button onClick={() => handleDelete(u)} disabled={u.id === me?.id} title="Excluir"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />)}
    </div>
  );
};

export default UsersManagement;
