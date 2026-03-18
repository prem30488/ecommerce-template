import React from 'react'


const Product = ({product, compare}) =>
    <div key={product.id} className="col-sm-6 col-md-3">
        <div className={"product " + (product.compare ? "compare" : "")} >
            <img src={product.img} alt={product.title} />
            <div className="image_overlay"/>
            <div className="view_details" onClick={() => compare(product)}>
              {product.compare ? "Remove" : "Compare"}
            </div>
            <div className="stats">
                <div className="stats-container">
                    <span className="product_price">{product.price}</span>
                    <span className="product_name">{product.title}</span>
                    <p>{product.description}</p>
                </div>
            </div>
        </div>
    </div>;

export default Product
