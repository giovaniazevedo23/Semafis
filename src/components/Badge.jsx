import { QRCodeSVG } from 'qrcode.react';

export function Badge({ type = 'participante', name, institution, roleName, logoUrl, qrCodeValue }) {
  const getStyleTokens = () => {
    switch (type) {
      case 'monitor':
        return {
          gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
          text: 'white',
          label: 'MONITOR',
          shadow: 'rgba(59, 130, 246, 0.4)'
        };
      case 'organizador':
        return {
          gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          text: '#fbbf24', // Gold text
          label: 'ORGANIZAÇÃO',
          shadow: 'rgba(15, 23, 42, 0.4)'
        };
      default:
        return {
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          text: 'white',
          label: 'PARTICIPANTE',
          shadow: 'rgba(236, 72, 153, 0.4)'
        };
    }
  };

  const tokens = getStyleTokens();
  const displayRole = roleName || tokens.label;

  return (
    <div style={{
      width: '100%',
      maxWidth: '320px',
      margin: '0 auto',
      background: tokens.gradient,
      borderRadius: '16px',
      boxShadow: `0 20px 40px -10px ${tokens.shadow}`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      {/* Lanyard Hole */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60px',
        height: '12px',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.3)',
        zIndex: 10
      }}></div>

      {/* Decorative top circles */}
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
      <div style={{ position: 'absolute', top: '50px', left: '-50px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>

      {/* Header */}
      <div style={{
        padding: '40px 1.5rem 1.5rem 1.5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {logoUrl ? (
          <img src={logoUrl} alt="Logo Evento" style={{ maxHeight: '70px', objectFit: 'contain', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }} />
        ) : (
          <div style={{ height: '70px', display: 'flex', alignItems: 'center', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            SEMAFIS
          </div>
        )}
      </div>

      {/* Content Area */}
      <div style={{
        padding: '1rem 1.5rem 2rem 1.5rem',
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', lineHeight: '1.2', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          {name || 'Nome do Usuário'}
        </h2>
        
        {type === 'participante' && institution && (
          <p style={{ fontSize: '1rem', fontWeight: '500', opacity: 0.9, marginBottom: '1.5rem' }}>
            {institution}
          </p>
        )}
        
        {/* Glassmorphism QR Code Container */}
        {qrCodeValue && (
          <div style={{ 
            marginTop: institution ? '0' : '1.5rem', 
            padding: '12px', 
            background: 'rgba(255, 255, 255, 0.9)', 
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(4px)'
          }}>
            <QRCodeSVG value={qrCodeValue} size={140} />
          </div>
        )}
      </div>

      {/* Bottom Role Banner */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(10px)',
        color: tokens.text,
        padding: '1.25rem',
        textAlign: 'center',
        fontWeight: '800',
        fontSize: '1.25rem',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {displayRole}
      </div>
    </div>
  );
}
