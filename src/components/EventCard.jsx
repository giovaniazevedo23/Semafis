import { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

function CountdownTimer({ event }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => {
    const getNextDeadline = () => {
      const now = new Date();
      const deadlines = [];
      if (event.dataInicioInscricao) deadlines.push({ label: 'Inscrições abrem em', date: new Date(`${event.dataInicioInscricao}T00:00:00`) });
      if (event.dataFimInscricao) deadlines.push({ label: 'Inscrições encerram em', date: new Date(`${event.dataFimInscricao}T23:59:59`) });
      if (event.dataInicioSubmissao) deadlines.push({ label: 'Submissões abrem em', date: new Date(`${event.dataInicioSubmissao}T00:00:00`) });
      if (event.dataFimSubmissao) deadlines.push({ label: 'Submissões encerram em', date: new Date(`${event.dataFimSubmissao}T23:59:59`) });
      if (event.date) deadlines.push({ label: 'Evento começa em', date: new Date(`${event.date}T00:00:00`) });

      const futureDeadlines = deadlines.filter(d => d.date > now).sort((a, b) => a.date - b.date);
      return futureDeadlines.length > 0 ? futureDeadlines[0] : null;
    };

    const updateTimer = () => {
      const target = getNextDeadline();
      if (!target) {
        setLabel('Evento Iniciado ou Finalizado');
        setTimeLeft('');
        return;
      }

      setLabel(target.label);
      const now = new Date();
      const diff = target.date - now;

      if (diff <= 0) {
        setTimeLeft('');
        return;
      }
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (!timeLeft) return null;

  return (
    <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Clock size={16} /> {timeLeft}
      </span>
    </div>
  );
}

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
        
        <CountdownTimer event={event} />

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
