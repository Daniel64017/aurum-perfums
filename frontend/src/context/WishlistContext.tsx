import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { Product } from '../types';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  favorites: Product[];
  loading: boolean;
  toggleFavorite: (productId: number) => Promise<boolean>;
  isFavorite: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({} as WishlistContextType);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/favorites');
      setFavorites(res.data);
    } catch (err) {
      console.error("Erro ao buscar favoritos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (productId: number): Promise<boolean> => {
    if (!user) {
      throw new Error("Faça login para salvar seus perfumes favoritos.");
    }
    try {
      const res = await api.post(`/favorites/toggle/${productId}`);
      await fetchFavorites();
      return res.data.is_favorite;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Erro ao salvar favorito.";
      throw new Error(msg);
    }
  };

  const isFavorite = (productId: number): boolean => {
    return favorites.some(p => p.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        favorites,
        loading,
        toggleFavorite,
        isFavorite
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
