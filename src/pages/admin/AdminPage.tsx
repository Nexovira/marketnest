/**
 * @file src/pages/admin/AdminPage.tsx
 * MarketNest Admin Control Center Master Shell.
 * Integrates enterprise layout, dense operational navigation, role switcher,
 * confirmation dialogs, global search, and sub-page route mounting.
 */

import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

// Admin Sub-pages
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminAnalyticsPage } from './AdminAnalyticsPage';
import { AdminReportsPage } from './AdminReportsPage';
import { AdminAuditLogsPage } from './AdminAuditLogsPage';
import { AdminOrdersPage } from './AdminOrdersPage';
import { AdminPaymentsPage } from './AdminPaymentsPage';
import { AdminRefundsPage } from './AdminRefundsPage';
import { AdminReturnsPage } from './AdminReturnsPage';
import { AdminProductsPage } from './AdminProductsPage';
import { AdminReviewsPage } from './AdminReviewsPage';
import { AdminCategoriesPage } from './AdminCategoriesPage';
import { AdminStoresPage } from './AdminStoresPage';
import { AdminSellersPage } from './AdminSellersPage';
import { AdminSellerApplicationsPage } from './AdminSellerApplicationsPage';
import { AdminAffiliatesPage } from './AdminAffiliatesPage';
import { AdminAffiliateApplicationsPage } from './AdminAffiliateApplicationsPage';
import { AdminCustomersPage } from './AdminCustomersPage';
import { AdminMessagesPage } from './AdminMessagesPage';
import { AdminCommissionsPage } from './AdminCommissionsPage';
import { AdminPayoutsPage } from './AdminPayoutsPage';
import { AdminPromotionsPage } from './AdminPromotionsPage';
import { AdminSettingsPage } from './AdminSettingsPage';
import { AdminLaunchReadinessPage } from './AdminLaunchReadinessPage';
import { AdminOperationsPage } from './AdminOperationsPage';
import { AdminSupportPage } from './AdminSupportPage';
import { AdminAiInsightsPage } from './AdminAiInsightsPage';
import { AdminScalabilityPage } from './AdminScalabilityPage';
import { AdminBusinessIntelligencePage } from './AdminBusinessIntelligencePage';
import { AdminReconciliationPage } from './AdminReconciliationPage';
import { AdminRiskPage } from './AdminRiskPage';
import { AdminMarketingPage } from './AdminMarketingPage';

// Admin Shell Components
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { AdminSearchModal } from './components/AdminSearchModal';
import { AdminConfirmModal } from './components/AdminConfirmModal';
import { AdminAccessGate } from './components/AdminAccessGate';

export const AdminPage: React.FC = () => {
  const { activeSection, isAdminVerified } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Security Gate: Ensure only verified administrators can view the Control Center
  if (!isAdminVerified) {
    return <AdminAccessGate />;
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col font-sans">
      {/* Dense Operational Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Operational Bar */}
        <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Dynamic Section Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeSection === 'dashboard' && <AdminDashboardPage />}
          {activeSection === 'operations' && <AdminOperationsPage />}
          {(activeSection === 'business-intelligence' ||
            activeSection === 'sales-analytics' ||
            activeSection === 'customer-analytics' ||
            activeSection === 'seller-analytics' ||
            activeSection === 'affiliate-analytics' ||
            activeSection === 'product-analytics' ||
            activeSection === 'marketing-analytics') && <AdminBusinessIntelligencePage />}
          {activeSection === 'reconciliation' && <AdminReconciliationPage />}
          {(activeSection === 'scalability' || activeSection === 'regions') && <AdminScalabilityPage />}
          {(activeSection === 'insights' || activeSection === 'ai-usage') && <AdminAiInsightsPage />}
          {activeSection === 'launch-readiness' && <AdminLaunchReadinessPage />}
          {activeSection === 'analytics' && <AdminAnalyticsPage />}
          {activeSection === 'reports' && <AdminReportsPage />}
          {activeSection === 'audit-logs' && <AdminAuditLogsPage />}

          {/* Commerce & Risk */}
          {(activeSection === 'risk' ||
            activeSection === 'risk-cases' ||
            activeSection === 'disputes' ||
            activeSection === 'seller-governance' ||
            activeSection === 'affiliate-integrity') && <AdminRiskPage />}
          {activeSection === 'orders' && <AdminOrdersPage />}
          {activeSection === 'payments' && <AdminPaymentsPage />}
          {activeSection === 'refunds' && <AdminRefundsPage />}
          {activeSection === 'returns' && <AdminReturnsPage />}

          {/* Catalog & Stores */}
          {activeSection === 'products' && <AdminProductsPage />}
          {activeSection === 'reviews' && <AdminReviewsPage />}
          {activeSection === 'categories' && <AdminCategoriesPage />}
          {activeSection === 'stores' && <AdminStoresPage />}

          {/* Merchants & Partners */}
          {activeSection === 'sellers' && <AdminSellersPage />}
          {activeSection === 'seller-applications' && <AdminSellerApplicationsPage />}
          {activeSection === 'affiliates' && <AdminAffiliatesPage />}
          {activeSection === 'affiliate-applications' && <AdminAffiliateApplicationsPage />}

          {/* Users & Support */}
          {activeSection === 'customers' && <AdminCustomersPage />}
          {activeSection === 'support' && <AdminSupportPage />}
          {activeSection === 'messages' && <AdminMessagesPage />}

          {/* Settlements & Governance */}
          {activeSection === 'marketing' && <AdminMarketingPage />}
          {activeSection === 'commissions' && <AdminCommissionsPage />}
          {activeSection === 'affiliate-commissions' && <AdminCommissionsPage />}
          {activeSection === 'payouts' && <AdminPayoutsPage />}
          {activeSection === 'promotions' && <AdminPromotionsPage />}
          {activeSection === 'settings' && <AdminSettingsPage />}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <AdminSearchModal />
      <AdminConfirmModal />
    </div>
  );
};
export default AdminPage;
