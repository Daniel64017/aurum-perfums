import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, Award, Mail, Phone, MapPin, Instagram, Facebook, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#050508] border-t border-aurum-gold/20 text-slate-300 pt-16 pb-8">
      {/* Benefícios Institucionais */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 px-6 rounded-2xl bg-aurum-card/60 border border-aurum-gold/20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-aurum-gold/10 border border-aurum-gold/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-aurum-gold" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider">Compra 100% Segura</h4>
              <p className="text-xs text-aurum-gray-light mt-1">Criptografia SSL de ponta a ponta em todos os pagamentos.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-aurum-gold/10 border border-aurum-gold/40 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-aurum-gold" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider">Entrega Expressa VIP</h4>
              <p className="text-xs text-aurum-gray-light mt-1">Envio seguro com rastreamento detalhado em tempo real.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-aurum-gold/10 border border-aurum-gold/40 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-aurum-gold" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider">Produtos 100% Originais</h4>
              <p className="text-xs text-aurum-gray-light mt-1">Importação oficial com selo de autenticidade garantido.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal do Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
        
        {/* Coluna 1: Sobre */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-aurum-gold-glow border border-aurum-gold flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-aurum-gold" />
            </div>
            <span className="font-serif text-xl font-bold tracking-widest text-white">AURUM PARFUMS</span>
          </Link>
          <p className="text-xs text-aurum-gray-light leading-relaxed pr-4">
            Sua destino definitivo para a alta perfumaria de nicho e frascos raros. Selecionamos rigorosamente as essências mais suntuosas do mundo para transmitir sofisticação, poder e elegância atemporal.
          </p>

          {/* Redes Sociais */}
          <div className="flex items-center gap-3 pt-2">
            <a href="#instagram" className="w-8 h-8 rounded-full bg-aurum-surface border border-aurum-border hover:border-aurum-gold text-slate-300 hover:text-aurum-gold flex items-center justify-center transition-all">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#facebook" className="w-8 h-8 rounded-full bg-aurum-surface border border-aurum-border hover:border-aurum-gold text-slate-300 hover:text-aurum-gold flex items-center justify-center transition-all">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Coluna 2: Navegação rápida */}
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-semibold text-aurum-gold uppercase tracking-wider">Coleções</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/catalogo?release=true" className="hover:text-aurum-gold transition-colors">Lançamentos Exclusivos</Link></li>
            <li><Link to="/catalogo?gender=feminino" className="hover:text-aurum-gold transition-colors">Perfumes Femininos</Link></li>
            <li><Link to="/catalogo?gender=masculino" className="hover:text-aurum-gold transition-colors">Perfumes Masculinos</Link></li>
            <li><Link to="/catalogo?gender=unissex" className="hover:text-aurum-gold transition-colors">Linha Unissex & Niche</Link></li>
            <li><Link to="/catalogo?sort_by=bestseller" className="hover:text-aurum-gold transition-colors">Os Mais Vendidos</Link></li>
          </ul>
        </div>

        {/* Coluna 3: Institucional */}
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-semibold text-aurum-gold uppercase tracking-wider">Atendimento</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/minha-conta" className="hover:text-aurum-gold transition-colors">Meus Pedidos</Link></li>
            <li><a href="#trocas" className="hover:text-aurum-gold transition-colors">Trocas e Devoluções</a></li>
            <li><a href="#privacidade" className="hover:text-aurum-gold transition-colors">Política de Privacidade</a></li>
            <li><a href="#termos" className="hover:text-aurum-gold transition-colors">Termos de Uso</a></li>
            <li><a href="#contato" className="hover:text-aurum-gold transition-colors">Fale Conosco</a></li>
          </ul>
        </div>

        {/* Coluna 4: Newsletter */}
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-semibold text-aurum-gold uppercase tracking-wider">Clube VIP Aurum</h4>
          <p className="text-xs text-aurum-gray-light">Receba convites para lançamentos privados e ofertas exclusivas antes de todos.</p>
          
          <form onSubmit={handleNewsletter} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-aurum-surface border border-aurum-border rounded-lg py-2 px-3 pr-10 text-xs text-white placeholder-aurum-gray focus:outline-none focus:border-aurum-gold"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-aurum-gold hover:text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            {subscribed && (
              <p className="text-[10px] text-emerald-400 font-medium">✨ Inscrição realizada no Clube VIP Aurum!</p>
            )}
          </form>
        </div>

      </div>

      {/* Bar de Direitos Reservados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-aurum-border/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-aurum-gray">
        <p>© 2026 Aurum Parfums Ltda. Todos os direitos reservados. CNPJ: 00.000.000/0001-00.</p>
        <div className="flex items-center gap-3">
          <span className="bg-aurum-surface border border-aurum-border px-2 py-1 rounded text-[10px] text-slate-300 font-semibold">PIX</span>
          <span className="bg-aurum-surface border border-aurum-border px-2 py-1 rounded text-[10px] text-slate-300 font-semibold">CARTÃO CRÉDITO</span>
          <span className="bg-aurum-surface border border-aurum-border px-2 py-1 rounded text-[10px] text-slate-300 font-semibold">BOLETO</span>
        </div>
      </div>
    </footer>
  );
};
