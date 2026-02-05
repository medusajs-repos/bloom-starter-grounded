import ErrorBoundary from "@/components/error-boundary"
import Footer from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { CartProvider } from "@/lib/context/cart"
import { NavbarProvider } from "@/lib/context/navbar-context"
import { ToastProvider } from "@/lib/context/toast-context"
import { Outlet, useLocation } from "@tanstack/react-router"

const Layout = () => {
  const location = useLocation()
  const isCheckout = location.pathname.includes("/checkout")

  return (
    <ToastProvider>
      <CartProvider>
        <NavbarProvider>
          <div className="min-h-screen flex flex-col">
            {!isCheckout && <Navbar />}

            <main className="relative flex-1">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </main>

            {!isCheckout && (
              <div className="p-2 bg-white">
                <Footer />
              </div>
            )}
          </div>
        </NavbarProvider>
      </CartProvider>
    </ToastProvider>
  );
};

export default Layout;
