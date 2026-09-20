import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Product, Category, Brand } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [olfactoryFamilies, setOlfactoryFamilies] = useState<string[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Estados dos Filtros extraídos da URL
  const search = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category_slug') || '';
  const brandSlug = searchParams.get('brand_slug') || '';
  const gender = searchParams.get('gender') || 'todos';
  const olfactoryFamily = searchParams.get('olfactory_family') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const inStockOnly = searchParams.get('in_stock_only') === 'true';
  const release = searchParams.get('release') === 'true';
  const bestseller = searchParams.get('bestseller') === 'true';
  const sortBy = searchParams.get('sort_by') || 'created_desc';

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  // Carregar metadados (Categorias, Marcas, Famílias Olfativas)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes, famRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
          api.get('/products/olfactory-families')
        ]);
        setCategories(catRes.data);
        setBrands(brandRes.data);
        setOlfactoryFamilies(famRes.data);
      } catch (err) {
        console.error("Erro ao carregar metadados do catálogo:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Buscar Produtos quando filtros ou página mudarem
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = {
          page,
          limit: 12,
          sort_by: sortBy
        };

        if (search) params.search = search;
        if (categorySlug) params.category_slug = categorySlug;
        if (brandSlug) params.brand_slug = brandSlug;
        if (gender && gender !== 'todos') params.gender = gender;
        if (olfactoryFamily) params.olfactory_family = olfactoryFamily;
        if (minPrice) params.min_price = parseFloat(minPrice);
        if (maxPrice) params.max_price = parseFloat(maxPrice);
        if (inStockOnly) params.in_stock_only = true;
        if (release) params.release = true;
        if (bestseller) params.bestseller = true;

        const res = await api.get('/products', { params });
        setProducts(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.pages);
      } catch (err) {
        console.error("Erro ao buscar catálogo:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, page]);

  const updateFilter = (key: string, value: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === null || value === false || value === 'todos') {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    setPage(1);
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header do Catálogo */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-aurum-border pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Catálogo de <span className="gold-text">Alta Perfumaria</span>
          </h1>
          <p className="text-xs text-aurum-gray mt-1">
            Exibindo {total} fragrância(s) exclusiva(s) encontrada(s)
          </p>
        </div>

        {/* Ordenação e Filtros Mobile */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-aurum-surface border border-aurum-border text-xs font-semibold text-aurum-gold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros</span>
          </button>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-aurum-gold hidden sm:inline" />
            <select
              value={sortBy}
              onChange={(e) => updateFilter('sort_by', e.target.value)}
              className="bg-aurum-surface border border-aurum-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-aurum-gold font-medium"
            >
              <option value="created_desc">Mais Recentes</option>
              <option value="bestseller">Mais Vendidos</option>
              <option value="release">Lançamentos</option>
              <option value="price_asc">Preço: Menor ao Maior</option>
              <option value="price_desc">Preço: Maior ao Menor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Principal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filtros Desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <ProductFilters
            categories={categories}
            brands={brands}
            olfactoryFamilies={olfactoryFamilies}
            selectedCategory={categorySlug}
            selectedBrand={brandSlug}
            selectedGender={gender}
            selectedFamily={olfactoryFamily}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStockOnly={inStockOnly}
            onFilterChange={updateFilter}
            onResetFilters={resetFilters}
          />
        </div>

        {/* Modal Filtros Mobile */}
        {isMobileFiltersOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-aurum-card rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-aurum-border">
                <span className="font-serif font-bold text-white">Filtros do Catálogo</span>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="text-aurum-gold font-bold text-xs">
                  Fechar
                </button>
              </div>
              <ProductFilters
                categories={categories}
                brands={brands}
                olfactoryFamilies={olfactoryFamilies}
                selectedCategory={categorySlug}
                selectedBrand={brandSlug}
                selectedGender={gender}
                selectedFamily={olfactoryFamily}
                minPrice={minPrice}
                maxPrice={maxPrice}
                inStockOnly={inStockOnly}
                onFilterChange={(k, v) => {
                  updateFilter(k, v);
                  setIsMobileFiltersOpen(false);
                }}
                onResetFilters={() => {
                  resetFilters();
                  setIsMobileFiltersOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Lista de Produtos */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-aurum-card rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center bg-aurum-card border border-aurum-border rounded-2xl p-8 space-y-4">
              <Sparkles className="w-10 h-10 text-aurum-gold mx-auto" />
              <h3 className="font-serif text-lg font-bold text-white">Nenhum perfume encontrado</h3>
              <p className="text-xs text-aurum-gray max-w-md mx-auto">
                Tente ajustar os filtros de busca ou remover alguns critérios para visualizar outros perfumes da coleção.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-aurum-gold text-aurum-dark font-bold text-xs"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-aurum-surface border border-aurum-border text-aurum-gold disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-xs font-bold text-slate-300 px-4">
                Página {page} de {totalPages}
              </span>

              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-aurum-surface border border-aurum-border text-aurum-gold disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
