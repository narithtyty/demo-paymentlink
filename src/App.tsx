/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Settings, 
  ExternalLink, 
  Copy, 
  Check, 
  QrCode, 
  Info, 
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Globe,
  Layout,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentPayload {
  merchantId: string;
  orderId: string;
  amount: number;
  currency: string;
  reference?: string;
  description?: string;
  returnUrl?: string;
  callbackUrl?: string;
  iat?: number;
  exp?: number;
}

export default function App() {
  // Merchant Settings
  const [merchantId, setMerchantId] = useState('EPOS_TEST_001');
  const [secretKey, setSecretKey] = useState('your_secret_key_here');
  const [cashierUrl, setCashierUrl] = useState('https://new-ops-poc.inet.co.th/private-payment-cashier/checkout');
  const [showSettings, setShowSettings] = useState(false);

  // Payment Details
  const [orderId, setOrderId] = useState(`ORD-${Math.floor(Date.now() / 1000)}`);
  const [amount, setAmount] = useState(1.00);
  const [currency] = useState('THB');
  const [description, setDescription] = useState('Demo Payment for Services');
  const [returnUrl, setReturnUrl] = useState(window.location.origin + '/success');
  const [callbackUrl, setCallbackUrl] = useState(window.location.origin + '/api/webhook');

  // Result State
  const [jwt, setJwt] = useState('');
  const [fullUrl, setFullUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'link' | 'iframe' | 'json'>('link');

  const generateLink = async () => {
    setLoading(true);
    setError('');

    try {
      const payload: PaymentPayload = {
        merchantId,
        orderId,
        amount,
        currency,
        description,
        returnUrl,
        callbackUrl,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
      };

      const response = await fetch('/api/create-payment-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, secretKey }),
      });

      if (!response.ok) throw new Error('Failed to generate secure token');

      const data = await response.json();
      const token = data.token;
      
      const newUrl = `${cashierUrl}?token=${token}`;
      setJwt(token);
      setFullUrl(newUrl);
      
      // Open in new tab
      window.open(newUrl, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden p-8"
      >
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-lg shadow-blue-200">
            <CreditCard size={32} />
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tight leading-tight">Secure Payment</h1>
            <p className="text-sm text-gray-400 font-medium tracking-tight">EPOS e-Cashier Gateway</p>
          </div>
        </div>

        <nav className="space-y-6">
          {/* Payment Details Section */}
          <section className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Order Reference</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={orderId} 
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="Order ID"
                />
                <button 
                  onClick={() => setOrderId(`ORD-${Math.floor(Date.now() / 1000)}`)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                  title="Generate new ID"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Amount (THB)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all pl-12"
                  placeholder="0.00"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">฿</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
              <input 
                type="text"
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                placeholder="Product description..."
              />
            </div>
          </section>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 rounded-2xl p-4 text-xs text-red-600 font-medium flex items-start gap-2"
            >
              <Info size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="space-y-3 pt-2">
            <button 
              onClick={generateLink}
              disabled={loading}
              className={`w-full py-4 rounded-[1.25rem] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg ${
                loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              {loading ? 'Encrypting...' : 'Generate & Pay Now'}
            </button>

            {fullUrl && (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => copyToClipboard(fullUrl)}
                  className="py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-gray-200"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
                <a 
                  href={fullUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-gray-200"
                >
                  <ExternalLink size={14} />
                  Open Tab
                </a>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
            <ShieldCheck size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Secure AES-256 Protocol</span>
          </div>
        </nav>
      </motion.div>
    </div>
  );
}

