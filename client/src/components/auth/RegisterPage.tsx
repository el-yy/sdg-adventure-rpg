import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, displayName);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <aside className="auth-intro">
        <span className="eyebrow">Begin your field journal</span>
        <h1>Become an<br />SDG Guardian.</h1>
        <p>Your progress, quests, inventory, and achievements are saved to your Guardian profile.</p>
        <div className="auth-sprite-row" aria-hidden="true">
          <img src="/assets/characters/player.png" alt="" />
          <span>Learn</span><span>Explore</span><span>Act</span><span>Level up</span>
        </div>
      </aside>
      <section className="auth-panel card">
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
          🌍 Join the Adventure
        </h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24 }}>
          Create your SDG Guardian account
        </p>

        {error && (
          <div style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', padding: 'var(--space-sm)', marginBottom: 16, color: 'var(--color-danger)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Guardian Name</label>
            <input
              className="input-field"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Choose a name"
              required
            />
          </div>

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
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="input-field"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
            />
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
