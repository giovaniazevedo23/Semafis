import { Link } from 'react-router-dom';
import { Calendar, Clock, MonitorPlay, Presentation } from 'lucide-react';

export function UserDashboard({ submissions, events }) {
  if (submissions.length === 0) {
    return (
      <div className="container text-center" style={{ paddingTop: '5rem' }}>
        <h2>Você não possui trabalhos submetidos.</h2>
        <Link to="/" className="btn btn-primary mt-4" style={{ textDecoration: 'none' }}>Ver Eventos</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Meus Trabalhos</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Acompanhe o status das suas submissões e detalhes de apresentação.</p>

      <div className="grid grid-cols-1 gap-6">
        {submissions.map((sub) => {
          const evento = events.find(e => e.id === sub.eventId);
          
          return (
            <div key={sub.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {/* Card Header */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex items-center gap-2">
                  <MonitorPlay size={24} style={{ color: 'var(--text-secondary)' }} />
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Apresentação de Trabalho</h3>
                </div>
                <div>
                  {sub.status === 'em_analise' && <span style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 'bold' }}>Em Análise</span>}
                  {sub.status === 'aprovado' && <span style={{ backgroundColor: '#bbf7d0', color: '#166534', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 'bold' }}>Aprovado</span>}
                  {sub.status === 'rejeitado' && <span style={{ backgroundColor: '#fecaca', color: '#991b1b', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 'bold' }}>Rejeitado</span>}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '2rem' }}>
                
                {/* Se aprovado, mostra a barra de destaque igual a imagem */}
                {sub.status === 'aprovado' && sub.detalhesApresentacao && (
                  <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-4 mb-2" style={{ color: '#0f172a', fontWeight: '500' }}>
                      <span className="flex items-center gap-1"><Calendar size={18} /> {sub.detalhesApresentacao.dataApresentacao}</span>
                      <span className="flex items-center gap-1"><Clock size={18} /> {sub.detalhesApresentacao.horaApresentacao}</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: '600' }}>
                      <Presentation size={20} />
                      {sub.detalhesApresentacao.numeroPoster ? `${sub.detalhesApresentacao.numeroPoster} - ` : ''} 
                      {sub.detalhesApresentacao.localApresentacao}
                    </div>
                  </div>
                )}

                {/* Detalhes fixos */}
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Título do Evento:</p>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{evento?.title || 'Evento não encontrado'}</h4>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Arquivo Submetido:</p>
                <p style={{ fontWeight: '500', marginBottom: '1.5rem', textTransform: 'uppercase' }}>{sub.trabalho}</p>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Modalidade Selecionada:</p>
                <p style={{ fontWeight: '500' }}>
                  {sub.modalidade === 'poster' ? 'Pôster (PO)' : 'Comunicação Oral'}
                </p>

                {sub.status === 'aprovado' && sub.detalhesApresentacao && (
                  <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <h5 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Informações importantes para o dia:</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <strong>Data da apresentação:</strong> <span>{sub.detalhesApresentacao.dataApresentacao}</span>
                      <strong>Hora da apresentação:</strong> <span>{sub.detalhesApresentacao.horaApresentacao}</span>
                      <strong>Local / Sessão:</strong> <span>{sub.detalhesApresentacao.localApresentacao}</span>
                      {sub.detalhesApresentacao.numeroPoster && (
                        <>
                          <strong>Nº do Pôster:</strong> <span>{sub.detalhesApresentacao.numeroPoster}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
