import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Sparkles, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const primaryImg = product.images.find(i => i.is_primary)?.image_url || product.images[0]?.image_url || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80';
  const secondaryImg = product.images[1]?.image_url || primaryImg;

  const favorited = isFavorite(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    try {
      setAdding(true);
      await addItem(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleFavToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setFavLoading(true);
      await toggleFavorite(product.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="group relative bg-aurum-card border border-aurum-border/60 hover:border-aurum-gold/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-gold flex flex-col justify-between">
      
      {/* Badges de Destaque / Desconto */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.discount_percent > 0 && (
          <span className="bg-gradient-to-r from-rose-600 to-rose-700 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">
            -{product.discount_percent}% OFF
          </span>
        )}
        {product.release && (
          <span className="bg-aurum-gold text-aurum-dark text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> NOVO
          </span>
        )}
        {product.bestseller && (
          <span className="bg-aurum-surface border border-aurum-gold/40 text-aurum-gold text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
            BEST-SELLER
          </span>
        )}
      </div>

      {/* Botão de Favorito */}
      <button
        onClick={handleFavToggle}
        disabled={favLoading}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full border flex items-center justify-center transition-all shadow-md ${
          favorited
            ? 'bg-rose-500/20 border-rose-500 text-rose-400'
            : 'bg-aurum-surface/80 border-aurum-border text-slate-400 hover:text-rose-400 hover:border-rose-400'
        }`}
        aria-label="Adicionar aos Favoritos"
      >
        <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Imagem do Perfume com zoom hover */}
      <Link to={`/produto/${product.slug}`} className="block relative aspect-square overflow-hidden bg-[#0A0A10]">
        <img
          src={primaryImg}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </Link>

      {/* Informações do Produto */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-aurum-gray font-medium">
            <span className="text-aurum-gold font-semibold uppercase tracking-wider">{product.brand.name}</span>
            <span>{product.volume_ml}ml • {product.concentration}</span>
          </div>

          <Link to={`/produto/${product.slug}`} className="block">
            <h3 className="font-serif text-sm font-semibold text-white group-hover:text-aurum-gold transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-[11px] text-aurum-gray-light line-clamp-1">
            {product.olfactory_family}
          </p>

          {/* Avaliações */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="flex items-center text-aurum-gold">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(product.average_rating) ? 'fill-aurum-gold' : 'text-aurum-gray-dark'}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-aurum-gray font-medium">
              {product.average_rating.toFixed(1)} ({product.review_count})
            </span>
          </div>
        </div>

        {/* Preço e Ação */}
        <div className="pt-2 border-t border-aurum-border/40 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              {product.promotional_price ? (
                <div className="flex items-baseline gap-2">
                  <span className="font-sans text-base font-bold text-white">
                    R$ {product.promotional_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-aurum-gray line-through">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ) : (
                <span className="font-sans text-base font-bold text-white">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {/* Status do Estoque */}
            {product.stock <= 0 ? (
              <span className="text-[10px] font-bold text-rose-400 uppercase">Esgotado</span>
            ) : product.stock <= 3 ? (
              <span className="text-[10px] font-bold text-amber-400 uppercase">Últimas {product.stock} un.</span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Em Estoque</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || adding}
            className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
              product.stock <= 0
                ? 'bg-aurum-surface text-aurum-gray cursor-not-allowed border border-aurum-border'
                : added
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-aurum-gold/10 hover:bg-aurum-gold text-aurum-gold hover:text-aurum-dark border border-aurum-gold/40 shadow-sm'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Adicionado!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{product.stock <= 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
