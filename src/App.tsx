import React, { useState, useEffect, useMemo } from "react";
import { 
  ShoppingBag, 
  Search, 
  User, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  Menu,
  ChevronRight,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types ---
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface UserData {
  id: number;
  name: string;
  email: string;
}

// --- Components ---

const Navbar = ({ 
  user, 
  cartCount, 
  onOpenCart, 
  onOpenAuth, 
  onLogout,
  searchQuery,
  setSearchQuery 
}: { 
  user: UserData | null; 
  cartCount: number; 
  onOpenCart: () => void; 
  onOpenAuth: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) => (
  <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold tracking-tighter uppercase italic">Minimal.</h1>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-black/60">
            <a href="#" className="hover:text-black transition-colors">Home</a>
            <a href="#products" className="hover:text-black transition-colors text-black">Products</a>
            <a href="#" className="hover:text-black transition-colors">About</a>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input 
              type="text" 
              placeholder="Search accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/5 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-black/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold">{user.name}</span>
                <button onClick={onLogout} className="text-[10px] text-black/40 hover:text-black uppercase tracking-widest">Logout</button>
              </div>
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                {user.name[0]}
              </div>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
          )}
          
          <button 
            onClick={onOpenCart}
            className="relative p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  </nav>
);

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  onAddToCart: (p: Product) => void | Promise<void>;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="group"
  >
    <div className="relative aspect-[4/5] overflow-hidden bg-black/5 rounded-2xl mb-4">
      <img 
        src={product.image} 
        alt={product.name}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <button 
          onClick={() => onAddToCart(product)}
          className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add to Cart
        </button>
      </div>
    </div>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold mb-1">{product.category}</p>
        <h3 className="font-medium text-sm">{product.name}</h3>
      </div>
      <p className="font-bold text-sm">₹{product.price.toLocaleString()}</p>
    </div>
  </motion.div>
);

interface AuthModalProps {
  key?: React.Key;
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserData) => void;
}

const AuthModal = ({ isOpen, onClose, onAuthSuccess }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const endpoint = isLogin ? "/api/login" : "/api/register";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-3xl p-8 relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h2>
        <p className="text-black/40 text-sm mb-8">
          {isLogin ? "Enter your details to access your account" : "Join our community of minimalist enthusiasts"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-black/40 mb-2">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/5 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-black outline-none"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-black/40 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-black/5 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-black outline-none"
              placeholder="hello@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-black/40 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-black/5 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-black outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm hover:bg-black/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : (isLogin ? "Login" : "Register")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-black/40">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-black font-bold hover:underline"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

interface CartDrawerProps {
  key?: React.Key;
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, delta: number) => void | Promise<void>;
}

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onUpdateQuantity 
}: CartDrawerProps) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[120] w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-black/5 flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Cart</h2>
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-black/20" />
                  </div>
                  <h3 className="font-bold mb-1">Your cart is empty</h3>
                  <p className="text-sm text-black/40">Looks like you haven't added anything yet.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-24 bg-black/5 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-black/40">₹{item.price.toLocaleString()}</p>
                        </div>
                        <button onClick={() => onRemove(item.id)} className="p-1 text-black/20 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-black/10 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 px-2 hover:bg-black/5 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 px-2 hover:bg-black/5 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-bold ml-auto">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-black/5 bg-black/5">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-black/40 font-medium">Subtotal</span>
                  <span className="text-xl font-bold">₹{total.toLocaleString()}</span>
                </div>
                <button className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black/90 transition-colors">
                  Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchProducts();
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {}
  };

  const fetchCart = async () => {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      setCart(data);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id })
    });
    if (res.ok) {
      fetchCart();
      setIsCartOpen(true);
    }
  };

  const handleRemoveFromCart = async (productId: number) => {
    const res = await fetch(`/api/cart/${productId}`, { method: "DELETE" });
    if (res.ok) fetchCart();
  };

  const handleUpdateQuantity = async (productId: number, delta: number) => {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    if (item.quantity + delta <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: delta })
    });
    if (res.ok) fetchCart();
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    setCart([]);
  };

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar 
        user={user} 
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main>
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-black text-white">
          <div className="absolute inset-0 opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920" 
              alt="Hero" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative z-10 text-center px-4">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold uppercase tracking-[0.4em] mb-4"
            >
              Essential Collection 2026
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 max-w-2xl mx-auto"
            >
              Minimal Design. Maximum Impact.
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <a 
                href="#products" 
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-sm hover:scale-105 transition-transform"
              >
                Shop Collection <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Products</h2>
              <p className="text-black/40 text-sm">Curated essentials for your daily lifestyle.</p>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                    selectedCategory === cat 
                      ? "bg-black text-white" 
                      : "bg-black/5 text-black/40 hover:bg-black/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart} 
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-black/40 font-medium">No products found matching your criteria.</p>
            </div>
          )}
        </section>

        {/* Newsletter */}
        <section className="bg-black/5 py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-black/40 text-sm mb-8">Subscribe to receive updates on new arrivals and exclusive offers.</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none"
              />
              <button className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black/90 transition-colors">
                Join
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-black/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <h1 className="text-xl font-bold tracking-tighter uppercase italic">Minimal.</h1>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-black/40">
            <a href="#" className="hover:text-black">Privacy</a>
            <a href="#" className="hover:text-black">Terms</a>
            <a href="#" className="hover:text-black">Shipping</a>
            <a href="#" className="hover:text-black">Contact</a>
          </div>
          <p className="text-[10px] text-black/20 font-bold uppercase tracking-widest">© 2026 Minimalist Accessories Inc.</p>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={(u) => setUser(u)} 
      />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </div>
  );
}
