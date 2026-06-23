import { useState, useEffect } from 'react';

const API_BASE = 'https://task-fpo2.onrender.com/api';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cursorHistory, setCursorHistory] = useState([null]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(cursorHistory[currentPageIndex]);
  }, [selectedCategory, currentPageIndex]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async (cursorValue) => {
    setLoading(true);
    try {
      let url = `${API_BASE}/products?limit=20`;
      if (selectedCategory) {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (cursorValue) {
        url += `&cursor=${encodeURIComponent(cursorValue)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products);
      setNextCursor(data.nextCursor);
      setHasNextPage(data.hasNextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCursorHistory([null]);
    setCurrentPageIndex(0);
  };

  const handleNextPage = () => {
    if (!hasNextPage || loading) return;
    if (cursorHistory.length <= currentPageIndex + 1) {
      setCursorHistory([...cursorHistory, nextCursor]);
    }
    setCurrentPageIndex(currentPageIndex + 1);
  };

  const handlePrevPage = () => {
    if (currentPageIndex === 0 || loading) return;
    setCurrentPageIndex(currentPageIndex - 1);
  };

  const handleReset = () => {
    setCursorHistory([null]);
    setCurrentPageIndex(0);
    fetchProducts(null);
  };

  const handleSimulateAdd = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/products/simulate-add`;
      if (selectedCategory) {
        url += `?category=${encodeURIComponent(selectedCategory)}`;
      }
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      setSimulationMessage(data.message);
      setTimeout(() => setSimulationMessage(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Product Browser</h1>
        <div className="simulation-actions">
          <button className="btn btn-secondary" onClick={handleSimulateAdd} disabled={loading}>
            Simulate 50 New Products
          </button>
          <button className="btn btn-outline" onClick={handleReset}>
            Reset to Page 1
          </button>
        </div>
      </header>

      {simulationMessage && (
        <div className="alert-message">
          <span>{simulationMessage}</span>
        </div>
      )}

      <main className="app-main">
        <div className="category-tabs">
          <button
            className={`category-tab ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('')}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && products.length === 0 ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Fetching products...</p>
          </div>
        ) : (
          <div className="products-grid-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="id-col">#{p.id}</td>
                    <td className="name-col">{p.name}</td>
                    <td>
                      <span className="category-badge">{p.category}</span>
                    </td>
                    <td className="price-col">${parseFloat(p.price).toFixed(2)}</td>
                    <td className="time-col">{new Date(p.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination-bar">
          <button
            className="btn btn-nav"
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0 || loading}
          >
            &larr; Previous Page
          </button>
          <span className="page-indicator">
            Page {currentPageIndex + 1}
          </span>
          <button
            className="btn btn-nav"
            onClick={handleNextPage}
            disabled={!hasNextPage || loading}
          >
            Next Page &rarr;
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
