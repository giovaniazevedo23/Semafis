import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ShieldCheck, User, Building, Tag, List } from 'lucide-react';

export function ValidarCredencial() {
  const [searchParams] = useSearchParams();
  
  const nome = searchParams.get('nome');
  const cpf = searchParams.get('cpf');
  const inst = searchParams.get('inst');
  const campus = searchParams.get('campus');
  const cat = searchParams.get('cat');
  const atividades = searchParams.get('atividades');
  const id = searchParams.get('id');
  const evento = searchParams.get('evento');

  // Se não tem nome, a URL é inválida
  if (!nome) {
    return (
      <div className="container text-center" style={{ paddingTop: '5rem' }}>
        <h2>QR Code Inválido.</h2>
        <p>Os dados da credencial não puderam ser lidos.</p>
        <Link to="/" className="btn btn-primary mt-4">Voltar ao Início</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem', maxWidth: '600px' }}>
      <div className="card text-center" style={{ padding: '3rem 2rem', borderTop: '8px solid #10b981' }}>
        <ShieldCheck size={64} style={{ color: '#10b981', margin: '0 auto', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2rem', color: '#10b981', marginBottom: '0.5rem' }}>Credencial Autêntica</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>A validação deste ingresso foi realizada com sucesso.</p>

        <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '1.5rem', textAlign: 'left', border: '1px solid #e2e8f0' }}>
          
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Participante</span>
              <strong style={{ fontSize: '1.25rem', color: '#0f172a' }}>{nome}</strong>
            </div>
          </div>

          {cpf && (
            <div style={{ marginBottom: '1rem', marginLeft: '28px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>CPF / Passaporte</span>
              <strong style={{ color: '#0f172a' }}>{cpf}</strong>
            </div>
          )}

          {inst && (
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Building size={20} style={{ color: 'var(--accent-primary)', marginTop: '4px' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Instituição / Campus</span>
                <strong style={{ color: '#0f172a' }}>{inst} {campus ? `- ${campus}` : ''}</strong>
              </div>
            </div>
          )}

          {(cat || id) && (
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Tag size={20} style={{ color: 'var(--accent-primary)', marginTop: '4px' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Categoria / ID</span>
                <strong style={{ color: '#0f172a' }}>{cat || `Ingresso ID: ${id}`}</strong>
              </div>
            </div>
          )}

          {(atividades || evento) && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', borderTop: '1px solid #cbd5e1', paddingTop: '1rem', marginTop: '1rem' }}>
              <List size={20} style={{ color: 'var(--accent-primary)', marginTop: '4px' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Atividades Inscritas / Evento</span>
                <strong style={{ color: '#0f172a' }}>{atividades || evento}</strong>
              </div>
            </div>
          )}

        </div>

        <div style={{ marginTop: '2rem' }}>
          <CheckCircle size={24} style={{ color: '#10b981', display: 'inline', marginRight: '0.5rem' }} />
          <span style={{ fontWeight: '500', color: '#10b981' }}>Validação verificada em {new Date().toLocaleString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}
