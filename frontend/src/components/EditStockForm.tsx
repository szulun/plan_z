'use client';

import { useState } from 'react';
import { Stock } from '@/types';

interface EditStockFormProps {
  stock: Stock;
  onSave: (stock: Stock) => void;
  onClose: () => void;
}

export default function EditStockForm({ stock, onSave, onClose }: EditStockFormProps) {
  const [formData, setFormData] = useState({
    quantity: stock.quantity.toString(),
    purchasePrice: stock.purchasePrice.toString(),
    purchaseDate: stock.purchaseDate instanceof Date
      ? stock.purchaseDate.toISOString().split('T')[0]
      : new Date(stock.purchaseDate).toISOString().split('T')[0],
    targetPrice: stock.targetPrice?.toString() || '',
    notes: stock.notes || '',
    buyReason: stock.buyReason || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedStock: Stock = {
      ...stock,
      quantity: parseInt(formData.quantity),
      purchasePrice: parseFloat(formData.purchasePrice),
      purchaseDate: new Date(formData.purchaseDate),
      targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
      notes: formData.notes,
      buyReason: formData.buyReason,
    };

    onSave(updatedStock);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Quantity
        </label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Purchase Price
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.purchasePrice}
          onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Purchase Date
        </label>
        <input
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Target Price (Optional)
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.targetPrice}
          onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Buy Reason
        </label>
        <textarea
          value={formData.buyReason}
          onChange={(e) => setFormData({ ...formData, buyReason: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
} 