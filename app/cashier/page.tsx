"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { Search, Scan, ShoppingCart, CreditCard, Trash2, Plus, Minus, LogOut, User, CheckCircle, Clock, XCircle, Sparkles, Package, ChevronRight, Banknote, Smartphone, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ThemeToggle } from '@/components/theme-toggle';
import { useHardwareScanner } from '@/components/hooks/useHardwareScanner';

const ReceiptDownloader = dynamic(() => import("./ReceiptDownloader"), {
  ssr: false,
});

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), {
  ssr: false,
});

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Sale {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info';
}

type PaymentStep = 'method' | 'confirm' | 'receipt';

export default function CashierPage() {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('method');
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "mobile"
  >("cash");
  const [completedSaleData, setCompletedSaleData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingReference, setPendingReference] = useState<string | null>(null);
  const previousSalesRef = useRef<Sale[]>([]);
  const { data: session, isPending } = useSession();

  // Route protection is securely handled by middleware.ts

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = `${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Poll for sales status updates every 5 seconds
  useEffect(() => {
    if (!session) return;

    const fetchSales = async () => {
      try {
        const res = await fetch('/api/sales');
        if (res.ok) {
          const data: Sale[] = await res.json();
          const todaySales = data.filter(s => {
            const saleDate = new Date(s.createdAt).toDateString();
            return saleDate === new Date().toDateString();
          });

          // Check if any previously pending sale is now paid
          const prev = previousSalesRef.current;
          if (prev.length > 0) {
            todaySales.forEach(sale => {
              const prevSale = prev.find(p => p.id === sale.id);
              if (prevSale && prevSale.paymentStatus === 'pending' && sale.paymentStatus === 'paid') {
                showToast(`💳 Payment confirmed! GH₵ ${sale.totalAmount.toFixed(2)} via ${sale.paymentMethod.toUpperCase()}`, 'success');
              }
            });
          }

          previousSalesRef.current = todaySales;
          setRecentSales(todaySales);
        }
      } catch (error) {
        console.error('Error fetching sales:', error);
      }
    };

    fetchSales();
    const interval = setInterval(fetchSales, 5000);
    return () => clearInterval(interval);
  }, [session]);

  // Poll to verify pending digital payment
  useEffect(() => {
    if (!pendingReference) return;

    const pollVerify = async () => {
      try {
        const res = await fetch(`/api/paystack/verify/${pendingReference}`);
        if (res.ok) {
          const data = await res.json();
          if (data.verified && data.status === 'paid') {
            setPendingReference(null);
            showToast(`\u{1f4b3} Payment confirmed! Sale recorded successfully.`, 'success');
            setCompletedSaleData((prev: any) => prev ? { ...prev, paymentVerified: true } : prev);
            // Refresh products since stock was just decremented
            const productsRes = await fetch('/api/products');
            if (productsRes.ok) {
              setProducts(await productsRes.json());
            }
          }
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      }
    };

    const interval = setInterval(pollVerify, 5000);
    return () => clearInterval(interval);
  }, [pendingReference]);

  // Filter products based on search
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Add product to cart
  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      alert("Product out of stock");
      return;
    }
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.quantity) {
        setCart(
          cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        alert("Not enough stock available");
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  // Lookup by barcode string (used by both hardware scanner and camera)
  const handleBarcodeValue = useCallback((code: string) => {
    const product = products.find((p) => p.barcode === code);
    if (product) {
      addToCart(product);
      showToast(`✅ ${product.name} added to cart`, 'success');
    } else {
      showToast(`❌ Product not found: ${code}`, 'info');
    }
  }, [products]);

  // Hardware scanner: auto-fires when USB/Bluetooth scanner sends barcode
  useHardwareScanner(handleBarcodeValue);

  // Search by barcode (manual form submit)
  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    handleBarcodeValue(barcode.trim());
    setBarcode("");
  };

  // Update quantity — removing item if it drops to 0
  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null; // signal removal
            if (newQuantity > item.product.quantity) {
              alert("Not enough stock available");
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.125;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length > 0) {
      setCompletedSaleData(null);
      setPaymentStep('method');
      setShowPaymentModal(true);
    }
  };

  const handlePaymentComplete = async () => {
    setPaymentStep('confirm');
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const isCash = paymentMethod === 'cash';

      if (isCash) {
        // CASH FLOW: Save sale + decrement stock immediately
        const res = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
            })),
            subtotal,
            tax,
            total,
            paymentMethod: 'cash',
            paymentStatus: 'paid',
          }),
        });

        if (!res.ok) {
          alert('Failed to record sale. Please try again.');
          return;
        }

        setCompletedSaleData({
          items: [...cart],
          subtotal,
          tax,
          total,
          paymentMethod: 'cash',
          paystackUrl: null,
          date: new Date().toLocaleString(),
        });
        setPaymentStep('receipt');
        setCart([]);
        const productsRes = await fetch('/api/products');
        if (productsRes.ok) {
          setProducts(await productsRes.json());
        }
      } else {
        // DIGITAL FLOW: Only generate Paystack link — webhook creates the sale on payment
        const paystackRes = await fetch('/api/paystack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            email: (session?.user as any)?.email || 'customer@EvansCouture.com',
            saleReference: `sale_${Date.now()}`,
            items: cart.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
            })),
            userId: (session?.user as any)?.id,
            subtotal,
            tax,
            paymentMethod,
          }),
        });

        if (!paystackRes.ok) {
          alert('Failed to generate payment link. Please try again.');
          return;
        }

        const paystackData = await paystackRes.json();

        setPendingReference(paystackData.reference);

        setCompletedSaleData({
          items: [...cart],
          subtotal,
          tax,
          total,
          paymentMethod,
          paystackUrl: paystackData.authorization_url,
          paymentVerified: false,
          date: new Date().toLocaleString(),
        });
        setPaymentStep('receipt');
        setCart([]);
        // Do NOT refresh products here — stock is not decremented until verified
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const paymentMethodIcon = {
    cash: <Banknote className="w-6 h-6" />,
    card: <CreditCard className="w-6 h-6" />,
    mobile: <Smartphone className="w-6 h-6" />,
  };
  const paymentMethodLabel = { cash: 'Cash', card: 'Card / POS', mobile: 'Mobile Money' };

  if (isPending || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center animate-pulse">
            <Sparkles className="size-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Loading Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background dark">

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 bg-green-500 text-white rounded-lg shadow-lg animate-in slide-in-from-right"
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Premium Header */}
      <div className="bg-card text-foreground px-6 py-4 flex items-center justify-between border-b border-border/40 relative z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center glow-primary">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm tracking-tight text-foreground">Evan's Couture</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Point of Sale</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-xl border border-border/50">
            <User className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold">{session?.user?.name || 'Cashier'}</span>
          </div>
          <ThemeToggle />
          <div className="w-px h-5 bg-border/50 hidden md:block" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 hover:bg-destructive/10 text-destructive rounded-xl transition-colors font-semibold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Products */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Search and Barcode */}
          <div className="mb-6 space-y-3">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-10 pr-4 h-11 bg-card border-border/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
              />
            </div>
            <form onSubmit={handleBarcodeSearch} className="flex gap-2">
              <div className="relative flex-1 group">
                <Scan className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or enter SKU..."
                  className="w-full pl-10 pr-4 h-11 bg-card border-border/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-6 h-11 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors border border-border/50"
              >
                Add
              </button>
              <BarcodeScanner
                onScan={(code) => { handleBarcodeValue(code); }}
                buttonVariant="icon"
                buttonClassName="h-11 w-11 flex items-center justify-center bg-secondary hover:bg-secondary/80 rounded-xl border border-border/50"
              />
            </form>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="size-10 rounded-xl border border-primary/20 border-t-primary animate-spin" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Loading Catalog</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="size-16 rounded-2xl bg-secondary/50 flex items-center justify-center text-muted-foreground/50 mb-2">
                  <Package className="size-8" />
                </div>
                <p className="font-semibold">No items found</p>
                <p className="text-sm text-muted-foreground max-w-[200px]">Try a different search term or scan a new SKU.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.quantity <= 0}
                    className="group relative flex flex-col items-start p-4 bg-card hover:bg-accent/50 border border-border/50 rounded-2xl text-left transition-all hover:border-primary/30 hover:shadow-[0_8px_24px_-12px_rgba(201,168,76,0.2)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border/50 disabled:hover:bg-card disabled:hover:shadow-none h-[140px]"
                  >
                    <div className="flex justify-between items-start w-full mb-auto">
                      <div className="p-2 rounded-lg bg-secondary/50 text-muted-foreground group-hover:text-primary transition-colors">
                        <Package className="size-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                        GH₵ {product.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full">
                      <h3 className="font-bold text-sm leading-tight mb-1 truncate text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between w-full">
                        <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                          {product.category}
                        </p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${product.quantity <= 5 ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'}`}>
                          {product.quantity} left
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions Nav Button */}
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={() => router.push('/cashier/transactions')}
              className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border hover:border-primary hover:shadow-sm rounded-xl transition-all group"
            //style={{ backgroundColor: '#D0D6B5' }}
            >
              <div className="flex items-center gap-3 ">
                <div className="p-2 bg-/10 rounded-lg text-primary group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm">Transaction History</h3>
                  <p className="text-xs text-muted-foreground font-medium">View today's sales & status</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <span className="text-lg font-bold leading-none mb-1">→</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Panel - Cart */}
        <div className="w-[420px] bg-secondary/10 border-l border-border/40 flex flex-col relative z-10 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.2)]">
          <div className="px-6 py-5 border-b border-border/40 bg-card/50 backdrop-blur-sm">
            <h2 className="font-display font-bold text-xl mb-1">Current Order</h2>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">
              {cart.length} item{cart.length !== 1 && 's'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="size-20 rounded-full border border-border/50 flex items-center justify-center mb-4 text-muted-foreground/30">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <p className="font-medium text-muted-foreground">Cart is empty</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Select items from the catalog</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm group hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <h4 className="font-bold text-sm truncate">{item.product.name}</h4>
                      <p className="text-[11px] font-semibold text-primary/80 uppercase tracking-widest mt-0.5">
                        GH₵ {item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 border border-border/50">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background hover:shadow-sm text-foreground transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background hover:shadow-sm text-foreground transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-bold text-[15px]">
                      GH₵ {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border/40 bg-card/50 backdrop-blur-sm px-6 py-5">
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="font-semibold">GH₵ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Tax (12.5%)</span>
                <span className="font-semibold">GH₵ {tax.toFixed(2)}</span>
              </div>
              <div className="gold-divider my-2" />
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Total</span>
                <span className="font-display font-bold text-primary text-2xl">
                  GH₵ {total.toFixed(2)}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 font-bold group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Premium Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 animate-in">
          <div className="bg-card border border-border/50 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-border/40 flex items-center justify-between bg-secondary/20 relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.1)_0%,transparent_70%)] pointer-events-none" />
              <div>
                <h3 className="text-2xl font-display font-bold text-foreground">Checkout</h3>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mt-1">
                  {paymentStep === 'method' && 'Step 1: Select Payment'}
                  {paymentStep === 'confirm' && 'Step 2: Processing'}
                  {paymentStep === 'receipt' && 'Step 3: Receipt'}
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessing}
                className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              {paymentStep === 'method' && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="grid grid-cols-3 gap-3">
                    {(['cash', 'card', 'mobile'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                          paymentMethod === method
                            ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_-5px_rgba(201,168,76,0.3)]'
                            : 'bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary/50 hover:border-border'
                        }`}
                      >
                        {paymentMethodIcon[method]}
                        <span className="text-xs font-bold uppercase tracking-widest">{paymentMethodLabel[method]}</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-secondary/30 rounded-2xl p-6 border border-border/50 flex flex-col items-center justify-center space-y-2">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Amount Due</span>
                    <span className="text-4xl font-display font-bold text-foreground">GH₵ {total.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handlePaymentComplete}
                    disabled={isProcessing}
                    className="w-full h-14 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 font-bold text-lg group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                    <span>Confirm Payment</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}

              {paymentStep === 'confirm' && (
                <div className="py-12 flex flex-col items-center justify-center space-y-6 animate-in slide-in-from-right-4">
                  <div className="size-20 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Processing Transaction</h3>
                    <p className="text-sm text-muted-foreground">Please wait while we secure the payment...</p>
                  </div>
                </div>
              )}

              {paymentStep === 'receipt' && completedSaleData && (
                <div className="space-y-6 text-center animate-in slide-in-from-bottom-4">
                  <div className="flex justify-center">
                    {completedSaleData.paymentMethod === 'cash' || completedSaleData.paymentVerified ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                        <div className="size-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/30 relative z-10">
                          <CheckCircle className="w-10 h-10" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                        <div className="size-20 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center border border-blue-500/30 relative z-10">
                          <Clock className="w-10 h-10" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">
                      {completedSaleData.paymentMethod === 'cash' 
                        ? 'Payment Successful' 
                        : completedSaleData.paymentVerified 
                          ? 'Payment Confirmed' 
                          : 'Awaiting Payment'}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {completedSaleData.paymentMethod === 'cash' || completedSaleData.paymentVerified
                        ? 'The transaction has been safely recorded.'
                        : 'Download the receipt with the payment QR. This screen will update automatically.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/40">
                    <ReceiptDownloader
                      completedSaleData={completedSaleData}
                      onDone={() => setShowPaymentModal(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}