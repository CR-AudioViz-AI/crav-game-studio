'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Coins,
  Check,
  Sparkles,
  ArrowLeft,
  Shield,
  Zap,
  Gift,
  Crown,
  ChevronRight
} from 'lucide-react';
import { ECOSYSTEM_CONFIG } from '@/lib/ecosystem';

export default function CreditsPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>('creator');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  const packages = ECOSYSTEM_CONFIG.creditPackages;
  const costs = ECOSYSTEM_CONFIG.gameCosts;

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    
    try {
      if (paymentMethod === 'stripe') {
        const res = await fetch('/api/payments/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: selectedPackage }),
        });
        const { url } = await res.json();
        if (url) window.location.href = url;
      } else {
        // PayPal flow would be similar
        alert('PayPal integration coming soon!');
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/30 to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-400" />
            Purchase Credits
          </h1>
          <div className="w-32" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 bg-yellow-500/20 rounded-2xl mb-6"
          >
            <Coins className="w-16 h-16 text-yellow-400" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">Universal Credits</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            One credit system for the entire CR AudioViz AI ecosystem.
            Use credits across Game Studio, Video Tools, Image Generation, and more!
          </p>
        </div>

        {/* What Credits Buy */}
        <div className="mb-12 p-6 bg-white/5 rounded-2xl border border-white/10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            What Credits Get You in Game Studio
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {Object.entries(costs).map(([key, value]) => (
              <div key={key} className="text-center p-3 bg-black/30 rounded-xl">
                <div className="text-2xl font-bold text-yellow-400">{value}</div>
                <div className="text-xs text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Package Selection */}
        <div className="grid md:grid-cols-5 gap-4 mb-12">
          {packages.map((pkg, i) => (
            <motion.button
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`relative p-6 rounded-2xl border text-center transition-all ${
                selectedPackage === pkg.id
                  ? 'bg-purple-600/20 border-purple-500 scale-105'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-black">
                  MOST POPULAR
                </div>
              )}
              
              {pkg.id === 'enterprise' && (
                <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              )}

              <div className="text-3xl font-bold mb-1">{pkg.credits.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mb-3">credits</div>
              
              {pkg.bonus > 0 && (
                <div className="text-sm text-green-400 mb-2 flex items-center justify-center gap-1">
                  <Gift className="w-4 h-4" />
                  +{pkg.bonus} bonus
                </div>
              )}
              
              <div className="text-2xl font-bold">${pkg.price}</div>
              <div className="text-xs text-gray-500">
                ${(pkg.price / (pkg.credits + pkg.bonus)).toFixed(3)}/credit
              </div>

              {selectedPackage === pkg.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Payment Method */}
        <div className="max-w-xl mx-auto">
          <h3 className="text-lg font-bold mb-4 text-center">Payment Method</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setPaymentMethod('stripe')}
              className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                paymentMethod === 'stripe'
                  ? 'bg-purple-600/20 border-purple-500'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <CreditCard className="w-6 h-6" />
              <span className="font-semibold">Credit Card</span>
            </button>
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                paymentMethod === 'paypal'
                  ? 'bg-blue-600/20 border-blue-500'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <span className="text-2xl">🅿️</span>
              <span className="font-semibold">PayPal</span>
            </button>
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || isProcessing}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Purchase {selectedPackage && packages.find(p => p.id === selectedPackage)?.credits.toLocaleString()} Credits
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-400">Secure Payment</h4>
              <p className="text-sm text-gray-400">
                All payments are processed securely through Stripe. We never store your card details.
                Your purchase is protected by 256-bit SSL encryption.
              </p>
            </div>
          </div>

          {/* Credits Never Expire */}
          <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <h4 className="font-semibold text-purple-400 mb-1">Credits Never Expire!</h4>
            <p className="text-sm text-gray-400">
              Unlike other platforms, your purchased credits never expire on paid plans.
              Use them whenever you want across the entire CR AudioViz AI ecosystem.
            </p>
          </div>
        </div>

        {/* Cross-sell */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Use Credits Across the Ecosystem
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {ECOSYSTEM_CONFIG.products.slice(0, 8).map((product, i) => (
              <motion.a
                key={product.id}
                href={product.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all flex items-center gap-3"
              >
                <span className="text-3xl">{product.icon}</span>
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-xs text-gray-500">{product.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 ml-auto" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {[
              {
                q: 'What can I do with credits?',
                a: 'Credits are used across all CR AudioViz AI products. In Game Studio, use them to create games, publish to marketplace, generate AI assets, and more.',
              },
              {
                q: 'Do credits expire?',
                a: 'No! On paid plans, your credits never expire. Use them whenever you need them.',
              },
              {
                q: 'Can I use credits across different apps?',
                a: 'Yes! Credits work across the entire CR AudioViz AI ecosystem - Game Studio, Video Tools, Image Generation, Document Creator, and more.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, MasterCard, American Express) through Stripe, and PayPal.',
              },
              {
                q: 'Can I get a refund?',
                a: 'Unused credits are eligible for refund within 30 days of purchase. Contact support@craudiovizai.com.',
              },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-gray-400 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
