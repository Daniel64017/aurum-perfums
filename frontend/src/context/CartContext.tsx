import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { Cart, CartItem } from '../types';
import { useAuth } from './AuthContext';

interface AppliedCoupon {
  code: string;
  discount_type: string;
  discount_value: number;
  calculated_discount: number;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  coupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<string>;
  removeCoupon: () => void;
  totalItems: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error("Erro ao carregar carrinho:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addItem = async (productId: number, quantity: number = 1) => {
    try {
      const res = await api.post('/cart/items', { product_id: productId, quantity });
      setCart(res.data);
      setIsCartOpen(true);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Não foi possível adicionar o produto.";
      throw new Error(msg);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      setCart(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Erro ao atualizar quantidade.";
      throw new Error(msg);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      setCart(res.data);
    } catch (err: any) {
      console.error("Erro ao remover item:", err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/cart/clear');
      setCart(res.data);
      setCoupon(null);
    } catch (err: any) {
      console.error("Erro ao limpar carrinho:", err);
    }
  };

  const applyCoupon = async (code: string): Promise<string> => {
    if (!cart || cart.subtotal <= 0) {
      throw new Error("Adicione produtos ao carrinho antes de aplicar o cupom.");
    }
    try {
      const res = await api.post('/coupons/validate', {
        code,
        subtotal: cart.subtotal
      });

      setCoupon({
        code: res.data.code,
        discount_type: res.data.discount_type,
        discount_value: res.data.discount_value,
        calculated_discount: res.data.calculated_discount
      });

      return res.data.message;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Cupom inválido.";
      throw new Error(msg);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const discountVal = coupon ? coupon.calculated_discount : 0;
  const finalTotal = Math.max(0, (cart?.subtotal || 0) - discountVal);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isCartOpen,
        setIsCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        totalItems,
        finalTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
