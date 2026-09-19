import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MonitorPlay, Presentation, FileText, Printer, Ticket, Award, FileUp, Mail, AlertCircle } from 'lucide-react';

import { CredentialTicket } from '../components/CredentialTicket';
import { Badge } from '../components/Badge';
import { uploadFile } from '../services/db';

export function UserDashboard({ submissions, events, ingressos = [], user, onSubmitWork, onUpdateSubmission, notifications = [], onUpdateIngresso }) {
  const [activeTab, setActiveTab] = useState('trabalhos');
  const [viewingEvaluation, setViewingEvaluation] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [expandedActivityInfo, setExpandedActivityInfo] = useState(null);

  // Estados para o formulário de submissão
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventId: '',
    tipoApresentacao: 'poster',
    coAutores: '',
  });
  const [trabalhoFile, setTrabalhoFile] = useState(null);
  const [chatInputs, setChatInputs] = useState({});

  const handleSendChatMessage = (subId) => {
    if (!chatInputs[subId]?.trim()) return;
    const sub = submissions.find(s => s.id === subId);
    if (!sub) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'participante',
      text: chatInputs[subId],
      date: new Date().toISOString()
    };

    onUpdateSubmission(subId, { mensagens: [...(sub.mensagens || []), newMessage] });
    setChatInputs(prev => ({ ...prev, [subId]: '' }));
  };

  const canSubmit = true; 
  
  const temTrabalhoAprovado = submissions.some(s => s.status === 'aprovado');
  const temIngressoApresentador = ingressos.some(i => i.categoriasDisplay && i.categoriasDisplay.includes('Apresentador'));
  const precisaComprarIngresso = temTrabalhoAprovado && !temIngressoApresentador;

  const welcomeMessage = {
    id: 'welcome_msg',
    type: 'welcome',
    title: 'Bem-vindo(a) à SEMAFIS - Semana da Física do IFPI!',
    date: new Date().toISOString(),
    content: `Olá, ${user?.displayName || (user?.email ? user.email.split('@')[0] : 'Participante')}!

Seja muito bem-vindo(a) à plataforma oficial da SEMAFIS - Semana da Física do Instituto Federal do Piauí (IFPI) - Campus Teresina Central.

Este sistema foi desenvolvido para facilitar a sua jornada durante o nosso evento, centralizando as informações sobre palestras, minicursos, submissões de trabalhos e certificados. A SEMAFIS é um espaço dedicado à troca de conhecimentos, divulgação científica e fortalecimento da nossa comunidade acadêmica.

Próximos passos:
• Complete o seu perfil na plataforma.
• Acompanhe o cronograma atualizado e inscreva-se nas atividades do seu interesse.
• Fique atento à aba de "Submissões" caso deseje apresentar sua pesquisa.

O evento ocorrerá em breve. Caso haja qualquer alteração de datas ou horários, você será notificado diretamente por aqui.

Em caso de dúvidas, nossa comissão organizadora está à disposição através do e-mail de contato.

Saudações científicas,
Comissão Organizadora - SEMAFIS`
  };

  const displayNotifications = [welcomeMessage, ...notifications].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleSubmitAction = async (e) => {
    e.preventDefault();
    if (!trabalhoFile || !formData.eventId) {
      alert("Selecione o evento e o arquivo PDF.");
      return;
    }
    
    setIsSubmitting(true);
    let arquivoUrl = '';
    try {
      const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
      });

      const base64Data = await fileToBase64(trabalhoFile);
      
      const response = await fetch("https://script.google.com/macros/s/AKfycbwChGj7f-egqX2cPS48JfB2-MW3WWmx9XD16WCqCCUVbt310rFALpYs3l9PHzDI_1I9/exec", {
        method: "POST",
        body: JSON.stringify({
          fileName: `${user.email}_${trabalhoFile.name}`,
          mimeType: trabalhoFile.type,
          base64: base64Data
        })
      });
      
      const result = await response.json();
      if (result.success) {
        arquivoUrl = result.url;
      } else {
        throw new Error(result.error || "Erro desconhecido no Apps Script");
      }
    } catch (err) {
      console.error("Erro no upload do trabalho:", err);
      alert("Aviso: Falha ao enviar arquivo para o Google Drive. Verifique sua conexão ou tente novamente.");
      setIsSubmitting(false);
      return; // Interrompe o envio se falhar
    }

    await onSubmitWork(formData.eventId, {
      usuario: user.displayName || user.email.split('@')[0],
      userEmail: user.email,
      coAutores: formData.coAutores,
      trabalho: trabalhoFile.name,
      arquivoUrl: arquivoUrl,
      modalidade: formData.tipoApresentacao,
      status: 'em_analise',
      data: new Date().toISOString(),
      avaliadoresEmails: [],
      avaliacoes: []
    });

    setShowSubmitForm(false);
    setIsSubmitting(false);
    setFormData({ eventId: '', tipoApresentacao: 'poster', coAutores: '' });
    setTrabalhoFile(null);
  };

  const handlePrint = () => {
    window.print();
  };

  // Mock de Certificados (Para visualização)
  const mockCertificados = events.length > 0 ? [
    { id: 'CERT-001', eventId: events[0].id, type: 'Participação no Evento', ch: '40h' }
  ] : [];

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

        <div className="card print-area" style={{ padding: '4rem', maxWidth: '800px', margin: '0 auto', border: '10px solid var(--accent-primary)', backgroundColor: 'white', color: 'black', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '2rem', right: '2rem', width: '100px', height: '100px', opacity: 0.1, backgroundImage: 'url("https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80")', backgroundSize: 'cover' }}></div>
          
          <h1 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '1rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Certificado</h1>
          <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '3rem', color: 'black', fontWeight: 'normal' }}>de {cert.type}</h2>

          <p style={{ fontSize: '1.25rem', lineHeight: '2', textAlign: 'justify', marginBottom: '3rem' }}>
            Certificamos que <strong>{user?.displayName?.toUpperCase() || 'PARTICIPANTE'}</strong> participou do evento <strong>{evento?.title.toUpperCase()}</strong>, na modalidade presencial, cumprindo carga horária total de <strong>{cert.ch}</strong>.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '4rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '200px', borderBottom: '1px solid black', marginBottom: '0.5rem' }}></div>
              <p style={{ fontSize: '0.875rem' }}>Coordenação do Evento</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '200px', borderBottom: '1px solid black', marginBottom: '0.5rem' }}></div>
              <p style={{ fontSize: '0.875rem' }}>Direção Geral</p>
            </div>
          </div>

          <div style={{ marginTop: '4rem', fontSize: '0.75rem', color: '#666', textAlign: 'center' }}>
            Código de Autenticação: {cert.id}-{user?.uid?.slice(0,6) || 'XXXXXX'}-{new Date().getFullYear()}
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

      {precisaComprarIngresso && (
        <div className="card" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <AlertCircle size={32} style={{ color: '#16a34a', flexShrink: 0 }} />
          <div>
            <h3 style={{ color: '#166534', margin: 0, marginBottom: '0.25rem' }}>Parabéns! Seu trabalho foi aprovado.</h3>
            <p style={{ color: '#15803d', margin: 0 }}>Para confirmar sua apresentação no evento, você precisa adquirir o ingresso da categoria <strong>Apresentador</strong>.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block', backgroundColor: '#16a34a' }}>Comprar Ingresso de Apresentador</Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('trabalhos')} className={`btn ${activeTab === 'trabalhos' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <FileText size={18} /> Trabalhos
        </button>
        <button onClick={() => setActiveTab('ingressos')} className={`btn ${activeTab === 'ingressos' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Ticket size={18} /> Ingressos
        </button>
        <button onClick={() => setActiveTab('programacao')} className={`btn ${activeTab === 'programacao' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Calendar size={18} /> Programação / Atividades
        </button>
        <button onClick={() => setActiveTab('certificados')} className={`btn ${activeTab === 'certificados' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Award size={18} /> Certificados
        </button>
        <button onClick={() => setActiveTab('mensagens')} className={`btn ${activeTab === 'mensagens' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center', position: 'relative' }}>
          <Mail size={18} /> Mensagens
          {displayNotifications.length > 0 && (
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.7rem', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {displayNotifications.length}
            </span>
          )}
        </button>
      </div>

      {/* Programação Tab */}
      {activeTab === 'programacao' && (
        <div className="grid grid-cols-1 gap-8">
          {events.length === 0 ? (
            <div className="card text-center" style={{ padding: '3rem 2rem' }}>
              <h2>Nenhum evento disponível no momento.</h2>
            </div>
          ) : (
            events.map(evento => {
              const myIngresso = ingressos.find(ing => ing.eventId === evento.id);
              if (!evento.activities || evento.activities.length === 0) return null;
              
              const userActivities = myIngresso ? (myIngresso.atividades || '').split(',').map(a => a.trim()) : [];
              
              const toggleInscricao = (actName) => {
                if (!myIngresso) {
                  alert("Você precisa adquirir o ingresso principal deste evento primeiro na página do evento!");
                  return;
                }
                const isEnrolled = userActivities.includes(actName);
                const newActivities = isEnrolled 
                  ? userActivities.filter(a => a !== actName) 
                  : [...userActivities, actName];
                
                onUpdateIngresso(myIngresso.id, { atividades: newActivities.join(', ') || 'Nenhuma' });
                alert(isEnrolled ? `Inscrição em ${actName} cancelada.` : `Inscrito com sucesso em ${actName}!`);
              };

              return (
                <div key={evento.id}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
                    {evento.title} - Quadro de Atividades
                  </h3>
                  {myIngresso ? (
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Você possui ingresso para este evento. Navegue pelas atividades abaixo e se inscreva nas que desejar participar.</p>
                  ) : (
                    <div style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '1rem', borderRadius: '8px', border: '1px dashed #d97706', marginBottom: '2rem' }}>
                      <strong>Aviso:</strong> Você não possui ingresso para este evento. Inscreva-se no evento para poder participar destas atividades.
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {evento.activities.map((act, idx) => {
                      const isEnrolled = userActivities.includes(act.name);
                      
                      // Identify top border color by activity type
                      let borderColor = '#3b82f6'; // Minicurso (default blue)
                      if (act.type === 'Palestra' || act.type === 'Palestra Magna' || act.type === 'Palestra de Encerramento') borderColor = '#0ea5e9'; // Cyan
                      if (act.type === 'Oficina') borderColor = '#8b5cf6'; // Violet
                      if (act.type === 'Mesa Redonda') borderColor = '#f59e0b'; // Amber

                      // Find speaker data
                      const speaker = (evento.speakers || []).find(s => s.nome === act.minister) || {
                        nome: act.minister,
                        bio: 'Biografia não cadastrada pela organização.',
                        detalhesAtividade: 'Nenhum detalhamento extra disponível para esta atividade.',
                        fotoUrl: 'https://via.placeholder.com/150?text=Sem+Foto',
                        papel: 'Ministrante'
                      };

                      const isExpanded = expandedActivityInfo === `${evento.id}-${idx}`;

                      return (
                        <div key={idx} style={{ 
                          backgroundColor: 'white', 
                          borderRadius: '12px', 
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          borderTop: `6px solid ${borderColor}`,
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          {/* Header section */}
                          <div style={{ padding: '1.5rem', flex: 1 }}>
                            <div className="flex justify-between items-start mb-2">
                              <span style={{ color: borderColor, fontWeight: 'bold', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                                {act.type || 'Minicurso'}
                              </span>
                              {isEnrolled && (
                                <span style={{ backgroundColor: '#10b981', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  ✓ Inscrito
                                </span>
                              )}
                            </div>
                            
                            <h4 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                              {act.name}
                            </h4>

                            <div className="flex items-center gap-3 mb-4">
                              <img src={speaker.fotoUrl} alt={speaker.nome} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                              <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                                Com <strong>{speaker.nome}</strong>
                              </div>
                            </div>

                            <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div className="flex items-center gap-2">
                                <Calendar size={16} /> <span>{act.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MonitorPlay size={16} /> <span>{act.room}</span>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Info */}
                          {isExpanded && (
                            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderTop: '1px dashed #e2e8f0', fontSize: '0.9rem', color: '#334155' }}>
                              <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#0f172a' }}>O que você vai aprender:</strong>
                              <p style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{speaker.detalhesAtividade}</p>
                              
                              <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#0f172a' }}>Sobre o Ministrante ({speaker.papel}):</strong>
                              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{speaker.bio}</p>
                            </div>
                          )}

                          {/* Actions Footer */}
                          <div style={{ backgroundColor: '#f1f5f9', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', alignItems: 'center' }}>
                            <button 
                              onClick={() => setExpandedActivityInfo(isExpanded ? null : `${evento.id}-${idx}`)}
                              style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 'bold', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <AlertCircle size={16} /> {isExpanded ? 'Ocultar informações' : 'Mais informações'}
                            </button>
                            
                            {myIngresso && (
                              <button 
                                onClick={() => toggleInscricao(act.name)}
                                style={{ 
                                  background: 'none', 
                                  border: 'none', 
                                  color: isEnrolled ? '#ef4444' : '#10b981', 
                                  fontWeight: 'bold', 
                                  fontSize: '0.875rem', 
                                  cursor: 'pointer' 
                                }}
                              >
                                {isEnrolled ? '× Cancelar inscrição' : '+ Inscrever-se'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Mensagens Tab */}
      {activeTab === 'mensagens' && (
        <div className="grid grid-cols-1 gap-6">
          {displayNotifications.length === 0 ? (
            <div className="card text-center" style={{ padding: '3rem 2rem' }}>
              <h2>Nenhuma mensagem no momento.</h2>
            </div>
          ) : (
            displayNotifications.map((notif) => (
              <div key={notif.id} className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', margin: 0 }}>{notif.title}</h3>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {new Date(notif.date).toLocaleDateString()} {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  {notif.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Trabalhos Tab */}
      {activeTab === 'trabalhos' && (
        <>
          {canSubmit && !showSubmitForm && (
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-start' }}>
              <button onClick={() => setShowSubmitForm(true)} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '1rem 1.5rem' }}>
                <FileUp size={20} /> Enviar Arquivo do Trabalho
              </button>
            </div>
          )}

          {showSubmitForm && (
            <div className="card" style={{ marginBottom: '2rem', padding: '2rem', backgroundColor: '#f8fafc', border: '1px dashed var(--accent-primary)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Submissão de Novo Trabalho</h3>
              <form onSubmit={handleSubmitAction}>
                <div className="mb-4">
                  <label className="form-label">Selecione o Evento</label>
                  <select 
                    className="form-input" 
                    value={formData.eventId} 
                    onChange={e => setFormData({...formData, eventId: e.target.value})}
                    required
                  >
                    <option value="">-- Selecione o evento --</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label">Tipo de Apresentação</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" value="poster" checked={formData.tipoApresentacao === 'poster'} onChange={() => setFormData({...formData, tipoApresentacao: 'poster'})} /> Pôster (PO)
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" value="oral" checked={formData.tipoApresentacao === 'oral'} onChange={() => setFormData({...formData, tipoApresentacao: 'oral'})} /> Comunicação Oral
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label flex items-center gap-2">
                    Co-autores (Opcional)
                  </label>
                  <input type="text" value={formData.coAutores} onChange={e => setFormData({...formData, coAutores: e.target.value})} className="form-input" placeholder="Separe os nomes por vírgula. Ex: Maria Silva, José Pereira" />
                </div>

                <div className="mb-6">
                  <label className="form-label flex items-center gap-2">
                    <FileUp size={18} /> Selecione o Arquivo (PDF, DOCX)
                  </label>
                  <input type="file" onChange={(e) => setTrabalhoFile(e.target.files[0])} className="form-input" required />
                </div>

                <div className="flex gap-4">
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 1 }}>
                    {isSubmitting ? 'Enviando...' : 'Concluir Submissão'}
                  </button>
                  <button type="button" onClick={() => setShowSubmitForm(false)} className="btn btn-outline" style={{ flex: 1 }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {submissions.length === 0 && !showSubmitForm ? (
            <div className="card text-center" style={{ padding: '3rem 2rem' }}>
              <h2>Você não possui trabalhos submetidos.</h2>
              {!canSubmit && (
                <Link to="/" className="btn btn-primary mt-4" style={{ textDecoration: 'none' }}>Ver Eventos</Link>
              )}
            </div>
          ) : !showSubmitForm && (
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
                      {sub.arquivoUrl ? (
                        <button onClick={() => window.open(sub.arquivoUrl, '_blank')} style={{ background: 'none', border: 'none', padding: 0, fontWeight: '500', marginBottom: '1.5rem', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', textDecoration: 'none', cursor: 'pointer' }}>
                          <FileText size={18} /> {sub.trabalho}
                        </button>
                      ) : (
                        <p style={{ fontWeight: '500', marginBottom: '1.5rem', textTransform: 'uppercase' }}>{sub.trabalho}</p>
                      )}

                      {(sub.status === 'aprovado' || sub.status === 'rejeitado') && (
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
                          <button onClick={() => setViewingEvaluation(sub)} className="btn" style={{ backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', padding: '1rem' }}>
                            <FileText size={18} /> Verificar Avaliação
                          </button>
                        </div>
                      )}

                      {sub.status === 'aprovado' && (
                        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Mail size={18} /> Comunicação com a Organização</h4>
                          <div style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '1rem', maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem' }}>
                            {(!sub.mensagens || sub.mensagens.length === 0) ? (
                              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>Nenhuma mensagem enviada.</p>
                            ) : (
                              sub.mensagens.map(msg => (
                                <div key={msg.id} style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'participante' ? 'flex-end' : 'flex-start' }}>
                                  <div style={{ backgroundColor: msg.sender === 'participante' ? '#3b82f6' : '#e2e8f0', color: msg.sender === 'participante' ? 'white' : '#0f172a', padding: '0.75rem 1rem', borderRadius: '12px', maxWidth: '80%' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{msg.text}</p>
                                  </div>
                                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                                    {msg.sender === 'participante' ? 'Você' : 'Organização'} • {new Date(msg.date).toLocaleDateString()} {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                              type="text" 
                              value={chatInputs[sub.id] || ''} 
                              onChange={(e) => setChatInputs({...chatInputs, [sub.id]: e.target.value})} 
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(sub.id); }}
                              placeholder="Digite sua mensagem para a organização..." 
                              className="form-input" 
                              style={{ flex: 1 }}
                            />
                            <button onClick={() => handleSendChatMessage(sub.id)} className="btn btn-primary">Enviar</button>
                          </div>
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
        <div className="grid grid-cols-1 gap-6">
          {ingressos.length === 0 ? (
            <div className="card text-center" style={{ padding: '3rem 2rem', gridColumn: '1 / -1' }}>
              <h2>Você não possui ingressos.</h2>
            </div>
          ) : (
            ingressos.map(ing => {
              const evento = events.find(e => e.id === ing.eventId);
              return (
                <div key={ing.id} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 align-items-start">
                    <div className="md:col-span-2">
                      <CredentialTicket 
                        event={evento}
                        userEmail={ing.userEmail}
                        nome={ing.nome}
                        cpf={ing.cpf}
                        curso={ing.curso}
                        instituicao={ing.instituicao}
                        campus={ing.campus}
                        categoriasDisplay={ing.categoriasDisplay}
                        precoAtual={ing.precoAtual}
                        atividades={ing.atividades}
                        id={ing.id}
                        timestamp={ing.timestamp}
                        showSuccessHeader={false}
                        variant="compact"
                      />
                    </div>
                    
                    <div className="md:col-span-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', textAlign: 'center', color: '#64748b' }}>Seu Crachá Digital</h3>
                      <Badge 
                        type="participante"
                        name={ing.nome}
                        institution={ing.instituicao}
                        logoUrl={evento?.logoUrl}
                        qrCodeValue={JSON.stringify({ userId: ing.userEmail, eventId: ing.eventId, type: 'participante' })}
                      />
                      <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '1rem', textAlign: 'center' }}>
                        Salve ou imprima este crachá para facilitar seu credenciamento.
                      </p>
                    </div>
                  </div>
                  <hr style={{ border: 'none', borderBottom: '1px dashed var(--border-color)', margin: '1rem 0' }} />
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
