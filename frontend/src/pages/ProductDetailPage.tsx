import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, Sparkles, Check, Plus, Minus, Send } from 'lucide-react';
import api from '../services/api';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, setIsCartOpen } = useCart();
  const { toggleFavorite, isFavorite } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [adding, setAdding] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        const prodData: Product = res.data;
        setProduct(prodData);
        setSelectedImage(prodData.images[0]?.image_url || '');

        // Buscar relacionados e avaliações
        const [relRes, revRes] = await Promise.all([
          api.get(`/products/${prodData.id}/related`),
          api.get(`/reviews/product/${prodData.id}`)
        ]);

        setRelatedProducts(relRes.data);
        setReviews(revRes.data);
      } catch (err) {
        console.error("Erro ao carregar detalhes do produto:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchDetail();
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-aurum-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-aurum-gray">Carregando essência...</p>
      </div>
    );
  }

  const favorited = isFavorite(product.id);
  const currentPrice = product.promotional_price || product.price;

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;
    try {
      setAdding(true);
      await addItem(product.id, quantity);
      setIsCartOpen(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Faça login para enviar uma avaliação.");
      return;
    }
    try {
      setReviewSubmitting(true);
      await api.post('/reviews', {
        product_id: product.id,
        rating: reviewRating,
        comment: reviewComment
      });

      const updatedRevs = await api.get(`/reviews/product/${product.id}`);
      setReviews(updatedRevs.data);
      setReviewComment('');
      alert("Sua avaliação foi publicada com sucesso!");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao publicar avaliação.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Breadcrumb */}
      <div className="text-xs text-aurum-gray flex items-center gap-2">
        <Link to="/" className="hover:text-aurum-gold">Início</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-aurum-gold">Catálogo</Link>
        <span>/</span>
        <span className="text-white font-medium">{product.name}</span>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Galeria de Imagens */}
        <div className="space-y-4">
          <div className="aspect-square bg-[#050508] border border-aurum-gold/20 rounded-3xl overflow-hidden relative shadow-2xl">
            <img
              src={selectedImage || product.images[0]?.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount_percent > 0 && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                -{product.discount_percent}% OFF
              </span>
            )}
          </div>

          {/* Miniaturas */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-[#050508] ${
                    selectedImage === img.image_url ? 'border-aurum-gold shadow-gold' : 'border-aurum-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="Miniatura" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações e Compra */}
        <div className="space-y-6">
          
          <div>
            <div className="flex items-center justify-between text-xs text-aurum-gold uppercase font-bold tracking-widest mb-1">
              <span>{product.brand.name}</span>
              <span>SKU: {product.sku}</span>
            </div>

            <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
              {product.name}
            </h1>

            <p className="text-xs text-aurum-gray-light mt-1 font-medium">
              {product.volume_ml}ml • {product.concentration} • Linha {product.gender.toUpperCase()}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center text-aurum-gold">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.average_rating) ? 'fill-aurum-gold' : 'text-aurum-gray-dark'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-white">{product.average_rating.toFixed(1)}</span>
              <span className="text-xs text-aurum-gray">({product.review_count} avaliações)</span>
            </div>
          </div>

          {/* Preço e Parcelamento */}
          <div className="p-4 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-2">
            <div className="flex items-baseline gap-3">
              {product.promotional_price ? (
                <>
                  <span className="font-serif text-3xl font-bold text-aurum-gold">
                    R$ {product.promotional_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm text-aurum-gray line-through">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </>
              ) : (
                <span className="font-serif text-3xl font-bold text-aurum-gold">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            <p className="text-xs text-emerald-400 font-medium">
              Ou até 10x de R$ {(currentPrice / 10).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros no cartão
            </p>

            <div className="pt-2 text-xs">
              {product.stock <= 0 ? (
                <span className="text-rose-400 font-bold uppercase">Produto Esgotado no Momento</span>
              ) : product.stock <= 3 ? (
                <span className="text-amber-400 font-bold uppercase">Estoque Crítico: Apenas {product.stock} un. restantes!</span>
              ) : (
                <span className="text-emerald-400 font-bold uppercase">Disponível para Envio Imediato ({product.stock} un.)</span>
              )}
            </div>
          </div>

          {/* Seletor de Quantidade e Botões de Ação */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Quantidade:</span>
                <div className="flex items-center border border-aurum-border rounded-xl bg-aurum-surface">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2 text-aurum-gray hover:text-aurum-gold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="p-2 text-aurum-gray hover:text-aurum-gold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="py-3.5 rounded-xl bg-aurum-surface border border-aurum-gold/40 text-aurum-gold font-bold text-xs uppercase tracking-wider hover:bg-aurum-gold/10 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Adicionar ao Carrinho</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3.5 rounded-xl bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-gold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Comprar Agora</span>
                </button>
              </div>
            </div>
          )}

          {/* Garantias */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-aurum-border/40 text-[11px] text-aurum-gray">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-aurum-gold shrink-0" />
              <span>100% Original</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-aurum-gold shrink-0" />
              <span>Entrega VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-aurum-gold shrink-0" />
              <span>Troca Garantida</span>
            </div>
          </div>

        </div>

      </div>

      {/* Pirâmide Olfativa e Descrição */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pirâmide Olfativa */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-aurum-card border border-aurum-gold/20 space-y-4">
          <h3 className="font-serif text-lg font-bold text-aurum-gold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Pirâmide Olfativa</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-aurum-surface border border-aurum-border">
              <span className="font-bold text-white uppercase text-[10px] text-aurum-gold block mb-1">Notas de Saída (Topo)</span>
              <p className="text-slate-300">{product.top_notes || 'Ingredientes secretos selecionados'}</p>
            </div>

            <div className="p-3 rounded-xl bg-aurum-surface border border-aurum-border">
              <span className="font-bold text-white uppercase text-[10px] text-aurum-gold block mb-1">Notas de Coração (Corpo)</span>
              <p className="text-slate-300">{product.heart_notes || 'Extratos botânicos raros'}</p>
            </div>

            <div className="p-3 rounded-xl bg-aurum-surface border border-aurum-border">
              <span className="font-bold text-white uppercase text-[10px] text-aurum-gold block mb-1">Notas de Fundo (Base)</span>
              <p className="text-slate-300">{product.base_notes || 'Acordes resinosos e madeiras nobres'}</p>
            </div>
          </div>
        </div>

        {/* Descrição Detalhada */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-4">
          <h3 className="font-serif text-lg font-bold text-white">Sobre a Fragrância</h3>
          <p className="text-xs text-aurum-gray-light leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

      </div>

      {/* Seção de Avaliações */}
      <section className="space-y-8 pt-6 border-t border-aurum-border">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-bold text-white">
            Avaliações dos Clientes ({reviews.length})
          </h3>
        </div>

        {/* Form de Nova Avaliação */}
        {user && (
          <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-aurum-card border border-aurum-gold/20 space-y-3">
            <h4 className="text-xs font-bold text-aurum-gold uppercase tracking-wider">Escrever uma Avaliação</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-aurum-gray">Sua Nota:</span>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(parseInt(e.target.value))}
                className="bg-aurum-surface border border-aurum-border rounded-lg text-xs py-1 px-2 text-white"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Estrelas)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Estrelas)</option>
                <option value={3}>⭐⭐⭐ (3 Estrelas)</option>
                <option value={2}>⭐⭐ (2 Estrelas)</option>
                <option value={1}>⭐ (1 Estrela)</option>
              </select>
            </div>
            <textarea
              placeholder="Compartilhe sua experiência com o perfume (fixação, projeção, elegância)..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              required
              className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-3 text-xs text-white placeholder-aurum-gray"
            />
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="px-6 py-2 rounded-xl bg-aurum-gold text-aurum-dark font-bold text-xs"
            >
              {reviewSubmitting ? 'Enviando...' : 'Publicar Avaliação'}
            </button>
          </form>
        )}

        {/* Lista de Avaliações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-aurum-gray">Seja o primeiro a avaliar este perfume magnífico.</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl bg-aurum-card border border-aurum-border/40 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{rev.user_name}</span>
                  <div className="flex text-aurum-gold">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-aurum-gold" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-aurum-gray-light leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-aurum-gray block">
                  {new Date(rev.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Relacionados */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-aurum-border">
          <h3 className="font-serif text-2xl font-bold text-white">Fragrâncias Recomendadas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
