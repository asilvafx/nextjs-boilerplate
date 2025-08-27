// app/dashboard/components/modals/ProductModal.jsx
"use client"

import { useState } from 'react';

const ProductModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'product',
        inStock: true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'product',
            inStock: true
        });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="dashboard-modal-overlay">
            <div className="dashboard-modal">
                <div className="modal-header">
                    <h2 className="modal-title">Add New Product</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="dashboard-form">
                        <div className="form-group">
                            <label className="form-label">Product Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter product name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Enter product description"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label className="form-label">Price</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                >
                                    <option value="product">Product</option>
                                    <option value="service">Service</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="inStock"
                                    className="form-checkbox"
                                    checked={formData.inStock}
                                    onChange={(e) => handleInputChange('inStock', e.target.checked)}
                                />
                                <label htmlFor="inStock" className="form-label">In Stock</label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="button" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="button primary">
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
