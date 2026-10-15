/**
 * @file src/pages/payment/PaymentCallbackPage.tsx
 * Secure payment callback handler.
 * Reads the Paystack reference, renders a verifying state,
 * and calls trusted server-side verification before advancing.
 */

import React, { useEffect, useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { verifyPaymentSession } from '../../services/payments/paymentService';
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const PaymentCallbackPage: React.FC = () => {
  const { navigateTo, clearCart, showToast } = useMarket();
  const [reference, setReference] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Parse reference from window.location.search
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference') || params.get('trxref') || '';
    setReference(ref);

    if (!ref) {
      setVerifying(false);
      setErrorMessage('No payment reference found in the callback URL.');
      return;
    }

    // Call server-side verification
    verifyPaymentSession(ref)
      .then((res) => {
        if (res.status === 'success') {
          // Clear cart now that payment is confirmed
          clearCart();
          showToast('Payment Verified', `Order ${res.orderNumber} confirmed.`, 'success');
          // Navigate to success page
          navigateTo('payment-success', {
            orderId: res.orderId,
            search: ref
          });
        } else {
          setVerifying(false);
          setErrorMessage(res.error || 'Payment could not be verified by Paystack.');
        }
      })
      .catch((err) => {
        setVerifying(false);
        setErrorMessage(err.message || 'Network error during verification.');
      });
  }, []);

  const handleRetryVerification = () => {
    if (!reference) return;
    setVerifying(true);
    setErrorMessage(null);
    verifyPaymentSession(reference)
      .then((res) => {
        if (res.status === 'success') {
          clearCart();
          navigateTo('payment-success', { orderId: res.orderId, search: reference });
        } else {
          setVerifying(false);
          setErrorMessage(res.error || 'Verification failed.');
        }
      })
      .catch((err) => {
        setVerifying(false);
        setErrorMessage(err.message || 'Verification failed.');
      });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white border border-[#E4E7E5] rounded-2xl p-8 text-center space-y-6 shadow-sm animate-in fade-in">
        {verifying ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[#101413] tracking-tight">
                Verifying your payment...
              </h2>
              <p className="text-xs text-[#6B726E] leading-relaxed">
                Confirming transaction status with the Paystack gateway and finalizing your order escrow.
              </p>
            </div>

            {reference && (
              <div className="inline-block px-3 py-1.5 rounded-full bg-[#F7F5F0] border border-[#E4E7E5] text-[11px] font-mono font-bold text-[#101413]">
                Ref: {reference}
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6B726E]">
              <ShieldCheck className="w-4 h-4 text-[#0E8F5A]" />
              <span>Bank-grade cryptographic verification</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#101413]">
                Payment wasn't completed.
              </h2>
              <p className="text-xs text-[#6B726E] leading-relaxed">
                {errorMessage || 'Your payment could not be confirmed. Your order has not been marked as paid.'}
              </p>
            </div>

            {reference && (
              <div className="p-3 bg-[#F7F5F0] rounded-xl text-left text-xs space-y-1">
                <span className="text-[#6B726E] text-[10px] block">PAYMENT REFERENCE</span>
                <span className="font-mono font-bold text-[#101413]">{reference}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={handleRetryVerification}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Retry Verification
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="md"
                onClick={() => navigateTo('checkout')}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
