import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, UserCircle, FileText, Menu, ChevronDown, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import logoImg from '../assets/logo.png';

export function Navbar({ user, userProfile, monitors = [], avaliadores = [] }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  const isMonitor = monitors.some(m => m.email === user?.email);
  const isAvaliador = avaliadores.some(a => a.email === user?.email);
  const userRole = sessionStorage.getItem('userRole') || 'participante';

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('userRole');
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };

  return (
    <nav className="navbar" style={{ position: 'relative', zIndex: 1000 }}>
      <div className="container navbar-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="flex items-center" style={{ textDecoration: 'none' }}>
          <img src={logoImg} alt="Semafis Logo" style={{ height: '140px', objectFit: 'contain', margin: '-30px 0', marginLeft: '-10px' }} />
        </Link>
        
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="btn btn-outline flex items-center gap-2"
            style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', backgroundColor: 'white', borderRadius: '50px' }}
          >
            {user ? (
              <>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', overflow: 'hidden' }}>
                  {userProfile?.photoUrl ? (
                    <img src={userProfile.photoUrl} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle size={14} />
                  )}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName || 'Minha Conta'}
                </span>
                <ChevronDown size={16} />
              </>
            ) : (
              <>
                <Menu size={20} />
                <span>Menu</span>
              </>
            )}
          </button>

          {isMenuOpen && (
            <div style={{ 
              position: 'absolute', 
              top: 'calc(100% + 0.5rem)', 
              right: 0, 
              backgroundColor: 'white', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px', 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', 
              minWidth: '240px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Portal de Eventos: Visível para Participante, Organizador e Monitor */}
              {(userRole === 'participante' || userRole === 'organizador' || userRole === 'monitor') && (
                <Link to="/" onClick={() => setIsMenuOpen(false)} className={`nav-link-dropdown ${location.pathname === '/' ? 'active-dropdown' : ''}`} style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                  <CalendarDays size={18} /> Portal de Eventos
                </Link>
              )}
              
              {user ? (
                <>
                  {/* Meu Perfil: Visível para Participante, Organizador e Monitor */}
                  {(userRole === 'participante' || userRole === 'organizador' || userRole === 'monitor') && (
                    <Link to="/perfil" onClick={() => setIsMenuOpen(false)} className={`nav-link-dropdown ${location.pathname === '/perfil' ? 'active-dropdown' : ''}`} style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                      <UserCircle size={18} /> Meu Perfil
                    </Link>
                  )}

                  {/* Área do Participante: Visível para Participante, Monitor e Organizador */}
                  {(userRole === 'participante' || userRole === 'monitor' || userRole === 'organizador') && (
                    <Link to="/painel-usuario" onClick={() => setIsMenuOpen(false)} className={`nav-link-dropdown ${location.pathname === '/painel-usuario' ? 'active-dropdown' : ''}`} style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                      <FileText size={18} /> Área do Participante
                    </Link>
                  )}

                  {/* Minhas Atividades (Painel do Monitor): Visível APENAS para Monitor */}
                  {isMonitor && userRole === 'monitor' && (
                    <Link to="/painel-monitor" onClick={() => setIsMenuOpen(false)} className={`nav-link-dropdown ${location.pathname === '/painel-monitor' ? 'active-dropdown' : ''}`} style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                      <FileText size={18} /> Minhas Atividades
                    </Link>
                  )}

                  {/* Painel do Avaliador: Visível APENAS para Avaliador */}
                  {isAvaliador && userRole === 'avaliador' && (
                    <Link to="/painel-avaliador" onClick={() => setIsMenuOpen(false)} className={`nav-link-dropdown ${location.pathname === '/painel-avaliador' ? 'active-dropdown' : ''}`} style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                      <LayoutDashboard size={18} /> Painel do Avaliador
                    </Link>
                  )}

                  {/* Área do Organizador: Visível APENAS para Organizador */}
                  {userRole === 'organizador' && (
                    <Link to="/organizador" onClick={() => setIsMenuOpen(false)} className={`nav-link-dropdown ${location.pathname === '/organizador' ? 'active-dropdown' : ''}`} style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                      <LayoutDashboard size={18} /> Área do Organizador
                    </Link>
                  )}

                  <button onClick={handleLogout} className="nav-link-dropdown" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: '1rem' }}>
                    <LogOut size={18} /> Sair da Conta
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="nav-link-dropdown" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                  <UserCircle size={18} /> Fazer Login
                </Link>
              )}

            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
