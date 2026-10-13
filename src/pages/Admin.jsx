import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api.js';

const empty = { name: '', email: '', password: '', role: 'WARDEN', phone: '', hostelName: '', roomNo: '' };

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [cat, setCat] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const load = () => Promise.all([api.get('/users'), api.get('/categories')])
    .then(([u, c]) => { setUsers(u.data); setCategories(c.data); })
    .catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const run = async (fn) => { setError(''); try { await fn(); await load(); } catch (e) { setError(errorMessage(e)); } };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h1>Manage hostel</h1>
      {error && <p className="error" role="alert">{error}</p>}

      <div className="grid-2">
        <form className="card form" onSubmit={(e) => { e.preventDefault(); run(async () => { await api.post('/users', form); setForm(empty); }); }}>
          <h2>Add a user</h2>
          <label>Name<input required value={form.name} onChange={set('name')} /></label>
          <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
          <label>Temporary password<input type="password" required minLength={6} value={form.password} onChange={set('password')} /></label>
          <div className="row">
            <label>Role
              <select value={form.role} onChange={set('role')}>
                <option value="WARDEN">Warden</option>
                <option value="STAFF">Maintenance staff</option>
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <label>Hostel / block<input value={form.hostelName} onChange={set('hostelName')} /></label>
          </div>
          <button className="btn">Add user</button>
        </form>

        <div className="card">
          <h2>Complaint categories</h2>
          <ul className="plain">
            {categories.map((c) => (
              <li key={c.categoryId}>
                <span>{c.name}</span>
                <button className="link-btn danger" onClick={() => run(() => api.delete(`/categories/${c.categoryId}`))}>Delete</button>
              </li>
            ))}
          </ul>
          <form className="row add-cat" onSubmit={(e) => { e.preventDefault(); run(async () => { await api.post('/categories', cat); setCat({ name: '', description: '' }); }); }}>
            <input required placeholder="New category" value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} />
            <button className="btn">Add category</button>
          </form>
        </div>
      </div>

      <h2>All users</h2>
      <div className="table-wrap card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Hostel</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId}>
                <td>{u.name}</td><td>{u.email}</td><td>{u.role.toLowerCase()}</td>
                <td>{u.hostelName} {u.roomNo}</td>
                <td>{u.status.toLowerCase()}</td>
                <td><button className="link-btn" onClick={() => run(() => api.put(`/users/${u.userId}/toggle-status`))}>
                  {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
