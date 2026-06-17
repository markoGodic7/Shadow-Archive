import { Provider } from 'react-redux';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { store } from './store/store';
import { useHealth } from './hooks/useHealth';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DeckBuilderPage from './pages/DeckBuilderPage';
import WishlistPage from './pages/WishlistPage';
import CollectionPage from './pages/CollectionPage';
import AdminPage from './pages/AdminPage';
import CardDetailPage from './pages/CardDetailPage';

function AppContent() {
  const status = useHealth();

  return (
    <BrowserRouter>
      <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', display: 'grid', gap: '1rem' }}>
        <header>
          <h1>Shadow Archive</h1>
          <p>Backend health: {status}</p>
        </header>

        <nav style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign up</Link>
          <Link to="/deck-builder">Deck Builder</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/collection">Collection</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/card/1">Card Detail</Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/deck-builder" element={<DeckBuilderPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/card/:id" element={<CardDetailPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
