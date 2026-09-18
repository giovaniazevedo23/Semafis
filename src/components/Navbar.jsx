import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, UserCircle, FileText } from 'lucide-react';

export function Navbar({ user }) {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
          <CalendarDays size={28} color="var(--accent-primary)" />
          <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>EventFlow</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Portal de Eventos
          </Link>
          <Link to="/painel-usuario" className={`nav-link ${location.pathname === '/painel-usuario' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <FileText size={18} /> Meus Trabalhos
          </Link>
          <Link to="/perfil" className={`nav-link ${location.pathname === '/perfil' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <UserCircle size={18} /> Meu Perfil
          </Link>
          <Link to="/organizador" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <LayoutDashboard size={18} />
            Painel Organizador
          </Link>
        </div>
      </div>
    </nav>
  );
}
