import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";


const MegaMenu = () => {

  const [categories, setCategories] = useState([]);


  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/category/getCategories?page=0&size=1000&&sort=order,asc");
        if (!res.ok) throw new Error("Oops! An error has occured");
        const json = await res.json();

        setCategories(json.content);
      } catch (err) {
        console.log(err.message);
      }
    };
    getData();
  }, []);

  return (
    <div className="menudropdown-content">
      <div className="menuheader">
        <h2>Shop By Category</h2>
      </div>
      <div className="menurow">
        <div className="menucolumn">
          <h3>Wellness & Beauty</h3>
          <div className="category-list">
            {
              categories && categories
                .filter(cat => cat.type === 1)
                .map(cat => (
                  <Link key={cat.id} to={`/byCategory/${cat.id}`}>{cat.title}</Link>
                ))
            }
          </div>
        </div>
        <div className="menucolumn">
          <h3>Explore By Need</h3>
          <div className="category-list">
            {
              categories && categories
                .filter(cat => cat.type === 2)
                .map(cat => (
                  <Link key={cat.id} to={`/byCategory/${cat.id}`}>{cat.title}</Link>
                ))
            }
          </div>
        </div>
        <div className="menucolumn">
          <h3>Explore By Ingradient</h3>
          <div className="category-list">
            {
              categories && categories
                .filter(cat => cat.type === 3)
                .map(cat => (
                  <Link key={cat.id} to={`/byCategory/${cat.id}`}>{cat.title}</Link>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default MegaMenu;
