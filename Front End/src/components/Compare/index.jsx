import React, {useContext} from 'react'
import './styles.css'
import { ShopContext } from "../../context/shop-context";


export const Compare = () =>
{
  const {selectedItems} = useContext(ShopContext);
  const products = selectedItems;
console.log(JSON.stringify(selectedItems));
  return(

  <div className="row compare" style={{alignContent:"center"}}>
    <div className="col-12 mt-5 text-center">
      <table className="table">
        <thead className="thead-default">
          <tr style={{border : 2, backgroundColor: "rosybrown"}}>
            <th />
             {products && products
             .filter((p) => p.active === true)
             .map(product =>
              <th key={product.id}>
                <b>{product.title.slice(0,100)}</b>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          <tr className="price">
            <th scope="row">Price</th>
            {products?.map(product =>
              <td key={product.id} className="text-center">{product.price} INR/-</td>
            )}
          </tr>
          <tr className="colors">
            <th scope="row">Categories</th>
            {products?.map(product =>
              <td key={product.id}>
                {product.categories[0].title}
              </td>
            )}
          </tr>
          <tr className="condition">
            <th scope="row">Audience</th>
             {products?.map(product =>
              <td key={product.id} >
                <span className="font-semibold capitalize">{product.audience.slice(0, 20)}</span>
              </td>
            )} 
          </tr>
        </tbody>
      </table>
    </div>
  </div>);}

export default Compare;
