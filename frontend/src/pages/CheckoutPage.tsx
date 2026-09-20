import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, QrCode, FileText, Truck, MapPin, CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../config/stripe';
import { StripeCardForm } from '../components/StripeCardForm';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, coupon, finalTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1); // 1: Endereço, 2: Frete, 3: Pagamento

  // Endereço
  const [address, setAddress] = useState<Address>({
    zip_code: '01415-000',
    street: 'Alameda Santos',
    number: '1470',
    complement: 'Apto 121',
    neighborhood: 'Jardins',
    city: 'São Paulo',
    state: 'SP'
  });

  // Método de Frete
  const [shippingMethod, setShippingMethod] = useState<string>('Normal');
  const shippingCosts: Record<string, number> = {
    'Normal': 25.00,
    'Expressa': 45.00,
    'Retirada': 0.00
  };

  // Método de Pagamento
  const [paymentMethod, setPaymentMethod] = useState<string>('pix');

  // Dados fictícios de cartão
  const [cardNum, setCardNum] = useState('4000 1234 5678 9010');
  const [cardName, setCardName] = useState(user?.name || 'GABRIEL ALENCAR');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [installments, setInstallments] = useState<number>(1);

  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-white">Seu carrinho está vazio</h2>
        <button
          onClick={() => navigate('/catalogo')}
          className="px-6 py-2.5 rounded-full bg-aurum-gold text-aurum-dark font-bold text-xs"
        >
          Explorar Perfumes
        </button>
      </div>
    );
  }

  const shippingCost = shippingCosts[shippingMethod] || 25.00;
  const grandTotal = Math.max(0, finalTotal + shippingCost);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Por favor, faça login ou cadastre-se para finalizar seu pedido.");
      navigate('/login?redirect=checkout');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        shipping_address: address,
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        coupon_code: coupon ? coupon.code : null,
        card_details: paymentMethod === 'credit_card' ? {
          number: cardNum,
          name: cardName,
          expiry: cardExpiry,
          cvv: cardCvv,
          installments: installments
        } : null
      };

      const res = await api.post('/checkout/place-order', payload);
      
      // Guardar os detalhes da resposta no state e navegar para a confirmação
      navigate(`/confirmacao-pedido/${res.data.order_number}`, { state: { orderData: res.data } });
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Erro ao processar checkout.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header do Checkout */}
      <div className="text-center space-y-2 border-b border-aurum-border pb-6">
        <div className="inline-flex items-center gap-2 text-aurum-gold text-xs font-bold uppercase tracking-widest">
          <Lock className="w-3.5 h-3.5" />
          <span>Checkout 100% Criptografado e Seguro</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white">Finalizar Pedido VIP</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário Principal (Etapas) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Etapa 1: Endereço de Entrega */}
          <div className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-aurum-border/40">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-aurum-gold" />
                <span>1. Endereço de Entrega</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-aurum-gray font-semibold mb-1">CEP</label>
                <input
                  type="text"
                  value={address.zip_code}
                  onChange={(e) => setAddress({ ...address, zip_code: e.target.value })}
                  className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-aurum-gray font-semibold mb-1">Rua / Logradouro</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-aurum-gray font-semibold mb-1">Número</label>
                <input
                  type="text"
                  value={address.number}
                  onChange={(e) => setAddress({ ...address, number: e.target.value })}
                  className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-aurum-gray font-semibold mb-1">Complemento (opcional)</label>
                <input
                  type="text"
                  value={address.complement || ''}
                  onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                  className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-aurum-gray font-semibold mb-1">Bairro</label>
                <input
                  type="text"
                  value={address.neighborhood}
                  onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                  className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">Cidade</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">Estado</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Etapa 2: Método de Entrega */}
          <div className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-4">
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-aurum-border/40">
              <Truck className="w-4 h-4 text-aurum-gold" />
              <span>2. Método de Entrega</span>
            </h3>

            <div className="space-y-3">
              {[
                { id: 'Normal', name: 'Entrega Normal Expressa (4 a 6 dias úteis)', price: 25.00 },
                { id: 'Expressa', name: 'Entrega Sedex VIP (1 a 2 dias úteis)', price: 45.00 },
                { id: 'Retirada', name: 'Retirada na Boutique Flagship (São Paulo)', price: 0.00 }
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setShippingMethod(opt.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    shippingMethod === opt.id
                      ? 'bg-aurum-gold/10 border-aurum-gold text-white'
                      : 'bg-aurum-surface border-aurum-border text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === opt.id}
                      onChange={() => setShippingMethod(opt.id)}
                      className="text-aurum-gold focus:ring-0"
                    />
                    <span className="text-xs font-semibold">{opt.name}</span>
                  </div>
                  <span className="text-xs font-bold text-aurum-gold">
                    {opt.price === 0 ? 'GRÁTIS' : `R$ ${opt.price.toFixed(2)}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Etapa 3: Forma de Pagamento (SANDBOX) */}
          <div className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-aurum-border/40">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-aurum-gold" />
                <span>3. Forma de Pagamento (Modo Sandbox / Demonstração)</span>
              </h3>
              <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                SANDBOX ATIVO
              </span>
            </div>

            {/* Abas do Pagamento */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`py-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'pix' ? 'bg-aurum-gold text-aurum-dark border-aurum-gold shadow-gold' : 'bg-aurum-surface text-slate-300 border-aurum-border'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>PIX</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`py-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'credit_card' ? 'bg-aurum-gold text-aurum-dark border-aurum-gold shadow-gold' : 'bg-aurum-surface text-slate-300 border-aurum-border'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Cartão de Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('boleto')}
                className={`py-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'boleto' ? 'bg-aurum-gold text-aurum-dark border-aurum-gold shadow-gold' : 'bg-aurum-surface text-slate-300 border-aurum-border'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Boleto Bancário</span>
              </button>
            </div>

            {/* Painéis Específicos do Método de Pagamento */}
            <div className="p-4 rounded-xl bg-aurum-surface border border-aurum-border space-y-3">
              {paymentMethod === 'pix' && (
                <div className="text-xs text-aurum-gray-light space-y-2">
                  <p className="font-semibold text-white">✨ Pagamento instantâneo via PIX com aprovação imediata.</p>
                  <p>Após a confirmação, será gerado o QR Code e a chave copia e cola em ambiente de simulação para validação total do fluxo.</p>
                </div>
              )}

              {paymentMethod === 'credit_card' && (
                <div className="space-y-3 text-xs">
                  <Elements stripe={stripePromise}>
                    <StripeCardForm
                      amount={grandTotal}
                      onSuccess={async (res) => {
                        if (!user) {
                          alert("Por favor, faça login para continuar.");
                          navigate('/login?redirect=checkout');
                          return;
                        }
                        try {
                          setSubmitting(true);
                          // 1. Criar pedido no sistema
                          const orderRes = await api.post('/checkout/place-order', {
                            shipping_address: address,
                            shipping_method: shippingMethod,
                            payment_method: 'credit_card',
                            coupon_code: coupon ? coupon.code : null,
                            card_details: null
                          });

                          const orderData = orderRes.data;

                          // 2. Processar cobrança via Stripe
                          if (res.paymentMethodId) {
                            const payRes = await api.post('/payments/checkout', {
                              payment_method_id: res.paymentMethodId,
                              amount: grandTotal,
                              order_id: orderData.order_id
                            });

                            if (payRes.data.success) {
                              clearCart();
                              navigate(`/confirmacao-pedido/${orderData.order_number}`, {
                                state: { orderData: { ...orderData, payment_status: 'approved', status: 'paid' } }
                              });
                            } else {
                              alert('O pagamento não pôde ser aprovado pela Stripe.');
                            }
                          } else {
                            clearCart();
                            navigate(`/confirmacao-pedido/${orderData.order_number}`, { state: { orderData } });
                          }
                        } catch (err: any) {
                          const msg = err.response?.data?.detail || err.message || "Erro ao concluir pedido.";
                          alert(msg);
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                    />
                  </Elements>
                </div>
              )}

              {paymentMethod === 'boleto' && (
                <div className="text-xs text-aurum-gray-light space-y-2">
                  <p className="font-semibold text-white">📄 Boleto Bancário com vencimento para 3 dias úteis.</p>
                  <p>O código numérico simulado será gerado na tela final para cópia.</p>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Resumo do Pedido Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-aurum-card border border-aurum-gold/30 space-y-4 sticky top-28 shadow-glass">
            <h3 className="font-serif text-lg font-bold text-white pb-3 border-b border-aurum-border">
              Resumo do Pedido
            </h3>

            {/* Lista Simplificada */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-slate-300 truncate max-w-[180px]">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-bold text-white">
                    R$ {item.item_subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-aurum-border/40 space-y-2 text-xs">
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
                <span>Frete ({shippingMethod})</span>
                <span className="text-white">
                  {shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-white pt-3 border-t border-aurum-border/60">
                <span>Total a Pagar</span>
                <span className="text-aurum-gold font-serif text-lg">
                  R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-gold"
            >
              {submitting ? (
                <span>Gerando Pedido...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Concluir e Pagar R$ {grandTotal.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
