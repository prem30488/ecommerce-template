import React, { useContext, useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';

import { ShopContext } from '../../context/shop-context';
import { getCoupons, createOrder, verifyPayment, getCurrentUser } from '../../util/APIUtils';
import Alert from 'react-s-alert';
import { COMPANY_INFO } from '../../constants/companyInfo';
import { API_BASE_URL } from '../../constants';
import './PremiumCheckout.css';

const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const PremiumCheckout = () => {
    const navigate = useNavigate();
    const {
        cartItems,
        martItems,
        lartItems,
        freeCartItems,
        freeMartItems,
        freeLartItems,
        getTotalCartAmount,
        getTotalAfterDiscount,
        products,
        addToCustomerData,
        addTotalAfterDiscount,
        cleanTotalAfterDiscount,
        resetCart
    } = useContext(ShopContext);

    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [flavors, setFlavors] = useState([]);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountError, setDiscountError] = useState("");

    useEffect(() => {
        const fetchFlavors = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/flavor/getFlavors?size=1000`);
                const json = await res.json();
                setFlavors(json.content || []);
            } catch (e) {
                console.error('Failed to fetch flavors:', e);
            }
        };
        fetchFlavors();

        const fetchCoupons = async () => {
            try {
                const data = await getCoupons(0, 100);
                setAvailableCoupons(data.content || []);
            } catch (err) {
                console.error("Failed to fetch coupons:", err);
            }
        };
        fetchCoupons();

        // Ensure discount is cleared when entering checkout unless it was already set from cart
        // However, if the user wants "only 1", just managing it here is fine.
    }, []);

    const applyDiscountCode = () => {
        setDiscountError("");
        if (!discountCode.trim()) {
            setAppliedDiscount(null);
            cleanTotalAfterDiscount();
            return;
        }

        const found = availableCoupons.find(c => c.code.toUpperCase() === discountCode.toUpperCase());

        if (found) {
            setAppliedDiscount(found);
            const discountedTotal = totalAmount * (1 - found.discount / 100);
            addTotalAfterDiscount(discountedTotal);
            Alert.success(`Discount code ${found.code} applied!`);
        } else {
            setAppliedDiscount(null);
            cleanTotalAfterDiscount();
            setDiscountError("Invalid discount code.");
            Alert.error("Invalid discount code.");
        }
    };

    const totalAmount = getTotalCartAmount() || 0;
    const totalAfterDiscount = getTotalAfterDiscount() || 0;
    const finalTotal = totalAfterDiscount || totalAmount;

    const getFinalItemPrice = (product, size, flavorId, qty) => {
        const activeFlavorId = flavorId || (product.productFlavors && product.productFlavors[0]?.flavor_id);
        const activeFlavorData = product.productFlavors?.find(pf => String(pf.flavor_id) === String(activeFlavorId));

        if (!activeFlavorData) return 0;

        let unitPrice = 0;
        if (size === "S") unitPrice = activeFlavorData.price || 0;
        else if (size === "M") unitPrice = activeFlavorData.priceMedium || 0;
        else if (size === "L") unitPrice = activeFlavorData.priceLarge || 0;
        else unitPrice = activeFlavorData.price || 0;

        const activeOffer = product.offers?.find(o =>
            o.active &&
            o.discount > 0 &&
            (o.size === size || !o.size)
        );

        let finalUnitPrice = unitPrice;
        if (activeOffer) {
            if (activeOffer.type === 2) {
                finalUnitPrice = Math.max(0, unitPrice - activeOffer.discount);
            } else {
                finalUnitPrice = unitPrice * (1 - activeOffer.discount / 100);
            }
        }

        return (finalUnitPrice || 0) * qty;
    };

    const toggleSummary = () => setIsSummaryOpen(!isSummaryOpen);

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            mobileNumber: '',
            billingAddress: {
                street: '',
                addressLine2: '',
                city: '',
                state: 'Gujarat',
                country: 'India',
                zipcode: '',
                type: 'billing',
            },
            shippingAddress: {
                street: '',
                addressLine2: '',
                city: '',
                state: 'Gujarat',
                country: 'India',
                zipcode: '',
                type: 'shipping',
            },
            paymentType: 'Razorpay Secure',
            sameAddress: true,
        },
        validationSchema: Yup.object({
            firstName: Yup.string()
                .trim()
                .min(2, 'First Name must be at least 2 characters')
                .required('First Name is required'),
            lastName: Yup.string()
                .trim()
                .min(2, 'Last Name must be at least 2 characters')
                .required('Last Name is required'),
            email: Yup.string()
                .trim()
                .email('Please enter a valid email address')
                .required('Email is required'),
            mobileNumber: Yup.string()
                .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
                .required('Mobile Number is required'),
            shippingAddress: Yup.object().shape({
                street: Yup.string()
                    .trim()
                    .min(5, 'Address must be at least 5 characters')
                    .required('Address is required'),
                city: Yup.string()
                    .trim()
                    .min(2, 'City must be at least 2 characters')
                    .required('City is required'),
                state: Yup.string().required('State is required'),
                country: Yup.string().required('Country is required'),
                zipcode: Yup.string()
                    .matches(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code')
                    .required('PIN Code is required'),
            }),
            billingAddress: Yup.object().when('sameAddress', {
                is: false,
                then: () => Yup.object().shape({
                    street: Yup.string()
                        .trim()
                        .min(5, 'Address must be at least 5 characters')
                        .required('Address is required'),
                    city: Yup.string()
                        .trim()
                        .min(2, 'City must be at least 2 characters')
                        .required('City is required'),
                    state: Yup.string().required('State is required'),
                    country: Yup.string().required('Country is required'),
                    zipcode: Yup.string()
                        .matches(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code')
                        .required('PIN Code is required'),
                }),
                otherwise: () => Yup.object(),
            }),
        }),
        onSubmit: async (values) => {
            // Check if user is blocked (by email or mobile from the order history)
            try {
                const blockCheck = await fetch(`${API_BASE_URL}/api/public/checkBlockStatus?email=${values.email}&mobile=${values.mobileNumber}`);
                const blockData = await blockCheck.json();
                if (blockData.is_blocked) {
                    Alert.error("Operation is not allowed, please contact company incharge.");
                    return;
                }
            } catch (err) {
                console.warn("Block check failed, proceeding...");
            }

            const detailedItems = [];
            const processSet = (items, size) => {
                Object.keys(items).forEach(key => {
                    const qty = items[key];
                    if (qty > 0) {
                        const [pid, fid] = key.split('_');
                        const product = products.find(p => String(p.id) === String(pid));
                        if (product) {
                            const sizeLabel = size === 'small' ? 'S' : (size === 'medium' ? 'M' : 'L');
                            const unitPriceTotal = getFinalItemPrice(product, sizeLabel, fid, qty);
                            detailedItems.push({
                                productId: parseInt(pid),
                                flavorId: fid ? parseInt(fid) : null,
                                size: size,
                                quantity: qty,
                                price: unitPriceTotal / qty
                            });
                        }
                    }
                });
            };

            processSet(cartItems, 'small');
            processSet(martItems, 'medium');
            processSet(lartItems, 'large');

            const processFreeSet = (items, size) => {
                Object.keys(items).forEach(pid => {
                    const qty = items[pid];
                    if (qty > 0) {
                        const product = products.find(p => String(p.id) === String(pid));
                        if (product) {
                            detailedItems.push({
                                productId: parseInt(pid),
                                flavorId: null, // Free items often lack a specific flavor in this logic
                                size: size,
                                quantity: qty,
                                price: 0,
                                isFree: true
                            });
                        }
                    }
                });
            };

            processFreeSet(freeCartItems, 'small');
            processFreeSet(freeMartItems, 'medium');
            processFreeSet(freeLartItems, 'large');

            const submissionData = {
                ...values,
                subTotal: totalAmount,

                total: finalTotal,
                cartItems,
                martItems,
                lartItems,
                detailedItems
            };

            if (appliedDiscount) {
                submissionData.couponCode = appliedDiscount.code;
                submissionData.discountAmount = totalAmount - finalTotal;
            }

            if (values.sameAddress) {
                submissionData.billingAddress = { ...values.shippingAddress, type: 'billing' };
            }

            // Guard: block submission if cart is empty or total is zero
            if (!totalAmount || totalAmount <= 0) {
                Alert.error('Your cart is empty. Please add items before checking out.');
                return;
            }

            addToCustomerData(submissionData);

            try {
                // 1. Create order on backend and get Razorpay Order ID
                const createResponse = await createOrder(submissionData);

                const { razorpayOrderId, amount, currency, id: localOrderId, key_id } = createResponse;

                // 2. Load Razorpay script
                const res = await loadRazorpay();
                if (!res) {
                    Alert.error("Razorpay SDK failed to load. Are you online?");
                    return;
                }

                // 3. Open Razorpay Modal
                const options = {
                    key: key_id,
                    amount: amount,
                    currency: currency,
                    name: COMPANY_INFO.name,
                    description: "Order Payment",
                    order_id: razorpayOrderId,
                    handler: async function (response) {
                        // 4. Verify Payment
                        try {
                            const verifyRes = await verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                order_id: localOrderId
                            });

                            if (verifyRes.success) {
                                Alert.success("Payment Successful!");
                                resetCart();
                                navigate("/previewInvoice/" + localOrderId);
                            } else {
                                Alert.error("Payment verification failed.");
                            }
                        } catch (err) {
                            console.error("Verification error:", err);
                            Alert.error("Error verifying payment.");
                        }
                    },
                    prefill: {
                        name: values.name,
                        email: values.email,
                        contact: values.mobileNumber,
                    },
                    theme: {
                        color: "#005bd3",
                    },
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();

            } catch (error) {
                console.error('Order/Payment Error:', error);
                // Extract the clearest message from Axios response or error object
                const msg =
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Oops! Something went wrong. Please try again.';
                Alert.error(msg);
            }
        },
    });

    const CheckoutItem = ({ product, sizeLabel, flavor, flavorId, qty, itemTotalPrice }) => {
        const [imageSrc, setImageSrc] = useState("/images/placeholder.png");

        useEffect(() => {
            const fetchFolderImages = async () => {
                try {
                    const targetFlavorId = flavorId || '1';
                    // Use the specific API endpoint that returns JSON image lists
                    const res = await fetch(`${API_BASE_URL}/api/product/images/${product.id}/${targetFlavorId}`);
                    const json = await res.json();

                    if (Array.isArray(json) && json.length > 0) {
                        // The API returns full URLs: "/images/productId/flavorId/file.jpg"
                        setImageSrc(json[0]);
                    } else {
                        // Fallback to primary flavor (1)
                        const fallbackRes = await fetch(`${API_BASE_URL}/api/product/images/${product.id}/1`);
                        const fallbackJson = await fallbackRes.json();
                        if (Array.isArray(fallbackJson) && fallbackJson.length > 0) {
                            setImageSrc(fallbackJson[0]);
                        } else {
                            // Use product default image if filesystem scan yields nothing
                            const defaultImg = product.image || product.productImage || product.img;
                            if (defaultImg) {
                                const finalSrc = defaultImg.startsWith('http') || defaultImg.startsWith('/')
                                    ? defaultImg
                                    : `/images/${defaultImg}`;
                                setImageSrc(finalSrc);
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error in CheckoutItem image fetch:', e);
                    const defaultImg = product.image || product.productImage || product.img;
                    if (defaultImg) {
                        const finalSrc = defaultImg.startsWith('http') || defaultImg.startsWith('/')
                            ? defaultImg
                            : `/images/${defaultImg}`;
                        setImageSrc(finalSrc);
                    }
                }
            };
            fetchFolderImages();
        }, [product.id, flavorId, product.image, product.productImage, product.img]);

        return (
            <div className="summary-item">
                <div className="item-info">
                    <div className="item-img-container">
                        <img
                            src={imageSrc}
                            alt={product.productName}
                            onError={(e) => { e.target.src = "/images/placeholder.png" }}
                        />
                        <span className="item-badge">{qty}</span>
                    </div>
                    <div className="item-details">
                        <h4>{product.productName}</h4>
                        <p>{sizeLabel} Pack{flavor ? ` • ${flavor.name}` : ''}</p>
                    </div>
                </div>
                <div className="item-price">
                    ₹{itemTotalPrice.toLocaleString()}
                </div>
            </div>
        );
    };

    const renderOrderItem = (product, type) => {
        let itemsMap;
        let sizeLabel;
        if (type === 'S') { itemsMap = cartItems; sizeLabel = 'Small'; }
        else if (type === 'M') { itemsMap = martItems; sizeLabel = 'Medium'; }
        else if (type === 'L') { itemsMap = lartItems; sizeLabel = 'Large'; }

        return Object.keys(itemsMap).map(key => {
            const [pid, fid] = key.split('_');
            if (pid === String(product.id) && itemsMap[key] > 0) {
                const qty = itemsMap[key];
                const flavor = flavors.find(f => String(f.id) === String(fid));
                const itemTotalPrice = getFinalItemPrice(product, type, fid, qty);

                return (
                    <CheckoutItem
                        key={`${key}_${type}`}
                        product={product}
                        sizeLabel={sizeLabel}
                        flavor={flavor}
                        flavorId={fid}
                        qty={qty}
                        itemTotalPrice={itemTotalPrice}
                    />
                );
            }
            return null;
        });
    };

    const renderFreeItem = (product, type) => {
        let itemsMap;
        let sizeLabel;
        if (type === 'S') { itemsMap = freeCartItems; sizeLabel = 'Small'; }
        else if (type === 'M') { itemsMap = freeMartItems; sizeLabel = 'Medium'; }
        else if (type === 'L') { itemsMap = freeLartItems; sizeLabel = 'Large'; }

        return Object.keys(itemsMap).map(pid => {
            if (pid === String(product.id) && itemsMap[pid] > 0) {
                const qty = itemsMap[pid];
                return (
                    <div key={`free_${pid}_${type}`} className="summary-item free-gift">
                        <div className="item-info">
                            <div className="item-img-container">
                                <img
                                    src={product.productFlavors?.[0]?.productImage || product.image || "/images/placeholder.png"}
                                    alt={product.productName}
                                    onError={(e) => { e.target.src = "/images/placeholder.png" }}
                                />
                                <span className="item-badge">{qty}</span>
                            </div>
                            <div className="item-details">
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {product.productName}
                                    <span style={{ fontSize: '10px', background: '#FFEDD5', color: '#C2410C', padding: '2px 6px', borderRadius: '4px' }}>FREE GIFT</span>
                                </h4>
                                <p>{sizeLabel} Pack</p>
                            </div>
                        </div>
                        <div className="item-price" style={{ color: '#10B981', fontWeight: '700' }}>
                            ₹0
                        </div>
                    </div>
                );
            }
            return null;
        });
    };

    return (
        <div className="premium-checkout-container">
            {/* Mobile Summary Toggle */}
            <div className="mobile-summary-toggle" onClick={toggleSummary}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isSummaryOpen ? 'Hide order summary' : 'Show order summary'}
                        <span style={{
                            display: 'inline-block',
                            transition: 'transform 0.3s ease',
                            transform: isSummaryOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                            ↓
                        </span>
                    </span>
                </div>

                <span style={{ fontWeight: 600, fontSize: '18px' }}>₹{finalTotal.toLocaleString()}</span>
            </div>

            {/* Main Form Area */}
            <div className="checkout-main">
                <div className="checkout-header">
                    <h1>{COMPANY_INFO.name}</h1>
                    <nav className="checkout-breadcrumbs">
                        <Link to="/your-cart">Cart</Link>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-current">Information</span>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-disabled">Payment</span>
                    </nav>
                </div>


                <form onSubmit={formik.handleSubmit}>
                    {/* Contact Section */}
                    <div className="checkout-section">
                        <div className="section-title">
                            <h2 className='tit'>Contact</h2>
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                className={`input-field ${formik.touched.email && formik.errors.email ? 'error' : ''}`}
                                placeholder="Enter your email"
                                {...formik.getFieldProps('email')}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="error-msg">{formik.errors.email}</div>
                            )}
                        </div>
                        <div className="checkbox-group">
                            <input type="checkbox" id="news-offers" defaultChecked />
                            <label htmlFor="news-offers">Email me with news and offers</label>
                        </div>
                    </div>

                    {/* Delivery Section */}
                    <div className="checkout-section">
                        <div className="section-title">
                            <h2 className='tit'>Delivery</h2>
                        </div>

                        <div className="form-group">
                            <select
                                className="input-field"
                                {...formik.getFieldProps('shippingAddress.country')}
                            >
                                <option value="India">India</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className={`input-field ${formik.touched.firstName && formik.errors.firstName ? 'error' : ''}`}
                                    placeholder="First name"
                                    {...formik.getFieldProps('firstName')}
                                />
                                {formik.touched.firstName && formik.errors.firstName && (
                                    <div className="error-msg">{formik.errors.firstName}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className={`input-field ${formik.touched.lastName && formik.errors.lastName ? 'error' : ''}`}
                                    placeholder="Last name"
                                    {...formik.getFieldProps('lastName')}
                                />
                                {formik.touched.lastName && formik.errors.lastName && (
                                    <div className="error-msg">{formik.errors.lastName}</div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                className={`input-field ${formik.touched.shippingAddress?.street && formik.errors.shippingAddress?.street ? 'error' : ''}`}
                                placeholder="Address"
                                {...formik.getFieldProps('shippingAddress.street')}
                            />
                            {formik.touched.shippingAddress?.street && formik.errors.shippingAddress?.street && (
                                <div className="error-msg">{formik.errors.shippingAddress?.street}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Apartment, suite, etc. (optional)"
                                {...formik.getFieldProps('shippingAddress.addressLine2')}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className={`input-field ${formik.touched.shippingAddress?.city && formik.errors.shippingAddress?.city ? 'error' : ''}`}
                                    placeholder="City"
                                    {...formik.getFieldProps('shippingAddress.city')}
                                />
                                {formik.touched.shippingAddress?.city && formik.errors.shippingAddress?.city && (
                                    <div className="error-msg">{formik.errors.shippingAddress?.city}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <select
                                    className="input-field"
                                    {...formik.getFieldProps('shippingAddress.state')}
                                >
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Delhi">Delhi</option>
                                    {/* Add more states as needed */}
                                </select>
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className={`input-field ${formik.touched.shippingAddress?.zipcode && formik.errors.shippingAddress?.zipcode ? 'error' : ''}`}
                                    placeholder="PIN code"
                                    {...formik.getFieldProps('shippingAddress.zipcode')}
                                />
                                {formik.touched.shippingAddress?.zipcode && formik.errors.shippingAddress?.zipcode && (
                                    <div className="error-msg">{formik.errors.shippingAddress?.zipcode}</div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                className={`input-field ${formik.touched.mobileNumber && formik.errors.mobileNumber ? 'error' : ''}`}
                                placeholder="Phone"
                                {...formik.getFieldProps('mobileNumber')}
                            />
                            {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                                <div className="error-msg">{formik.errors.mobileNumber}</div>
                            )}
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="checkout-section">
                        <div className="section-title">
                            <h2 className='tit'>Payment</h2>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                            All transactions are secure and encrypted.
                        </p>
                        <div className="payment-box">
                            <div className="payment-header">
                                <span className="payment-title">Razorpay Secure (UPI, Cards, Wallets)</span>
                                <div className="payment-icons">
                                    <img src="data:image/png;base64,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" alt="UPI" />
                                    <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" />
                                    <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" />
                                </div>
                            </div>
                            <div className="payment-content">
                                <p>You'll be redirected to Razorpay Secure to complete your purchase.</p>
                            </div>
                        </div>
                    </div>

                    {/* Billing Address Section */}
                    <div className="checkout-section">
                        <div className="section-title">
                            <h2 className='tit'>Billing address</h2>
                        </div>
                        <div className="payment-box">
                            <div className="payment-header" style={{ background: '#fff' }}>
                                <div className="checkbox-group" style={{ margin: 0 }}>
                                    <input
                                        type="radio"
                                        name="sameAddress"
                                        checked={formik.values.sameAddress === true}
                                        onChange={() => formik.setFieldValue('sameAddress', true)}
                                    />
                                    <label>Same as shipping address</label>
                                </div>
                            </div>
                            <div className="payment-header" style={{ background: '#fff' }}>
                                <div className="checkbox-group" style={{ margin: 0 }}>
                                    <input
                                        type="radio"
                                        name="sameAddress"
                                        checked={formik.values.sameAddress === false}
                                        onChange={() => formik.setFieldValue('sameAddress', false)}
                                    />
                                    <label>Use a different billing address</label>
                                </div>
                            </div>

                            {formik.values.sameAddress === false && (
                                <div className="different-billing-address-form">
                                    <div className="form-group">
                                        <select
                                            className="input-field"
                                            {...formik.getFieldProps('billingAddress.country')}
                                        >
                                            <option value="India">India</option>
                                        </select>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                className={`input-field ${formik.touched.firstName && formik.errors.firstName ? 'error' : ''}`}
                                                placeholder="First name"
                                                {...formik.getFieldProps('firstName')}
                                            />
                                            {formik.touched.firstName && formik.errors.firstName && (
                                                <div className="error-msg">{formik.errors.firstName}</div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                className={`input-field ${formik.touched.lastName && formik.errors.lastName ? 'error' : ''}`}
                                                placeholder="Last name"
                                                {...formik.getFieldProps('lastName')}
                                            />
                                            {formik.touched.lastName && formik.errors.lastName && (
                                                <div className="error-msg">{formik.errors.lastName}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className={`input-field ${formik.touched.billingAddress?.street && formik.errors.billingAddress?.street ? 'error' : ''}`}
                                            placeholder="Address"
                                            {...formik.getFieldProps('billingAddress.street')}
                                        />
                                        {formik.touched.billingAddress?.street && formik.errors.billingAddress?.street && (
                                            <div className="error-msg">{formik.errors.billingAddress?.street}</div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Apartment, suite, etc. (optional)"
                                            {...formik.getFieldProps('billingAddress.addressLine2')}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                className={`input-field ${formik.touched.billingAddress?.city && formik.errors.billingAddress?.city ? 'error' : ''}`}
                                                placeholder="City"
                                                {...formik.getFieldProps('billingAddress.city')}
                                            />
                                            {formik.touched.billingAddress?.city && formik.errors.billingAddress?.city && (
                                                <div className="error-msg">{formik.errors.billingAddress?.city}</div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <select
                                                className="input-field"
                                                {...formik.getFieldProps('billingAddress.state')}
                                            >
                                                <option value="Gujarat">Gujarat</option>
                                                <option value="Maharashtra">Maharashtra</option>
                                                <option value="Delhi">Delhi</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                className={`input-field ${formik.touched.billingAddress?.zipcode && formik.errors.billingAddress?.zipcode ? 'error' : ''}`}
                                                placeholder="PIN code"
                                                {...formik.getFieldProps('billingAddress.zipcode')}
                                            />
                                            {formik.touched.billingAddress?.zipcode && formik.errors.billingAddress?.zipcode && (
                                                <div className="error-msg">{formik.errors.billingAddress?.zipcode}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="pay-now-btn">
                        Pay now
                    </button>
                </form>

                <div className="checkout-footer">
                    <a href="/policies/refund-policy">Refund policy</a>
                    <a href="/policies/privacy-policy">Privacy policy</a>
                    <a href="/policies/terms-of-service">Terms of service</a>
                    <a href="/contact">Contact information</a>
                </div>
            </div>

            {/* Summary Area (Desktop) */}
            <div className={`checkout-summary ${isSummaryOpen ? 'mobile-open' : ''}`}>
                <div className="summary-items">
                    {products.map(product => (
                        <React.Fragment key={product.id}>
                            {renderOrderItem(product, 'S')}
                            {renderFreeItem(product, 'S')}
                            {renderOrderItem(product, 'M')}
                            {renderFreeItem(product, 'M')}
                            {renderOrderItem(product, 'L')}
                            {renderFreeItem(product, 'L')}
                        </React.Fragment>
                    ))}
                </div>

                <div className="discount-code-section">
                    <div className="input-with-button">
                        <input
                            type="text"
                            className={`input-field ${discountError ? 'error' : ''}`}
                            placeholder="Discount code"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                        />
                        <button
                            type="button"
                            className={`apply-btn ${discountCode ? 'active' : ''}`}
                            onClick={applyDiscountCode}
                        >
                            Apply
                        </button>
                    </div>
                    {discountError && <p className="discount-error-msg">{discountError}</p>}
                    {appliedDiscount && (
                        <div className="applied-discount-tag">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.72 2.03L21 2.23l.2 8.28-11.28 11.28a2 2 0 01-2.83 0l-7.07-7.07a2 2 0 010-2.83L12.72 2.03zM17.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                            <span>{appliedDiscount.code} ({appliedDiscount.discount}% OFF)</span>
                            <button onClick={() => { setAppliedDiscount(null); setDiscountCode(''); cleanTotalAfterDiscount(); }}>×</button>
                        </div>
                    )}
                </div>

                <div className="totals-section">
                    <div className="total-row">
                        <span>Subtotal</span>
                        <span>₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="total-row">
                        <span>Shipping</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Calculated at next step</span>
                    </div>
                    {totalAfterDiscount > 0 && appliedDiscount && (
                        <div className="total-row discount">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12.72 2.03L21 2.23l.2 8.28-11.28 11.28a2 2 0 01-2.83 0l-7.07-7.07a2 2 0 010-2.83L12.72 2.03zM17.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                                <span>Discount</span>
                            </div>
                            <span style={{ color: '#10b981' }}>-₹{(totalAmount - totalAfterDiscount).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="total-row grand-total">
                        <span>Total</span>
                        <span>
                            <span className="total-currency">INR</span>
                            ₹{finalTotal.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumCheckout;
