import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CredentialTicket({ 
  event, 
  userEmail,
  nome,
  cpf,
  curso,
  instituicao,
  campus,
  categoriasDisplay,
  precoAtual,
  atividades,
  id,
  timestamp,
  showSuccessHeader = false
}) {
  const dataInscricao = timestamp ? new Date(timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
  
  // URL Encode logic para o QR Code
  const qrUrlParams = new URLSearchParams({
    nome: nome,
    cpf: cpf,
    inst: instituicao,
    campus: campus,
    cat: categoriasDisplay,
    atividades: atividades,
    id: id || ''
  });
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/validar?${qrUrlParams.toString()}`)}`;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {showSuccessHeader && (
        <div className="text-center mb-4">
          <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto', marginBottom: '1rem' }} />
          <h2>Pagamento Confirmado!</h2>
        </div>
      )}

      <div style={{ backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        
        {/* Header Ticket */}
        <div className="flex justify-between items-center ticket-header" style={{ borderBottom: '2px solid #cbd5e1', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>DOCUMENTO DE INSCRIÇÃO</h1>
          {event?.logoUrl ? (
            <img src={event.logoUrl} alt="Logo" style={{ height: '50px', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--accent-primary)', textAlign: 'right' }}>{event?.title}</div>
          )}
        </div>

        {/* Nome/Profile */}
        <div className="flex items-center gap-4 mb-8">
          {event?.logoUrl && (
            <img src={event.logoUrl} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
          )}
          <div>
            <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Nome:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>
              {nome}
            </span>
          </div>
        </div>

        {/* Dados Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '2rem', marginBottom: '2rem' }}>
          
          {/* Coluna Esquerda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>E-mail:</span>
              <strong style={{ color: '#0f172a', wordBreak: 'break-all' }}>{userEmail}</strong>
            </div>
            {cpf && (
              <div>
                <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>CPF/Passaporte:</span>
                <strong style={{ color: '#0f172a' }}>{cpf}</strong>
              </div>
            )}
            {curso && (
              <div>
                <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Titulação/Curso:</span>
                <strong style={{ color: '#0f172a' }}>{curso}</strong>
              </div>
            )}
            <div>
              <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Instituição:</span>
              <strong style={{ color: '#0f172a' }}>{instituicao} {campus ? `- ${campus}` : ''}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Crachá:</span>
              <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{nome.split(' ')[0]}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Categoria de inscrição:</span>
              <strong style={{ color: '#0f172a' }}>{categoriasDisplay}</strong>
            </div>
            {atividades && atividades !== 'Nenhuma' && (
              <div>
                <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Atividades Inscritas:</span>
                <strong style={{ color: '#0f172a' }}>{atividades}</strong>
              </div>
            )}
            <div>
              <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Data de inscrição:</span>
              <strong style={{ color: '#0f172a' }}>{dataInscricao}</strong>
            </div>
            {id && (
              <div>
                <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>ID do Ingresso:</span>
                <strong style={{ color: '#0f172a' }}>{id}</strong>
              </div>
            )}
          </div>

          {/* Coluna Direita */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
            <div className="flex justify-between">
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Valor da inscrição:</span>
              <span style={{ fontWeight: '600', color: '#64748b' }}>R$ {Number(precoAtual).toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Acréscimo:</span>
              <span style={{ fontWeight: '600', color: '#64748b' }}>R$ 0,00</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Desconto:</span>
              <span style={{ fontWeight: '600', color: '#64748b' }}>R$ 0,00</span>
            </div>
            
            <div className="flex justify-between mt-4 pt-4" style={{ borderTop: '1px solid #cbd5e1' }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Valor Total:</span>
              <span style={{ fontWeight: '800', fontSize: '1.5rem', color: '#0f172a' }}>R$ {Number(precoAtual).toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="mt-6">
              <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Status de pagamento:</span>
              <div style={{ backgroundColor: '#16a34a', color: 'white', padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', borderRadius: '4px' }}>
                Paga - Concluída
              </div>
            </div>
          </div>

        </div>

        {/* QR Code de Validação */}
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '2rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem', fontWeight: 'bold' }}>QR CODE DE AUTENTICAÇÃO</span>
          <img 
            src={qrUrl} 
            alt="QR Code de Validação" 
            style={{ borderRadius: '8px', border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>Apresente este código na entrada do evento</span>
        </div>

      </div>

      {showSuccessHeader && (
        <div className="text-center mt-8">
          <Link to="/painel-usuario" className="btn btn-outline mr-4 mb-2 md:mb-0" style={{ textDecoration: 'none' }}>Ver Meus Ingressos</Link>
          <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>Voltar ao Portal</Link>
        </div>
      )}
    </div>
  );
}
