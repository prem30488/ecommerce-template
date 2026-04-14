import React from 'react';
import { useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus } from "../../../../util/APIUtils";
import Alert from 'react-s-alert';
import { AdminInvoice } from './AdminInvoice';
import './OrderTable.css';
export const OrderTable = ({ }) => {

  const [orders, setOrders] = useState([]);
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

      fetchOrders(0, 1000)
        .then(response => {
          console.log("data : :" + JSON.stringify(response));
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

  const [printingOrder, setPrintingOrder] = useState(null);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus)
      .then(() => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        Alert.success('Order status updated successfully');
      })
      .catch((error) => {
        Alert.error('Failed to update status');
      });
  };

  const generatePDF = (order) => {
    setPrintingOrder(order);
  };

  const handlePdfGenerated = () => {
    setPrintingOrder(null);
  };

  const filteredOrders = currentOrders.filter((order) =>
    order?.customer?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    order?.customer?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    order?.customer?.mobile?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    order?.billingAddress?.zipcode === searchTerm ||
    order?.delieveryAddress?.zipcode === searchTerm ||
    order?.id?.toString() === searchTerm // Added ID search as fallback
  );

  return (
    <div className="order-management-container">
      <div className="search-bar-container">
        <input
          type="text"
          className="order-search-input"
          placeholder="Search by customer name, email, zip, or order ID..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {filteredOrders.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-card-header">
            <h3 className="order-card-title">Order #{order.id}</h3>
            <button className="export-btn" onClick={() => generatePDF(order)}>
              Print Invoice PDF
            </button>
          </div>
          <div className="order-tables-wrapper">
            <div style={{ overflowX: 'auto' }}>
              <table className="premium-order-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Coupon</th>
                    <th>Discount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Billing Address</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Delivery Address</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#{order.id}</td>
                    <td>{new Date(order.createdAt || order.created_at).toLocaleDateString()}</td>
                    <td>INR {Number(order.total || 0).toFixed(2)}</td>
                    <td className="font-semibold" style={{color: '#6366f1'}}>{order.couponCode || '-'}</td>
                    <td className="font-semibold" style={{color: '#10b981'}}>{order.discountAmount > 0 ? `₹${Number(order.discountAmount).toFixed(2)}` : '-'}</td>
                    <td>{order.paymentType || '-'}</td>
                    <td>
                      <select
                        className="status-select"
                        value={order.status || 'Pending'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      {order.billingAddress ?
                        `${order.billingAddress.street || ''}, ${order.billingAddress.city || ''}, ${order.billingAddress.zipcode || ''}`
                        : '-'}
                    </td>
                    <td>{order.customer?.name || 'Guest'}</td>
                    <td>{order.customer?.email || '-'}</td>
                    <td>{order.customer?.mobile || '-'}</td>
                    <td>
                      {order.delieveryAddress ?
                        `${order.delieveryAddress.street || ''}, ${order.delieveryAddress.city || ''}, ${order.delieveryAddress.zipcode || ''}`
                        : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <h4 style={{ marginBottom: '10px', color: '#cc4555', fontWeight: 'bold' }}>Line Items</h4>
              <table className="premium-order-table">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Product</th>
                    <th>Size</th>
                    <th>Flavor</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.lineItems || []).map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>{item.product?.title || 'Product #' + item.productId}</td>
                      <td>{(item.size || '-').charAt(0).toUpperCase() + (item.size || '').slice(1)} Pack</td>
                      <td>{item.flavor || '-'}</td>
                      <td>{item.quantity}</td>
                      <td className="font-semibold">₹{Number(item.price || 0).toLocaleString()}</td>
                      <td className="font-semibold" style={{color: 'var(--primary-color)'}}>
                        ₹{Number((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                      </td>
                      <td style={{fontSize: '11px', color: '#666'}}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleString([], {hour: '2-digit', minute:'2-digit', day: '2-digit', month: 'short'}) : '-'}
                      </td>
                    </tr>
                  ))}
                  {(!order.lineItems || order.lineItems.length === 0) && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center' }}>No line items available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      <div className="pagination-controls">
        <div>
          <span>Page {currentPage} of {totalPages || 1}</span>
        </div>
        <div>
          <button onClick={() => handleChangePage(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <button onClick={() => handleChangePage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
            Next
          </button>
        </div>
        <select value={perPage} onChange={handlePerPageChange}>
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      {printingOrder && <AdminInvoice order={printingOrder} onGenerated={handlePdfGenerated} />}
    </div>
  );
};

export default OrderTable;
