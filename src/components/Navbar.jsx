import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import api from '../api.js';

const ROLE_LABEL = { STUDENT: 'Student', WARDEN: 'Warden', STAFF: 'Maintenance', ADMIN: 'Admin' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = () =>
      api.get('/notifications').then((r) => setUnread(r.data.filter((n) => n.status === 'UNREAD').length)).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [location.pathname]);

  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="brand">Hostel Desk</NavLink>
        <nav className="nav-links">
          <NavLink to="/" end>Complaints</NavLink>
          {user.role === 'STUDENT' && <NavLink to="/new">New complaint</NavLink>}
          {user.role === 'ADMIN' && <NavLink to="/admin">Manage</NavLink>}
          <NavLink to="/notifications">
            Notifications {unread > 0 && <span className="count">{unread}</span>}
          </NavLink>
          <NavLink to="/profile">{user.name.split(' ')[0]} <small>({ROLE_LABEL[user.role]})</small></NavLink>
          <button className="link-btn" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
        </nav>
      </div>
    </header>
  );
}
