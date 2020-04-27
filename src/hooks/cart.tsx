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
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([] as Product[]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const procuctsStoraged = await AsyncStorage.getItem('@GoMP:products');

      if (procuctsStoraged) {
        setProducts(JSON.parse(procuctsStoraged));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productFound = products.find(item => item.id === product.id);

      if (productFound) {
        productFound.quantity += 1;
      } else {
        const newProduct: Product = {
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          price: product.price,
          quantity: 1,
        };

        products.push(newProduct);
      }

      setProducts([...products]);

      AsyncStorage.setItem('@GoMP:products', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productFound = products.find(product => product.id === id);
      if (productFound) {
        productFound.quantity += 1;

        AsyncStorage.setItem('@GoMP:products', JSON.stringify(products));

        setProducts([...products]);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productFound = products.find(product => product.id === id);
      if (productFound) {
        if (productFound.quantity > 1) {
          productFound.quantity -= 1;
        } else {
          const index = products.findIndex(item => item.id === productFound.id);

          products.splice(index, 1);
        }

        AsyncStorage.setItem('@GoMP:products', JSON.stringify(products));

        setProducts([...products]);
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
