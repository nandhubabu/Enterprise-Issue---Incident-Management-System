import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User as UserIcon, Mail, ShieldAlert, Terminal } from 'lucide-react';

export function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('SUPPORT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          username,
          password,
          email,
          firstName,
          lastName,
          roles: [role],
        });
        await login({ username, password });
      } else {
        await login({ username, password });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user, pass) => {
    setError('');
    setLoading(true);
    try {
      await login({ username: user, password: pass });
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--app-bg)' }}>
      <div className="enterprise-panel" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', background: '#ffffff', border: '1px solid var(--border-default)', borderRadius: '20px', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Enterprise Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 0.95rem', background: 'var(--jira-blue-subtle)', border: '1px solid var(--jira-blue-border)', borderRadius: 'var(--radius-full)', marginBottom: '1rem' }}>
            <Terminal size={14} color="var(--jira-blue)" />
            <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--jira-blue)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              IncidentSphere Ops Console v2.4
            </span>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--text-heading)', letterSpacing: '-0.025em' }}>
            Enterprise Incident Portal
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: 0 }}>
            Unified Atlassian ITSM & Incident Dispatch Terminal
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.7rem 0.9rem', background: 'var(--pagerduty-red-subtle)', border: '1px solid var(--pagerduty-red-border)', color: 'var(--pagerduty-red)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
              <input
                type="text"
                required
                placeholder="Username (e.g. admin or support)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Enterprise Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                  <input
                    type="email"
                    required
                    placeholder="name@enterprise.corp"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Assigned Operational Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="SUPPORT">SUPPORT (NOC incident dispatcher)</option>
                  <option value="DEVELOPER">DEVELOPER (Engineer / Tier 2 responder)</option>
                  <option value="ADMIN">ADMIN (Full organization administrator)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Credentials / Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.45rem', padding: '0.65rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Provision Account' : 'Authenticate Session'}
          </button>
        </form>

        <div style={{ marginTop: '1.15rem', textAlign: 'center' }}>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{ background: 'transparent', border: 'none', color: 'var(--jira-blue)', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}
          >
            {isRegister ? '← Return to Sign In' : 'Need a new operator account? Register'}
          </button>
        </div>

        {/* Demo Fast-Login Strip for Live Verification */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.15rem', borderTop: '1px solid var(--border-default)' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            Quick Role-Based Authentication
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              disabled={loading}
              style={{ fontSize: '0.78rem', justifyContent: 'center' }}
            >
              Admin
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('support', 'support123')}
              disabled={loading}
              style={{ fontSize: '0.78rem', justifyContent: 'center' }}
            >
              Support
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('developer', 'dev123')}
              disabled={loading}
              style={{ fontSize: '0.78rem', justifyContent: 'center' }}
            >
              Developer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
