import { createContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../constants";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  return {};
};

export const ShopContextProvider = (props) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [martItems, setMartItems] = useState(getDefaultCart());
  const [lartItems, setLartItems] = useState(getDefaultCart());
  const [freeCartItems, setFreeCartItems] = useState(getDefaultCart());
  const [freeMartItems, setFreeMartItems] = useState(getDefaultCart());
  const [freeLartItems, setFreeLartItems] = useState(getDefaultCart());

  const [selectedItems, setSelectedItems] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [totalAfterCoupon, setTotalAfterCoupon] = useState(0);
  const [flavorCart, setFlavorCart] = useState({}); // Still used for legacy lookups if needed, but primary storage is now in keys

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

  const addToCart = (itemId, size, flavorId = null) => {
    // If flavorId is not provided, try to find the first flavor of the product
    let activeFlavorId = flavorId;
    if (!activeFlavorId) {
      const product = products.find(p => p.id === Number(itemId));
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
