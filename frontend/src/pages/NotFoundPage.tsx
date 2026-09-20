import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-aurum-gold/10 border border-aurum-gold flex items-center justify-center mx-auto shadow-gold">
        <Sparkles className="w-8 h-8 text-aurum-gold" />
      </div>

      <h1 className="font-serif text-5xl font-bold text-white">404</h1>
      <h2 className="font-serif text-xl font-semibold text-aurum-gold">Página Não Encontrada</h2>

      <p className="text-xs text-aurum-gray max-w-md mx-auto leading-relaxed">
        A fragrância ou página que você procurava evaporou no ar ou não existe em nossa boutique.
      </p>

      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider shadow-gold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Página Inicial</span>
        </Link>
      </div>
    </div>
  );
};
