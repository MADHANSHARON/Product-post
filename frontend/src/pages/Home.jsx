import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.css'

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/products').then((res) => setProducts(res.data));
  }, []);

  return (
    <div className='all-products'>
      <h1>All Products</h1>
      <div className='products-container'>
        {products.map((p) => (
          <div key={p._id} className='products-list'>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            {p.image && (
              <img
                src={`http://localhost:3000/${p.image}`}
                alt={p.name}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
