import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { errorMessage } from '../api.js';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', hostelName: '', roomNo: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await register(form); }
    catch (err) { setError(errorMessage(err)); setBusy(false); }
  };

  return (
    <div className="auth single">
      <form className="card form" onSubmit={submit}>
        <h2>Create student account</h2>
        {error && <p className="error" role="alert">{error}</p>}
        <label>Full name<input required value={form.name} onChange={set('name')} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Password (6+ characters)<input type="password" required minLength={6} value={form.password} onChange={set('password')} /></label>
        <label>Phone<input value={form.phone} onChange={set('phone')} /></label>
        <div className="row">
          <label>Hostel / block<input placeholder="Block A" value={form.hostelName} onChange={set('hostelName')} /></label>
          <label>Room no.<input placeholder="204" value={form.roomNo} onChange={set('roomNo')} /></label>
        </div>
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
