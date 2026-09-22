import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import logoImg from '../assets/logo.png';

export const Badge = React.forwardRef(({ type = 'participante', name, roleName, logoUrl, qrCodeValue, photoUrl, validUntil }, ref) => {
  const getStyleTokens = () => {
    switch (type.toLowerCase()) {
      case 'monitor':
        return { color: '#3b82f6', role: 'Monitor' }; // Blue
      case 'organizador':
      case 'organização':
        return { color: '#334155', role: 'Organização' }; // Slate
      case 'apresentador':
        return { color: '#8b5cf6', role: 'Apresentador' }; // Purple
      default:
        return { color: '#f97316', role: 'Participante' }; // Orange platform color
    }
  };

  const tokens = getStyleTokens();
  const displayRole = roleName || tokens.role;
  const badgeColor = tokens.color;

  return (
    <div ref={ref} style={{
      width: '320px',
      height: '500px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      color: '#0f172a',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Top Banner with Clip Path and City Skyline Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '180px',
        backgroundColor: badgeColor,
        clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 100%)',
        zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='40' viewBox='0 0 100 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40h10v-20h10v-10h10v30h10v-25h10v25h10v-15h10v15h10v-35h10v35h10v-5h10v5' fill='none' stroke='rgba(255,255,255,0.2)' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundPosition: 'bottom',
        backgroundRepeat: 'repeat-x',
        backgroundSize: '100px 40px'
      }}></div>

      {/* Header Logo */}
      <div style={{
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
        color: 'white'
      }}>
        {logoUrl ? (
          <img src={logoUrl} alt="Logo Evento" style={{ maxHeight: '40px', objectFit: 'contain' }} />
        ) : (
          <img src={logoImg} alt="SEMAFIS Logo" style={{ maxHeight: '50px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        )}
      </div>

      {/* Profile Photo */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        marginTop: '1rem'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: '#e2e8f0',
          border: `4px solid ${badgeColor}`,
          padding: '2px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {photoUrl ? (
            <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            <span style={{ fontSize: '3rem', color: '#94a3b8' }}>
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </span>
          )}
        </div>
      </div>

      {/* User Info */}
      <div style={{
        textAlign: 'center',
        padding: '0.5rem 1.5rem 0',
        position: 'relative',
        zIndex: 1
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '800', 
          margin: '0.5rem 0 0.25rem', 
          color: badgeColor,
          lineHeight: '1.2'
        }}>
          {name || 'Nome do Participante'}
        </h2>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          margin: '0 auto 1rem',
          maxWidth: '80%'
        }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: badgeColor }}></div>
          <span style={{ fontSize: '0.875rem', fontWeight: '700', color: badgeColor, textTransform: 'uppercase' }}>
            {displayRole}
          </span>
          <div style={{ height: '1px', flex: 1, backgroundColor: badgeColor }}></div>
        </div>
      </div>

      {/* QR Code and Validation */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        paddingBottom: '2rem'
      }}>
        {qrCodeValue && (
          <div style={{
            position: 'relative',
            padding: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            {/* Brackets around QR Code */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '20px', height: '20px', borderTop: `3px solid ${badgeColor}`, borderLeft: `3px solid ${badgeColor}` }}></div>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '20px', height: '20px', borderTop: `3px solid ${badgeColor}`, borderRight: `3px solid ${badgeColor}` }}></div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '20px', height: '20px', borderBottom: `3px solid ${badgeColor}`, borderLeft: `3px solid ${badgeColor}` }}></div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', borderBottom: `3px solid ${badgeColor}`, borderRight: `3px solid ${badgeColor}` }}></div>
            
            <QRCodeCanvas value={qrCodeValue} size={90} fgColor={badgeColor} />
          </div>
        )}
        <div style={{
          fontSize: '0.7rem',
          fontWeight: '700',
          color: badgeColor,
          textTransform: 'uppercase'
        }}>
          VÁLIDO ATÉ {validUntil || '21/04/2023'}
        </div>
      </div>

      {/* Bottom Slope */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: badgeColor,
        clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 65%)',
        zIndex: 0
      }}></div>
    </div>
  );
});

Badge.displayName = 'Badge';
