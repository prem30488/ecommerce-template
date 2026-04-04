import { useEffect, useState } from "react";

import { API_BASE_URL } from '../constants/index.jsx';
const Fetchdata = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (!res.ok) throw new Error("Oops! An error has occured");
      const json = await res.json();

      setProducts(json);
    };
    getData();
  }, []);

  return products;
};

export default Fetchdata;
