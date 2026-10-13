import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api.js';

export default function NewComplaint() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ categoryId: '', location: '', description: '' });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => { api.get('/categories').then((r) => setCategories(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (image) data.append('image', image);
    try {
      const res = await api.post('/complaints', data);
      navigate(`/complaints/${res.data.complaintId}`);
    } catch (err) { setError(errorMessage(err)); setBusy(false); }
  };

  return (
    <div className="narrow">
      <h1>Report a problem</h1>
      <form className="card form" onSubmit={submit}>
        {error && <p className="error" role="alert">{error}</p>}
        <label>Category
          <select required value={form.categoryId} onChange={set('categoryId')}>
            <option value="">Choose a category</option>
            {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
          </select>
        </label>
        <label>Where is it?
          <input required placeholder="Room 204, Block A, 2nd floor washroom…" value={form.location} onChange={set('location')} />
        </label>
        <label>What is wrong?
          <textarea required rows={5} maxLength={2000} placeholder="Describe the problem and when it started" value={form.description} onChange={set('description')} />
        </label>
        <label>Photo (optional, up to 5 MB)
          <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={(e) => setImage(e.target.files[0] || null)} />
        </label>
        <button className="btn" disabled={busy}>{busy ? 'Submitting…' : 'Submit complaint'}</button>
      </form>
    </div>
  );
}
