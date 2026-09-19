import { QRCodeSVG } from 'qrcode.react';

export function Badge({ type = 'participante', name, institution, roleName, logoUrl, qrCodeValue }) {
  const getColors = () => {
    switch (type) {
      case 'monitor':
        return { bg: '#3b82f6', text: 'white', label: 'MONITOR' }; // Blue
      case 'organizador':
        return { bg: '#475569', text: 'white', label: 'ORGANIZAÇÃO' }; // Slate/Dark Gray
      default:
        return { bg: '#f8fafc', text: '#0f172a', label: 'PARTICIPANTE' }; // Light
    }
  };

  const colors = getColors();
  const displayRole = roleName || colors.label;

  return (
    <div style={{
      width: '100%',
      maxWidth: '320px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Furo para cordão */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60px',
        height: '10px',
        backgroundColor: '#e2e8f0',
        borderRadius: '10px',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
        zIndex: 10
      }}></div>

      {/* Header com Logo */}
      <div style={{
        padding: '35px 1.5rem 1rem 1.5rem',
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: '2px solid #f1f5f9'
      }}>
        {logoUrl ? (
          <img src={logoUrl} alt="Logo Evento" style={{ maxHeight: '80px', objectFit: 'contain' }} />
        ) : (
          <div style={{ height: '80px', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1.25rem', color: '#64748b' }}>
            SEMAFIS
          </div>
        )}
      </div>

      {/* Área da Foto/Nome */}
      <div style={{
        padding: '2rem 1.5rem',
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg === '#f8fafc' ? 'white' : '#ffffff'
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem', lineHeight: '1.2' }}>
          {name || 'Nome do Usuário'}
        </h2>
        
        {type === 'participante' && institution && (
          <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>
            {institution}
          </p>
        )}
        
        {/* QR Code centralizado para o participante */}
        {qrCodeValue && (
          <div style={{ marginTop: '1.5rem', padding: '10px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
            <QRCodeSVG value={qrCodeValue} size={120} />
          </div>
        )}
      </div>

      {/* Faixa Inferior de Papel/Identificação */}
      <div style={{
        backgroundColor: colors.bg,
        color: colors.text,
        padding: '1rem',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '1.25rem',
        letterSpacing: '2px'
      }}>
        {displayRole}
      </div>
    </div>
  );
}
