/**
 * @file src/pages/payment/PaymentFailedPage.tsx
 * Premium failed payment recovery page.
 * Provides transparent error reasoning, reference, order number, support helpline,
 * and seamless retry CTA.
 */

import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { AlertTriangle, ArrowLeft, RefreshCw, HelpCircle, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const PaymentFailedPage: React.FC = () => {
  const { navigateTo, searchQuery, selectedOrderId } = useMarket();

  // Reference or reason passed in search
  const reference = searchQuery || 'N/A';

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-8 animate-in fade-in">
      <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#101413] tracking-tight">
          Payment wasn't completed.
        </h1>
        <p className="text-sm text-[#6B726E] max-w-md mx-auto leading-relaxed">
          Your payment could not be confirmed. Your order has not been marked as paid and no funds were captured.
        </p>
      </div>

      {/* Support & Diagnostics Box */}
      <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-2xl p-6 text-left space-y-4 text-xs">
        <h3 className="font-bold text-[#101413] flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#0E8F5A]" />
          <span>Transaction Details & Support</span>
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs border-t border-[#E4E7E5] pt-3">
          <div>
            <span className="text-[#6B726E] text-[11px] block">PAYMENT REFERENCE</span>
            <span className="font-mono font-bold text-[#101413]">{reference}</span>
          </div>
          {selectedOrderId && (
            <div>
              <span className="text-[#6B726E] text-[11px] block">ORDER ID</span>
              <span className="font-mono font-bold text-[#101413]">{selectedOrderId}</span>
            </div>
          )}
        </div>

        <p className="text-[#6B726E] text-[11px] leading-relaxed pt-1">
          If your card was debited by your bank, Paystack will automatically reverse the transaction, or you may reach our 24/7 Lagos support desk with the reference above.
        </p>

        <div className="pt-2 flex items-center gap-2 text-[#0E8F5A] font-medium text-xs">
          <Mail className="w-3.5 h-3.5" />
          <span>support@marketnest.ng · +234 (01) 800-NEST</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigateTo('checkout')}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Try Payment Again
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => navigateTo('cart')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Return to Cart
        </Button>
      </div>
    </div>
  );
};
