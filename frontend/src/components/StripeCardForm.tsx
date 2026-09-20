import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

interface StripeCardFormProps {
  orderId?: number;
  amount: number;
  onSuccess: (orderData: any) => void;
  onError?: (errorMessage: string) => void;
}

export const StripeCardForm: React.FC<StripeCardFormProps> = ({
  orderId,
  amount,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cardHolderName, setCardHolderName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMsg('Stripe ainda não foi inicializado.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMsg('Formulário de cartão não encontrado.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Criar o PaymentMethod na Stripe no frontend
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardHolderName || 'Cliente Aurum Parfums'
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao validar cartão de crédito.');
      }

      // 2. Se tiver um orderId existente, envia para a rota do backend /api/v1/payments/checkout
      if (orderId) {
        const response = await api.post('/payments/checkout', {
          payment_method_id: paymentMethod.id,
          amount: amount,
          order_id: orderId
        });

        if (response.data.success) {
          onSuccess(response.data);
        } else {
          throw new Error('Não foi possível aprovar o pagamento.');
        }
      } else {
        // Se a ordem ainda não foi criada, devolve o paymentMethod.id para o pai tratar
        onSuccess({ paymentMethodId: paymentMethod.id });
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Erro ao processar pagamento.';
      setErrorMsg(message);
      if (onError) onError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-5 rounded-2xl bg-[#0B0C10] border border-aurum-gold/40 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-aurum-border/50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-aurum-gold" />
            <span className="font-serif text-sm font-bold text-white tracking-wide">
              Cartão de Crédito Seguro (Stripe Test)
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-aurum-gold bg-aurum-gold/10 px-2.5 py-1 rounded-full border border-aurum-gold/20 font-mono">
            <Lock className="w-3 h-3" />
            <span>256-bit SSL</span>
          </div>
        </div>

        {/* Nome no Cartão */}
        <div>
          <label className="block text-xs font-semibold text-aurum-gray mb-1">
            Nome Impresso no Cartão
          </label>
          <input
            type="text"
            placeholder="Ex: GABRIEL ALENCAR"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value.toUpperCase())}
            className="w-full bg-[#050508] border border-aurum-border focus:border-aurum-gold rounded-xl p-3 text-xs text-white uppercase placeholder-aurum-gray/40 outline-none transition-all"
            required
          />
        </div>

        {/* Stripe CardElement */}
        <div>
          <label className="block text-xs font-semibold text-aurum-gray mb-1">
            Dados do Cartão (Número, Validade, CVV)
          </label>
          <div className="p-3.5 bg-[#050508] border border-aurum-border focus-within:border-aurum-gold rounded-xl transition-all">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '14px',
                    color: '#FFFFFF',
                    fontFamily: 'Playfair Display, Inter, sans-serif',
                    fontSmoothing: 'antialiased',
                    '::placeholder': {
                      color: '#6B7280'
                    },
                    iconColor: '#D4AF37'
                  },
                  invalid: {
                    color: '#EF4444',
                    iconColor: '#EF4444'
                  }
                },
                hidePostalCode: true
              }}
            />
          </div>
        </div>

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full py-3.5 rounded-xl bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-gold cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-aurum-dark" />
                <span>Processando Pagamento Stripe...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Pagar R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} via Stripe</span>
              </>
            )}
          </button>
        </div>

      </div>
    </form>
  );
};
