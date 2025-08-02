import React, { useState } from 'react';
import axios from 'axios';

function AddProduct({ onProductAdded }) {
  const [name, setName] = useState('');
  const [description, setDesc] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (image) formData.append('image', image);

    try {
      await axios.post('http://localhost:3000/product', formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data',
        },
      });
      setName('');
      setDesc('');
      setImage(null);
      onProductAdded();
    } catch {
      alert('Product upload failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Description" value={description} onChange={(e) => setDesc(e.target.value)} />
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <button type="submit">Add Product</button>
    </form>
  );
}

export default AddProduct;
