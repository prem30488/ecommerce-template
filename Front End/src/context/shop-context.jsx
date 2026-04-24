import { createContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../constants";
import Alert from 'react-s-alert';

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  return {};
};

const CART_STORAGE_KEY = "premium_cart_persistent_data";

const loadCartFromStorage = () => {
  try {
    const savedData = localStorage.getItem(CART_STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error("Failed to load cart from storage:", error);
  }
  return null;
};


export const ShopContextProvider = (props) => {
  const initialData = loadCartFromStorage();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState(initialData?.cartItems || getDefaultCart());
  const [martItems, setMartItems] = useState(initialData?.martItems || getDefaultCart());
  const [lartItems, setLartItems] = useState(initialData?.lartItems || getDefaultCart());
  const [freeCartItems, setFreeCartItems] = useState(initialData?.freeCartItems || getDefaultCart());
  const [freeMartItems, setFreeMartItems] = useState(initialData?.freeMartItems || getDefaultCart());
  const [freeLartItems, setFreeLartItems] = useState(initialData?.freeLartItems || getDefaultCart());

  const [selectedItems, setSelectedItems] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [totalAfterCoupon, setTotalAfterCoupon] = useState(0);
  const [flavorCart, setFlavorCart] = useState(initialData?.flavorCart || {});


  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/product/getProducts?page=0&size=200&sorted=true`);
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();
        setProducts(json.content);

        // Fetch categories as well
        const catRes = await fetch(`${API_BASE_URL}/api/category/getCategories?page=0&size=1000&sort=id&sort=order,asc`);
        if (catRes.ok) {
          const catJson = await catRes.json();
          setCategories(catJson.content || catJson || []);
        }
      } catch (err) {
        console.error("Failed to fetch products/categories:", err);
      }
    };
    getData();
  }, []);

  // Save cart to localStorage whenever any item changes
  useEffect(() => {
    const dataToSave = {
      cartItems,
      martItems,
      lartItems,
      freeCartItems,
      freeMartItems,
      freeLartItems,
      flavorCart
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [cartItems, martItems, lartItems, freeCartItems, freeMartItems, freeLartItems, flavorCart]);


  const getProductFlavorPrice = (product, size, flavorId = null) => {
    if (!product) return 0;
    const activeFlavorId = flavorId || flavorCart[`${product.id}_${size}`] || (product.productFlavors && product.productFlavors[0]?.flavor_id);
    const activeFlavorData = product.productFlavors?.find(pf => String(pf.flavor_id) === String(activeFlavorId));
    if (!activeFlavorData) return 0;
    if (size === "S") return activeFlavorData.price || 0;
    if (size === "M") return activeFlavorData.priceMedium || 0;
    if (size === "L") return activeFlavorData.priceLarge || 0;
    return activeFlavorData.price || 0;
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;

    const calculateForMap = (items, size) => {
      for (const key in items) {
        if (items[key] > 0) {
          const [productId, flavorId] = key.split('_');
          const itemInfo = products.find((p) => p.id === Number(productId));
          if (!itemInfo) continue;

          const unitPrice = getProductFlavorPrice(itemInfo, size, flavorId);

          // Match the logic in PremiumProductCard/PremiumCartItem
          const activeOffer = itemInfo.offers?.find(o =>
            o.active &&
            o.discount > 0 &&
            (o.size === size || !o.size)
          );

          if (activeOffer) {
            let discountedPrice = unitPrice;
            if (activeOffer.type === 2) {
              discountedPrice = Math.max(0, unitPrice - activeOffer.discount);
            } else {
              discountedPrice = unitPrice * (1 - activeOffer.discount / 100);
            }
            totalAmount += items[key] * discountedPrice;
          } else {
            totalAmount += items[key] * unitPrice;
          }
        }
      }
    };

    calculateForMap(cartItems, "S");
    calculateForMap(martItems, "M");
    calculateForMap(lartItems, "L");

    return totalAmount;
  };

  const getTotalCartCount = () => {
    let cartCount = 0;
    [cartItems, martItems, lartItems, freeCartItems, freeMartItems, freeLartItems].forEach(items => {
      for (const key in items) {
        if (items[key] > 0) cartCount += items[key];
      }
    });
    return cartCount;
  };

  // ── Automated Free Items Sync (BOGO / Buy X Get Y) ─────────────
  useEffect(() => {
    if (products.length === 0) return;

    const newFreeS = {};
    const newFreeM = {};
    const newFreeL = {};

    const syncForSize = (paidItems, size, targetMap) => {
      // 1. Group paid counts by productId (merging flavors)
      const paidCounts = {};
      for (const key in paidItems) {
        if (paidItems[key] > 0) {
          const [pid] = key.split('_');
          paidCounts[pid] = (paidCounts[pid] || 0) + paidItems[key];
        }
      }

      // 2. Resolve free items based on offers
      for (const pid in paidCounts) {
        const itemInfo = products.find(p => String(p.id) === String(pid));
        if (!itemInfo || !itemInfo.offers) continue;

        itemInfo.offers.forEach(offer => {
          if (offer.active && offer.buy > 0 && offer.buyget > 0 && (offer.size === size || !offer.size)) {
            const freeCount = Math.floor(paidCounts[pid] / offer.buy) * offer.buyget;
            if (freeCount > 0) {
              const freeId = offer.freeProductid || pid;
              targetMap[freeId] = (targetMap[freeId] || 0) + freeCount;
            }
          }
        });
      }
    };

    syncForSize(cartItems, "S", newFreeS);
    syncForSize(martItems, "M", newFreeM);
    syncForSize(lartItems, "L", newFreeL);

    setFreeCartItems(newFreeS);
    setFreeMartItems(newFreeM);
    setFreeLartItems(newFreeL);
  }, [cartItems, martItems, lartItems, products]);

  const checkStockAvailability = (productId, newAmount, size) => {
    const product = products.find(p => p.id === Number(productId));
    if (!product || product.stock === undefined || product.stock === null) return true;

    const pidStr = String(productId);

    // 1. Calculate total paid items for this product across all sizes, 
    // replacing the count for the current size with newAmount
    let totalPaid = 0;

    // Size S
    if (size === "S") {
      totalPaid += newAmount;
    } else {
      for (const k in cartItems) if (k.split('_')[0] === pidStr) totalPaid += cartItems[k];
    }

    // Size M
    if (size === "M") {
      totalPaid += newAmount;
    } else {
      for (const k in martItems) if (k.split('_')[0] === pidStr) totalPaid += martItems[k];
    }

    // Size L
    if (size === "L") {
      totalPaid += newAmount;
    } else {
      for (const k in lartItems) if (k.split('_')[0] === pidStr) totalPaid += lartItems[k];
    }

    // 2. Predict total free items for this product based on ALL paid items (including the newAmount)
    let totalFree = 0;

    // The BOGO/Offer logic from useEffect (lines 116-140)
    const sizes = ["S", "M", "L"];
    sizes.forEach(s => {
      let paidInSize = 0;
      if (s === size) {
        paidInSize = newAmount;
      } else {
        const itemMap = s === "S" ? cartItems : (s === "M" ? martItems : lartItems);
        for (const k in itemMap) if (k.split('_')[0] === pidStr) paidInSize += itemMap[k];
      }

      if (paidInSize > 0 && product.offers) {
        product.offers.forEach(offer => {
          if (offer.active && offer.buy > 0 && offer.buyget > 0 && (offer.size === s || !offer.size)) {
            const freeCount = Math.floor(paidInSize / offer.buy) * offer.buyget;
            const freeId = offer.freeProductid || product.id;
            if (String(freeId) === pidStr) {
              totalFree += freeCount;
            }
          }
        });
      }
    });

    // 3. Also check if OTHER products give THIS product for free
    products.forEach(otherProduct => {
      if (otherProduct.id === product.id) return; // Already handled above
      if (otherProduct.offers) {
        otherProduct.offers.forEach(offer => {
          if (offer.active && offer.buy > 0 && offer.buyget > 0 && String(offer.freeProductid) === pidStr) {
            // Check how many of this other product we have in the paid maps
            sizes.forEach(s => {
              let paidOfOtherInSize = 0;
              const itemMap = s === "S" ? cartItems : (s === "M" ? martItems : lartItems);
              for (const k in itemMap) if (k.split('_')[0] === String(otherProduct.id)) paidOfOtherInSize += itemMap[k];

              if (offer.size === s || !offer.size) {
                totalFree += Math.floor(paidOfOtherInSize / offer.buy) * offer.buyget;
              }
            });
          }
        });
      }
    });

    if (totalPaid + totalFree > product.stock) {
      Alert.error(`Insufficient stock! Only ${product.stock} units of "${product.title}" available total (including free items).`);
      return false;
    }
    return true;
  };

  const addToCart = (itemId, size, flavorId = null) => {
    // Check stock first
    const pidStr = String(itemId);
    let currentPaidInSize = 0;
    const itemMap = size === "S" ? cartItems : (size === "M" ? martItems : lartItems);
    for (const k in itemMap) if (k.split('_')[0] === pidStr) currentPaidInSize += itemMap[k];

    if (!checkStockAvailability(itemId, currentPaidInSize + 1, size)) {
      return false;
    }

    // If flavorId is not provided, try to find the first flavor of the product
    let activeFlavorId = flavorId;
    const product = products.find(p => p.id === Number(itemId));
    if (!activeFlavorId) {
      activeFlavorId = product?.productFlavors?.[0]?.flavor_id || null;
    }

    const cartKey = activeFlavorId ? `${itemId}_${activeFlavorId}` : itemId;

    // Update legacy flavorCart for backward compatibility
    if (activeFlavorId) {
      setFlavorCart((prev) => ({ ...prev, [`${itemId}_${size}`]: activeFlavorId }));
    }

    const updater = (prev) => ({
      ...prev,
      [cartKey]: (prev[cartKey] || 0) + 1
    });

    if (size === "M") {
      setMartItems(updater);
    } else if (size === "L") {
      setLartItems(updater);
    } else {
      setCartItems(updater);
    }

    Alert.success(`${product?.title || 'Item'} added to cart!`);
    return true;
  };

  const removeFromCart = (itemId, size, flavorId = null) => {
    const cartKey = flavorId ? `${itemId}_${flavorId}` : itemId;
    const updater = (prev) => ({
      ...prev,
      [cartKey]: Math.max((prev[cartKey] || 0) - 1, 0)
    });

    if (size === "M") {
      setMartItems(updater);
    } else if (size === "L") {
      setLartItems(updater);
    } else {
      setCartItems(updater);
    }
  };

  const updateCartItemCount = (newAmount, itemId, size, flavorId = null) => {
    if (newAmount > 0 && !checkStockAvailability(itemId, newAmount, size)) {
      return false;
    }
    const cartKey = flavorId ? `${itemId}_${flavorId}` : itemId;
    const updater = (prev) => ({
      ...prev,
      [cartKey]: newAmount
    });

    if (size === "M") {
      setMartItems(updater);
    } else if (size === "L") {
      setLartItems(updater);
    } else {
      setCartItems(updater);
    }
    return true;
  };

  const updateFreeToCart = (newAmount, itemId, size) => {
    if (size === "M") {
      setFreeMartItems((prev) => ({ ...prev, [itemId]: newAmount }));
    } else if (size === "L") {
      setFreeLartItems((prev) => ({ ...prev, [itemId]: newAmount }));
    } else {
      setFreeCartItems((prev) => ({ ...prev, [itemId]: newAmount }));
    }
  };

  // add free item into appropriate free map depending on size
  // size: "S" | "M" | "L" (optional, defaults to S)
  const addFreeToCart = (id, qty, itemId, size = "S") => {
    if (size === "M") {
      setFreeMartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + qty }));
    } else if (size === "L") {
      setFreeLartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + qty }));
    } else {
      setFreeCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + qty }));
    }
  };

  const removeFreeFromCart = (id, qty, itemId) => {
    if ((freeCartItems[itemId] || 0) >= qty) {
      setFreeCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - qty }));
    }
  };

  const addFreeMartToCart = (id, qty, itemId) => {
    setFreeMartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + qty }));
  };

  const removeFreeMartFromCart = (id, qty, itemId) => {
    if ((freeMartItems[itemId] || 0) >= qty) {
      setFreeMartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - qty }));
    }
  };

  const addFreeLartToCart = (id, qty, itemId) => {
    setFreeLartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + qty }));
  };

  const removeFreeLartFromCart = (id, qty, itemId) => {
    if ((freeLartItems[itemId] || 0) >= qty) {
      setFreeLartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - qty }));
    }
  };

  const updateFreeCartItemCount = (newAmount, itemId) => {
    setFreeCartItems((prev) => ({ ...prev, [itemId]: newAmount }));
  };

  const updateFreeMartItemCount = (newAmount, itemId) => {
    setFreeMartItems((prev) => ({ ...prev, [itemId]: newAmount }));
  };

  const updateFreeLartItemCount = (newAmount, itemId) => {
    setFreeLartItems((prev) => ({ ...prev, [itemId]: newAmount }));
  };

  const addToCompare = (item) => {
    if (selectedItems.length <= 4) {
      setSelectedItems((selectedItems) => [...selectedItems, item])
    }
  }

  const removeFromCompare = (item) => {
    const filteredItems = selectedItems.filter(product => product.id !== item.id)
    setSelectedItems(filteredItems)
  }

  const addToCustomerData = (item) => {
    setCustomerData(item);
  }

  const getCustomerData = () => {
    return customerData;
  }
  const cleanCustomerData = () => {
    setCustomerData({});
  }

  const addTotalAfterDiscount = (money) => {
    setTotalAfterCoupon(money);
  }

  const getTotalAfterDiscount = () => {
    return totalAfterCoupon;
  }
  const cleanTotalAfterDiscount = () => {
    setTotalAfterCoupon(0.0);
  }

  const checkout = () => { };

  const resetCart = () => {
    setCartItems(getDefaultCart());
    setMartItems(getDefaultCart());
    setLartItems(getDefaultCart());
    setFreeCartItems(getDefaultCart());
    setFreeMartItems(getDefaultCart());
    setFreeLartItems(getDefaultCart());
    setFlavorCart({});
  };


  const contextValue = {
    cartItems,
    martItems,
    lartItems,
    selectedItems,
    freeCartItems,
    freeMartItems,
    freeLartItems,
    flavorCart,
    setFlavorCart,
    addToCart,
    updateCartItemCount,
    removeFromCart,
    addFreeToCart,
    updateFreeCartItemCount,
    removeFreeFromCart,
    getTotalCartAmount,
    checkout,
    getTotalCartCount,
    addToCompare,
    removeFromCompare,
    setSelectedItems,
    resetCart,
    addToCustomerData,
    getCustomerData,
    cleanCustomerData,
    addTotalAfterDiscount,
    getTotalAfterDiscount,
    cleanTotalAfterDiscount,
    getProductFlavorPrice,
    products,
    categories
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};
