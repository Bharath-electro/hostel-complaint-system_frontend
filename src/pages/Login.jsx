import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { errorMessage } from '../api.js';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await login(form.email, form.password); }
    catch (err) { setError(errorMessage(err)); setBusy(false); }
  };

  return (
    <div className="auth">
      <section className="auth-intro">
        <h1>Hostel Complaint System</h1>
        <p>Report a problem in your room or block, follow it from submitted to resolved, and talk to the warden in one place.</p>
        <ul className="demo">
          <li><b>student@hostel.com</b> student</li>
          <li><b>warden@hostel.com</b> warden</li>
          <li><b>staff@hostel.com</b> maintenance</li>
          <li><b>admin@hostel.com</b> admin</li>
          <li>Password for all: <b>Password@123</b></li>
        </ul>
      </section>
      <form className="card form" onSubmit={submit}>
        <h2>Log in</h2>
        {error && <p className="error" role="alert">{error}</p>}
        <label>Email
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>Password
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <button className="btn" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="muted">New resident? <Link to="/register">Create a student account</Link></p>
      </form>
    </div>
  );
}
