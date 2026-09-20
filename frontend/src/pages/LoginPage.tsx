import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, Sparkles, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirect = searchParams.get('redirect') || '/minha-conta';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      login(res.data.access_token, res.data.user);

      if (res.data.user.role === 'ADMIN' && redirect === '/minha-conta') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erro ao realizar login. Verifique e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  const fillCustomer = () => {
    setEmail('cliente@aurumparfums.com');
    setPassword('cliente123');
  };

  const fillAdmin = () => {
    setEmail('admin@aurumparfums.com');
    setPassword('admin123');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8 animate-fade-in">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-aurum-gold-glow border border-aurum-gold flex items-center justify-center mx-auto shadow-gold">
          <Sparkles className="w-6 h-6 text-aurum-gold" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-white">Acesse sua Conta VIP</h1>
        <p className="text-xs text-aurum-gray">Entre para gerenciar seus pedidos e favoritos</p>
      </div>

      {/* Botões de Preenchimento Rápido para Demonstração */}
      <div className="p-4 rounded-2xl bg-aurum-card border border-aurum-gold/30 space-y-2">
        <span className="text-[10px] font-extrabold text-aurum-gold uppercase tracking-wider block text-center">
          Credenciais de Teste / Demonstração
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={fillCustomer}
            className="py-2 px-3 rounded-xl bg-aurum-surface border border-aurum-border hover:border-aurum-gold text-[11px] font-semibold text-slate-300 text-center"
          >
            Cliente de Teste
          </button>
          <button
            type="button"
            onClick={fillAdmin}
            className="py-2 px-3 rounded-xl bg-aurum-surface border border-aurum-border hover:border-aurum-gold text-[11px] font-semibold text-aurum-gold text-center"
          >
            Admin de Teste
          </button>
        </div>
      </div>

      {/* Form Principal */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-4 shadow-glass">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-aurum-gray block">E-mail Cadastrado</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-aurum-surface border border-aurum-border rounded-xl py-2.5 px-3 pl-10 text-xs text-white placeholder-aurum-gray focus:outline-none focus:border-aurum-gold"
            />
            <Mail className="w-4 h-4 text-aurum-gray absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-aurum-gray block">Senha</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-aurum-surface border border-aurum-border rounded-xl py-2.5 px-3 pl-10 text-xs text-white placeholder-aurum-gray focus:outline-none focus:border-aurum-gold"
            />
            <Lock className="w-4 h-4 text-aurum-gray absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-gold"
        >
          {loading ? 'Entrando...' : 'Entrar na Conta'}
        </button>

        <div className="text-center pt-2">
          <Link to="/cadastro" className="text-xs text-aurum-gray hover:text-aurum-gold transition-colors">
            Ainda não possui conta? <strong className="text-white">Cadastre-se aqui</strong>
          </Link>
        </div>
      </form>

    </div>
  );
};
