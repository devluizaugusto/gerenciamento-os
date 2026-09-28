import React, { useMemo, useState } from 'react';
import { authAPI } from '../services/api';

const PasswordRecoveryPage: React.FC = () => {
  const token = useMemo(() => {
    const match = window.location.pathname.match(/^\/redefinir-senha\/([^/]+)$/);
    return match?.[1] || '';
  }, []);
  const redefinindo = Boolean(token);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [link, setLink] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const solicitar = async (e: React.FormEvent) => {
    e.preventDefault(); setErro(''); setMensagem(''); setLink(''); setCarregando(true);
    try {
      const r = await authAPI.solicitarRecuperacaoSenha(email.trim());
      setMensagem(r.message);
      if (r.link) setLink(r.link);
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Não foi possível gerar o link.');
    } finally { setCarregando(false); }
  };

  const redefinir = async (e: React.FormEvent) => {
    e.preventDefault(); setErro(''); setMensagem('');
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (senha !== confirmar) { setErro('As senhas não conferem.'); return; }
    setCarregando(true);
    try {
      const r = await authAPI.redefinirSenhaPorToken(token, senha);
      setMensagem(r.message);
      setTimeout(() => { window.location.href = '/'; }, 1500);
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Não foi possível redefinir a senha.');
    } finally { setCarregando(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a2236] to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="p-8">
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-3">
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{redefinindo ? 'Redefinir senha' : 'Recuperar acesso'}</h1>
            <p className="text-sm text-slate-500 mt-1 text-center">
              {redefinindo ? 'Crie uma nova senha para sua conta.' : 'Gere um link temporário para redefinir sua senha.'}
            </p>
          </div>

          {redefinindo ? (
            <form onSubmit={redefinir} className="space-y-4">
              <input type="password" minLength={6} required value={senha} onChange={e => setSenha(e.target.value)} placeholder="Nova senha" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
              <input type="password" minLength={6} required value={confirmar} onChange={e => setConfirmar(e.target.value)} placeholder="Confirmar nova senha" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
              <button disabled={carregando} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-60">
                {carregando ? 'Redefinindo…' : 'Redefinir senha'}
              </button>
            </form>
          ) : (
            <form onSubmit={solicitar} className="space-y-4">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">E-mail</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
              <button disabled={carregando} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-60">
                {carregando ? 'Gerando…' : 'Gerar link de recuperação'}
              </button>
            </form>
          )}

          {erro && <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{erro}</div>}
          {mensagem && <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">{mensagem}</div>}
          {link && (
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 mb-2">Link temporário — válido por 15 minutos:</p>
              <a
                href={link}
                className="block w-full text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline break-all"
              >
                Abrir página de redefinição de senha
              </a>
              <button type="button" onClick={() => navigator.clipboard?.writeText(link)} className="mt-2 text-xs text-slate-500 hover:text-slate-700 hover:underline">Copiar link</button>
            </div>
          )}
          <button type="button" onClick={() => { window.location.href = '/'; }} className="w-full mt-6 text-sm text-slate-500 hover:text-slate-800">← Voltar para o login</button>
        </div>
      </div>
    </div>
  );
};
export default PasswordRecoveryPage;
