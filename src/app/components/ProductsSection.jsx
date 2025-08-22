const ProductsSection = () => {
    const products = [
        { name: "Tarot Reading Guide", price: "€15", description: "Complete beginner's guide to understanding tarot cards." },
        { name: "Crystal Set Bundle", price: "€45", description: "Curated collection of healing crystals for meditation." },
        { name: "Spiritual Journal", price: "€25", description: "Guided journal for spiritual growth and self-reflection." },
        { name: "Meditation Audio Pack", price: "€30", description: "Personalized meditation recordings for daily practice." }
    ];

    return (
        <div className="card">
            <div id="products">
                <h3>Products</h3>
                <div className="products-grid">
                    {products.map((product, index) => (
                        <div key={index} className="product-card">
                            <h4>
                                {product.name} <span className="price">{product.price}</span>
                            </h4>
                            <p className="text-xs">{product.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductsSection;
