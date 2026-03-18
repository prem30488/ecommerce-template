import React from 'react';
import { useEffect,useState } from 'react';
import {fetchOrders} from "../../../../util/APIUtils";
import Alert from 'react-s-alert';
export const OrderTable = ({  }) => {
  
  const [orders,setOrders] = useState([]);
   // = [
  //   {
  //     id: 1,
  //     created_at: '2023-01-01',
  //     total: 100,
  //     subtotal: 90,
  //     payment_type: 'Credit Card',
  //     status: 'Completed',
  //     billing_address: '123 Main St, City, State, Zip',
  //     customer: 'John Doe',
  //     delivery_address: '456 Main St, City, State, Zip',
  //     order_line_items: [
  //       { id: 101, quantity: 2, product: 'Product A', size: 'Large' },
  //       { id: 102, quantity: 1, product: 'Product B', size: 'Medium' },
  //     ],
  //   },
  //   // ... add more orders
  // ];


  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {

    const getData = async () => {

      fetchOrders(currentPage,perPage)
      .then(response => {
      console.log("data : :"+ JSON.stringify(response));
      setOrders(response.content);
      })
      .catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
      
    };
    getData();
  }, []);
  const indexOfLastOrder = currentPage * perPage;
  const indexOfFirstOrder = indexOfLastOrder - perPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(orders.length / perPage);

  const handleChangePage = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePerPageChange = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredOrders = currentOrders.filter((order) =>
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.billingAddress.zipcode === searchTerm ||
    order.delieveryAddress.zipcode === searchTerm
  );

  return (
    <div>
      <input type="text" placeholder="Search by customer" value={searchTerm} onChange={handleSearch} />
      {filteredOrders.map((order) => (
        <div key={order.id}>
          <h3>Order Details</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Created At</th>
                <th>Total</th>
                <th>Subtotal</th>
                <th>Payment Type</th>
                <th>Status</th>
                <th>Billing Address</th>
                <th>Customer</th>
                <th>Customer Email</th>
                <th>Customer Mobile</th>
                <th>Delivery Address</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{order.id}</td>
                <td>{order.createdAt}</td>
                <td>{order.total}</td>
                <td>{order.subTotal}</td>
                <td>{order.paymentType}</td>
                <td>{order.status}</td>
                <td>{order.billingAddress.street},{order.billingAddress.city},{order.billingAddress.state},{order.billingAddress.country},{order.billingAddress.zipcode}</td>
                <td>{order.customer.name}</td>
                <td>{order.customer.email}</td>
                <td>{order.customer.mobile}</td>
                <td>{order.delieveryAddress.street},{order.delieveryAddress.city},{order.delieveryAddress.state},{order.delieveryAddress.country},{order.delieveryAddress.zipcode}</td>
              </tr>
            </tbody>
          </table>
          <h3>Order Line Items</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Quantity</th>
                <th>Product</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {order.lineItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.quantity}</td>
                  <td>{item.product.title}</td>
                  <td>{item.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <div>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => handleChangePage(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <button onClick={() => handleChangePage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
        <select value={perPage} onChange={handlePerPageChange}>
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
        </select>
      </div>
    </div>
  );
};

export default OrderTable;
