import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MonitorPlay, Presentation, FileText, Printer, Ticket, Award, MapPin } from 'lucide-react';

export function UserDashboard({ submissions, events }) {
  const [activeTab, setActiveTab] = useState('trabalhos'); // 'trabalhos', 'ingressos', 'certificados'
  const [viewingEvaluation, setViewingEvaluation] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  
  // Mock de Ingressos (Para visualização)
  const mockIngressos = events.length > 0 ? [
    { id: 'ING-001', eventId: events[0].id, status: 'pago', user: 'Usuário Demo' }
  ] : [];

  // Mock de Certificados (Para visualização)
  const mockCertificados = events.length > 0 ? [
    { id: 'CERT-001', eventId: events[0].id, type: 'Participação no Evento', ch: '40h' }
  ] : [];

  const handlePrint = () => {
    window.print();
  };

  // Visão de Certificado (Impressão)
  if (viewingCertificate) {
    const cert = viewingCertificate;
    const evento = events.find(e => e.id === cert.eventId);
    
    return (
      <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
        <button onClick={() => setViewingCertificate(null)} className="btn btn-outline mb-4 no-print">Voltar</button>
        <button onClick={handlePrint} className="btn btn-primary mb-4 no-print" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
          <Printer size={16} /> Imprimir / Salvar PDF
        </button>

        <div className="card print-area" style={{ padding: '4rem', maxWidth: '1000px', margin: '0 auto', border: '10px solid var(--accent-primary)', backgroundColor: 'white', color: 'black', textAlign: 'center' }}>
          {evento?.logoUrl && <img src={evento.logoUrl} alt="Logo" style={{ height: '80px', marginBottom: '2rem', objectFit: 'contain' }} />}
          
          <h1 style={{ fontSize: '3rem', color: 'var(--accent-primary)', marginBottom: '3rem', fontFamily: 'serif' }}>CERTIFICADO</h1>
          
          <p style={{ fontSize: '1.25rem', lineHeight: '2', marginBottom: '4rem' }}>
            Certificamos para os devidos fins que <strong>Usuário Demo</strong> participou do evento<br/>
            <strong style={{ fontSize: '1.5rem' }}>{evento?.title}</strong><br/>
            na condição de <strong>{cert.type}</strong>, com carga horária total de <strong>{cert.ch}</strong>.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginTop: '6rem' }}>
            <div style={{ borderTop: '1px solid black', width: '250px', paddingTop: '0.5rem' }}>
              <strong>Coordenação do Evento</strong>
            </div>
            <div style={{ borderTop: '1px solid black', width: '250px', paddingTop: '0.5rem' }}>
              <strong>Comissão Científica</strong>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            .print-area, .print-area * { visibility: visible !important; }
            .print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; border: 10px solid var(--accent-primary) !important; box-shadow: none !important; padding: 2rem !important; }
            .no-print { display: none !important; }
          }
        `}</style>
      </div>
    );
  }

  // Visão de Avaliação
  if (viewingEvaluation) {
    const sub = viewingEvaluation;
    const evento = events.find(e => e.id === sub.eventId);
    const autores = sub.coAutores ? `${sub.usuario} e ${sub.coAutores}` : sub.usuario;
    const comentarios = (sub.avaliacoes || []).map(a => a.comentario).filter(c => c).join("\n\n");

    return (
      <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
        <button onClick={() => setViewingEvaluation(null)} className="btn btn-outline mb-4 no-print">Voltar</button>
        <button onClick={handlePrint} className="btn btn-primary mb-4 no-print" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
          <Printer size={16} /> Imprimir / Salvar PDF
        </button>

        <div className="card print-area" style={{ padding: '4rem', maxWidth: '800px', margin: '0 auto', borderTop: '8px solid var(--accent-primary)', backgroundColor: 'white', color: 'black' }}>
          {evento?.logoUrl ? (
            <img src={evento.logoUrl} alt="Logo Evento" style={{ display: 'block', margin: '0 auto', height: '80px', marginBottom: '3rem', objectFit: 'contain' }} />
          ) : (
            <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem', color: 'var(--accent-primary)' }}>{evento?.title}</h1>
          )}

          <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '4rem', color: 'black', fontWeight: 'bold' }}>AVALIAÇÃO DO TRABALHO</h2>

          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Prezado(a) <strong>{sub.usuario.toUpperCase()}</strong>, informamos que seu trabalho intitulado "{sub.trabalho.toUpperCase()}", foi avaliado e considerado <strong>"{sub.status === 'aprovado' ? 'ACEITO' : 'REJEITADO'}"</strong> pela Comissão Científica do evento.
          </p>

          {comentarios && (
            <div style={{ marginBottom: '3rem' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Caso a comissão tenha deixado algum comentário, ele encontra-se abaixo:</p>
              <div style={{ fontStyle: 'italic', padding: '1rem', borderLeft: '4px solid #ccc', backgroundColor: '#f9f9f9', whiteSpace: 'pre-wrap', fontSize: '1rem' }}>
                "{comentarios}"
              </div>
            </div>
          )}

          <div style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '4rem' }}>
            <p><strong>Modalidade:</strong> {sub.modalidade === 'poster' ? 'Pôster (PO)' : 'Comunicação Oral'}</p>
            <p><strong>Título:</strong> {sub.trabalho.toUpperCase()}</p>
            <p><strong>Autor(es):</strong> {autores.toUpperCase()}</p>
          </div>

          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>Atenciosamente,<br/>Comissão Científica</p>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            .print-area, .print-area * { visibility: visible !important; }
            .print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
            .no-print { display: none !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Área do Participante</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Gerencie seus ingressos, submissões e certificados de participação.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button onClick={() => setActiveTab('trabalhos')} className={`btn ${activeTab === 'trabalhos' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <FileText size={18} /> Meus Trabalhos
        </button>
        <button onClick={() => setActiveTab('ingressos')} className={`btn ${activeTab === 'ingressos' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Ticket size={18} /> Meus Ingressos
        </button>
        <button onClick={() => setActiveTab('certificados')} className={`btn ${activeTab === 'certificados' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Award size={18} /> Meus Certificados
        </button>
      </div>

      {/* Trabalhos Tab */}
      {activeTab === 'trabalhos' && (
        <>
          {submissions.length === 0 ? (
            <div className="card text-center" style={{ padding: '3rem 2rem' }}>
              <h2>Você não possui trabalhos submetidos.</h2>
              <Link to="/" className="btn btn-primary mt-4" style={{ textDecoration: 'none' }}>Ver Eventos</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {submissions.map((sub) => {
                const evento = events.find(e => e.id === sub.eventId);
                return (
                  <div key={sub.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
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

                    <div style={{ padding: '2rem' }}>
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

                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Título do Evento:</p>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{evento?.title || 'Evento não encontrado'}</h4>

                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Arquivo Submetido:</p>
                      <p style={{ fontWeight: '500', marginBottom: '1.5rem', textTransform: 'uppercase' }}>{sub.trabalho}</p>

                      {(sub.status === 'aprovado' || sub.status === 'rejeitado') && (
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
                          <button onClick={() => setViewingEvaluation(sub)} className="btn" style={{ backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', padding: '1rem' }}>
                            <FileText size={18} /> Verificar Avaliação
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Ingressos Tab */}
      {activeTab === 'ingressos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockIngressos.length === 0 ? (
            <div className="card text-center" style={{ padding: '3rem 2rem', gridColumn: '1 / -1' }}>
              <h2>Você não possui ingressos.</h2>
            </div>
          ) : (
            mockIngressos.map(ing => {
              const evento = events.find(e => e.id === ing.eventId);
              const qrUrl = `https://api.invertexto.com/v1/qrcode?text=${ing.id}&scale=3`;
              return (
                <div key={ing.id} className="card" style={{ display: 'flex', overflow: 'hidden', padding: 0 }}>
                  <div style={{ backgroundColor: 'var(--accent-primary)', color: 'white', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '150px' }}>
                    <Ticket size={48} style={{ marginBottom: '1rem' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>VIP Acesso</span>
                  </div>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{evento?.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}><Calendar size={14} style={{ display: 'inline' }}/> {evento?.date}</p>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}><MapPin size={14} style={{ display: 'inline' }}/> {evento?.location}</p>
                      <p style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Participante: {ing.user}</p>
                      <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.5rem', fontWeight: 'bold' }}>PAGAMENTO CONFIRMADO</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
                       <img src={qrUrl} alt="QR Code" style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Certificados Tab */}
      {activeTab === 'certificados' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCertificados.length === 0 ? (
            <div className="card text-center" style={{ padding: '3rem 2rem', gridColumn: '1 / -1' }}>
              <h2>Nenhum certificado disponível.</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Os certificados são liberados após a confirmação de presença no evento.</p>
            </div>
          ) : (
            mockCertificados.map(cert => {
              const evento = events.find(e => e.id === cert.eventId);
              return (
                <div key={cert.id} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '50%', color: '#16a34a' }}>
                    <Award size={32} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{evento?.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{cert.type} - Carga Horária: {cert.ch}</p>
                    <button onClick={() => setViewingCertificate(cert)} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                      Visualizar Certificado
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
