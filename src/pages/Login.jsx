import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export function Login({ setUser }) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Fazendo o login real com o Google usando o Firebase
      const result = await signInWithPopup(auth, googleProvider);
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName
      });
      navigate('/'); // Volta para a Home
    } catch (error) {
      console.error("Erro no login", error);
      alert("Falha ao fazer login com o Google. Verifique se o provedor está habilitado no Console do Firebase.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="card text-center" style={{ padding: '3rem', maxWidth: '400px', width: '100%' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Bem-vindo</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Faça login para se inscrever nos eventos e enviar seus trabalhos.</p>
        
        <button 
          onClick={handleGoogleLogin} 
          disabled={isLoading}
          className="btn btn-outline" 
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}
        >
          {isLoading ? 'Conectando...' : (
            <>
              <LogIn size={20} />
              Entrar com o Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}
