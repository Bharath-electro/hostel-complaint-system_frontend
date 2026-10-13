import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage, fmtDate } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { StatusBadge, RoomPlate, STATUS_LABEL } from '../components/StatusBadge.jsx';

const TITLES = {
  STUDENT: 'My complaints',
  WARDEN: 'Complaints in your hostel',
  STAFF: 'Complaints assigned to you',
  ADMIN: 'All complaints',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get('/complaints', { params: filter ? { status: filter } : {} }), api.get('/complaints/stats')])
      .then(([l, s]) => { setList(l.data); setStats(s.data); })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [filter]);

  const downloadReport = async () => {
    try {
      const res = await api.get('/complaints/report', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = 'complaints-report.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setError(errorMessage(e)); }
  };

  return (
    <>
      <div className="page-head">
        <h1>{TITLES[user.role]}</h1>
        <div className="actions">
          {user.role === 'STUDENT' && <Link className="btn" to="/new">Report a problem</Link>}
          {(user.role === 'WARDEN' || user.role === 'ADMIN') && (
            <button className="btn btn-ghost" onClick={downloadReport}>Download report (CSV)</button>
          )}
        </div>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {stats && (
        <div className="stats">
          <button className={`stat ${filter === '' ? 'on' : ''}`} onClick={() => setFilter('')}>
            <b>{stats.total}</b> All
          </button>
          {Object.keys(STATUS_LABEL).map((s) => (
            <button key={s} className={`stat ${filter === s ? 'on' : ''}`} onClick={() => setFilter(s)}>
              <b>{stats[s]}</b> {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      )}

      {loading ? <p className="muted">Loading complaints…</p> : list.length === 0 ? (
        <div className="card empty">
          <p>No complaints here yet.</p>
          {user.role === 'STUDENT' && <Link className="btn" to="/new">Report your first problem</Link>}
        </div>
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>No.</th><th>Category</th><th>Location</th>
                {user.role !== 'STUDENT' && <th>Student</th>}
                <th>Assigned to</th><th>Status</th><th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.complaintId}>
                  <td><Link to={`/complaints/${c.complaintId}`}><RoomPlate id={c.complaintId} /></Link></td>
                  <td>{c.category.name}</td>
                  <td>{c.location}</td>
                  {user.role !== 'STUDENT' && <td>{c.user.name}<small className="muted"> {c.user.hostelName} {c.user.roomNo}</small></td>}
                  <td>{c.assignedTo ? c.assignedTo.name : <span className="muted">Not assigned</span>}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{fmtDate(c.updatedDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
