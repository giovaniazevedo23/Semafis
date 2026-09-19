import { useState } from 'react';
import { EventForm } from '../components/EventForm';
import { EventCard } from '../components/EventCard';
import { FileDown, Users, Check, X, ArrowLeft, ClipboardList, GraduationCap, MonitorPlay } from 'lucide-react';

export function OrganizerDashboard({ events, onAddEvent, onUpdateEvent, submissions, onUpdateSubmission, monitors = [], onAddMonitor, avaliadores = [], onAddAvaliador }) {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [activeTab, setActiveTab] = useState('submissoes'); // 'submissoes', 'equipe', 'credenciamento', 'atividades'
  
  const [approvingSubId, setApprovingSubId] = useState(null);
  const [chatSubId, setChatSubId] = useState(null);
  const [chatInputs, setChatInputs] = useState({});
  const [approvalData, setApprovalData] = useState({ dataApresentacao: '', horaApresentacao: '', localApresentacao: '', numeroPoster: '' });
  const [monitorData, setMonitorData] = useState({ nome: '', email: '', matricula: '', ira: '', telefone: '' });
  const [avaliadorData, setAvaliadorData] = useState({ nome: '', email: '', matricula: '', telefone: '', fotoUrl: '' });
  const [activityData, setActivityData] = useState({ name: '', minister: '', time: '', room: '', type: 'Minicurso' });

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const handleAddEventWrapper = (data) => {
    onAddEvent(data);
    setIsCreatingEvent(false);
  };

  const handleMonitorSubmit = (e) => {
    e.preventDefault();
    onAddMonitor(monitorData);
    setMonitorData({ nome: '', email: '', matricula: '', ira: '', telefone: '' });
    alert("Monitor cadastrado com sucesso!");
  };

  const handleAvaliadorSubmit = (e) => {
    e.preventDefault();
    onAddAvaliador(avaliadorData);
    setAvaliadorData({ nome: '', email: '', matricula: '', telefone: '', fotoUrl: '' });
    alert("Avaliador cadastrado com sucesso!");
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    const currentActivities = selectedEvent.activities || [];
    onUpdateEvent(selectedEvent.id, { activities: [...currentActivities, activityData] });
    setActivityData({ name: '', minister: '', time: '', room: '', type: 'Minicurso' });
    alert("Atividade cadastrada com sucesso!");
  };

  const handleApproveClick = (subId) => setApprovingSubId(subId);
  const handleConfirmApproval = () => {
    onUpdateSubmission(approvingSubId, { status: 'aprovado', detalhesApresentacao: approvalData });
    setApprovingSubId(null);
    setApprovalData({ dataApresentacao: '', horaApresentacao: '', localApresentacao: '', numeroPoster: '' });
  };
  const handleReject = (subId) => {
    if (window.confirm("Deseja rejeitar este trabalho?")) onUpdateSubmission(subId, { status: 'rejeitado' });
  };

  const handleSendChatMessage = (subId) => {
    if (!chatInputs[subId]?.trim()) return;
    const sub = submissions.find(s => s.id === subId);
    if (!sub) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'organizador',
      text: chatInputs[subId],
      date: new Date().toISOString()
    };

    onUpdateSubmission(subId, { mensagens: [...(sub.mensagens || []), newMessage] });
    setChatInputs(prev => ({ ...prev, [subId]: '' }));
  };

  const handleGeneratePosters = () => {
    // Pegar trabalhos aprovados e modalidade poster
    const posterSubmissions = submissions.filter(s => s.status === 'aprovado' && s.modalidade === 'poster');
    
    // Ordenar pelo primeiro avaliador associado
    posterSubmissions.sort((a, b) => {
      const avaliadorA = (a.avaliadoresEmails && a.avaliadoresEmails[0]) || '';
      const avaliadorB = (b.avaliadoresEmails && b.avaliadoresEmails[0]) || '';
      return avaliadorA.localeCompare(avaliadorB);
    });

    let currentNumber = 1;
    posterSubmissions.forEach(sub => {
      const formattedNumber = `PO-${currentNumber.toString().padStart(3, '0')}`;
      const newDetails = { ...(sub.detalhesApresentacao || {}), numeroPoster: formattedNumber };
      onUpdateSubmission(sub.id, { detalhesApresentacao: newDetails });
      currentNumber++;
    });

    alert(`Numeração automática gerada para ${posterSubmissions.length} pôsteres!`);
  };

  // Se não tem evento selecionado E não está criando, mostra a lista de eventos
  if (!selectedEventId && !isCreatingEvent) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '700' }}>Painel do Organizador</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Selecione um evento para gerenciar ou crie um novo.</p>
          </div>
          <button onClick={() => setIsCreatingEvent(true)} className="btn btn-primary">
            + Criar Novo Evento
          </button>
        </div>

        {events.length === 0 ? (
          <div className="card text-center" style={{ padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <p>Você ainda não tem nenhum evento. Clique em "Criar Novo Evento" para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map(event => (
              <div key={event.id} style={{ position: 'relative' }}>
                <EventCard event={event} />
                <button 
                  onClick={() => setSelectedEventId(event.id)}
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '0.5rem', borderTopLeftRadius: 0, borderTopRightRadius: 0, backgroundColor: '#0f172a' }}
                >
                  Gerenciar Este Evento
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Tela de Criação de Evento
  if (isCreatingEvent) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <button onClick={() => setIsCreatingEvent(false)} className="btn btn-outline flex items-center gap-2 mb-4">
          <ArrowLeft size={16} /> Voltar
        </button>
        <EventForm onSubmit={handleAddEventWrapper} />
      </div>
    );
  }

  // Painel de Gerenciamento do Evento Selecionado
  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <button onClick={() => setSelectedEventId(null)} className="btn btn-outline flex items-center gap-2 mb-4" style={{ padding: '0.5rem 1rem' }}>
        <ArrowLeft size={16} /> Voltar aos Eventos
      </button>

      <div className="card mb-8" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
          {selectedEvent?.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Gerencie as submissões, equipe e credenciamento deste evento.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button onClick={() => setActiveTab('submissoes')} className={`btn ${activeTab === 'submissoes' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Submissões
        </button>
        <button onClick={() => setActiveTab('equipe')} className={`btn ${activeTab === 'equipe' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Equipe (Avaliadores/Monitores)
        </button>
        <button onClick={() => setActiveTab('atividades')} className={`btn ${activeTab === 'atividades' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Atividades (Minicursos/Oficinas)
        </button>
        <button onClick={() => setActiveTab('credenciamento')} className={`btn ${activeTab === 'credenciamento' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Credenciamento (Presença)
        </button>
      </div>

      {/* Aba de Submissões */}
      {activeTab === 'submissoes' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Trabalhos Submetidos para Avaliação</h2>
            <button onClick={handleGeneratePosters} className="btn btn-primary" style={{ backgroundColor: '#8b5cf6', border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              Gerar Numeração Automática de Pôsteres
            </button>
          </div>
          {submissions.length === 0 ? (
            <div className="card text-center mb-8" style={{ padding: '3rem 2rem', color: 'var(--text-secondary)' }}>
              <Users size={48} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
              <p>Nenhuma submissão de trabalho recebida ainda.</p>
            </div>
          ) : (
            <div className="card mb-8" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Autor(a)</th>
                    <th style={{ padding: '0.75rem' }}>Modalidade</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: '500' }}>
                        {sub.usuario}
                        <br/>
                        <button className="btn btn-outline mt-2" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          <FileDown size={12} style={{ display: 'inline' }} /> Baixar {sub.trabalho}
                        </button>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.875rem' }}>
                        {sub.modalidade}
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        {sub.status === 'em_analise' && <span style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Em Análise</span>}
                        {sub.status === 'aprovado' && <span style={{ backgroundColor: '#bbf7d0', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Aprovado</span>}
                        {sub.status === 'rejeitado' && <span style={{ backgroundColor: '#fecaca', color: '#991b1b', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Rejeitado</span>}
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        {sub.status === 'em_analise' && (
                          <div className="flex gap-2 mb-2">
                            <button onClick={() => handleApproveClick(sub.id)} className="btn" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem' }}>Aprovar</button>
                            <button onClick={() => handleReject(sub.id)} className="btn" style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem' }}>Rejeitar</button>
                          </div>
                        )}
                        <button onClick={() => setChatSubId(sub.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: '100%', marginBottom: '0.5rem', position: 'relative' }}>
                          Ver Chat do Participante
                          {sub.mensagens?.length > 0 && (
                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.6rem', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {sub.mensagens.length}
                            </span>
                          )}
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <select className="form-input" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} value={sub.monitorEmail || ''} onChange={(e) => onUpdateSubmission(sub.id, { monitorEmail: e.target.value })}>
                            <option value="">Atribuir Monitor...</option>
                            {monitors.map(m => <option key={m.id} value={m.email}>{m.nome}</option>)}
                          </select>
                          <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Atribuir Avaliadores:</strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '80px', overflowY: 'auto' }}>
                              {avaliadores.map(a => {
                                const isAssigned = (sub.avaliadoresEmails || []).includes(a.email);
                                return (
                                  <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={isAssigned} onChange={() => onUpdateSubmission(sub.id, { avaliadoresEmails: isAssigned ? (sub.avaliadoresEmails || []).filter(e => e !== a.email) : [...(sub.avaliadoresEmails || []), a.email] })} /> {a.nome}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Aba de Equipe */}
      {activeTab === 'equipe' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MonitorPlay size={24} /> Monitores</h2>
            <div className="card" style={{ padding: '1.5rem' }}>
              <form onSubmit={handleMonitorSubmit} className="mb-6">
                <input type="text" placeholder="Nome Completo" value={monitorData.nome} onChange={e => setMonitorData({...monitorData, nome: e.target.value})} className="form-input mb-2" required />
                <input type="email" placeholder="E-mail" value={monitorData.email} onChange={e => setMonitorData({...monitorData, email: e.target.value})} className="form-input mb-2" required />
                <input type="text" placeholder="Matrícula" value={monitorData.matricula} onChange={e => setMonitorData({...monitorData, matricula: e.target.value})} className="form-input mb-2" required />
                <input type="text" placeholder="I.R.A" value={monitorData.ira} onChange={e => setMonitorData({...monitorData, ira: e.target.value})} className="form-input mb-2" required />
                <input type="tel" placeholder="Telefone" value={monitorData.telefone} onChange={e => setMonitorData({...monitorData, telefone: e.target.value})} className="form-input mb-4" required />
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Cadastrar Monitor</button>
              </form>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Lista</h3>
              {monitors.map(m => (
                <div key={m.id} style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
                  <strong>{m.nome}</strong> ({m.email})
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><GraduationCap size={24} /> Avaliadores</h2>
            <div className="card" style={{ padding: '1.5rem' }}>
              <form onSubmit={handleAvaliadorSubmit} className="mb-6">
                <input type="text" placeholder="Nome Completo" value={avaliadorData.nome} onChange={e => setAvaliadorData({...avaliadorData, nome: e.target.value})} className="form-input mb-2" required />
                <input type="email" placeholder="E-mail" value={avaliadorData.email} onChange={e => setAvaliadorData({...avaliadorData, email: e.target.value})} className="form-input mb-2" required />
                <input type="text" placeholder="Matrícula" value={avaliadorData.matricula} onChange={e => setAvaliadorData({...avaliadorData, matricula: e.target.value})} className="form-input mb-2" required />
                <input type="tel" placeholder="Telefone" value={avaliadorData.telefone} onChange={e => setAvaliadorData({...avaliadorData, telefone: e.target.value})} className="form-input mb-2" required />
                <input type="url" placeholder="Link da Foto" value={avaliadorData.fotoUrl} onChange={e => setAvaliadorData({...avaliadorData, fotoUrl: e.target.value})} className="form-input mb-4" />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: '#16a34a', border: 'none' }}>Cadastrar Avaliador</button>
              </form>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Lista</h3>
              {avaliadores.map(a => (
                <div key={a.id} style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
                  <strong>{a.nome}</strong> ({a.email})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Aba de Atividades */}
      {activeTab === 'atividades' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Cadastrar Atividade</h2>
            <div className="card" style={{ padding: '1.5rem' }}>
              <form onSubmit={handleAddActivity} className="mb-6">
                <select value={activityData.type} onChange={e => setActivityData({...activityData, type: e.target.value})} className="form-input mb-2" required>
                  <option value="Minicurso">Minicurso</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Palestra">Palestra</option>
                  <option value="Mesa Redonda">Mesa Redonda</option>
                </select>
                <input type="text" placeholder="Nome da Atividade" value={activityData.name} onChange={e => setActivityData({...activityData, name: e.target.value})} className="form-input mb-2" required />
                <input type="text" placeholder="Ministrante / Palestrante" value={activityData.minister} onChange={e => setActivityData({...activityData, minister: e.target.value})} className="form-input mb-2" required />
                <input type="text" placeholder="Horário (Ex: 14:00 - 16:00)" value={activityData.time} onChange={e => setActivityData({...activityData, time: e.target.value})} className="form-input mb-2" required />
                <input type="text" placeholder="Local / Sala" value={activityData.room} onChange={e => setActivityData({...activityData, room: e.target.value})} className="form-input mb-4" required />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: '#8b5cf6', border: 'none' }}>Cadastrar Atividade</button>
              </form>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Atividades Cadastradas</h2>
            <div className="card" style={{ padding: '1.5rem' }}>
              {(!selectedEvent?.activities || selectedEvent.activities.length === 0) ? (
                <p style={{ color: 'var(--text-secondary)' }}>Nenhuma atividade cadastrada ainda.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedEvent.activities.map((act, idx) => (
                    <div key={idx} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold', display: 'inline-block', marginBottom: '0.5rem' }}>
                        {act.type || 'Minicurso'}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{act.name}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <strong>Ministrante:</strong> {act.minister} <br/>
                        <strong>Horário:</strong> {act.time} <br/>
                        <strong>Local:</strong> {act.room}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aba de Credenciamento */}
      {activeTab === 'credenciamento' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={24} /> Credenciamento das Atividades
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Lista de inscritos no evento. Marque a caixa para confirmar a presença de cada participante nas atividades (necessário para liberar o certificado).</p>
          
          {(!selectedEvent?.activities || selectedEvent.activities.length === 0) ? (
            <div className="card text-center" style={{ padding: '2rem' }}>
              <p>Nenhuma atividade cadastrada neste evento.</p>
            </div>
          ) : (
            selectedEvent.activities.map((act, idx) => (
              <div key={idx} className="card mb-6" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>{act.type || 'Palestra'}</span>
                    <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>{act.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ministrante: {act.minister} | {act.startTime} - {act.endTime} | Local: {act.room}</p>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Inscritos</h4>
                  {/* Mock: Usaremos os submissores como mock de inscritos por enquanto */}
                  {submissions.length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Nenhum participante comprou ingresso/se inscreveu ainda.</p>
                  ) : (
                    <table style={{ width: '100%', fontSize: '0.875rem' }}>
                      <tbody>
                        {submissions.map((sub, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '0.75rem' }}>{sub.usuario}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <div style={{ position: 'relative' }}>
                                  <input type="checkbox" className="sr-only" style={{ display: 'none' }} />
                                  <div style={{ width: '48px', height: '24px', backgroundColor: '#cbd5e1', borderRadius: '9999px', transition: 'background-color 0.3s', display: 'flex', alignItems: 'center', padding: '2px' }} onMouseDown={(e) => {
                                    const parent = e.currentTarget;
                                    const isChecked = parent.style.backgroundColor === 'rgb(16, 185, 129)' || parent.style.backgroundColor === '#10b981';
                                    parent.style.backgroundColor = isChecked ? '#cbd5e1' : '#10b981';
                                    parent.firstChild.style.transform = isChecked ? 'translateX(0)' : 'translateX(24px)';
                                  }}>
                                    <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transform: 'translateX(0)', transition: 'transform 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}></div>
                                  </div>
                                </div>
                                <span style={{ marginLeft: '0.5rem', fontWeight: 'bold', color: '#64748b' }}>Presente</span>
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Renderizado Fora da Tabela */}
      {approvingSubId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', minWidth: '400px', maxWidth: '90%' }}>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Dados da Apresentação</h4>
            <div className="form-group mb-4">
              <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Data</label>
              <input type="text" placeholder="Ex: 10/10/2026" value={approvalData.dataApresentacao} onChange={(e) => setApprovalData({...approvalData, dataApresentacao: e.target.value})} className="form-input" />
            </div>
            <div className="form-group mb-4">
              <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Horário</label>
              <input type="text" placeholder="Ex: 16:00" value={approvalData.horaApresentacao} onChange={(e) => setApprovalData({...approvalData, horaApresentacao: e.target.value})} className="form-input" />
            </div>
            <div className="form-group mb-4">
              <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Local / Sessão</label>
              <input type="text" placeholder="Ex: Área de Pôster - Sessão 1" value={approvalData.localApresentacao} onChange={(e) => setApprovalData({...approvalData, localApresentacao: e.target.value})} className="form-input" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setApprovingSubId(null)} className="btn btn-outline" style={{ flex: 1, padding: '0.75rem' }}>Cancelar</button>
              <button onClick={handleConfirmApproval} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }}>Confirmar Aprovação</button>
            </div>
          </div>
        </div>
      )}

      {chatSubId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', minWidth: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Chat com o Participante</h4>
              <button onClick={() => setChatSubId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>
            
            <div style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '1rem', height: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
              {(() => {
                const sub = submissions.find(s => s.id === chatSubId);
                if (!sub?.mensagens || sub.mensagens.length === 0) {
                  return <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>Nenhuma mensagem enviada.</p>;
                }
                return sub.mensagens.map(msg => (
                  <div key={msg.id} style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'organizador' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ backgroundColor: msg.sender === 'organizador' ? '#10b981' : '#e2e8f0', color: msg.sender === 'organizador' ? 'white' : '#0f172a', padding: '0.75rem 1rem', borderRadius: '12px', maxWidth: '80%' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>{msg.text}</p>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {msg.sender === 'organizador' ? 'Você (Organização)' : 'Participante'} • {new Date(msg.date).toLocaleDateString()} {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ));
              })()}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={chatInputs[chatSubId] || ''} 
                onChange={(e) => setChatInputs({...chatInputs, [chatSubId]: e.target.value})} 
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(chatSubId); }}
                placeholder="Digite sua resposta..." 
                className="form-input" 
                style={{ flex: 1 }}
              />
              <button onClick={() => handleSendChatMessage(chatSubId)} className="btn btn-primary" style={{ backgroundColor: '#10b981', border: 'none' }}>Responder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
