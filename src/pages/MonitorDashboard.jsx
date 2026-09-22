import { useState, useEffect, useRef } from 'react';
import { Users, FileText, CheckCircle, Calendar, Camera, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';

export function MonitorDashboard({ user, monitors, submissions, avaliadores, events, ingressos = [], onUpdateIngresso }) {
  const [activeTab, setActiveTab] = useState('escala'); // 'escala', 'trabalhos', 'credenciamento', 'relatorios'
  const [viewingReport, setViewingReport] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUserId, setScannedUserId] = useState(null);
  const [selectedCheckinActivity, setSelectedCheckinActivity] = useState('GERAL');
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrcodeScanner = null;
    if (isScanning && window.Html5QrcodeScanner) {
      html5QrcodeScanner = new window.Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      html5QrcodeScanner.render(
        (decodedText, decodedResult) => {
          let extractedId = decodedText;
          try {
            const url = new URL(decodedText);
            if (url.searchParams.has('id')) {
              extractedId = url.searchParams.get('id');
            }
          } catch(e) {}

          setScannedUserId(extractedId);
          const ing = ingressos.find(i => i.userEmail === extractedId || i.id === extractedId);
          if (ing) {
            if (onUpdateIngresso) {
              const novaPresenca = { ...(ing.presenca || {}) };
              novaPresenca[selectedCheckinActivity] = true;
              onUpdateIngresso(ing.id, { 
                presenca: novaPresenca, 
                checkinGeral: selectedCheckinActivity === 'GERAL' ? true : ing.checkinGeral 
              });
            }
            alert(`Usuário ${ing.nome} credenciado com sucesso em: ${selectedCheckinActivity}!`);
          } else {
            alert(`Usuário ${extractedId} lido, mas ingresso não encontrado.`);
          }
          setIsScanning(false);
          if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().catch(error => {
              console.error("Failed to clear html5QrcodeScanner. ", error);
            });
          }
        },
        (errorMessage) => {
          // ignora os erros de scan contínuo
        }
      );
      scannerRef.current = html5QrcodeScanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  if (!user) {
    return (
      <div className="container text-center" style={{ paddingTop: '5rem' }}>
        <h2>Acesso Negado</h2>
        <p>Você precisa estar logado para acessar esta página.</p>
        <Link to="/login" className="btn btn-primary mt-4" style={{ textDecoration: 'none' }}>Fazer Login</Link>
      </div>
    );
  }

  const isMonitor = monitors.some(m => m.email === user.email);

  if (!isMonitor) {
    return (
      <div className="container text-center" style={{ paddingTop: '5rem' }}>
        <h2>Acesso Restrito</h2>
        <p>Esta página é exclusiva para Monitores cadastrados pela organização.</p>
        <Link to="/" className="btn btn-primary mt-4" style={{ textDecoration: 'none' }}>Voltar ao Início</Link>
      </div>
    );
  }

  const mySubmissions = submissions.filter(sub => sub.monitorEmail === user.email);

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div className="flex justify-between items-center mb-8" style={{ marginTop: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--accent-primary)' }}>Painel do Monitor</h1>
          <p>Olá, {user.displayName || user.email}! Aqui está sua escala de trabalho, trabalhos sob sua supervisão e credenciamento.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe' }}>
          <div className="flex items-center gap-4">
            <FileText size={32} color="#4f46e5" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#312e81' }}>{mySubmissions.length}</h3>
              <span style={{ color: '#4338ca', fontSize: '0.875rem' }}>Trabalhos Atribuídos a Você</span>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe' }}>
          <div className="flex items-center gap-4">
            <Users size={32} color="#4f46e5" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#312e81' }}>{ingressos.length}</h3>
              <span style={{ color: '#4338ca', fontSize: '0.875rem' }}>Participantes Inscritos</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('escala')} className={`btn ${activeTab === 'escala' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Sua Escala de Trabalho
        </button>
        <button onClick={() => setActiveTab('trabalhos')} className={`btn ${activeTab === 'trabalhos' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Trabalhos Sob Sua Supervisão
        </button>
        <button onClick={() => setActiveTab('credenciamento')} className={`btn ${activeTab === 'credenciamento' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Credenciamento e Check-in
        </button>
        <button onClick={() => setActiveTab('relatorios')} className={`btn ${activeTab === 'relatorios' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Relatórios Compartilhados
        </button>
      </div>
      
      {activeTab === 'escala' && (
        <div className="grid grid-cols-1 gap-8 mb-8">
          {events.length === 0 ? (
            <p>Nenhum evento disponível.</p>
          ) : (
            events.map(event => {
              const myAssignments = (event.monitorAssignments || []).filter(a => a.monitorEmail === user.email);
              if (myAssignments.length === 0) return null;
              
              return (
                <div key={event.id} className="card" style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>{event.title} - Suas Funções</h2>
                  
                  {myAssignments.map((assig, idx) => (
                    <div key={idx} style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{assig.funcao}</h3>
                          <p style={{ color: 'var(--text-secondary)' }}>
                            <strong>Dia:</strong> {assig.dia} | <strong>Horário:</strong> {assig.horario} | <strong>Local:</strong> {assig.local}
                          </p>
                        </div>
                      </div>
                      
                      {assig.ministranteIds && assig.ministranteIds.length > 0 && (
                        <div>
                          <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '1rem', marginTop: '1rem' }}>Palestrantes/Ministrantes para acompanhar:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {assig.ministranteIds.map(spkId => {
                              const speaker = (event.speakers || []).find(s => s.id === spkId);
                              if (!speaker) return null;
                              return (
                                <div key={spkId} style={{ display: 'flex', gap: '1rem', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                  <img src={speaker.fotoUrl} alt={speaker.nome} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                                  <div>
                                    <div style={{ fontSize: '0.7rem', backgroundColor: '#e2e8f0', padding: '0.2rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold', display: 'inline-block', marginBottom: '0.25rem' }}>{speaker.papel}</div>
                                    <h5 style={{ margin: 0, fontSize: '1rem' }}>{speaker.nome}</h5>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0' }}>{speaker.bio}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
      
      {activeTab === 'trabalhos' && (
        <>
          {mySubmissions.length === 0 ? (
            <div className="card text-center mb-8" style={{ padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <CheckCircle size={48} style={{ margin: '0 auto', marginBottom: '1rem', color: '#10b981', opacity: 0.5 }} />
              <p>Você ainda não foi designado para supervisionar nenhum trabalho pela organização.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 mb-8">
              {mySubmissions.map(sub => {
                const assignedAvaliadores = avaliadores.filter(a => (sub.avaliadoresEmails || []).includes(a.email));
                const event = events.find(e => e.id === sub.eventId);
                
                return (
                  <div key={sub.id} className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{sub.trabalho}</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Autor(a): <strong>{sub.usuario}</strong></p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Evento: {event ? event.title : 'Desconhecido'}</p>
                      </div>
                      <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                        {sub.modalidade.toUpperCase()}
                      </span>
                    </div>

                    <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border-color)' }} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
                          <Calendar size={18} /> Detalhes da Apresentação
                        </h4>
                        {sub.detalhesApresentacao && sub.detalhesApresentacao.dataApresentacao ? (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}><strong>Data:</strong> {sub.detalhesApresentacao.dataApresentacao}</li>
                            <li style={{ marginBottom: '0.5rem' }}><strong>Horário:</strong> {sub.detalhesApresentacao.horaApresentacao}</li>
                            <li style={{ marginBottom: '0.5rem' }}><strong>Local:</strong> {sub.detalhesApresentacao.localApresentacao}</li>
                            {sub.detalhesApresentacao.numeroPoster && <li><strong>Código:</strong> {sub.detalhesApresentacao.numeroPoster}</li>}
                          </ul>
                        ) : (
                          <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>A organização ainda não definiu data e local para este trabalho. Aguarde a aprovação.</p>
                        )}
                      </div>

                      <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
                          <Users size={18} /> Avaliadores Responsáveis
                        </h4>
                        {assignedAvaliadores.length > 0 ? (
                          <div className="flex flex-col gap-4">
                            {assignedAvaliadores.map(avaliador => (
                              <div key={avaliador.id} className="flex items-center gap-4">
                                {avaliador.fotoUrl ? (
                                  <img src={avaliador.fotoUrl} alt={avaliador.nome} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                ) : (
                                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={24} color="#64748b" />
                                  </div>
                                )}
                                <div>
                                  <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '1rem' }}>{avaliador.nome}</strong>
                                  <a href={`mailto:${avaliador.email}`} style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>{avaliador.email}</a>
                                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Tel: {avaliador.telefone}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#f59e0b', fontSize: '0.875rem', margin: 0, fontWeight: '500' }}>Nenhum avaliador atribuído ainda a este trabalho. A organização deve realizar este vínculo.</p>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'credenciamento' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 style={{ fontSize: '1.5rem' }}>Credenciamento de Participantes</h2>
            <div className="flex gap-4">
              <select 
                className="form-input" 
                value={selectedCheckinActivity}
                onChange={(e) => setSelectedCheckinActivity(e.target.value)}
                style={{ minWidth: '200px' }}
              >
                <option value="GERAL">Credenciamento Geral</option>
                {events.flatMap(e => e.activities || []).map((act, i) => (
                  <option key={i} value={act.name}>{act.name} (Atividade)</option>
                ))}
              </select>
              <button 
                onClick={() => setIsScanning(!isScanning)} 
                className={`btn ${isScanning ? 'btn-outline' : 'btn-primary'} flex items-center gap-2`}
              >
                <Camera size={18} /> {isScanning ? 'Fechar Câmera' : 'Ler QR Code'}
              </button>
            </div>
          </div>

          {isScanning && (
            <div className="card mb-8" style={{ padding: '1.5rem', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', padding: '1.5rem' }}>
                <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem', color: '#16a34a' }}>
                  Ação: {selectedCheckinActivity === 'GERAL' ? 'Check-in Geral do Evento' : `Presença em ${selectedCheckinActivity}`}
                </p>
                <h4 style={{ color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Camera size={20} /> Leitura Automática (Câmera)
                </h4>
                <div id="reader" style={{ width: '100%' }}></div>
                
                <h4 style={{ color: '#0f172a', margin: '1.5rem 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <QrCode size={20} /> Ou digite manualmente
                </h4>
                <input 
                  type="text" 
                  placeholder="ID ou Email do Participante" 
                  className="form-input"
                  style={{ borderColor: '#cbd5e1' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      const decodedText = e.target.value;
                      
                      let extractedId = decodedText;
                      try {
                        const url = new URL(decodedText);
                        if (url.searchParams.has('id')) {
                          extractedId = url.searchParams.get('id');
                        }
                      } catch(e) {}

                      setScannedUserId(extractedId);
                      const ing = ingressos.find(i => i.userEmail === extractedId || i.id === extractedId);
                      if (ing) {
                        if (onUpdateIngresso) {
                          const novaPresenca = { ...(ing.presenca || {}) };
                          novaPresenca[selectedCheckinActivity] = true;
                          onUpdateIngresso(ing.id, { 
                            presenca: novaPresenca, 
                            checkinGeral: selectedCheckinActivity === 'GERAL' ? true : ing.checkinGeral 
                          });
                        }
                        alert(`Usuário ${ing.nome} credenciado com sucesso em: ${selectedCheckinActivity}!`);
                      } else {
                        alert(`Usuário ${extractedId} lido, mas ingresso não encontrado.`);
                      }
                      setIsScanning(false);
                    }
                  }} 
                />
              </div>
            </div>
          )}

          {scannedUserId && (
            <div className="card mb-8" style={{ padding: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#047857' }}>Último usuário lido:</strong> {scannedUserId}
              </div>
              <button onClick={() => setScannedUserId(null)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Limpar</button>
            </div>
          )}

          {/* Grid formato "Folder" */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {ingressos.length === 0 ? (
              <p>Nenhum participante inscrito.</p>
            ) : (
              ingressos.map(ing => {
                const isHighlighted = scannedUserId === ing.userEmail;
                const event = events.find(e => e.id === ing.eventId);
                
                return (
                  <div key={ing.id} style={{
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    transform: isHighlighted ? 'scale(1.02)' : 'none',
                    boxShadow: isHighlighted ? '0 0 0 4px #10b981, 0 10px 25px rgba(0,0,0,0.1)' : 'none',
                    borderRadius: '12px'
                  }}>
                    <Badge 
                      type="participante"
                      name={ing.nome}
                      institution={ing.instituicao}
                      logoUrl={event?.logoUrl}
                    />
                    
                    <div className="card mt-2" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#64748b' }}>Check-in / Presença</span>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <div style={{ position: 'relative' }}>
                          <input type="checkbox" className="sr-only" style={{ display: 'none' }} checked={ing.checkinGeral || false} onChange={(e) => {
                            if (onUpdateIngresso) onUpdateIngresso(ing.id, { checkinGeral: e.target.checked });
                          }} />
                          <div style={{ width: '48px', height: '24px', backgroundColor: ing.checkinGeral ? '#10b981' : '#cbd5e1', borderRadius: '9999px', transition: 'background-color 0.3s', display: 'flex', alignItems: 'center', padding: '2px' }}>
                            <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transform: ing.checkinGeral ? 'translateX(24px)' : 'translateX(0)', transition: 'transform 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}></div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'relatorios' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Relatórios Compartilhados com Você</h2>
          {(!monitors.find(m => m.email === user.email)?.relatoriosPermitidos || monitors.find(m => m.email === user.email).relatoriosPermitidos.length === 0) ? (
            <div className="card text-center mb-8" style={{ padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <FileText size={48} style={{ margin: '0 auto', marginBottom: '1rem', color: '#64748b', opacity: 0.5 }} />
              <p>A organização ainda não compartilhou nenhum relatório com você.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {monitors.find(m => m.email === user.email).relatoriosPermitidos.map((reportType, idx) => (
                <div key={idx} className="card text-center" style={{ padding: '2rem', cursor: 'pointer', border: '1px solid var(--border-color)', transition: 'transform 0.2s' }} onClick={() => setViewingReport(reportType)} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
                  <FileText size={32} style={{ margin: '0 auto 1rem', color: 'var(--accent-primary)' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                    {reportType === 'credenciamento' && 'Ficha de Credenciamento'}
                    {reportType === 'oficinas' && 'Fichas de Oficinas'}
                    {reportType === 'monitores' && 'Escala de Monitores'}
                    {reportType === 'trabalhos' && 'Trabalhos Aceitos'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Clique para visualizar e imprimir este relatório.</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE IMPRESSÃO (TELA CHEIA) */}
      {viewingReport && (
        <div className="print-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 99999, overflowY: 'auto' }}>
          <div className="no-print" style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9', padding: '1rem', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <button onClick={() => setViewingReport(null)} className="btn btn-outline flex items-center gap-2">
              Voltar
            </button>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ backgroundColor: '#16a34a', border: 'none' }}>
              Imprimir Relatório
            </button>
          </div>

          <div className="print-area" style={{ padding: '2rem 4rem', color: 'black', fontFamily: 'Arial, sans-serif' }}>
            {events.map(selectedEvent => (
              <div key={selectedEvent.id} style={{ marginBottom: '4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{selectedEvent?.title}</h1>
                  <h2 style={{ fontSize: '1.25rem', margin: '0.5rem 0 0 0', color: '#333' }}>
                    {viewingReport === 'credenciamento' && 'FICHA DE CREDENCIAMENTO / PRESENÇA'}
                    {viewingReport === 'oficinas' && 'FICHAS DE FREQUÊNCIA - ATIVIDADES'}
                    {viewingReport === 'monitores' && 'ESCALA E CONTROLE DE MONITORES'}
                    {viewingReport === 'trabalhos' && 'LISTAGEM OFICIAL DE TRABALHOS APROVADOS'}
                  </h2>
                </div>

                {/* REPORT: CREDENCIAMENTO */}
                {viewingReport === 'credenciamento' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #000', padding: '0.5rem', width: '5%', backgroundColor: '#f0f0f0' }}>Nº</th>
                        <th style={{ border: '1px solid #000', padding: '0.5rem', width: '45%', backgroundColor: '#f0f0f0', textAlign: 'left' }}>Nome do Participante</th>
                        <th style={{ border: '1px solid #000', padding: '0.5rem', width: '50%', backgroundColor: '#f0f0f0', textAlign: 'left' }}>Assinatura</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingressos.filter(i => i.eventId === selectedEvent.id).map((ing, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #000', padding: '0.5rem', textTransform: 'uppercase' }}>{ing.nome}</td>
                          <td style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>
                            {(ing.presenca && ing.presenca['GERAL']) ? 'ASSINADO' : ''}
                          </td>
                        </tr>
                      ))}
                      {ingressos.filter(i => i.eventId === selectedEvent.id).length === 0 && (
                        <tr><td colSpan="3" style={{ border: '1px solid #000', padding: '1rem', textAlign: 'center' }}>Nenhum participante inscrito.</td></tr>
                      )}
                    </tbody>
                  </table>
                )}

                {/* REPORT: OFICINAS */}
                {viewingReport === 'oficinas' && (
                  <div>
                    {(!selectedEvent?.activities || selectedEvent.activities.length === 0) ? (
                      <p style={{ textAlign: 'center' }}>Nenhuma atividade cadastrada neste evento.</p>
                    ) : (
                      selectedEvent.activities.map((act, idx) => {
                        const inscritos = ingressos.filter(ing => ing.eventId === selectedEvent.id && (ing.atividades || '').includes(act.name));
                        return (
                          <div key={idx} style={{ marginBottom: '3rem', pageBreakInside: 'avoid' }}>
                            <div style={{ backgroundColor: '#f0f0f0', border: '1px solid #000', padding: '0.5rem', fontWeight: 'bold' }}>
                              ATIVIDADE: {act.name.toUpperCase()} <br/>
                              <span style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>Local: {act.room} | Ministrante: {act.minister} | Horário: {act.time}</span>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none' }}>
                              <thead>
                                <tr>
                                  <th style={{ border: '1px solid #000', padding: '0.5rem', width: '5%' }}>Nº</th>
                                  <th style={{ border: '1px solid #000', padding: '0.5rem', width: '45%', textAlign: 'left' }}>Nome do Matriculado</th>
                                  <th style={{ border: '1px solid #000', padding: '0.5rem', width: '50%', textAlign: 'left' }}>Assinatura</th>
                                </tr>
                              </thead>
                              <tbody>
                                {inscritos.map((ing, i) => (
                                  <tr key={i}>
                                    <td style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>{i + 1}</td>
                                    <td style={{ border: '1px solid #000', padding: '0.5rem', textTransform: 'uppercase' }}>{ing.nome}</td>
                                    <td style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>
                                      {(ing.presenca && ing.presenca[act.name]) ? 'ASSINADO' : ''}
                                    </td>
                                  </tr>
                                ))}
                                {inscritos.length === 0 && (
                                  <tr><td colSpan="3" style={{ border: '1px solid #000', padding: '1rem', textAlign: 'center' }}>Nenhum participante matriculado.</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* REPORT: MONITORES */}
                {viewingReport === 'monitores' && (
                  <div>
                    {(!selectedEvent?.monitorAssignments || selectedEvent.monitorAssignments.length === 0) ? (
                      <p style={{ textAlign: 'center' }}>Nenhuma função delegada aos monitores neste evento.</p>
                    ) : (
                      Array.from(new Set(selectedEvent.monitorAssignments.map(a => a.dia))).map((dia, dIdx) => (
                        <div key={dIdx} style={{ marginBottom: '3rem', pageBreakInside: 'avoid' }}>
                          <div style={{ backgroundColor: '#f0f0f0', border: '1px solid #000', padding: '0.5rem', fontWeight: 'bold' }}>
                            DATA / DIA: {dia.toUpperCase()}
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none' }}>
                            <thead>
                              <tr>
                                <th style={{ border: '1px solid #000', padding: '0.5rem', width: '25%', textAlign: 'left' }}>Nome do Monitor</th>
                                <th style={{ border: '1px solid #000', padding: '0.5rem', width: '25%', textAlign: 'left' }}>Função / Tarefa</th>
                                <th style={{ border: '1px solid #000', padding: '0.5rem', width: '25%', textAlign: 'left' }}>Local</th>
                                <th style={{ border: '1px solid #000', padding: '0.5rem', width: '25%', textAlign: 'left' }}>Horário</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedEvent.monitorAssignments.filter(a => a.dia === dia).map((assig, i) => {
                                const monitorObj = monitors.find(m => m.email === assig.monitorEmail);
                                const nome = monitorObj ? monitorObj.nome : assig.monitorEmail;
                                return (
                                  <tr key={i}>
                                    <td style={{ border: '1px solid #000', padding: '0.5rem', textTransform: 'uppercase' }}>{nome}</td>
                                    <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{assig.funcao}</td>
                                    <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{assig.local}</td>
                                    <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{assig.horario}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* REPORT: TRABALHOS */}
                {viewingReport === 'trabalhos' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '0.875rem' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #000', padding: '0.5rem', width: '10%', backgroundColor: '#f0f0f0' }}>Código</th>
                        <th style={{ border: '1px solid #000', padding: '0.5rem', width: '30%', backgroundColor: '#f0f0f0', textAlign: 'left' }}>Título do Trabalho</th>
                        <th style={{ border: '1px solid #000', padding: '0.5rem', width: '20%', backgroundColor: '#f0f0f0', textAlign: 'left' }}>Autores</th>
                        <th style={{ border: '1px solid #000', padding: '0.5rem', width: '15%', backgroundColor: '#f0f0f0', textAlign: 'left' }}>Sessão/Local</th>
                        <th style={{ border: '1px solid #000', padding: '0.5rem', width: '15%', backgroundColor: '#f0f0f0', textAlign: 'left' }}>Monitor Responsável</th>
                        <th style={{ border: '1px solid #000', padding: '0.5rem', width: '10%', backgroundColor: '#f0f0f0', textAlign: 'left' }}>Avaliadores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.filter(s => s.status === 'aprovado' && s.eventId === selectedEvent.id).map((sub, idx) => {
                        const autores = sub.coAutores ? `${sub.usuario}, ${sub.coAutores}` : sub.usuario;
                        const monitorObj = monitors.find(m => m.email === sub.monitorEmail);
                        const monitorNome = monitorObj ? monitorObj.nome : '';
                        
                        const avaliadoresNomes = (sub.avaliadoresEmails || []).map(email => {
                          const av = avaliadores.find(a => a.email === email);
                          return av ? av.nome : email;
                        }).join(', ');

                        return (
                          <tr key={idx}>
                            <td style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>{sub.detalhesApresentacao?.numeroPoster || 'N/A'}</td>
                            <td style={{ border: '1px solid #000', padding: '0.5rem', textTransform: 'uppercase' }}>{sub.trabalho}</td>
                            <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{autores}</td>
                            <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{sub.detalhesApresentacao?.localApresentacao || ''}</td>
                            <td style={{ border: '1px solid #000', padding: '0.5rem', textTransform: 'uppercase' }}>{monitorNome}</td>
                            <td style={{ border: '1px solid #000', padding: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>{avaliadoresNomes}</td>
                          </tr>
                        );
                      })}
                      {submissions.filter(s => s.status === 'aprovado' && s.eventId === selectedEvent.id).length === 0 && (
                        <tr><td colSpan="6" style={{ border: '1px solid #000', padding: '1rem', textAlign: 'center' }}>Nenhum trabalho aprovado.</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>

          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              .print-modal { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; background: white !important; }
              .print-area, .print-area * { visibility: visible !important; color: black !important; }
              .print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 0 !important; }
              .no-print { display: none !important; }
            }
          `}</style>
        </div>
      )}

    </div>
  );
}
