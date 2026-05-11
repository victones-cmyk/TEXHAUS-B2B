import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface ProductResult {
  id: string;
  name: string;
  category: string;
  image_url: string;
  images: string[];
  price: number;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const searchProducts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api<ProductResult[]>(`/api/products/search?q=${encodeURIComponent(q.trim())}`);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      searchProducts(query);
    }, 300);
    return () => {
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
  }, [query, searchProducts]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    if (results.length > 0 || query.trim()) {
      setShowDropdown(true);
    }
  };

  const handleSelect = (product: ProductResult) => {
    setShowDropdown(false);
    setQuery('');
    setResults([]);
    navigate(`/produto/${product.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      if (results.length > 0) {
        handleSelect(results[0]);
      }
    }
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const getProductImage = (product: ProductResult) => {
    if (product.image_url) return product.image_url;
    if (product.images && product.images.length > 0) return product.images[0];
    return null;
  };

  return (
    <div className="search-bar-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <span className="search-icon">&#x1F50D;</span>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar produtos..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowDropdown(false);
            }}
            type="button"
          >
            &times;
          </button>
        )}
      </div>

      {showDropdown && query.trim() && (
        <div className="search-dropdown">
          {loading ? (
            <div className="search-dropdown-item search-loading">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="search-dropdown-item search-empty">Nenhum produto encontrado</div>
          ) : (
            results.map(product => {
              const img = getProductImage(product);
              return (
                <div
                  key={product.id}
                  className="search-dropdown-item"
                  onClick={() => handleSelect(product)}
                  onKeyDown={e => e.key === 'Enter' && handleSelect(product)}
                  tabIndex={0}
                  role="option"
                  aria-selected={false}
                >
                  {img && <img src={img} alt="" className="search-result-img" />}
                  <div className="search-result-info">
                    <span className="search-result-name">{product.name}</span>
                    {product.category && (
                      <span className="search-result-category">{product.category}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
