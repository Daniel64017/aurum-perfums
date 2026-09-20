import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, Tag, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    totalItems,
    coupon,
    applyCoupon,
    removeCoupon,
    finalTotal
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      setCouponLoading(true);
      setCouponMessage(null);
      const msg = await applyCoupon(couponCode);
      setCouponMessage({ text: msg, isError: false });
      setCouponCode('');
    } catch (err: any) {
      setCouponMessage({ text: err.message, isError: true });
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D0D14] border-l border-aurum-gold/20 text-slate-100 flex flex-col justify-between shadow-2xl">
          
          {/* Header do Carrinho */}
          <div className="p-5 border-b border-aurum-border/60 flex items-center justify-between bg-aurum-card">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-aurum-gold" />
              <h2 className="font-serif text-lg font-bold tracking-wide text-white">
                Seu Carrinho ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-aurum-gray hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo dos Itens */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!cart || cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-aurum-surface border border-aurum-gold/30 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-aurum-gold" />
                </div>
                <h3 className="font-serif text-base font-semibold text-white">Seu carrinho está vazio</h3>
                <p className="text-xs text-aurum-gray max-w-xs">
                  Explore nosso catálogo e descubra perfumes extraordinários para enriquecer sua coleção.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/catalogo');
                  }}
                  className="mt-4 px-6 py-2.5 rounded-full bg-aurum-gold text-aurum-dark font-bold text-xs hover:bg-aurum-gold-light transition-all shadow-gold"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-xl bg-aurum-card border border-aurum-border/50 relative group"
                >
                  <img
                    src={item.product.images[0]?.image_url || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=200&q=80'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg bg-[#050508] shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-xs font-semibold text-white truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-aurum-gray hover:text-rose-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-aurum-gray">
                        {item.product.brand.name} • {item.product.volume_ml}ml
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-aurum-border/30">
                      <div className="flex items-center border border-aurum-border rounded-lg bg-aurum-surface">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-aurum-gold text-aurum-gray"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1 hover:text-aurum-gold text-aurum-gray disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-sans text-xs font-bold text-aurum-gold">
                        R$ {item.item_subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer do Carrinho (Resumo e Checkout) */}
          {cart && cart.items.length > 0 && (
            <div className="p-5 border-t border-aurum-border/60 bg-aurum-card space-y-4">

              {/* Formulário Cupom */}
              <div className="space-y-2">
                {coupon ? (
                  <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-aurum-gold/10 border border-aurum-gold/40 text-xs">
                    <div className="flex items-center gap-1.5 text-aurum-gold font-bold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Cupom '{coupon.code}' ativo</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[10px] text-rose-400 hover:underline font-semibold"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Cupom (ex: AURUM20)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-aurum-surface border border-aurum-border rounded-lg py-1.5 px-3 text-xs text-white uppercase placeholder:normal-case placeholder-aurum-gray focus:outline-none focus:border-aurum-gold"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="px-3 py-1.5 rounded-lg bg-aurum-surface border border-aurum-border hover:border-aurum-gold text-aurum-gold text-xs font-semibold"
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <p className={`text-[10px] ${couponMessage.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Resumo Financeiro */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-aurum-gray">
                  <span>Subtotal</span>
                  <span className="text-white">R$ {cart.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Desconto ({coupon.code})</span>
                    <span>- R$ {coupon.calculated_discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-aurum-gray">
                  <span>Frete</span>
                  <span className="text-aurum-gold font-medium">Calculado no checkout</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-aurum-border/40">
                  <span>Total estimado</span>
                  <span className="text-aurum-gold font-serif text-base">
                    R$ {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Botão Finalizar */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                className="w-full py-3 rounded-xl bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-gold"
              >
                <span>Finalizar Compra</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-aurum-gray pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-aurum-gold" />
                <span>Ambiente Seguro • Garantia de Satisfação Aurum</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
