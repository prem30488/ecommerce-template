import { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let i = 1; i < 50; i++) {
    cart[i] = 0;
  }
  return cart;
};

export const ShopContextProvider = (props) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [martItems, setMartItems] = useState(getDefaultCart());
  const [lartItems, setLartItems] = useState(getDefaultCart());
  const [freeCartItems, setFreeCartItems] = useState(getDefaultCart());
  const [freeMartItems, setFreeMartItems] = useState(getDefaultCart());
  const [freeLartItems, setFreeLartItems] = useState(getDefaultCart());

  const [selectedItems, setSelectedItems] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [totalAfterCoupon, setTotalAfterCoupon] = useState(0);
  useEffect(() => {
    const getData = async () => {
      try {
        setCartItems(getDefaultCart());

        const res = await fetch("//localhost:5000/api/product/getProducts?page=0&size=1000&sorted=true");
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();
        console.log(json.content);
        setProducts(json.content);
        //setSelectedItems([{}]);


      } catch (err) {


      }
    };
    getData();
  }, []);
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item1 in cartItems) {
      let id = item1;
      if (cartItems[item1] > 0) {
        let itemInfo1 = products.find((product1) => product1.id === Number(item1));


        let flag = false;
        let disco = 0;
        if (itemInfo1.offers && itemInfo1.offers.length > 0) {
          itemInfo1.offers
            .filter((o) => o.size === "S" && o.active === true)
            .map((offer) => {
              if ((offer.type === 0 && cartItems[id] > 0 && cartItems[id] === 1) ||
                (offer.type === 3 && cartItems[id] > 0 && cartItems[id] === offer.buy)) {
                flag = true;
                disco = offer.discount;
              }
            })

        }
        if (flag) {
          totalAmount += (cartItems[item1] * (itemInfo1.price - (Number((disco * itemInfo1.price) / 100))));
        }
        else {
          totalAmount += cartItems[item1] * Number(itemInfo1.price);
        }
      }
    }

    for (const item2 in martItems) {
      let id = item2;
      if (martItems[item2] > 0) {
        let itemInfo2 = products.find((product2) => product2.id === Number(item2));


        let flag = false;
        let disco = 0;
        if (itemInfo2.offers && itemInfo2.offers.length > 0) {
          itemInfo2.offers
            .filter((o) => o.size === "S" && o.active === true)
            .map((offer) => {
              if ((offer.type === 0 && martItems[id] > 0 && martItems[id] === 1) ||
                (offer.type === 3 && martItems[id] > 0 && martItems[id] === offer.buy)) {
                flag = true;
                disco = offer.discount;
              }
            })

        }
        if (flag) {
          totalAmount += (martItems[item2] * (itemInfo2.priceMedium - (Number((disco * itemInfo2.priceMedium) / 100))));
        }
        else {
          totalAmount += martItems[item2] * Number(itemInfo2.priceMedium);
        }
      }
    }


    for (const item3 in lartItems) {
      let id = item3;
      if (lartItems[item3] > 0) {
        let itemInfo3 = products.find((product3) => product3.id === Number(item3));


        let flag = false;
        let disco = 0;
        if (itemInfo3.offers && itemInfo3.offers.length > 0) {
          itemInfo3.offers
            .filter((o) => o.size === "S" && o.active === true)
            .map((offer) => {
              if ((offer.type === 0 && lartItems[id] > 0 && lartItems[id] === 1) ||
                (offer.type === 3 && lartItems[id] > 0 && lartItems[id] === offer.buy)) {
                flag = true;
                disco = offer.discount;
              }
            })

        }
        if (flag) {
          totalAmount += (lartItems[item3] * (itemInfo3.priceLarge - (Number((disco * itemInfo3.priceLarge) / 100))));
        }
        else {
          totalAmount += lartItems[item3] * Number(itemInfo3.priceLarge);
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartCount = () => {
    let cartCount = 0;
    for (const item1 in cartItems) {
      if (cartItems[item1] > 0) {
        cartCount += cartItems[item1];
      }
    }
    for (const item2 in martItems) {
      if (martItems[item2] > 0) {
        cartCount += martItems[item2];
      }
    }
    for (const item3 in lartItems) {
      if (lartItems[item3] > 0) {
        cartCount += lartItems[item3];
      }
    }
    for (const item4 in freeCartItems) {
      if (freeCartItems[item4] > 0) {
        cartCount += freeCartItems[item4];
      }
    }
    for (const item5 in freeMartItems) {
      if (freeMartItems[item5] > 0) {
        cartCount += freeMartItems[item5];
      }
    }
    for (const item6 in freeLartItems) {
      if (freeLartItems[item6] > 0) {
        cartCount += freeLartItems[item6];
      }
    }
    return cartCount;
  };

  const addFreeCartItem = (itemId, items, size) => {

    let currentProduct = products.find((product) => product.id === itemId);
    let id = itemId;

    if (currentProduct.offers && currentProduct.offers.length > 0) {
      currentProduct.offers
        .filter((o) => o.size === size && o.active === true)
        .map((offer) => {
          if (offer.type === 3 && offer.buy === items[id] + 1) {
            if (offer.freeProductsize === 'S') {
              removeFreeFromCart(id, Math.ceil((items[id] + 1) / offer.buy) + 1, offer.freeProductid);
            }
            else if (offer.freeProductsize === 'M') {
              removeFreeMartFromCart(id, Math.ceil((items[id] + 1) / offer.buy) + 1, offer.freeProductid);
            } else if (offer.freeProductsize === 'L') {
              removeFreeLartFromCart(id, Math.ceil((items[id] + 1) / offer.buy) + 1, offer.freeProductid);
            }
          }
          else if ((offer.type === 2 && (items[id] + 1 > 0 && items[id] + 1 === offer.buy)
            || Number((items[id] + 1) % offer.buy) === 0) ||
            (offer.type === 1 && (items[id] + 1 > 0 && items[id] + 1 === offer.buy))
            || Number((items[id] + 1) % offer.buy) === 0) {
            let qty = offer.buyget;


            if (offer.freeProductsize === 'S') {
              if ((((items[id] + 1) * offer.buyget) / offer.buy) > freeCartItems[offer.freeProductid]) {
                qty = Math.floor(((items[id] + 1) * offer.buyget) / offer.buy);
                updateFreeCartItemCount(qty, offer.freeProductid);
              }
              else {
                addFreeToCart(id, qty, offer.freeProductid)
              }
            }
            else if (offer.freeProductsize === 'M') {
              if ((((items[id] + 1) * offer.buyget) / offer.buy) > freeMartItems[offer.freeProductid]) {
                qty = Math.floor(((items[id] + 1) * offer.buyget) / offer.buy);
                updateFreeMartItemCount(qty, offer.freeProductid);
              }
              else {
                addFreeMartToCart(id, qty, offer.freeProductid)
              }

            } else if (offer.freeProductsize === 'L') {
              if ((((items[id] + 1) * offer.buyget) / offer.buy) > freeLartItems[offer.freeProductid]) {
                qty = Math.floor(((items[id] + 1) * offer.buyget) / offer.buy);
                updateFreeLartItemCount(qty, offer.freeProductid);
              }
              else {
                addFreeLartToCart(id, qty, offer.freeProductid)
              }

            }

          }
        })
    }

  };

  const addToCart = (itemId, size) => {
    if (size === "M") {
      setMartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
      addFreeCartItem(itemId, martItems, size);

    } else if (size === "L") {
      setLartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
      addFreeCartItem(itemId, lartItems, size);
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
      addFreeCartItem(itemId, cartItems, size);

    }


  };

  const removeorUpdateFreeItems = (itemId, items, size) => {

    let currentProduct = products.find((product) => product.id === itemId);
    let id = itemId;
    let flag = true;
    if (currentProduct.offers && currentProduct.offers.length > 0) {
      currentProduct.offers
        .filter((o) => o.size === size && o.active === true)
        .map((offer) => {

          if (offer.type === 3 && offer.buy === items[id] - 1) {
            if (offer.freeProductsize === 'S') {
              //removeFreeFromCart(id,Math.floor((items[id]-1) / offer.buy)-1,offer.freeProductid);
              updateFreeCartItemCount(0, offer.freeProductid);
              flag = false;
            }
            else if (offer.freeProductsize === 'M') {
              //removeFreeMartFromCart(id,Math.floor((items[id]-1) / offer.buy)-1,offer.freeProductid);
              updateFreeMartItemCount(0, offer.freeProductid);
              flag = false;
            } else if (offer.freeProductsize === 'L') {
              //removeFreeLartFromCart(id,Math.floor((items[id]-1) / offer.buy)-1,offer.freeProductid);
              updateFreeCartItemCount(0, offer.freeProductid);
              flag = false;
            }
          }
          else if (((offer.type === 2 && items[id] > 0 && items[id] - 1 !== offer.buy)
            || Number((items[id] - 1) % offer.buy) === 1)
            ||
            ((offer.type === 1 && items[id] > 0 && items[id] - 1 !== offer.buy)
              || Number((items[id] - 1) % offer.buy) === 1)
          ) {
            let qty = offer.buyget;

            if (offer.freeProductsize === 'S') {

              if ((((items[id] - 1) * offer.buyget) / offer.buy) < freeCartItems[offer.freeProductid]) {
                qty = Math.floor(((items[id] - 1) * offer.buyget) / offer.buy);

                if (qty >= 0 && flag === true) {
                  updateFreeCartItemCount(qty, offer.freeProductid);
                }
              }
              else {
                if (flag) {
                  qty = Math.floor(((items[id] - 1) * offer.buyget) / offer.buy);
                  updateFreeCartItemCount(qty, offer.freeProductid);
                } else {
                  removeFreeFromCart(id, offer.buyget, offer.freeProductid);
                }
              }

            }
            else if (offer.freeProductsize === 'M') {
              if ((((items[id] - 1) * offer.buyget) / offer.buy) < freeMartItems[offer.freeProductid]) {
                qty = Math.floor(((items[id] - 1) * offer.buyget) / offer.buy);

                if (qty >= 0 && flag === true) {
                  updateFreeMartItemCount(qty, offer.freeProductid);
                }
              }
              else {
                removeFreeMartFromCart(id, offer.buyget, offer.freeProductid);
              }

            } else if (offer.freeProductsize === 'L') {
              if ((((items[id] - 1) * offer.buyget) / offer.buy) < freeLartItems[offer.freeProductid]) {
                qty = Math.floor(((items[id] - 1) * offer.buyget) / offer.buy);
                if (qty >= 0 && flag === true) {
                  updateFreeLartItemCount(qty, offer.freeProductid);
                }
              }
              else {
                removeFreeLartFromCart(id, offer.buyget, offer.freeProductid);
              }

            } else {

            }
          }
        })
    }

  }

  const removeFromCart = (itemId, size) => {

    if (size === "M") {
      setMartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
      removeorUpdateFreeItems(itemId, martItems, size);
    } else if (size === "L") {
      setLartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
      removeorUpdateFreeItems(itemId, lartItems, size);
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
      removeorUpdateFreeItems(itemId, cartItems, size);
    }

  };

  const updateCartItemCount = (newAmount, itemId, size) => {
    let currentProduct = products.find((product) => product.id === itemId);
    let id = itemId;

    if (currentProduct.offers && currentProduct.offers.length > 0) {
      currentProduct.offers
        .filter((o) => o.size === size)
        .map((offer) => {
          if ((offer.type === 2 && newAmount > 0 && newAmount <= offer.buy) ||
            (offer.type === 1 && newAmount > 0 && newAmount <= offer.buy)) {
            if (newAmount === offer.buy) {
              if (offer.freeProductsize === 'S') {
                addFreeToCart(id, offer.buyget, offer.freeProductid)
              }
              else if (offer.freeProductsize === 'M') {
                addFreeMartToCart(id, offer.buyget, offer.freeProductid)
              } else if (offer.freeProductsize === 'L') {
                addFreeLartToCart(id, offer.buyget, offer.freeProductid)
              }
            }
          }
          else {
            if (offer.freeProductsize === 'S') {
              removeFreeFromCart(id, offer.buyget, offer.freeProductid)
            }
            else if (offer.freeProductsize === 'M') {
              removeFreeMartFromCart(id, offer.buyget, offer.freeProductid)
            } else if (offer.freeProductsize === 'L') {
              removeFreeLartFromCart(id, offer.buyget, offer.freeProductid)
            }
          }
        })
    }

    if (size === "M") {
      setMartItems((prev) => ({ ...prev, [itemId]: newAmount }));
    } else if (size === "L") {
      setLartItems((prev) => ({ ...prev, [itemId]: newAmount }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: newAmount }));
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

  }

  const addFreeToCart = (id, qty, itemId) => {
    setFreeCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + qty }));
  };

  const removeFreeFromCart = (id, qty, itemId) => {
    if (freeCartItems[itemId] >= qty) {
      setFreeCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - qty }));
    }
  };

  const addFreeMartToCart = (id, qty, itemId) => {
    setFreeMartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + qty }));
  };

  const removeFreeMartFromCart = (id, qty, itemId) => {
    if (freeMartItems[itemId] >= qty) {
      setFreeMartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - qty }));
    }
  };

  const addFreeLartToCart = (id, qty, itemId) => {
    setFreeLartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + qty }));
  };

  const removeFreeLartFromCart = (id, qty, itemId) => {
    if (freeLartItems[itemId] >= qty) {
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
    console.log('After coupon total : ' + money);
    setTotalAfterCoupon(money);
  }


  const getTotalAfterDiscount = () => {
    return totalAfterCoupon;
  }
  const cleanTotalAfterDiscount = () => {
    setTotalAfterCoupon(0.0);
  }

  const checkout = () => {
    //setCartItems(getDefaultCart());
  };

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
    resetCart,
    addToCustomerData,
    getCustomerData,
    cleanCustomerData,
    addTotalAfterDiscount,
    getTotalAfterDiscount,
    cleanTotalAfterDiscount
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};
