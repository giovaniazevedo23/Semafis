import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, UserCircle, FileText, Menu, ChevronDown, LogOut, Bell, CheckCircle, Circle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import logoImg from '../assets/logo.png';

export function Navbar({ user, userProfile, monitors = [], avaliadores = [], events = [], notifications = [], onMarkRead, onMarkUnread }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  
  const isMonitor = monitors.some(m => m.email === user?.email);
  const isAvaliador = avaliadores.some(a => a.email === user?.email);
  const userRole = sessionStorage.getItem('userRole') || 'participante';

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef, notifRef]);

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('userRole');
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };

  const eventMatch = location.pathname.match(/\/evento\/([^/]+)/);
  const currentEventId = eventMatch ? eventMatch[1] : null;
  const currentEvent = events?.find(e => e.id === currentEventId) || (events && events.length > 0 ? events[0] : null);

  let edition = "I";
  if (currentEvent && currentEvent.title) {
    // Tenta encontrar um número romano ou decimal no início do título
    const match = currentEvent.title.match(/^([XIVMCDL]+|\d+)\b/i);
    if (match) {
      edition = match[1].toUpperCase();
    }
  }

  return (
    <nav className="navbar" style={{ position: 'relative', zIndex: 1000 }}>
      <div className="container navbar-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="flex items-center" style={{ textDecoration: 'none', gap: '1rem' }}>
          <img src={logoImg} alt="Semafis Logo" style={{ height: '50px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
             <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-primary)', lineHeight: 1, letterSpacing: '2px' }}>
                {edition} EDIÇÃO
             </span>
             <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '1px' }}>
                SEMAFIS
             </span>
          </div>
        </Link>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user && (
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="btn btn-outline"
                style={{ padding: '0.5rem', border: 'none', backgroundColor: 'transparent', position: 'relative' }}
              >
                <Bell size={24} style={{ color: 'var(--text-primary)' }} />
                {notifications.some(n => !(n.readBy || []).includes(user.email)) && (
                  <span style={{ position: 'absolute', top: '2px', right: '4px', width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>
                )}
              </button>

              {isNotifOpen && (
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(100% + 0.5rem)', 
                  right: 0, 
                  backgroundColor: 'white', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', 
                  width: '350px',
                  maxHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  zIndex: 1001
                }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Suas Mensagens</h3>
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {notifications.filter(notif => !(notif.readBy || []).includes(user.email)).length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>0 mensagens. Você não tem novas mensagens.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {notifications.filter(notif => !(notif.readBy || []).includes(user.email)).map(notif => {
                          const isRead = false; // Como só mostramos não lidas, sempre é false
                          return (
                            <div key={notif.id} style={{ 
                              padding: '1rem', 
                              backgroundColor: '#f0fdf4', 
                              borderBottom: '1px solid var(--border-color)',
                              borderLeft: `4px solid #10b981`
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>{notif.title}</h4>
                                <button 
                                  onClick={() => onMarkRead(notif.id, user.email)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', padding: 0 }}
                                  title="Marcar como lida e ocultar"
                                >
                                  <Circle size={16} />
                                </button>
                              </div>
                              <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.85rem', lineHeight: '1.4' }}>{notif.content}</p>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                {new Date(notif.timestamp).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

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
                overflow: 'hidden',
                zIndex: 1001
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
      </div>
    </nav>
  );
}
