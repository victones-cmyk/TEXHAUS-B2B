/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Product, ProductVariation, CartItem } from '../types';

function itemKey(productId: string, variationId?: string) {
  return `${productId}-${variationId ?? 'base'}`;
}

function itemPrice(item: CartItem): number {
  return item.product.price + (item.variation?.price_modifier ?? 0);
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variation?: ProductVariation) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  total: 0,
  itemCount: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product, quantity = 1, variation?: ProductVariation) => {
    const key = itemKey(product.id, variation?.id);
    setItems(prev => {
      const existing = prev.find(
        item => item.product.id === product.id && (item.variation?.id ?? 'base') === (variation?.id ?? 'base')
      );
      if (existing) {
        return prev.map(item =>
          itemKey(item.product.id, item.variation?.id) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, variation, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setItems(prev => prev.filter(item => itemKey(item.product.id, item.variation?.id) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => itemKey(item.product.id, item.variation?.id) !== key));
      return;
    }
    setItems(prev =>
      prev.map(item =>
        itemKey(item.product.id, item.variation?.id) === key ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
