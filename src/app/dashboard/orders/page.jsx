"use client"

import { useState, useEffect } from 'react';
import { DataTable, StatusBadge } from '../components/common/Common';
import { getAll } from '@/lib/query.js';
import { Eye, Edit3, Trash2, FileText, Truck, X, Check, AlertTriangle } from 'lucide-react';

// Enhanced PDF Generator
const generatePDF = (order) => {
    // This would use jsPDF - for demo purposes, we'll simulate the functionality
    console.log('Generating PDF for order:', order.uid);

    // In real implementation, you'd use your existing generatePDF function
    // For demo, we'll create a mock download
    const mockPDFContent = `Invoice for Order ${order.uid}\nCustomer: ${order.cst_name}\nAmount: €${order.amount}`;
    const blob = new Blob([mockPDFContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.uid}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-2xl",
        lg: "max-w-4xl",
        xl: "max-w-6xl"
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
                <div className={`inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

const DashboardOrders = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [editForm, setEditForm] = useState({});

    // Mock data for demo - replace with your actual data fetching
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {

        const ordersData = await getAll('orders', true);
        console.log(ordersData);


        //setOrders(ordersData.data);
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = typeof timestamp === 'number'
            ? new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000)
            : new Date(timestamp);
        return date.toLocaleDateString('fr-FR');
    };

    const formatCurrency = (amount, currency = 'eur') => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount);
    };

    const parseJSON = (jsonString, fallback = {}) => {
        try {
            return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString || fallback;
        } catch {
            return fallback;
        }
    };

    const handlePreview = (order) => {
        setSelectedOrder(order);
        setIsPreviewOpen(true);
    };

    const handleEdit = (order) => {
        setSelectedOrder(order);
        setEditForm({
            status: order.status,
            tracking: order.tracking || '',
            delivery_notes: order.delivery_notes || ''
        });
        setIsEditOpen(true);
    };

    const handleDelete = (order) => {
        setSelectedOrder(order);
        setDeleteConfirmation('');
        setIsDeleteOpen(true);
    };

    const handleInvoice = (order) => {
        setSelectedOrder(order);
        setIsInvoiceOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteConfirmation === 'delete') {
            try {
                // Here you would call your delete API
                // await deleteItem('orders', selectedOrder.id);
                setOrders(orders.filter(o => o.id !== selectedOrder.id));
                setIsDeleteOpen(false);
                setSelectedOrder(null);
                console.log('Order deleted:', selectedOrder.uid);
            } catch (error) {
                console.error('Error deleting order:', error);
            }
        }
    };

    const saveEdit = async () => {
        try {
            // Here you would call your update API
            // await updateItem('orders', selectedOrder.id, editForm);
            setOrders(orders.map(o =>
                o.id === selectedOrder.id
                    ? { ...o, ...editForm }
                    : o
            ));
            setIsEditOpen(false);
            console.log('Order updated:', selectedOrder.uid, editForm);
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const OrderPreview = ({ order }) => {
        const items = parseJSON(order.items, []);
        const address = parseJSON(order.shipping_address, {});

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-900">Informations de commande</h4>
                            <div className="mt-2 space-y-1 text-sm">
                                <p><span className="font-medium">ID:</span> {order.uid}</p>
                                <p><span className="font-medium">Date:</span> {formatDate(order.created_at)}</p>
                                <p><span className="font-medium">Statut:</span> <StatusBadge status={order.status} /></p>
                                <p><span className="font-medium">Méthode:</span> {order.method}</p>
                                <p><span className="font-medium">Transaction:</span> {order.tx}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900">Client</h4>
                            <div className="mt-2 space-y-1 text-sm">
                                <p><span className="font-medium">Nom:</span> {order.cst_name}</p>
                                <p><span className="font-medium">Email:</span> {order.cst_email}</p>
                                {address.phone && <p><span className="font-medium">Téléphone:</span> {address.phone}</p>}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900">Livraison</h4>
                            <div className="mt-2 space-y-1 text-sm">
                                {address.street && <p>{address.street}</p>}
                                {address.apartment && <p>{address.apartment}</p>}
                                {(address.city || address.zip) && <p>{address.zip} {address.city}</p>}
                                {address.state && <p>{address.state}</p>}
                                {address.country && <p>{address.country}</p>}
                                {order.tracking && <p><span className="font-medium">Suivi:</span> {order.tracking}</p>}
                                {order.delivery_notes && <p><span className="font-medium">Notes:</span> {order.delivery_notes}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-900">Articles</h4>
                            <div className="mt-2 space-y-2">
                                {items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                                            <p className="text-sm text-gray-600">{formatCurrency(item.price)} × {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-gray-900">Récapitulatif</h4>
                            <div className="mt-2 space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Sous-total:</span>
                                    <span>{formatCurrency(parseFloat(order.subtotal || 0))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Livraison:</span>
                                    <span>{formatCurrency(order.shipping || 0)}</span>
                                </div>
                                <div className="flex justify-between font-semibold border-t pt-2">
                                    <span>Total:</span>
                                    <span>{formatCurrency(order.amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const OrderEdit = ({ order, form, setForm }) => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Statut de la commande</label>
                <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="processing">En cours</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                    <option value="refunded">Remboursée</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Numéro de suivi</label>
                <input
                    type="text"
                    value={form.tracking}
                    onChange={(e) => setForm({ ...form, tracking: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Ex: FR123456789"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Notes de livraison</label>
                <textarea
                    value={form.delivery_notes}
                    onChange={(e) => setForm({ ...form, delivery_notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Instructions spéciales pour la livraison..."
                />
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                    Annuler
                </button>
                <button
                    onClick={saveEdit}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    Enregistrer
                </button>
            </div>
        </div>
    );

    const InvoiceViewer = ({ order }) => (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-lg border" style={{ fontFamily: 'Arial, sans-serif' }}>
                <div className="border-b pb-4 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold">LOST-FOREVER</h1>
                            <p className="text-gray-600">www.lost-forever.com</p>
                            <p className="text-gray-600">Boutique de vêtements</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold">FACTURE</h2>
                            <p>N° {order.uid}</p>
                            <p>{formatDate(order.created_at)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                        <h3 className="font-semibold mb-2">INFORMATIONS CLIENT</h3>
                        <p>{order.cst_name}</p>
                        <p>{order.cst_email}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">ADRESSE DE LIVRAISON</h3>
                        {(() => {
                            const address = parseJSON(order.shipping_address, {});
                            return (
                                <>
                                    <p>{address.name || order.cst_name}</p>
                                    {address.street && <p>{address.street}</p>}
                                    {(address.zip || address.city) && <p>{address.zip} {address.city}</p>}
                                    {address.country && <p>{address.country}</p>}
                                </>
                            );
                        })()}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-4">DÉTAIL DE LA COMMANDE</h3>
                    <table className="w-full">
                        <thead>
                        <tr className="border-b">
                            <th className="text-left py-2">Article</th>
                            <th className="text-center py-2">Qté</th>
                            <th className="text-right py-2">Prix U.</th>
                            <th className="text-right py-2">Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {parseJSON(order.items, []).map((item, index) => (
                            <tr key={index} className="border-b">
                                <td className="py-2">{item.name}</td>
                                <td className="text-center py-2">{item.quantity}</td>
                                <td className="text-right py-2">{formatCurrency(item.price)}</td>
                                <td className="text-right py-2">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end">
                    <div className="w-64">
                        <div className="flex justify-between py-1">
                            <span>Sous-total:</span>
                            <span>{formatCurrency(parseFloat(order.subtotal || 0))}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span>Frais de port:</span>
                            <span>{formatCurrency(order.shipping || 0)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span>TVA (20%):</span>
                            <span>Incluse</span>
                        </div>
                        <div className="flex justify-between py-2 border-t font-semibold">
                            <span>TOTAL:</span>
                            <span>{formatCurrency(order.amount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => window.print()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                    Imprimer
                </button>
                <button
                    onClick={() => generatePDF(order)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    Télécharger PDF
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="dashboard-card">
                <div className="dashboard-card-header">
                    <div>
                        <h1 className="dashboard-card-header">Gestion des Commandes</h1>
                        <p className="dashboard-card-subtitle">
                            Suivre et gérer les commandes clients ({orders.length} total)
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    {orders.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucune commande trouvée.</p>
                    ) : (
                        <DataTable headers={['Commande', 'Client', 'Produit', 'Montant', 'Date', 'Statut', 'Actions']}>
                            {orders.map((order) => (
                                <tr key={order.key} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                        #{order.uid}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.cst_name}</div>
                                        <div className="text-sm text-gray-500">{order.cst_email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {parseJSON(order.items, [])[0]?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(order.amount, order.currency)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handlePreview(order)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Voir les détails"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(order)}
                                                className="text-green-600 hover:text-green-900"
                                                title="Modifier"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleInvoice(order)}
                                                className="text-purple-600 hover:text-purple-900"
                                                title="Facture"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(order)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </DataTable>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            <Modal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title={`Détails de la commande ${selectedOrder?.uid}`}
                size="lg"
            >
                {selectedOrder && <OrderPreview order={selectedOrder} />}
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title={`Modifier la commande ${selectedOrder?.uid}`}
            >
                {selectedOrder && (
                    <OrderEdit
                        order={selectedOrder}
                        form={editForm}
                        setForm={setEditForm}
                    />
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Confirmer la suppression"
            >
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                        <div>
                            <p className="text-sm text-gray-900">
                                Vous êtes sur le point de supprimer définitivement la commande{' '}
                                <span className="font-mono font-medium">{selectedOrder?.uid}</span>.
                            </p>
                            <p className="text-sm text-gray-600">Cette action est irréversible.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tapez <span className="font-mono bg-gray-100 px-1 rounded">delete</span> pour confirmer:
                        </label>
                        <input
                            type="text"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            placeholder="delete"
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setIsDeleteOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={deleteConfirmation !== 'delete'}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Supprimer définitivement
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Invoice Modal */}
            <Modal
                isOpen={isInvoiceOpen}
                onClose={() => setIsInvoiceOpen(false)}
                title={`Facture ${selectedOrder?.uid}`}
                size="xl"
            >
                {selectedOrder && <InvoiceViewer order={selectedOrder} />}
            </Modal>
        </div>
    );
};

export default DashboardOrders;
