import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User as UserIcon, Package, MapPin, Heart, Shield, LogOut, CheckCircle, Clock, Truck, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Order, Address } from '../types';
import { ProductCard } from '../components/ProductCard';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout, refreshUser } = useAuth();
  const { favorites } = useWishlist();

  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'pedidos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

  // Form Perfil
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoadingOrders(true);
        const [ordRes, addrRes] = await Promise.all([
          api.get('/orders'),
          api.get('/auth/addresses')
        ]);
        setOrders(ordRes.data);
        setAddresses(addrRes.data);
      } catch (err) {
        console.error("Erro ao carregar dados da conta:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      await api.put('/auth/me', { name, phone });
      await refreshUser();
      alert("Dados atualizados com sucesso!");
    } catch (err: any) {
      alert("Erro ao atualizar dados.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/auth/me/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      alert("Senha alterada com sucesso!");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao alterar senha.");
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      received: { label: 'Pedido Recebido', class: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
      paid: { label: 'Pagamento Aprovado', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
      preparing: { label: 'Em Preparação', class: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
      shipped: { label: 'Enviado / Em Trânsito', class: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
      delivered: { label: 'Entregue', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
      cancelled: { label: 'Cancelado', class: 'bg-rose-500/20 text-rose-300 border-rose-500/40' }
    };
    const s = map[status] || { label: status, class: 'bg-aurum-surface text-white border-aurum-border' };
    return (
      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${s.class}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header do Usuário */}
      <div className="p-6 rounded-3xl bg-aurum-card border border-aurum-gold/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-glass">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold-gradient text-aurum-dark text-xl font-bold flex items-center justify-center uppercase shadow-gold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-xs text-aurum-gray">{user.email} • Cliente VIP</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="px-4 py-2 rounded-xl bg-aurum-surface border border-aurum-border text-rose-400 text-xs font-semibold hover:border-rose-400 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta</span>
        </button>
      </div>

      {/* Grid Principal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Abas */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
              activeTab === 'pedidos' ? 'bg-aurum-gold text-aurum-dark shadow-gold' : 'bg-aurum-card text-slate-300 border border-aurum-border'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Meus Pedidos ({orders.length})</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('favoritos')}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
              activeTab === 'favoritos' ? 'bg-aurum-gold text-aurum-dark shadow-gold' : 'bg-aurum-card text-slate-300 border border-aurum-border'
            }`}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Meus Favoritos ({favorites.length})</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
              activeTab === 'perfil' ? 'bg-aurum-gold text-aurum-dark shadow-gold' : 'bg-aurum-card text-slate-300 border border-aurum-border'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>Meus Dados & Segurança</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div className="lg:col-span-3">
          
          {/* ABA PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-white">Histórico de Pedidos</h2>

              {loadingOrders ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-40 bg-aurum-card rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 rounded-2xl bg-aurum-card border border-aurum-border text-center space-y-3">
                  <Package className="w-8 h-8 text-aurum-gold mx-auto" />
                  <p className="text-xs text-aurum-gray">Você ainda não realizou nenhum pedido em nossa boutique.</p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-aurum-border/40">
                      <div>
                        <span className="font-serif text-sm font-bold text-white">
                          Pedido #{ord.order_number}
                        </span>
                        <span className="text-[11px] text-aurum-gray block">
                          Realizado em {new Date(ord.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {getStatusBadge(ord.status)}
                    </div>

                    {/* Itens */}
                    <div className="space-y-2">
                      {ord.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs text-slate-300">
                          <span>{item.quantity}x {item.product_name}</span>
                          <span className="font-bold text-white">
                            R$ {item.item_subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-aurum-border/40 text-xs">
                      <span className="text-aurum-gray">
                        Rastreio: <strong className="text-aurum-gold">{ord.tracking_code || 'Aguardando'}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-aurum-gray">Total do Pedido:</span>
                        <span className="font-serif text-base font-bold text-aurum-gold">
                          R$ {ord.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ABA FAVORITOS */}
          {activeTab === 'favoritos' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-white">Seus Perfumes Salvos</h2>
              {favorites.length === 0 ? (
                <div className="p-8 rounded-2xl bg-aurum-card border border-aurum-border text-center space-y-3">
                  <Heart className="w-8 h-8 text-rose-500 mx-auto" />
                  <p className="text-xs text-aurum-gray">Nenhum perfume favorito salvo ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA PERFIL */}
          {activeTab === 'perfil' && (
            <div className="space-y-8">
              {/* Form Dados Pessoais */}
              <form onSubmit={handleUpdateProfile} className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-4">
                <h3 className="font-serif text-base font-bold text-white">Dados Pessoais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-aurum-gray font-semibold mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-aurum-gray font-semibold mb-1">Telefone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-6 py-2.5 rounded-xl bg-aurum-gold text-aurum-dark font-bold text-xs"
                >
                  Salvar Dados
                </button>
              </form>

              {/* Alterar Senha */}
              <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-4">
                <h3 className="font-serif text-base font-bold text-white">Segurança & Alteração de Senha</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-aurum-gray font-semibold mb-1">Senha Atual</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-aurum-gray font-semibold mb-1">Nova Senha</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-aurum-surface border border-aurum-gold/40 text-aurum-gold font-bold text-xs"
                >
                  Alterar Senha
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
