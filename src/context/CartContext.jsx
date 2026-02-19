import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

const STORAGE_KEY = "scentbase_cart_v1";

const initialState = {
  items: [], // {id, slug, name, price, actual, image, qty}
};

function cartReducer(state, action) {
  switch (action.type) {
    case "INIT": {
      return { ...state, items: action.payload || [] };
    }

    case "ADD": {
      const item = action.payload;
      const found = state.items.find((x) => x.id === item.id);

      if (found) {
        return {
          ...state,
          items: state.items.map((x) =>
            x.id === item.id ? { ...x, qty: x.qty + 1 } : x
          ),
        };
      }

      return { ...state, items: [{ ...item, qty: 1 }, ...state.items] };
    }

    case "INC": {
      const id = action.payload;
      return {
        ...state,
        items: state.items.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)),
      };
    }

    case "DEC": {
      const id = action.payload;
      return {
        ...state,
        items: state.items
          .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
          .filter((x) => x.qty > 0),
      };
    }

    case "REMOVE": {
      const id = action.payload;
      return { ...state, items: state.items.filter((x) => x.id !== id) };
    }

    case "CLEAR": {
      return { ...state, items: [] };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      dispatch({ type: "INIT", payload: parsed });
    } catch {
      dispatch({ type: "INIT", payload: [] });
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  // Derived values
  const totals = useMemo(() => {
    const itemsCount = state.items.reduce((sum, x) => sum + x.qty, 0);
    const subtotal = state.items.reduce(
      (sum, x) => sum + Number(x.price) * x.qty,
      0
    );
    const actualTotal = state.items.reduce(
      (sum, x) => sum + Number(x.actual || x.price) * x.qty,
      0
    );
    const savings = actualTotal - subtotal;

    return { itemsCount, subtotal, actualTotal, savings };
  }, [state.items]);

  // Actions
  const addToCart = (item) => {
    dispatch({ type: "ADD", payload: item });
    toast.success(`${item.name} added to cart`);
  };

  const inc = (id) => dispatch({ type: "INC", payload: id });
  const dec = (id) => dispatch({ type: "DEC", payload: id });
  const remove = (id) => {
    dispatch({ type: "REMOVE", payload: id });
    toast("Removed from cart", { icon: "🗑️" });
  };
  const clear = () => {
    dispatch({ type: "CLEAR" });
    toast("Cart cleared", { icon: "🧹" });
  };

  const value = { items: state.items, totals, addToCart, inc, dec, remove, clear };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
