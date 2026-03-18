import React, { useState, useEffect } from "react";


const MegaMenu = () => {

  const [categories, setCategories] = useState([]);


  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch("//localhost:5000/api/category/getCategories?page=0&size=1000&&sort=order,asc");
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
    <div className="menudropdown-content" style={{ zIndex: "20", position: "relative" }}>
      <div className="menuheader">
        <h2>Search By Category</h2>
      </div>
      <div className="menurow">
        <div className="menucolumn">
          <h3>Wellness & Beauty</h3>
          {
            categories && categories
              .filter((cat) => cat.type === 1)
              .map((category) =>
                <><a href={`/byCategory/${category.id}`} key={`${category.id}`}>{category.title}</a></>
              )
          }
        </div>
        <div className="menucolumn">
          <h3>Explore By Need</h3>
          {
            categories && categories
              .filter((cat) => cat.type === 2)
              .map((category) =>
                <a href={`/byCategory/${category.id}`} key={`${category.id}`}>{category.title}</a>
              )
          }
          {/* <a href="/byCategory/7">Cold, Flue & Immunity</a>
          <a href="/byCategory/8">Energy</a>
          <a href="/byCategory/9">PCOS, PCOD & UTI</a>
          <a href="/byCategory/10">Healthy Skin</a>
          <a href="/byCategory/11">Healthy Hair & Nails</a>
          <a href="/byCategory/12">Brain Health</a>
          <a href="/byCategory/13">Bones & Joints</a>
          <a href="/byCategory/14">Muscle Health</a>
          <a href="/byCategory/15">Metabolism</a>
          <a href="/byCategory/16">Gut & Liver Health</a>
          <a href="/byCategory/17">Heart Health</a>
          <a href="/byCategory/18">Stress & Sleep</a>
          <a href="/byCategory/19">Detox</a>
          <a href="/byCategory/20">Skincare</a> */}
        </div>
        <div className="menucolumn">
          <h3>Explore By Ingradient</h3>
          {
            categories && categories
              .filter((cat) => cat.type === 3)
              .map((category) =>
                <a href={`/byCategory/${category.id}`} key={`${category.id}`}>{category.title}</a>
              )
          }
          {/* <a href="/byCategory/21">Omega 3 & Fish Oil</a>
          <a href="/byCategory/22">Collagen</a>
          <a href="/byCategory/23">Biotin</a>
          <a href="/byCategory/24">Plant Protein</a>
          <a href="/byCategory/25">Calcium</a>
          <a href="/byCategory/26">Vitamin D</a>
          <a href="/byCategory/27">Megnesium</a>
          <a href="/byCategory/28">Melatonin</a>
          <a href="/byCategory/29">Iron</a>
          <a href="/byCategory/30">Vitamin C</a>
          <a href="/byCategory/31">Milk Thistle</a>
          <a href="/byCategory/32">Cranberry</a> */}
        </div>
      </div>
    </div>
  )
}

export default MegaMenu;
