import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Users, MonitorPlay, GraduationCap, LayoutDashboard } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export function Login({ setUser, monitors, avaliadores }) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async (role) => {
    setIsLoading(true);
    try {
      // Fazendo o login real com o Google usando o Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;

      // Verificação de Restrição
      if (role === 'avaliador') {
        const isAvaliador = avaliadores.some(a => a.email === userEmail);
        if (!isAvaliador) {
          alert("Acesso Negado: Seu e-mail não está cadastrado na lista de Avaliadores do evento.");
          await auth.signOut();
          setIsLoading(false);
          return;
        }
      }

      if (role === 'monitor') {
        const isMonitor = monitors.some(m => m.email === userEmail);
        if (!isMonitor) {
          alert("Acesso Negado: Seu e-mail não está cadastrado na lista de Monitores do evento.");
          await auth.signOut();
          setIsLoading(false);
          return;
        }
      }

      // Salva a role na sessão para controlar o Menu
      sessionStorage.setItem('userRole', role);

      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName
      });

      // Redireciona para o painel correto
      if (role === 'avaliador') navigate('/painel-avaliador');
      else if (role === 'monitor') navigate('/painel-monitor');
      else navigate('/'); 

    } catch (error) {
      console.error("Erro no login", error);
      alert("Falha ao fazer login com o Google. Verifique se o provedor está habilitado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="card text-center" style={{ padding: '3rem', maxWidth: '800px', width: '100%' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Acesso ao Sistema</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>Selecione o seu perfil de acesso. Todos os logins são feitos de forma segura via Google.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Users size={20} /> Participante
            </h3>
            <button 
              onClick={() => handleGoogleLogin('participante')} 
              disabled={isLoading}
              className="btn btn-outline" 
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', backgroundColor: 'white' }}
            >
              {isLoading ? 'Conectando...' : <><LogIn size={18} /> Entrar como Participante</>}
            </button>
          </div>

          <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={20} /> Organizador
            </h3>
            <button 
              onClick={() => handleGoogleLogin('organizador')} 
              disabled={isLoading}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', backgroundColor: '#475569', border: 'none' }}
            >
              {isLoading ? 'Conectando...' : <><LogIn size={18} /> Entrar como Organizador</>}
            </button>
          </div>

          <div style={{ padding: '1.5rem', border: '1px solid #bbf7d0', borderRadius: '8px', backgroundColor: '#f0fdf4', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <GraduationCap size={20} /> Membro da Comissão (Avaliador)
            </h3>
            <button 
              onClick={() => handleGoogleLogin('avaliador')} 
              disabled={isLoading}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', backgroundColor: '#16a34a', border: 'none' }}
            >
              {isLoading ? 'Conectando...' : <><LogIn size={18} /> Entrar como Avaliador</>}
            </button>
          </div>

          <div style={{ padding: '1.5rem', border: '1px solid #c7d2fe', borderRadius: '8px', backgroundColor: '#eef2ff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <MonitorPlay size={20} /> Monitor do Evento
            </h3>
            <button 
              onClick={() => handleGoogleLogin('monitor')} 
              disabled={isLoading}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', backgroundColor: '#4f46e5', border: 'none' }}
            >
              {isLoading ? 'Conectando...' : <><LogIn size={18} /> Entrar como Monitor</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
