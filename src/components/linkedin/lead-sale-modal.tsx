// Add this component to your Leads Dashboard
// You can trigger it when clicking a "Convert to Sale" button

'use client';

import React, { useState, useEffect } from 'react';
import { X, DollarSign,} from 'lucide-react';

interface ConvertLeadModalProps {
  lead: {
    id: string;
    email: string;
    phone: string | null;
    name: string;
    headline: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({ lead, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [consultants, setConsultants] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    customerName: lead.name,
    customerEmail: lead.email,
    customerPhone: lead.phone || '',
    packageType: 'STANDARD',
    agentId: '',
    paymentMethod: 'card',
    notes: '',
  });

  useEffect(() => {
    // Fetch consultants
    fetch('/api/sales')
      .then(res => res.json())
      .then(data => setConsultants(data.consultants || []))
      .catch(console.error);
  }, []);

  const packageOptions = [
    { value: 'STANDARD', label: 'Standard (5-7 days)', price: 2000, description: 'Perfect for regular timeline' },
    { value: 'PRIORITY', label: 'Priority (3-4 days)', price: 2500, description: 'Faster turnaround' },
    { value: 'URGENT', label: 'Urgent (1-2 days)', price: 3000, description: 'Rush service' },
  ];

  const selectedPackage = packageOptions.find(p => p.value === formData.packageType)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          ...formData,
          amount: selectedPackage.price,
          agentName: consultants.find(c => c.id === formData.agentId)?.name || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create sale');

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Failed to create sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Convert Lead to Sale</h2>
            <p className="text-sm text-gray-600 mt-1">{lead.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Customer Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+27 XX XXX XXXX"
              />
            </div>
          </div>

          {/* Package Selection with Stripe Checkout */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Select Package</h3>
            <p className="text-sm text-gray-600">
              Choose a package and proceed to secure Stripe checkout
            </p>
            
            <div className="space-y-3">
              {packageOptions.map((pkg) => (
                <label
                  key={pkg.value}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.packageType === pkg.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="packageType"
                    value={pkg.value}
                    checked={formData.packageType === pkg.value}
                    onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{pkg.label}</span>
                      <span className="text-lg font-bold text-green-600">
                        R{pkg.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <span className="text-2xl">💳</span>
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Secure Payment with Stripe</p>
                <p>After clicking Proceed to Checkout, you&apos;ll be redirected to Stripe&apos;s secure payment page to complete your purchase.</p>
              </div>
            </div>
          </div>

          {/* Agent Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to Agent
            </label>
            <select
              value={formData.agentId}
              onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {consultants.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="card">Credit/Debit Card</option>
              <option value="eft">EFT/Bank Transfer</option>
              <option value="payfast">PayFast</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add any special requirements or notes..."
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Package:</span>
                <span className="font-medium">{selectedPackage.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timeline:</span>
                <span className="font-medium">{selectedPackage.description}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-semibold text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">
                  R{selectedPackage.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Create Sale
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertLeadModal;