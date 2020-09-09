/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const listOfProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (listOfProducts != null) {
        setProducts([...JSON.parse(listOfProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const ifProductExist = products.find(item => {
        if (item.id === product.id) {
          item.quantity += 1;
          return item;
        }
        return null;
      });

      if (ifProductExist) {
        setProducts(
          products.map(item =>
            item.id === product.id ? { ...ifProductExist } : item,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const ifProductExist = products.find(item => {
        if (item.id === id) {
          item.quantity += 1;
          return item;
        }
        return null;
      });

      if (ifProductExist) {
        setProducts(
          products.map(item => (item.id === id ? { ...ifProductExist } : item)),
        );
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const ifProductExist = products.find(item => {
        if (item.id === id) {
          return item;
        }
        return null;
      });

      if (ifProductExist) {
        if (ifProductExist.quantity === 1) {
          setProducts(
            products.filter(item => {
              if (item.id !== ifProductExist.id) {
                return item;
              }
            }),
          );
        } else {
          setProducts(
            products.map(item =>
              item.id === id
                ? { ...ifProductExist, quantity: ifProductExist.quantity - 1 }
                : item,
            ),
          );
        }

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
