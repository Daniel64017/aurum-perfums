import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Star, ShieldCheck, Award, Flame, Heart, Crown } from 'lucide-react';
import api from '../services/api';
import { Product, Category, Brand } from '../types';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newReleases, setNewReleases] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featRes, relRes, bestRes, catRes, brandRes] = await Promise.all([
          api.get('/products?featured=true&limit=4'),
          api.get('/products?release=true&limit=4'),
          api.get('/products?bestseller=true&limit=4'),
          api.get('/categories'),
          api.get('/brands')
        ]);

        setFeaturedProducts(featRes.data.items);
        setNewReleases(relRes.data.items);
        setBestsellers(bestRes.data.items);
        setCategories(catRes.data);
        setBrands(brandRes.data);
      } catch (err) {
        console.error("Erro ao carregar dados da Home:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Banner Sofisticado */}
      <section className="relative min-h-[580px] flex items-center justify-center overflow-hidden border-b border-aurum-gold/20 bg-[#06060A]">
        {/* Fundo com Imagem de Luxo Overlay */}
        <div className="absolute inset-0 z-0 opacity-25 bg-[url('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center filter contrast-125" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#08080C] via-transparent to-[#08080C]/80" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-aurum-gold/10 border border-aurum-gold/40 text-aurum-gold text-xs font-semibold uppercase tracking-widest animate-fade-in shadow-gold">
            <Crown className="w-3.5 h-3.5" />
            <span>Alta Perfumaria de Nicho & Frascos Exclusivos</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            A Quintessência do Luxo e da <span className="gold-text">Perfumaria Autoral</span>
          </h1>

          <p className="text-sm sm:text-base text-aurum-gray-light max-w-2xl mx-auto font-light leading-relaxed">
            Fragrâncias criadas com os ingredientes mais raros e nobres do mundo. Permita que sua presença seja gravada no tempo através de essências inesquecíveis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/catalogo"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-gold flex items-center justify-center gap-2"
            >
              <span>Explorar Catálogo VIP</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/catalogo?release=true"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-aurum-surface border border-aurum-gold/40 text-aurum-gold font-bold text-xs uppercase tracking-widest hover:bg-aurum-gold/10 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ver Lançamentos</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Seção Categorias */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Famílias e Universos Olfativos</h2>
          <p className="text-xs text-aurum-gray">Navegue pelas categorias selecionadas por nossos mestres perfumistas</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalogo?category_slug=${cat.slug}`}
              className="group relative h-48 rounded-2xl overflow-hidden border border-aurum-border/60 hover:border-aurum-gold/50 transition-all shadow-glass"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-aurum-dark via-aurum-dark/40 to-transparent p-4 flex flex-col justify-end">
                <h3 className="font-serif text-sm font-bold text-white group-hover:text-aurum-gold transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-aurum-gray-light line-clamp-1 mt-0.5">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Perfumes em Destaque */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-aurum-border/60 pb-4">
          <div>
            <span className="text-xs font-bold text-aurum-gold uppercase tracking-widest">Seleção do Sommelier</span>
            <h2 className="font-serif text-2xl font-bold text-white">Perfumes em Destaque Absoluto</h2>
          </div>
          <Link to="/catalogo" className="text-xs font-bold text-aurum-gold hover:underline flex items-center gap-1">
            <span>Ver Todos os Perfumes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-aurum-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Banner Promocional de Marca de Luxo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-aurum-gold/30 bg-aurum-card p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-glass">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <span className="inline-block text-xs font-extrabold text-aurum-gold uppercase tracking-widest px-3 py-1 bg-aurum-gold/10 rounded-full border border-aurum-gold/30">
              Coleção Aurum Privé
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
              Aurum Imperial Oud <span className="gold-text">Extrait de Parfum</span>
            </h2>
            <p className="text-xs sm:text-sm text-aurum-gray-light leading-relaxed">
              Desenvolvido com Oud Cambojano maturado por duas décadas e notas de açafrão do Irã. Apenas 100 frascos numerados produzidos por lote.
            </p>
            <div className="pt-2">
              <Link
                to="/produto/aurum-imperial-oud-extrait"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider hover:opacity-90 shadow-gold transition-all"
              >
                <span>Conhecer o Elixir</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-96 aspect-square rounded-2xl overflow-hidden border border-aurum-gold/40 shadow-2xl relative">
            <img
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80"
              alt="Aurum Imperial Oud"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Lançamentos Exclusivos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between border-b border-aurum-border/60 pb-4">
          <div>
            <span className="text-xs font-bold text-aurum-gold uppercase tracking-widest">Recém Chegados</span>
            <h2 className="font-serif text-2xl font-bold text-white">Últimos Lançamentos</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newReleases.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Marcas Parceiras de Nicho */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
        <h3 className="font-serif text-lg font-semibold text-aurum-gold uppercase tracking-widest">Maisons & Casas de Perfumaria</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/catalogo?brand_slug=${brand.slug}`}
              className="p-4 rounded-xl bg-aurum-card border border-aurum-border/40 hover:border-aurum-gold/40 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <span className="font-serif text-sm font-bold text-slate-300 group-hover:text-aurum-gold transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};
