import { EventCard } from '../components/EventCard';
import { Search } from 'lucide-react';

export function ClientPortal({ events }) {
  return (
    <div className="container">
      <div className="text-center mb-8" style={{ marginTop: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
          Descubra Eventos Incríveis
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          Encontre e garanta seu ingresso para os melhores eventos. De conferências de tecnologia a festivais de música.
        </p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 style={{ fontSize: '1.875rem' }}>Próximos Eventos</h2>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <input 
            type="text" 
            placeholder="Buscar eventos..." 
            className="form-input" 
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center" style={{ padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.25rem' }}>Nenhum evento encontrado. Volte mais tarde!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '2rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
