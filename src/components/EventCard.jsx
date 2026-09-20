import { Calendar, MapPin, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EventCard({ event }) {
  const isFree = !event.priceWithoutSubmission || Number(event.priceWithoutSubmission) === 0;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div 
        style={{ 
          height: '200px', 
          backgroundColor: '#e2e8f0', 
          backgroundImage: `url(${event.imageUrl || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{event.title}</h3>
        
        <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
          <Calendar size={16} />
          <span style={{ fontSize: '0.875rem' }}>
            {event.date ? new Date(event.date).toLocaleDateString('pt-BR') : 'Data não definida'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
          <MapPin size={16} />
          <span style={{ fontSize: '0.875rem' }}>{event.location}</span>
        </div>

        <div className="flex items-center gap-2 mb-4" style={{ color: isFree ? '#10b981' : 'var(--accent-primary)', fontWeight: '600' }}>
          <DollarSign size={16} />
          <span style={{ fontSize: '0.875rem' }}>
            {isFree ? 'Gratuito' : `A partir de R$ ${Number(event.priceWithoutSubmission).toFixed(2).replace('.', ',')}`}
          </span>
        </div>
        
        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
          {event.description}
        </p>

        {event.detailedSchedule && event.detailedSchedule.length > 0 && (
          <div style={{ display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: 'bold' }}>
            📅 Cronograma Disponível
          </div>
        )}
        
        <Link to={`/evento/${event.id}`} className="btn btn-outline" style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}>
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
}
