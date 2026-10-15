/**
 * @file src/App.tsx
 * MarketNest — Nigeria's Premier Multi-Vendor Marketplace
 * Luxury Shopping Experience, Firebase Authentication, Master Seller Platform,
 * Affiliate Growth Engine, and Enterprise Admin Control Center.
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { MarketProvider, useMarket } from './context/MarketContext';
import { SellerProvider } from './context/SellerContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { GuestAuthModal } from './components/GuestAuthModal';
import { CompareTray } from './components/CompareTray';
import { ToastContainer } from './components/ui/ToastContainer';
import { ErrorBoundary } from './components/ErrorBoundary';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { SearchPage } from './pages/SearchPage';
import { ComparePage } from './pages/ComparePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { StoresPage } from './pages/StoresPage';
import { DealsPage } from './pages/DealsPage';
import { ShoppingAssistantPage } from './pages/ShoppingAssistantPage';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { AccountPage } from './pages/account/AccountPage';

import { SellLandingPage } from './pages/seller/SellLandingPage';
import { SellerOnboardingPage } from './pages/seller/SellerOnboardingPage';
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';
import { SellerProductFormPage } from './pages/seller/SellerProductFormPage';
import { StorefrontPage } from './pages/seller/StorefrontPage';

import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { PaymentCallbackPage } from './pages/payment/PaymentCallbackPage';
import { PaymentSuccessPage } from './pages/payment/PaymentSuccessPage';
import { PaymentFailedPage } from './pages/payment/PaymentFailedPage';
import { PaymentPendingPage } from './pages/payment/PaymentPendingPage';

import { AffiliateLandingPage } from './pages/affiliate/AffiliateLandingPage';
import { AffiliateApplyPage } from './pages/affiliate/AffiliateApplyPage';
import { AffiliateDashboardPage } from './pages/affiliate/AffiliateDashboardPage';
import { AffiliateLinksPage } from './pages/affiliate/AffiliateLinksPage';
import { AffiliateEarningsPage } from './pages/affiliate/AffiliateEarningsPage';
import { AffiliateAnalyticsPage } from './pages/affiliate/AffiliateAnalyticsPage';

import { AdminPage } from './pages/admin/AdminPage';

const AppContent: React.FC = () => {
  const { activePage } = useMarket();

  // Phase 7 & 8: Dedicated full-screen Admin Control Center shell
  if (activePage === 'admin') {
    return (
      <>
        <AdminPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#101413]">
      {/* WCAG AA Accessible Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#0E8F5A] focus:text-white focus:rounded-md focus:shadow-lg focus:font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E8F5A]"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {activePage === 'home' && <HomePage />}
        {activePage === 'shop' && <ShopPage />}
        {activePage === 'search' && <SearchPage />}
        {activePage === 'compare' && <ComparePage />}
        {activePage === 'product' && <ProductDetailPage />}
        {activePage === 'stores' && <StoresPage />}
        {activePage === 'deals' && <DealsPage />}
        {activePage === 'shopping-assistant' && <ShoppingAssistantPage />}

        {/* Phase 2: Customer Authentication & Account Routes */}
        {activePage === 'login' && <LoginPage />}
        {activePage === 'register' && <RegisterPage />}
        {activePage === 'forgot-password' && <ForgotPasswordPage />}
        {activePage === 'verify-email' && <VerifyEmailPage />}
        {activePage === 'account' && <AccountPage />}

        {/* Phase 3: Seller Platform Routes */}
        {(activePage === 'sell' || activePage === 'sell-on-marketnest') && <SellLandingPage />}
        {activePage === 'seller-onboarding' && <SellerOnboardingPage />}
        {(activePage === 'seller-dashboard' || activePage === 'seller-growth' || activePage === 'seller-insights') && <SellerDashboardPage />}
        {activePage === 'seller-product-new' && <SellerProductFormPage mode="new" />}
        {activePage === 'seller-product-edit' && <SellerProductFormPage mode="edit" />}
        {(activePage === 'seller-product-ai-assistant' || activePage === 'seller-ai-assistant') && (
          <SellerProductFormPage mode="edit" initialOpenAiAssistant={true} />
        )}
        {activePage === 'storefront' && <StorefrontPage />}

        {/* Phase 4 & 5: Core Commerce & Paystack Payment Routes */}
        {activePage === 'cart' && <CartPage />}
        {activePage === 'checkout' && <CheckoutPage />}
        {activePage === 'order-success' && <OrderSuccessPage />}
        {activePage === 'payment-callback' && <PaymentCallbackPage />}
        {activePage === 'payment-success' && <PaymentSuccessPage />}
        {activePage === 'payment-failed' && <PaymentFailedPage />}
        {activePage === 'payment-pending' && <PaymentPendingPage />}

        {/* Phase 6: Affiliate Platform Routes */}
        {activePage === 'affiliate' && <AffiliateLandingPage />}
        {activePage === 'affiliate-apply' && <AffiliateApplyPage />}
        {activePage === 'affiliate-dashboard' && <AffiliateDashboardPage />}
        {activePage === 'affiliate-links' && <AffiliateLinksPage />}
        {activePage === 'affiliate-earnings' && <AffiliateEarningsPage />}
        {activePage === 'affiliate-analytics' && <AffiliateAnalyticsPage />}
      </main>

      <Footer />

      {/* Overlays & Modals */}
      <CartDrawer />
      <QuickViewModal />
      <GuestAuthModal />
      <CompareTray />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminProvider>
          <MarketProvider>
            <SellerProvider>
              <AppContent />
            </SellerProvider>
          </MarketProvider>
        </AdminProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
