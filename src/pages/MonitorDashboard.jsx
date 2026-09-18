import { Users, FileText, CheckCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MonitorDashboard({ user, monitors, submissions, avaliadores, events }) {
  if (!user) {
    return (
      <div className="container text-center" style={{ paddingTop: '5rem' }}>
        <h2>Acesso Negado</h2>
        <p>Você precisa estar logado para acessar esta página.</p>
        <Link to="/login" className="btn btn-primary mt-4" style={{ textDecoration: 'none' }}>Fazer Login</Link>
      </div>
    );
  }

  const isMonitor = monitors.some(m => m.email === user.email);

  if (!isMonitor) {
    return (
      <div className="container text-center" style={{ paddingTop: '5rem' }}>
        <h2>Acesso Restrito</h2>
        <p>Esta página é exclusiva para Monitores cadastrados pela organização.</p>
        <Link to="/" className="btn btn-primary mt-4" style={{ textDecoration: 'none' }}>Voltar ao Início</Link>
      </div>
    );
  }

  const mySubmissions = submissions.filter(sub => sub.monitorEmail === user.email);

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div className="flex justify-between items-center mb-8" style={{ marginTop: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--accent-primary)' }}>Painel do Monitor</h1>
          <p>Olá, {user.displayName || user.email}! Aqui estão os trabalhos sob sua supervisão e os avaliadores que você deve acompanhar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe' }}>
          <div className="flex items-center gap-4">
            <FileText size={32} color="#4f46e5" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#312e81' }}>{mySubmissions.length}</h3>
              <span style={{ color: '#4338ca', fontSize: '0.875rem' }}>Trabalhos Atribuídos a Você</span>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Trabalhos Sob Sua Supervisão</h2>
      
      {mySubmissions.length === 0 ? (
        <div className="card text-center mb-8" style={{ padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
          <CheckCircle size={48} style={{ margin: '0 auto', marginBottom: '1rem', color: '#10b981', opacity: 0.5 }} />
          <p>Você ainda não foi designado para supervisionar nenhum trabalho pela organização.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 mb-8">
          {mySubmissions.map(sub => {
            const assignedAvaliadores = avaliadores.filter(a => (sub.avaliadoresEmails || []).includes(a.email));
            const event = events.find(e => e.id === sub.eventId);
            
            return (
              <div key={sub.id} className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{sub.trabalho}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Autor(a): <strong>{sub.usuario}</strong></p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Evento: {event ? event.title : 'Desconhecido'}</p>
                  </div>
                  <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                    {sub.modalidade.toUpperCase()}
                  </span>
                </div>

                <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border-color)' }} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
                      <Calendar size={18} /> Detalhes da Apresentação
                    </h4>
                    {sub.detalhesApresentacao && sub.detalhesApresentacao.dataApresentacao ? (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Data:</strong> {sub.detalhesApresentacao.dataApresentacao}</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Horário:</strong> {sub.detalhesApresentacao.horaApresentacao}</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Local:</strong> {sub.detalhesApresentacao.localApresentacao}</li>
                        {sub.detalhesApresentacao.numeroPoster && <li><strong>Pôster:</strong> {sub.detalhesApresentacao.numeroPoster}</li>}
                      </ul>
                    ) : (
                      <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>A organização ainda não definiu data e local para este trabalho. Aguarde a aprovação.</p>
                    )}
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
                      <Users size={18} /> Avaliadores Responsáveis
                    </h4>
                    {assignedAvaliadores.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {assignedAvaliadores.map(avaliador => (
                          <div key={avaliador.id} className="flex items-center gap-4">
                            {avaliador.fotoUrl ? (
                              <img src={avaliador.fotoUrl} alt={avaliador.nome} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            ) : (
                              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={24} color="#64748b" />
                              </div>
                            )}
                            <div>
                              <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '1rem' }}>{avaliador.nome}</strong>
                              <a href={`mailto:${avaliador.email}`} style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>{avaliador.email}</a>
                              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Tel: {avaliador.telefone}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#f59e0b', fontSize: '0.875rem', margin: 0, fontWeight: '500' }}>Nenhum avaliador atribuído ainda a este trabalho. A organização deve realizar este vínculo.</p>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
