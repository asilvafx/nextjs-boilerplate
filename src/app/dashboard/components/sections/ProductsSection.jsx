// app/dashboard/components/sections/ProductsSection.jsx
"use client"
import ProductModal from '../modals/ProductModal';
import { DataTable, StatusBadge, ActionButtons, EmptyState } from '../common/Common';

const ProductsSection = ({ products }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [productList, setProductList] = useState(products);

    const handleAddProduct = (productData) => {
        const newProduct = {
            id: String(productList.length + 1).padStart(3, '0'),
            ...productData,
            stock: productData.category === 'service' ? 'N/A' : Math.floor(Math.random() * 200),
            price: `$${productData.price}`,
            status: 'active'
        };
        setProductList([...productList, newProduct]);
        setShowAddModal(false);
    };

    const handleEditProduct = (productId) => {
        console.log('Edit product:', productId);
    };

    const handleViewProduct = (productId) => {
        console.log('View product:', productId);
    };

    const handleDeleteProduct = (productId) => {
        setProductList(productList.filter(product => product.id !== productId));
    };

    return (
        <div className="fade-in">
            <div className="dashboard-card-header">
                <div>
                    <h1 className="dashboard-card-title">Products Management</h1>
                    <p className="dashboard-card-subtitle">Manage your product catalog</p>
                </div>
                <button
                    className="button primary"
                    onClick={() => setShowAddModal(true)}
                >
                    Add Product
                </button>
            </div>

            <div className="dashboard-card">
                {productList.length === 0 ? (
                    <EmptyState
                        icon="📦"
                        title="No Products Found"
                        description="Start by adding your first product to the catalog."
                        actionButton={
                            <button
                                className="button primary"
                                onClick={() => setShowAddModal(true)}
                            >
                                Add Your First Product
                            </button>
                        }
                    />
                ) : (
                    <DataTable headers={['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions']}>
                        {productList.map((product) => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>{product.price}</td>
                                <td>{product.stock}</td>
                                <td>
                                    <StatusBadge status={product.status} />
                                </td>
                                <td>
                                    <ActionButtons
                                        onEdit={() => handleEditProduct(product.id)}
                                        onView={() => handleViewProduct(product.id)}
                                        onDelete={() => handleDeleteProduct(product.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </DataTable>
                )}
            </div>

            <ProductModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleAddProduct}
            />
        </div>
    );
};

export default ProductsSection;
