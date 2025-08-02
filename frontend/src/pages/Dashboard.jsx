import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddProduct from './AddProduct';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [showProducts, setShowProducts] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const navigate = useNavigate();

  const startEdit = (product) => {
    setEditId(product._id);
    setEditName(product.name);
    setEditDesc(product.description);
    setEditImage(null);
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('name', editName);
    formData.append('description', editDesc);
    if (editImage) formData.append('image', editImage);

    try {
      await axios.put(`http://localhost:3000/product/${id}`, formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data',
        },
      });
      setEditId(null);
      fetchData();
    } catch {
      alert('Update failed');
    }
  };

  const fetchData = () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');

    axios
      .get('http://localhost:3000/user', {
        headers: { Authorization: token },
      })
      .then((res) => {
        setUser(res.data.user);
        setProducts(res.data.products);
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/');
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');

    try {
      await axios.delete(`http://localhost:3000/product/${id}`, {
        headers: { Authorization: token },
      });
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className='user-detail'>
      <h2>User Dashboard</h2>

      <div className="info">
        {user && (
          <>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
          </>
        )}

        <div className="button-row">
          <button onClick={() => setShowProducts(!showProducts)}>
            {showProducts ? 'Hide Products' : 'List Products'}
          </button>

          <button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Hide Add Product' : 'Add Product'}
          </button>
        </div>
      </div>

      {showAddForm && <AddProduct onProductAdded={fetchData} />}

      <div className="products-container">
        {showProducts &&
          products.map((p) => (
            <div key={p._id} className="product-edit-box">
              {editId === p._id ? (
                <div className="form-container">
                  <form onSubmit={(e) => handleUpdate(e, p._id)}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Product Name"
                    />
                    <input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Description"
                    />
                    <input
                      type="file"
                      onChange={(e) => setEditImage(e.target.files[0])}
                    />
                    <button type="submit">Update</button>
                    <button type="button" onClick={() => setEditId(null)}>
                      Cancel
                    </button>
                  </form>
                </div>
              ) : (
                <div className="products-list">
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  {p.image && (
                    <img
                      src={`http://localhost:3000/${p.image}`}
                      alt={p.name}
                    />
                  )}
                  <button onClick={() => startEdit(p)}>Edit</button>
                  <button onClick={() => handleDelete(p._id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Dashboard;
