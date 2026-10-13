import { useEffect, useState } from 'react';
import api, { errorMessage, fmtDate } from '../api.js';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/notifications').then((r) => setItems(r.data)).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const markAll = async () => { await api.put('/notifications/read-all'); load(); };
  const mark = async (n) => { if (n.status === 'UNREAD') { await api.put(`/notifications/${n.notificationId}/read`); load(); } };

  return (
    <div className="narrow">
      <div className="page-head">
        <h1>Notifications</h1>
        {items.some((n) => n.status === 'UNREAD') && <button className="btn btn-ghost" onClick={markAll}>Mark all as read</button>}
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {items.length === 0 ? <div className="card empty"><p>Nothing new. Status changes and comments will show up here.</p></div> : (
        <ul className="card notes">
          {items.map((n) => (
            <li key={n.notificationId} className={n.status === 'UNREAD' ? 'unread' : ''}>
              <button onClick={() => mark(n)}>
                <span>{n.message}</span>
                <small className="muted">{fmtDate(n.createdDate)}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
