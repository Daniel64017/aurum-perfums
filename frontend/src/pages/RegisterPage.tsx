import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, Phone, Sparkles, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        name,
        email,
        phone,
        password
      });

      login(res.data.access_token, res.data.user);
      navigate('/minha-conta');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erro ao realizar cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8 animate-fade-in">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-aurum-gold-glow border border-aurum-gold flex items-center justify-center mx-auto shadow-gold">
          <Sparkles className="w-6 h-6 text-aurum-gold" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-white">Criar Conta Aurum VIP</h1>
        <p className="text-xs text-aurum-gray">Junte-se ao nosso clube exclusivo de alta perfumaria</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-4 shadow-glass">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-aurum-gray block">Nome Completo</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Gabriel Alencar"
              required
              className="w-full bg-aurum-surface border border-aurum-border rounded-xl py-2.5 px-3 pl-10 text-xs text-white placeholder-aurum-gray"
            />
            <UserIcon className="w-4 h-4 text-aurum-gray absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-aurum-gray block">E-mail</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-aurum-surface border border-aurum-border rounded-xl py-2.5 px-3 pl-10 text-xs text-white placeholder-aurum-gray"
            />
            <Mail className="w-4 h-4 text-aurum-gray absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-aurum-gray block">Telefone / WhatsApp</label>
          <div className="relative">
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full bg-aurum-surface border border-aurum-border rounded-xl py-2.5 px-3 pl-10 text-xs text-white placeholder-aurum-gray"
            />
            <Phone className="w-4 h-4 text-aurum-gray absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-aurum-gray block">Senha de Acesso</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-aurum-surface border border-aurum-border rounded-xl py-2.5 px-3 pl-10 text-xs text-white placeholder-aurum-gray"
            />
            <Lock className="w-4 h-4 text-aurum-gray absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-aurum-gray block">Confirmar Senha</label>
          <div className="relative">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-aurum-surface border border-aurum-border rounded-xl py-2.5 px-3 pl-10 text-xs text-white placeholder-aurum-gray"
            />
            <Lock className="w-4 h-4 text-aurum-gray absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-gold"
        >
          {loading ? 'Cadastrando...' : 'Criar Minha Conta VIP'}
        </button>

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-aurum-gray hover:text-aurum-gold transition-colors">
            Já tem uma conta? <strong className="text-white">Fazer login</strong>
          </Link>
        </div>
      </form>

    </div>
  );
};
