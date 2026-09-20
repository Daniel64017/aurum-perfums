import React from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';
import { Category, Brand } from '../types';

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  olfactoryFamilies: string[];
  selectedCategory: string;
  selectedBrand: string;
  selectedGender: string;
  selectedFamily: string;
  minPrice: string;
  maxPrice: string;
  inStockOnly: boolean;
  onFilterChange: (key: string, value: any) => void;
  onResetFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  brands,
  olfactoryFamilies,
  selectedCategory,
  selectedBrand,
  selectedGender,
  selectedFamily,
  minPrice,
  maxPrice,
  inStockOnly,
  onFilterChange,
  onResetFilters
}) => {
  return (
    <aside className="bg-aurum-card border border-aurum-border/60 rounded-2xl p-5 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-aurum-border">
        <div className="flex items-center gap-2 text-white font-serif font-semibold">
          <Filter className="w-4 h-4 text-aurum-gold" />
          <span>Filtrar Catálogo</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-aurum-gray hover:text-aurum-gold flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Limpar</span>
        </button>
      </div>

      {/* Gênero */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-aurum-gold uppercase tracking-wider">Gênero</h4>
        <div className="grid grid-cols-2 gap-2">
          {['todos', 'feminino', 'masculino', 'unissex'].map((g) => (
            <button
              key={g}
              onClick={() => onFilterChange('gender', g)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold capitalize border transition-all text-center ${
                selectedGender === g
                  ? 'bg-aurum-gold text-aurum-dark border-aurum-gold'
                  : 'bg-aurum-surface text-slate-300 border-aurum-border hover:border-aurum-gold/40'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Categorias */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-aurum-gold uppercase tracking-wider">Categoria</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onFilterChange('category_slug', '')}
            className={`w-full text-left py-1.5 px-2 rounded text-xs transition-colors flex items-center justify-between ${
              !selectedCategory ? 'text-aurum-gold font-bold bg-aurum-surface' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Todas as Categorias</span>
            {!selectedCategory && <Check className="w-3 h-3" />}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onFilterChange('category_slug', c.slug)}
              className={`w-full text-left py-1.5 px-2 rounded text-xs transition-colors flex items-center justify-between ${
                selectedCategory === c.slug ? 'text-aurum-gold font-bold bg-aurum-surface' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>{c.name}</span>
              {selectedCategory === c.slug && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      {/* Marcas */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-aurum-gold uppercase tracking-wider">Marca / Maison</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onFilterChange('brand_slug', '')}
            className={`w-full text-left py-1.5 px-2 rounded text-xs transition-colors flex items-center justify-between ${
              !selectedBrand ? 'text-aurum-gold font-bold bg-aurum-surface' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Todas as Marcas</span>
            {!selectedBrand && <Check className="w-3 h-3" />}
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => onFilterChange('brand_slug', b.slug)}
              className={`w-full text-left py-1.5 px-2 rounded text-xs transition-colors flex items-center justify-between ${
                selectedBrand === b.slug ? 'text-aurum-gold font-bold bg-aurum-surface' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>{b.name}</span>
              {selectedBrand === b.slug && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      {/* Família Olfativa */}
      {olfactoryFamilies.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-aurum-gold uppercase tracking-wider">Família Olfativa</h4>
          <select
            value={selectedFamily}
            onChange={(e) => onFilterChange('olfactory_family', e.target.value)}
            className="w-full bg-aurum-surface border border-aurum-border rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-aurum-gold"
          >
            <option value="">Todas as Famílias</option>
            {olfactoryFamilies.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      )}

      {/* Faixa de Preço */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-aurum-gold uppercase tracking-wider">Faixa de Preço (R$)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onFilterChange('min_price', e.target.value)}
            className="w-full bg-aurum-surface border border-aurum-border rounded-lg py-1.5 px-2 text-xs text-white"
          />
          <span className="text-aurum-gray text-xs">até</span>
          <input
            type="number"
            placeholder="Máx"
            value={maxPrice}
            onChange={(e) => onFilterChange('max_price', e.target.value)}
            className="w-full bg-aurum-surface border border-aurum-border rounded-lg py-1.5 px-2 text-xs text-white"
          />
        </div>
      </div>

      {/* Apenas em estoque */}
      <div className="pt-2 border-t border-aurum-border">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onFilterChange('in_stock_only', e.target.checked)}
            className="rounded bg-aurum-surface border-aurum-border text-aurum-gold focus:ring-0"
          />
          <span>Apenas produtos em estoque</span>
        </label>
      </div>

    </aside>
  );
};
