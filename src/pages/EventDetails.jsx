import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, ArrowLeft, Clock } from 'lucide-react';

export function EventDetails({ events }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="container text-center" style={{ paddingTop: '5rem' }}>
        <h2>Evento não encontrado</h2>
        <Link to="/" className="btn btn-primary mt-4" style={{ textDecoration: 'none' }}>Voltar ao Início</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Link to="/" className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', marginTop: '2rem' }}>
        <ArrowLeft size={16} /> Voltar para eventos
      </Link>
      
      <div className="card" style={{ overflow: 'hidden' }}>
        <div 
          style={{ 
            height: '400px', 
            backgroundColor: '#e2e8f0', 
            backgroundImage: `url(${event.imageUrl || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <div className="grid grid-cols-1" style={{ gap: '2rem', padding: '2rem', gridTemplateColumns: 'minmax(0, 2fr) 1fr' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{event.title}</h1>
            
            <div className="flex items-center gap-4 mb-6" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <span style={{ fontSize: '1rem' }}>
                  {event.date ? new Date(event.date).toLocaleDateString('pt-BR') : 'Data não definida'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={20} />
                <span style={{ fontSize: '1rem' }}>{event.location}</span>
              </div>
            </div>
            
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Sobre o evento</h3>
            <p style={{ fontSize: '1rem', whiteSpace: 'pre-line', lineHeight: '1.8', marginBottom: '2rem' }}>
              {event.description}
            </p>

            {event.schedule && (
              <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-primary)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                  <Clock size={20} color="var(--accent-primary)" /> Cronograma de Atividades
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {event.schedule.split('\n').filter(line => line.trim() !== '').map((line, idx) => {
                    const parts = line.split('-');
                    const time = parts[0]?.trim();
                    const title = parts.slice(1).join('-')?.trim() || line.trim();
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ 
                          backgroundColor: 'white', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '8px', 
                          fontWeight: 'bold', 
                          color: 'var(--accent-primary)', 
                          minWidth: '80px', 
                          textAlign: 'center',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                          {time || '--:--'}
                        </div>
                        <div style={{ 
                          padding: '0.5rem 0', 
                          color: '#334155', 
                          fontSize: '1rem',
                          flex: 1,
                          borderBottom: idx !== event.schedule.split('\n').filter(l => l.trim() !== '').length - 1 ? '1px dashed #cbd5e1' : 'none'
                        }}>
                          {parts.length > 1 ? title : time}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ position: 'sticky', top: '100px' }}>
            <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-primary)', border: 'none' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Investimento</h3>
              
              <div className="mb-4" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Com Submissão:</span>
                <div className="flex items-center gap-1" style={{ fontWeight: '700', fontSize: '1.25rem' }}>
                  R$ {Number(event.priceWithSubmission || 0).toFixed(2).replace('.', ',')}
                </div>
              </div>

              <div className="mb-6">
                <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Sem Submissão (Ouvinte):</span>
                <div className="flex items-center gap-1" style={{ fontWeight: '700', fontSize: '1.25rem' }}>
                  R$ {Number(event.priceWithoutSubmission || 0).toFixed(2).replace('.', ',')}
                </div>
              </div>

              <button 
                onClick={() => navigate(`/evento/${event.id}/inscricao`)} 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
              >
                Iniciar Inscrição
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
