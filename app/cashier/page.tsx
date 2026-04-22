"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { Search, Scan, ShoppingCart, CreditCard, Trash2, Plus, Minus, LogOut, User, CheckCircle, Clock, XCircle } from 'lucide-react';
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

export default function CashierPage() {
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
      setShowPaymentModal(true);
    }
  };

  const handlePaymentComplete = async () => {
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

  if (isPending || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">

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

      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">{"🛒"}EvansCouture - Cashier</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-lg">
            <User className="w-4 h-4" />
            <span>Cashier Mode</span>
          </div>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-white"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Products */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Search and Barcode */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <form onSubmit={handleBarcodeSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or enter barcode..."
                  className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                Add
              </button>
              <BarcodeScanner
                onScan={(code) => { handleBarcodeValue(code); }}
                buttonVariant="icon"
                buttonClassName="px-3 py-3 bg-secondary hover:bg-secondary/80 rounded-lg"
              />
            </form>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.quantity <= 0}
                    className="bg-card border border-border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate mb-1 font-medium">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-primary">
                        GH₵ {product.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {product.quantity}
                      </p>
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
        <div className="w-105 bg-card border-l border-border flex flex-col">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-bold text-lg">Current Order</h2>
            <p className="text-sm text-muted-foreground">
              {cart.length} item(s)
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Cart is empty</p>
                <p className="text-sm text-muted-foreground">
                  Add products to start a sale
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-background border border-border rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <h4 className="truncate font-medium">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        GH₵ {item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-destructive hover:bg-destructive/10 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-secondary hover:bg-secondary/80 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-secondary hover:bg-secondary/80 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-semibold">
                      GH₵ {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border px-6 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>GH₵ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (12.5%)</span>
              <span>GH₵ {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="font-semibold text-primary text-lg">
                GH₵ {total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              <CreditCard className="w-5 h-5" />
              <span>Checkout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg w-96">
            {!completedSaleData ? (
              <>
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-xl font-bold">Payment Method</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={(e) =>
                          setPaymentMethod(
                            e.target.value as "cash" | "card" | "mobile",
                          )
                        }
                      />
                      <span className="font-medium">Cash</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) =>
                          setPaymentMethod(
                            e.target.value as "cash" | "card" | "mobile",
                          )
                        }
                      />
                      <span className="font-medium">Card</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary">
                      <input
                        type="radio"
                        name="payment"
                        value="mobile"
                        checked={paymentMethod === "mobile"}
                        onChange={(e) =>
                          setPaymentMethod(
                            e.target.value as "cash" | "card" | "mobile",
                          )
                        }
                      />
                      <span className="font-medium">Mobile Money</span>
                    </label>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2 font-semibold">
                      Total Amount
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      GH₵ {total.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 py-2 px-4 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePaymentComplete}
                      disabled={isProcessing}
                      className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Processing...' : 'Complete Payment'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center space-y-6">
                {completedSaleData.paymentMethod === 'cash' ? (
                  <>
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        Payment Successful!
                      </h3>
                      <p className="text-muted-foreground font-medium">
                        The transaction has been safely recorded in the database.
                      </p>
                    </div>
                  </>
                ) : completedSaleData.paymentVerified ? (
                  <>
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        Payment Confirmed!
                      </h3>
                      <p className="text-muted-foreground font-medium">
                        The payment has been verified and the sale is recorded.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 relative">
                      <Clock className="w-8 h-8" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        Awaiting Payment
                      </h3>
                      <p className="text-muted-foreground font-medium">
                        Download the receipt with the payment QR. This screen will update automatically once the customer pays.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 animate-pulse">
                        Checking payment status...
                      </p>
                    </div>
                  </>
                )}
                <ReceiptDownloader
                  completedSaleData={completedSaleData}
                  onDone={() => setShowPaymentModal(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}