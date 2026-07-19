import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <aside className="auth-intro">
        <span className="eyebrow">A learning adventure for the SDGs</span>
        <h1>Small choices.<br />Visible impact.</h1>
        <p>Explore four communities, help residents solve local challenges, and build your Guardian’s knowledge through play.</p>
        <div className="auth-sprite-row" aria-hidden="true">
          <img src="/assets/characters/player.png" alt="" />
          <span>Move</span><span>Talk</span><span>Choose</span><span>Restore</span>
        </div>
      </aside>
      <section className="auth-panel card">
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
          🌍 SDG Adventure
        </h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24 }}>
          Sign in to continue your journey
        </p>

        {error && (
          <div style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', padding: 'var(--space-sm)', marginBottom: 16, color: 'var(--color-danger)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
