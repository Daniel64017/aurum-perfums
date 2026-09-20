import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@aurumparfums.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.user.role !== 'ADMIN') {
        setError("Acesso negado. Esta conta não possui privilégios de Administrador.");
        return;
      }

      login(res.data.access_token, res.data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Credenciais administrativas incorretas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 space-y-8 animate-fade-in">
      
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-aurum-gold/10 border border-aurum-gold flex items-center justify-center mx-auto shadow-gold">
          <ShieldCheck className="w-7 h-7 text-aurum-gold" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-white">Portal Administrativo</h1>
        <p className="text-xs text-aurum-gray">Área restrita de gestão de e-commerce da Aurum Parfums</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-aurum-card border border-aurum-gold/30 space-y-4 shadow-glass">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-aurum-gray block">E-mail do Administrador</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-aurum-surface border border-aurum-border rounded-xl py-2.5 px-3 pl-10 text-xs text-white"
            />
            <Mail className="w-4 h-4 text-aurum-gray absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-aurum-gray block">Senha de Acesso</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-aurum-surface border border-aurum-border rounded-xl py-2.5 px-3 pl-10 text-xs text-white"
            />
            <Lock className="w-4 h-4 text-aurum-gray absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-gold"
        >
          {loading ? 'Autenticando...' : 'Acessar Painel de Gestão'}
        </button>

        <p className="text-[10px] text-aurum-gray text-center pt-2">
          Acesso monitorado por token JWT seguro e autorização RBAC.
        </p>
      </form>

    </div>
  );
};
