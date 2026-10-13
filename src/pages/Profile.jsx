import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { errorMessage } from '../api.js';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user.name, phone: user.phone || '', hostelName: user.hostelName || '', roomNo: user.roomNo || '',
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try { await updateProfile(form); setMsg('Profile saved'); }
    catch (err) { setError(errorMessage(err)); }
  };

  return (
    <div className="narrow">
      <h1>My profile</h1>
      <form className="card form" onSubmit={submit}>
        {msg && <p className="ok" role="status">{msg}</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <label>Email<input value={user.email} disabled /></label>
        <label>Name<input required value={form.name} onChange={set('name')} /></label>
        <label>Phone<input value={form.phone} onChange={set('phone')} /></label>
        <div className="row">
          <label>Hostel / block<input value={form.hostelName} onChange={set('hostelName')} /></label>
          <label>Room no.<input value={form.roomNo} onChange={set('roomNo')} /></label>
        </div>
        <button className="btn">Save profile</button>
      </form>
    </div>
  );
}
