import React from 'react';
import { useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus } from "../../../../util/APIUtils";
import Alert from 'react-s-alert';
import * as XLSX from 'xlsx';
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
  const [statusFilter, setStatusFilter] = useState('All');

  const statuses = ['All', 'Delivered', 'Shipped', 'Processing', 'Pending', 'Cancelled'];

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
  // Chain filters: Status -> Search -> Pagination
  const filteredByStatus = statusFilter === 'All' 
    ? orders 
    : orders.filter(o => (o.status || 'Pending') === statusFilter);

  const filteredBySearch = filteredByStatus.filter((order) =>
    order?.customer?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    order?.customer?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    order?.customer?.mobile?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    order?.billingAddress?.zipcode === searchTerm ||
    order?.delieveryAddress?.zipcode === searchTerm ||
    order?.id?.toString() === searchTerm
  );

  const indexOfLastOrder = currentPage * perPage;
  const indexOfFirstOrder = indexOfLastOrder - perPage;
  const currentOrders = filteredBySearch.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(filteredBySearch.length / perPage);

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

  const exportToExcel = () => {
    if (orders.length === 0) {
      Alert.warning('No orders to export');
      return;
    }

    // Export based on CURRENT filters (status + search)
    const dataToExport = filteredBySearch.map(order => ({
      'Order ID': `#${order.id}`,
      'Date': new Date(order.createdAt || order.created_at).toLocaleDateString(),
      'Status': order.status || 'Pending',
      'Customer': order.customer?.name || 'Guest',
      'Email': order.customer?.email || '-',
      'Phone': order.customer?.mobile || '-',
      'Total Amount': order.total,
      'Discount': order.discountAmount || 0,
      'Coupon': order.couponCode || '-',
      'Payment Type': order.paymentType || '-',
      'Billing Address': order.billingAddress ? `${order.billingAddress.street}, ${order.billingAddress.city}, ${order.billingAddress.zipcode}` : '-',
      'City': order.billingAddress?.city || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders Report");
    
    // Auto-size columns (approximate)
    const maxWidths = {};
    dataToExport.forEach(row => {
      Object.keys(row).forEach(key => {
        const val = String(row[key]);
        maxWidths[key] = Math.max(maxWidths[key] || 10, val.length + 2);
      });
    });
    worksheet['!cols'] = Object.keys(maxWidths).map(key => ({ wch: maxWidths[key] }));

    XLSX.writeFile(workbook, `Orders_Export_${statusFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);
    Alert.success('Excel export started');
  };

  const exportToExcelSingle = (order) => {
    // Detailed export for a single order including line items
    const orderData = [{
      'Order ID': `#${order.id}`,
      'Date': new Date(order.createdAt || order.created_at).toLocaleString(),
      'Status': order.status || 'Pending',
      'Customer': order.customer?.name || 'Guest',
      'Email': order.customer?.email || '-',
      'Phone': order.customer?.mobile || '-',
      'Total Amount': order.total,
      'Payment': order.paymentType || '-',
      'Coupon': order.couponCode || '-',
      'Discount': order.discountAmount || 0,
    }];

    const itemsData = (order.lineItems || []).map(item => ({
      'Product': item.product?.title || 'Unknown',
      'Size': item.size,
      'Flavor': item.flavor,
      'Quantity': item.quantity,
      'Unit Price': item.price,
      'Subtotal': (item.price || 0) * (item.quantity || 0)
    }));

    const workbook = XLSX.utils.book_new();
    const wsOrder = XLSX.utils.json_to_sheet(orderData);
    const wsItems = XLSX.utils.json_to_sheet(itemsData);

    XLSX.utils.book_append_sheet(workbook, wsOrder, "Order Summary");
    XLSX.utils.book_append_sheet(workbook, wsItems, "Line Items");

    XLSX.writeFile(workbook, `Order_${order.id}_Detail.xlsx`);
    Alert.success(`Exported Order #${order.id}`);
  };

  const filteredOrders = currentOrders;

  return (
    <div className="order-management-container">
      <div className="orders-header-actions">
        <div className="status-filter-container">
          {statuses.map(status => (
            <button
              key={status}
              className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="search-bar-container">
          <input
            type="text"
            className="order-search-input"
            placeholder="Search by customer, email, phone or zipcode..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button className="export-excel-btn" onClick={exportToExcel} title="Export current view to Excel">
            Export Excel
          </button>
        </div>
      </div>

      {filteredOrders.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-card-header">
            <h3 className="order-card-title">Order #{order.id}</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="export-btn" onClick={() => generatePDF(order)}>
                Print Invoice PDF
              </button>
              <button className="export-excel-btn" onClick={() => exportToExcelSingle(order)}>
                Export Excel
              </button>
            </div>
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
