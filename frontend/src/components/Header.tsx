import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User as UserIcon, Search, Sparkles, Menu, X, ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const { favorites } = useWishlist();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#08080C]/95 backdrop-blur-md border-b border-aurum-gold/20 shadow-lg">
      {/* Top Banner Informativo */}
      <div className="bg-gradient-to-r from-[#12121A] via-aurum-dark to-[#12121A] border-b border-aurum-gold/10 py-1.5 px-4 text-xs font-medium text-center text-aurum-gray-light flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-aurum-gold animate-pulse" />
        <span>FRETE GRÁTIS VIP PARA TODO O BRASIL EM COMPRAS ACIMA DE R$ 900</span>
        <span className="hidden sm:inline text-aurum-gold">• PARCELAMENTO EM ATÉ 10X SEM JUROS</span>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-slate-300 hover:text-aurum-gold p-2"
            aria-label="Abrir Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-aurum-gold-glow border border-aurum-gold/40 flex items-center justify-center group-hover:border-aurum-gold transition-all duration-300 shadow-gold">
              <Sparkles className="w-5 h-5 text-aurum-gold group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-widest text-white group-hover:text-aurum-gold transition-colors">
                AURUM
              </span>
              <span className="text-[9px] font-sans tracking-[0.3em] text-aurum-gold uppercase -mt-1 font-semibold">
                PARFUMS
              </span>
            </div>
          </Link>

          {/* Busca Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <input
              type="text"
              placeholder="Pesquisar por perfume, marca ou nota olfativa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-aurum-surface/80 border border-aurum-border rounded-full py-2 px-4 pl-10 text-sm text-slate-100 placeholder-aurum-gray focus:outline-none focus:border-aurum-gold focus:ring-1 focus:ring-aurum-gold transition-all"
            />
            <Search className="w-4 h-4 text-aurum-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Ações / Ícones */}
          <div className="flex items-center gap-4">

            {/* Link Painel Admin (Se for Admin) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-aurum-gold/10 border border-aurum-gold/40 text-aurum-gold hover:bg-aurum-gold hover:text-aurum-dark transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Painel Admin</span>
              </Link>
            )}

            {/* Favoritos */}
            <Link
              to="/minha-conta?tab=favoritos"
              className="relative p-2 text-slate-300 hover:text-aurum-gold transition-colors"
              title="Meus Favoritos"
            >
              <Heart className="w-6 h-6" />
              {favorites.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-aurum-gold text-aurum-dark text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Carrinho */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-300 hover:text-aurum-gold transition-colors flex items-center gap-2"
              aria-label="Ver Carrinho"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-aurum-gold text-aurum-dark text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {totalItems}
                  </span>
                )}
              </div>
            </button>

            {/* Usuário / Conta */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full border border-aurum-border hover:border-aurum-gold/50 transition-all bg-aurum-surface/50"
                  >
                    <div className="w-7 h-7 rounded-full bg-aurum-gold text-aurum-dark font-bold text-xs flex items-center justify-center uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden sm:inline text-xs font-medium max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown User */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-aurum-card border border-aurum-gold/20 rounded-xl shadow-glass py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-aurum-border">
                        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-aurum-gray truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/minha-conta"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-aurum-surface hover:text-aurum-gold"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Minha Conta</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-aurum-gold hover:bg-aurum-surface"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>Painel Administrativo</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-aurum-surface"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sair</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-aurum-gold/30 hover:border-aurum-gold text-xs font-medium text-aurum-gold hover:bg-aurum-gold/10 transition-all"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Menu de Navegação Categorias Desktop */}
        <nav className="hidden lg:flex items-center justify-center gap-8 py-2.5 border-t border-aurum-border/40 text-xs font-semibold tracking-wider uppercase">
          <Link to="/" className="text-slate-300 hover:text-aurum-gold transition-colors">Início</Link>
          <Link to="/catalogo" className="text-slate-300 hover:text-aurum-gold transition-colors">Ver Catálogo Completo</Link>
          <Link to="/catalogo?release=true" className="text-aurum-gold hover:underline transition-colors flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Lançamentos Exclusivos
          </Link>
          <Link to="/catalogo?gender=feminino" className="text-slate-300 hover:text-aurum-gold transition-colors">Perfumes Femininos</Link>
          <Link to="/catalogo?gender=masculino" className="text-slate-300 hover:text-aurum-gold transition-colors">Perfumes Masculinos</Link>
          <Link to="/catalogo?gender=unissex" className="text-slate-300 hover:text-aurum-gold transition-colors">Unissex & Niche</Link>
          <Link to="/catalogo?sort_by=bestseller" className="text-slate-300 hover:text-aurum-gold transition-colors">Mais Vendidos</Link>
        </nav>
      </div>

      {/* Menu Mobile Retrátil */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-aurum-border bg-aurum-card px-4 py-4 space-y-3 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Pesquisar perfumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-aurum-surface border border-aurum-border rounded-lg py-2 px-4 pl-10 text-sm text-slate-100 placeholder-aurum-gray"
            />
            <Search className="w-4 h-4 text-aurum-gray absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 border-b border-aurum-border/40"
          >
            Início
          </Link>
          <Link
            to="/catalogo"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 border-b border-aurum-border/40"
          >
            Catálogo Completo
          </Link>
          <Link
            to="/catalogo?release=true"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-aurum-gold border-b border-aurum-border/40"
          >
            ✨ Lançamentos Exclusivos
          </Link>
          <Link
            to="/catalogo?gender=feminino"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 border-b border-aurum-border/40"
          >
            Perfumes Femininos
          </Link>
          <Link
            to="/catalogo?gender=masculino"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 border-b border-aurum-border/40"
          >
            Perfumes Masculinos
          </Link>
          <Link
            to="/catalogo?gender=unissex"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 border-b border-aurum-border/40"
          >
            Unissex & Niche
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-aurum-gold"
            >
              Painel Administrativo
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
