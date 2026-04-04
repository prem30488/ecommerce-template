import React from 'react'


const Product = ({ product, compare }) => {
    const categoryLabel = product.Category?.title || product.category || (product.categories?.length ? product.categories.map(c => c.title).join(', ') : 'Uncategorized');
    const formLabel = product.Form?.title || (product.form ? (typeof product.form === 'string' ? product.form : `Form #${product.form}`) : (product.formId ? `Form #${product.formId}` : 'No form'));

    return (
        <div key={product.id} className="col-sm-6 col-md-3">
            <div className={"product " + (product.compare ? "compare" : "")} >
                <img src={product.img} alt={product.title} />
                <div className="image_overlay" />
                <div className="view_details" onClick={() => compare(product)}>
                    {product.compare ? "Remove" : "Compare"}
                </div>
                <div className="stats">
                    <div className="stats-container">
                        <span className="product_price">{product.price}</span>
                        <span className="product_name">{product.title}</span>
                        <p>{product.description}</p>
                        <p className="product_category">Category: {categoryLabel}</p>
                        <p className="product_form">Form: {formLabel}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Product
