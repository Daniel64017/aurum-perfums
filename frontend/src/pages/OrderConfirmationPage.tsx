import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, QrCode, Copy, Check, Truck, MapPin, Package, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(location.state?.orderData || null);
  const [loading, setLoading] = useState<boolean>(!order);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!order && orderNumber) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/orders/${orderNumber}`);
          setOrder(res.data);
        } catch (err) {
          console.error("Erro ao carregar pedido:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderNumber]);

  if (loading || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-aurum-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-aurum-gray">Buscando confirmação do pedido...</p>
      </div>
    );
  }

  const payDetails = order.payment_details || order.payment?.details || {};

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      
      {/* Banner de Sucesso */}
      <div className="p-8 rounded-3xl bg-aurum-card border border-aurum-gold/40 text-center space-y-4 shadow-glass relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-aurum-gold/10 border border-aurum-gold flex items-center justify-center mx-auto shadow-gold">
          <CheckCircle2 className="w-8 h-8 text-aurum-gold" />
        </div>

        <div>
          <span className="text-xs font-extrabold text-aurum-gold uppercase tracking-widest">Pedido Realizado com Sucesso!</span>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">Obrigado pela sua Compra na Aurum Parfums</h1>
          <p className="text-xs text-aurum-gray-light mt-1">
            Número do Pedido: <span className="text-aurum-gold font-bold">{order.order_number}</span>
          </p>
        </div>

        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-aurum-surface border border-aurum-border text-xs text-slate-300">
          <Truck className="w-3.5 h-3.5 text-aurum-gold" />
          <span>Código de Rastreio: <strong className="text-white">{order.tracking_code}</strong></span>
        </div>
      </div>

      {/* Caixa de Instruções de Pagamento (SANDBOX) */}
      <div className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-aurum-border/40">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-aurum-gold" />
            <span>Instruções do Pagamento (Modo Sandbox)</span>
          </h3>
          <span className="text-[10px] font-bold bg-aurum-gold/10 text-aurum-gold px-2.5 py-0.5 rounded-full border border-aurum-gold/30">
            {order.payment_method?.toUpperCase()}
          </span>
        </div>

        {/* PIX */}
        {order.payment_method === 'pix' && payDetails.pix_copy_paste && (
          <div className="space-y-4 text-center">
            <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto shadow-lg">
              <img src={payDetails.qr_code_mock} alt="QR Code PIX Simulado" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <label className="block text-xs font-semibold text-aurum-gray">Código Pix Copia e Cola:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={payDetails.pix_copy_paste}
                  className="flex-1 bg-aurum-surface border border-aurum-border rounded-xl py-2 px-3 text-xs text-slate-300 font-mono"
                />
                <button
                  onClick={() => handleCopyCode(payDetails.pix_copy_paste)}
                  className="px-4 py-2 rounded-xl bg-aurum-gold text-aurum-dark font-bold text-xs flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CARTÃO DE CRÉDITO */}
        {order.payment_method === 'credit_card' && (
          <div className="p-4 rounded-xl bg-aurum-surface border border-aurum-border text-xs space-y-2">
            <p className="font-semibold text-emerald-400">✅ Pagamento Aprovado Instantaneamente via Cartão de Crédito!</p>
            <p className="text-slate-300">Bandeira: {payDetails.card_brand || 'Visa VIP'} • Final {payDetails.last4 || '4000'}</p>
            <p className="text-slate-300">Parcelamento: {payDetails.installments || '1x à vista'}</p>
            <p className="text-aurum-gray text-[10px]">Código de Autorização: {payDetails.authorization_code || 'AUTH-DEMO-99182'}</p>
          </div>
        )}

        {/* BOLETO BANCÁRIO */}
        {order.payment_method === 'boleto' && payDetails.barcode && (
          <div className="space-y-3 text-xs">
            <p className="font-semibold text-white">Vencimento: {payDetails.due_date}</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={payDetails.barcode}
                className="flex-1 bg-aurum-surface border border-aurum-border rounded-xl py-2 px-3 text-xs text-slate-300 font-mono"
              />
              <button
                onClick={() => handleCopyCode(payDetails.barcode)}
                className="px-4 py-2 rounded-xl bg-aurum-gold text-aurum-dark font-bold text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Resumo Financeiro */}
      <div className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-4">
        <h3 className="font-serif text-base font-bold text-white pb-3 border-b border-aurum-border/40">
          Detalhes da Compra
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-aurum-gray">
            <span>Subtotal:</span>
            <span className="text-white">R$ {(order.total - order.shipping_cost + order.discount_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-aurum-gray">
            <span>Frete:</span>
            <span className="text-white">R$ {order.shipping_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Desconto Aplicado:</span>
              <span>- R$ {order.discount_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-aurum-border/40">
            <span>Valor Total:</span>
            <span className="text-aurum-gold font-serif text-base">
              R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/minha-conta"
          className="px-8 py-3.5 rounded-full bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider hover:opacity-90 shadow-gold text-center"
        >
          Acompanhar Pedido em Minha Conta
        </Link>
        <Link
          to="/catalogo"
          className="px-8 py-3.5 rounded-full bg-aurum-surface border border-aurum-border text-slate-300 font-bold text-xs uppercase tracking-wider hover:text-aurum-gold text-center"
        >
          Voltar para a Loja
        </Link>
      </div>

    </div>
  );
};
