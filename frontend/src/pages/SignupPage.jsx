import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../store/slices/authSlice';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await dispatch(register({ username, email, password, passwordConfirm })).unwrap();
      navigate('/search');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <section style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
          />
        </div>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
          />
        </div>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <label htmlFor="password-confirm">Confirm Password</label>
          <input
            id="password-confirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Repeat your password"
            required
            minLength={8}
          />
        </div>
        {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>
    </section>
  );
}
