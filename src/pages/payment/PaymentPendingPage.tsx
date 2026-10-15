/**
 * @file src/pages/payment/PaymentPendingPage.tsx
 * Pending payment screen for asynchronous payment methods (Bank Transfer, USSD).
 * Warns against duplicate submissions, displays reference and order number,
 * and allows status polling via "Refresh Status".
 */

import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { fetchPaymentStatus, verifyPaymentSession } from '../../services/payments/paymentService';
import { Clock, RefreshCw, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const PaymentPendingPage: React.FC = () => {
  const { navigateTo, searchQuery, selectedOrderId, showToast } = useMarket();
  const [checking, setChecking] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Awaiting confirmation from bank...');

  const reference = searchQuery || 'MN-PAY-PENDING';

  const handleRefreshStatus = async () => {
    setChecking(true);
    setStatusMessage('Querying Paystack gateway...');
    try {
      const res = await verifyPaymentSession(reference);
      if (res.status === 'success') {
        showToast('Payment Verified', 'Your payment has been confirmed.', 'success');
        navigateTo('payment-success', { orderId: res.orderId, search: reference });
      } else {
        const polled = await fetchPaymentStatus(reference);
        if (polled.status === 'paid') {
          navigateTo('payment-success', { orderId: polled.orderId, search: reference });
        } else {
          setStatusMessage('Payment is still awaiting clearance from your bank. Please hold on.');
          showToast('Payment Pending', 'Transaction is still processing.', 'info');
        }
      }
    } catch (e: any) {
      setStatusMessage('Still confirming. Please check again in a moment.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-8 animate-in fade-in">
      <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50">
        <Clock className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#101413] tracking-tight">
          We're confirming your payment.
        </h1>
        <p className="text-sm text-[#6B726E] max-w-md mx-auto leading-relaxed">
          Bank transfers and USSD payments may take a few moments to reconcile. Please do not submit another payment.
        </p>
      </div>

      {/* Transaction Identifiers */}
      <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-2xl p-6 text-left space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3 text-xs">
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

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{statusMessage}</span>
        </div>

        <div className="flex items-center gap-2 text-[#0E8F5A] text-xs font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Your cart and reserved items are held securely during verification.</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          disabled={checking}
          onClick={handleRefreshStatus}
          leftIcon={<RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />}
        >
          {checking ? 'Checking Status...' : 'Refresh Status'}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => navigateTo('account', { tab: 'orders' })}
        >
          View in My Orders
        </Button>
      </div>
    </div>
  );
};
