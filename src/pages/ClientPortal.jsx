import { EventCard } from '../components/EventCard';
import { Search, CalendarDays, ArrowRight, Bell, CheckCircle, Circle } from 'lucide-react';

export function ClientPortal({ events, news = [], user, notifications = [], onMarkRead, onMarkUnread }) {
  return (
    <div className="container">
      {user && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, color: '#166534', fontSize: '1.5rem' }}>Boas-vindas ao Semafis, {user.displayName || user.email}!</h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#15803d' }}>Aqui estão as últimas atualizações para você.</p>
          </div>
        </div>
      )}
      <div className="text-center mb-8" style={{ marginTop: '3rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '900', color: 'black', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
          SEMAFIS
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto', fontWeight: '500', color: 'var(--text-secondary)' }}>
          Semana da Matemática e da Física do Instituto Federal do Piauí
        </p>
      </div>

      <div className="flex justify-between items-center mb-8" style={{ gap: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', whiteSpace: 'nowrap' }}>Próximos Eventos</h2>
        
        <div style={{ position: 'relative', flex: 1, maxWidth: '800px' }}>
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
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '2rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', marginBottom: '4rem' }}>
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Últimas Notícias
        </h2>

        {(!news || news.length === 0) ? (
          <div className="text-center" style={{ padding: '3rem 0', color: 'var(--text-secondary)', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
            <p style={{ fontSize: '1.125rem' }}>Fique ligado! Novidades serão publicadas em breve.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {news.map((item) => (
              <div key={item.id} style={{ 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                transition: 'transform 0.3s ease, boxShadow 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)';
              }}>
                {item.imageUrl ? (
                  <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
                    <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                         onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                         onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>
                ) : (
                  <div style={{ height: '200px', width: '100%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '2rem', fontWeight: 'bold' }}>SEMAFIS</span>
                  </div>
                )}
                
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                    <CalendarDays size={16} />
                    {item.date && new Date(item.date).toLocaleDateString('pt-BR')}
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    {item.title}
                  </h3>
                  
                  <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', flex: 1, marginBottom: '1.5rem' }}>
                    {item.summary}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontWeight: '600', fontSize: '0.9rem' }}>
                    Leia mais <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
