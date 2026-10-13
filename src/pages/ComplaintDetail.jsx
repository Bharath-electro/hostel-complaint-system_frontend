import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errorMessage, fmtDate } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { StatusTrack, RoomPlate, STATUS_LABEL } from '../components/StatusBadge.jsx';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [c, setC] = useState(null);
  const [comments, setComments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const canAssign = user.role === 'WARDEN' || user.role === 'ADMIN';
  const canUpdate = canAssign || user.role === 'STAFF';

  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([api.get(`/complaints/${id}`), api.get(`/complaints/${id}/comments`)]);
      setC(a.data); setComments(b.data);
    } catch (e) { setError(errorMessage(e)); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (canAssign) api.get('/users/staff').then((r) => setStaff(r.data)); }, [canAssign]);

  const act = async (fn) => { setError(''); try { await fn(); await load(); } catch (e) { setError(errorMessage(e)); } };
  const setStatus = (status) => act(() => api.put(`/complaints/${id}/status`, { status }));
  const assign = (staffId) => staffId && act(() => api.put(`/complaints/${id}/assign`, { staffId: Number(staffId) }));
  const send = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    act(async () => { await api.post(`/complaints/${id}/comments`, { message }); setMessage(''); });
  };

  if (error && !c) return <p className="error" role="alert">{error}</p>;
  if (!c) return <p className="muted">Loading…</p>;

  return (
    <div className="detail">
      <Link to="/" className="back">Back to complaints</Link>
      <div className="page-head">
        <h1><RoomPlate id={c.complaintId} /> {c.category.name}</h1>
      </div>
      {error && <p className="error" role="alert">{error}</p>}

      <section className="card">
        <StatusTrack status={c.status} />
        <dl className="facts">
          <div><dt>Location</dt><dd>{c.location}</dd></div>
          <div><dt>Reported by</dt><dd>{c.user.name} ({c.user.hostelName || 'no hostel'} {c.user.roomNo})</dd></div>
          <div><dt>Reported on</dt><dd>{fmtDate(c.createdDate)}</dd></div>
          <div><dt>Last update</dt><dd>{fmtDate(c.updatedDate)}</dd></div>
          <div><dt>Assigned to</dt><dd>{c.assignedTo ? c.assignedTo.name : 'Not assigned yet'}</dd></div>
        </dl>
        <p className="desc">{c.description}</p>
        {c.image && <a href={`/uploads/${c.image}`} target="_blank" rel="noreferrer"><img className="photo" src={`/uploads/${c.image}`} alt="Attached by the student" /></a>}
      </section>

      {canUpdate && (
        <section className="card controls">
          <label>Update status
            <select value={c.status} onChange={(e) => setStatus(e.target.value)}>
              {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          {canAssign && (
            <label>Assign to maintenance staff
              <select value="" onChange={(e) => assign(e.target.value)}>
                <option value="">{c.assignedTo ? `Reassign (now ${c.assignedTo.name})` : 'Choose staff member'}</option>
                {staff.map((s) => <option key={s.userId} value={s.userId}>{s.name}</option>)}
              </select>
            </label>
          )}
        </section>
      )}

      <section className="card">
        <h2>Comments</h2>
        {comments.length === 0 && <p className="muted">No comments yet.</p>}
        <ul className="comments">
          {comments.map((m) => (
            <li key={m.commentId} className={m.user.userId === user.userId ? 'mine' : ''}>
              <b>{m.user.name}</b> <small className="muted">{m.user.role.toLowerCase()} · {fmtDate(m.createdDate)}</small>
              <p>{m.message}</p>
            </li>
          ))}
        </ul>
        <form className="comment-form" onSubmit={send}>
          <input maxLength={1000} placeholder={user.role === 'STUDENT' ? 'Add a comment or feedback' : 'Add a remark'} value={message} onChange={(e) => setMessage(e.target.value)} />
          <button className="btn">Post comment</button>
        </form>
      </section>
    </div>
  );
}
