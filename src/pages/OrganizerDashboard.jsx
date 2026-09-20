import { useState } from 'react';
import { EventForm } from '../components/EventForm';
import { EventCard } from '../components/EventCard';
import { FileDown, Users, Check, X, ArrowLeft, ClipboardList, GraduationCap, MonitorPlay } from 'lucide-react';
import { uploadFile } from '../services/db';
import { QRCodeCanvas } from 'qrcode.react';

export function OrganizerDashboard({ events, onAddEvent, onUpdateEvent, submissions, onUpdateSubmission, monitors = [], onAddMonitor, onUpdateMonitor, avaliadores = [], onAddAvaliador, ingressos = [], onUpdateIngresso, news = [], onAddNews }) {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [activeTab, setActiveTab] = useState('submissoes'); // 'submissoes', 'equipe', 'atividades', 'credenciamento', 'relatorios'
  const [viewingReport, setViewingReport] = useState(null); // 'credenciamento', 'oficinas', 'monitores', 'trabalhos'
  const [sharingMonitorId, setSharingMonitorId] = useState('');
  
  const [approvingSubId, setApprovingSubId] = useState(null);
  const [chatSubId, setChatSubId] = useState(null);
  const [chatInputs, setChatInputs] = useState({});
  const [approvalData, setApprovalData] = useState({ dataApresentacao: '', horaApresentacao: '', localApresentacao: '', numeroPoster: '' });
  const [monitorData, setMonitorData] = useState({ nome: '', email: '', matricula: '', ira: '', telefone: '' });
  const [avaliadorData, setAvaliadorData] = useState({ nome: '', email: '', matricula: '', telefone: '', fotoUrl: '' });
  const [activityData, setActivityData] = useState({ name: '', minister: '', time: '', room: '', type: 'Minicurso' });
  const [assignmentData, setAssignmentData] = useState({ monitorEmail: '', dia: '', horario: '', local: '', funcao: '', ministranteIds: [] });
  const [speakerData, setSpeakerData] = useState({ nome: '', papel: 'Palestrante', bio: '', detalhesAtividade: '', fotoUrl: '' });
  const [speakerPhotoFile, setSpeakerPhotoFile] = useState(null);
  const [isUploadingSpeaker, setIsUploadingSpeaker] = useState(false);

  const [newsData, setNewsData] = useState({ title: '', summary: '', content: '', imageUrl: '', date: new Date().toISOString().split('T')[0] });
  const [newsImageFile, setNewsImageFile] = useState(null);
  const [isUploadingNewsImage, setIsUploadingNewsImage] = useState(false);
  const [isManagingNews, setIsManagingNews] = useState(false);
  const [scheduleItem, setScheduleItem] = useState({ date: '', time: '', title: '', description: '', type: 'Geral' });

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

  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    const currentAssignments = selectedEvent.monitorAssignments || [];
    const newAssignment = { ...assignmentData, id: Date.now().toString() };
    onUpdateEvent(selectedEvent.id, { monitorAssignments: [...currentAssignments, newAssignment] });
    setAssignmentData({ monitorEmail: '', dia: '', horario: '', local: '', funcao: '', ministranteIds: [] });
    alert("Função delegada com sucesso ao monitor!");
  };

  const handleAddSpeaker = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsUploadingSpeaker(true);
    let finalFotoUrl = speakerData.fotoUrl;
    
    if (speakerPhotoFile) {
      try {
        const fileName = `speakers/${Date.now()}_${speakerPhotoFile.name}`;
        finalFotoUrl = await uploadFile(fileName, speakerPhotoFile);
      } catch (error) {
        console.error("Erro no upload para o Storage. Salvando localmente como fallback.", error);
        finalFotoUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(speakerPhotoFile);
        });
        alert("Atenção: O upload da foto falhou devido a permissões do Firebase. A foto foi salva localmente no navegador temporariamente.");
      }
    }

    const currentSpeakers = selectedEvent.speakers || [];
    const newSpeaker = { ...speakerData, fotoUrl: finalFotoUrl, id: Date.now().toString() };
    onUpdateEvent(selectedEvent.id, { speakers: [...currentSpeakers, newSpeaker] });
    setSpeakerData({ nome: '', papel: 'Palestrante', bio: '', detalhesAtividade: '', fotoUrl: '' });
    setSpeakerPhotoFile(null);
    setIsUploadingSpeaker(false);
    alert("Ministrante cadastrado com sucesso!");
  };

  const handleAddScheduleItem = (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    const currentSchedule = selectedEvent.detailedSchedule || [];
    const newItem = { ...scheduleItem, id: Date.now().toString() };
    onUpdateEvent(selectedEvent.id, { 
      detailedSchedule: [...currentSchedule, newItem].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      }) 
    });
    setScheduleItem({ date: scheduleItem.date, time: '', title: '', description: '', type: 'Geral' });
    alert("Atividade adicionada ao cronograma com sucesso!");
  };

  const handleRemoveScheduleItem = (itemId) => {
    if (!selectedEvent) return;
    const currentSchedule = selectedEvent.detailedSchedule || [];
    onUpdateEvent(selectedEvent.id, { detailedSchedule: currentSchedule.filter(i => i.id !== itemId) });
  };

  const handleAddNewsSubmit = async (e) => {
    e.preventDefault();
    setIsUploadingNewsImage(true);
    let finalImageUrl = newsData.imageUrl;
    
    if (newsImageFile) {
      try {
        const fileName = `news/${Date.now()}_${newsImageFile.name}`;
        finalImageUrl = await uploadFile(fileName, newsImageFile);
      } catch (error) {
        console.error("Erro no upload da noticia para o Storage.", error);
        finalImageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(newsImageFile);
        });
        alert("Atenção: A foto foi salva localmente no navegador.");
      }
    }

    onAddNews({ ...newsData, imageUrl: finalImageUrl });
    setNewsData({ title: '', summary: '', content: '', imageUrl: '', date: new Date().toISOString().split('T')[0] });
    setNewsImageFile(null);
    setIsUploadingNewsImage(false);
    setIsManagingNews(false);
    alert("Notícia publicada com sucesso!");
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

  const handlePrint = () => {
    window.print();
  };

  // Se não tem evento selecionado E não está criando, mostra a lista de eventos
  if (!selectedEventId && !isCreatingEvent && !isManagingNews) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '700' }}>Painel do Organizador</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Selecione um evento para gerenciar ou crie um novo.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setIsManagingNews(true)} className="btn btn-outline">
              📰 Gerenciar Notícias
            </button>
            <button onClick={() => setIsCreatingEvent(true)} className="btn btn-primary">
              + Criar Novo Evento
            </button>
          </div>
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

  // Tela de Gerenciamento de Notícias
  if (isManagingNews) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <button onClick={() => setIsManagingNews(false)} className="btn btn-outline flex items-center gap-2 mb-4">
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Publicar Nova Notícia</h2>
            <div className="card" style={{ padding: '1.5rem' }}>
              <form onSubmit={handleAddNewsSubmit} className="mb-6">
                <input type="text" placeholder="Título da Notícia" value={newsData.title} onChange={e => setNewsData({...newsData, title: e.target.value})} className="form-input mb-2" required />
                <input type="date" value={newsData.date} onChange={e => setNewsData({...newsData, date: e.target.value})} className="form-input mb-2" required />
                <textarea placeholder="Resumo (Aparece no card pequeno)" value={newsData.summary} onChange={e => setNewsData({...newsData, summary: e.target.value})} className="form-input mb-2" rows="2" required></textarea>
                <textarea placeholder="Conteúdo Completo da Notícia" value={newsData.content} onChange={e => setNewsData({...newsData, content: e.target.value})} className="form-input mb-2" rows="6" required></textarea>
                <div className="form-group mb-4">
                  <label className="form-label" style={{ fontSize: '0.875rem' }}>Imagem de Capa (Ficará destacada)</label>
                  <input type="file" accept="image/*" onChange={e => setNewsImageFile(e.target.files[0])} className="form-input" required={!newsData.imageUrl} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isUploadingNewsImage} style={{ width: '100%', backgroundColor: '#0284c7', border: 'none' }}>
                  {isUploadingNewsImage ? 'Publicando...' : 'Publicar Notícia'}
                </button>
              </form>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Notícias Publicadas</h2>
            <div className="card" style={{ padding: '1.5rem' }}>
              {(!news || news.length === 0) ? (
                <p style={{ color: 'var(--text-secondary)' }}>Nenhuma notícia publicada ainda.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {news.map((item, idx) => (
                    <div key={idx} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem' }}>
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.title} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                      )}
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          {item.date}
                        </div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>{item.title}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {item.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button onClick={() => setActiveTab('submissoes')} className={`btn ${activeTab === 'submissoes' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Submissões
        </button>
        <button onClick={() => setActiveTab('equipe')} className={`btn ${activeTab === 'equipe' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Equipe (Avaliadores/Monitores)
        </button>
        <button onClick={() => setActiveTab('atividades')} className={`btn ${activeTab === 'atividades' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Atividades (Minicursos/Oficinas)
        </button>
        <button onClick={() => setActiveTab('ministrantes')} className={`btn ${activeTab === 'ministrantes' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Ministrantes/Palestrantes
        </button>
        <button onClick={() => setActiveTab('org-monitores')} className={`btn ${activeTab === 'org-monitores' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Organização de Monitores
        </button>
        <button onClick={() => setActiveTab('credenciamento')} className={`btn ${activeTab === 'credenciamento' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Credenciamento (Presença)
        </button>
        <button onClick={() => setActiveTab('credenciais-qr')} className={`btn ${activeTab === 'credenciais-qr' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Credenciais (QR Code)
        </button>
        <button onClick={() => setActiveTab('relatorios')} className={`btn ${activeTab === 'relatorios' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Relatórios / Impressão
        </button>
        <button onClick={() => setActiveTab('ranking')} className={`btn ${activeTab === 'ranking' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Ranking de Apresentações
        </button>
        <button onClick={() => setActiveTab('cronograma')} className={`btn ${activeTab === 'cronograma' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Cronograma do Evento
        </button>
      </div>

      {/* Aba de Cronograma */}
      {activeTab === 'cronograma' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Adicionar ao Cronograma</h2>
            <div className="card" style={{ padding: '1.5rem' }}>
              <form onSubmit={handleAddScheduleItem} className="mb-6">
                <input type="date" value={scheduleItem.date} onChange={e => setScheduleItem({...scheduleItem, date: e.target.value})} className="form-input mb-2" required />
                <input type="time" value={scheduleItem.time} onChange={e => setScheduleItem({...scheduleItem, time: e.target.value})} className="form-input mb-2" required />
                <input type="text" placeholder="Título da Atividade (ex: Abertura)" value={scheduleItem.title} onChange={e => setScheduleItem({...scheduleItem, title: e.target.value})} className="form-input mb-2" required />
                <textarea placeholder="Descrição ou Local (opcional)" value={scheduleItem.description} onChange={e => setScheduleItem({...scheduleItem, description: e.target.value})} className="form-input mb-2" rows="3"></textarea>
                <select value={scheduleItem.type} onChange={e => setScheduleItem({...scheduleItem, type: e.target.value})} className="form-input mb-4" required>
                  <option value="Geral">Geral</option>
                  <option value="Palestra">Palestra</option>
                  <option value="Oficina">Oficina/Minicurso</option>
                  <option value="Apresentação">Apresentação de Trabalhos</option>
                  <option value="Pausa">Pausa/Coffee Break</option>
                </select>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: '#6366f1', border: 'none' }}>Adicionar Atividade</button>
              </form>
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Cronograma Atual</h2>
            <div className="card" style={{ padding: '1.5rem', maxHeight: '600px', overflowY: 'auto' }}>
              {(!selectedEvent?.detailedSchedule || selectedEvent.detailedSchedule.length === 0) ? (
                <p style={{ color: 'var(--text-secondary)' }}>Nenhuma atividade adicionada ao cronograma detalhado ainda.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedEvent.detailedSchedule.map((item, idx) => (
                    <div key={item.id || idx} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative' }}>
                      <button onClick={() => handleRemoveScheduleItem(item.id)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                      <div style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold', display: 'inline-block', marginBottom: '0.5rem' }}>
                        {item.type}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.title}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        📅 {item.date ? new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-BR') : ''} ⏰ {item.time}
                      </p>
                      {item.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                        <button onClick={() => sub.arquivoUrl ? window.open(sub.arquivoUrl, '_blank') : alert('Arquivo não disponível')} className="btn btn-outline mt-2" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
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
                        {/* Botões de Aprovar/Rejeitar removidos (Lógica automática de 80%) */}
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
                          {sub.status === 'aprovado' && (
                            <div style={{ backgroundColor: '#fffbeb', padding: '0.5rem', borderRadius: '4px', border: '1px solid #fde68a', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                              <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#b45309' }}>Avaliadores da Apresentação (In-Loco):</strong>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '80px', overflowY: 'auto' }}>
                                {avaliadores.map(a => {
                                  const isAssigned = (sub.avaliadoresApresentacaoEmails || []).includes(a.email);
                                  return (
                                    <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                                      <input type="checkbox" checked={isAssigned} onChange={() => onUpdateSubmission(sub.id, { avaliadoresApresentacaoEmails: isAssigned ? (sub.avaliadoresApresentacaoEmails || []).filter(e => e !== a.email) : [...(sub.avaliadoresApresentacaoEmails || []), a.email] })} /> {a.nome}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
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
                <input type="tel" placeholder="Telefone" value={avaliadorData.telefone} onChange={e => setAvaliadorData({...avaliadorData, telefone: e.target.value})} className="form-input mb-4" required />
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

      {/* Aba de Ministrantes */}
      {activeTab === 'ministrantes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Cadastrar Ministrante / Palestrante</h2>
            <div className="card" style={{ padding: '1.5rem' }}>
              <form onSubmit={handleAddSpeaker} className="mb-6">
                <input type="text" placeholder="Nome Completo" value={speakerData.nome} onChange={e => setSpeakerData({...speakerData, nome: e.target.value})} className="form-input mb-2" required />
                <select value={speakerData.papel} onChange={e => setSpeakerData({...speakerData, papel: e.target.value})} className="form-input mb-2" required>
                  <option value="Palestrante">Palestrante</option>
                  <option value="Ministrante">Ministrante</option>
                  <option value="Professor">Professor(a)</option>
                  <option value="Convidado">Convidado(a) Especial</option>
                </select>
                <textarea placeholder="Breve Biografia / De onde é?" value={speakerData.bio} onChange={e => setSpeakerData({...speakerData, bio: e.target.value})} className="form-input mb-2" rows="3" required></textarea>
                <textarea placeholder="Detalhamento da Atividade (O que vai abordar)" value={speakerData.detalhesAtividade} onChange={e => setSpeakerData({...speakerData, detalhesAtividade: e.target.value})} className="form-input mb-2" rows="3" required></textarea>
                <div className="form-group mb-4">
                  <label className="form-label" style={{ fontSize: '0.875rem' }}>Foto de Perfil</label>
                  <input type="file" accept="image/*" onChange={e => setSpeakerPhotoFile(e.target.files[0])} className="form-input" required={!speakerData.fotoUrl} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isUploadingSpeaker} style={{ width: '100%', backgroundColor: '#f59e0b', border: 'none' }}>
                  {isUploadingSpeaker ? 'Cadastrando e Enviando Foto...' : 'Cadastrar'}
                </button>
              </form>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Ministrantes Cadastrados</h2>
            <div className="card" style={{ padding: '1.5rem' }}>
              {(!selectedEvent?.speakers || selectedEvent.speakers.length === 0) ? (
                <p style={{ color: 'var(--text-secondary)' }}>Nenhum ministrante cadastrado ainda.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedEvent.speakers.map((spk, idx) => (
                    <div key={idx} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem' }}>
                      <img src={spk.fotoUrl} alt={spk.nome} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold', display: 'inline-block', marginBottom: '0.5rem' }}>
                          {spk.papel}
                        </div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{spk.nome}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          <strong>Bio:</strong> {spk.bio} <br/>
                          <strong>Atividade:</strong> {spk.detalhesAtividade}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aba de Organização de Monitores */}
      {activeTab === 'org-monitores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Delegar Função a Monitor</h2>
            <div className="card" style={{ padding: '1.5rem' }}>
              <form onSubmit={handleAddAssignment} className="mb-6">
                <select value={assignmentData.monitorEmail} onChange={e => setAssignmentData({...assignmentData, monitorEmail: e.target.value})} className="form-input mb-2" required>
                  <option value="">Selecione o Monitor...</option>
                  {monitors.map(m => <option key={m.id} value={m.email}>{m.nome}</option>)}
                </select>
                <input type="text" placeholder="Dia (Ex: Dia 1, 10/10/2026)" value={assignmentData.dia} onChange={e => setAssignmentData({...assignmentData, dia: e.target.value})} className="form-input mb-2" required />
                <input type="text" placeholder="Horário (Ex: 08:00 às 12:00)" value={assignmentData.horario} onChange={e => setAssignmentData({...assignmentData, horario: e.target.value})} className="form-input mb-2" required />
                <input type="text" placeholder="Local de Atuação (Ex: Portaria Principal, Bloco C)" value={assignmentData.local} onChange={e => setAssignmentData({...assignmentData, local: e.target.value})} className="form-input mb-2" required />
                <textarea placeholder="Descrição da Função (O que ele vai fazer?)" value={assignmentData.funcao} onChange={e => setAssignmentData({...assignmentData, funcao: e.target.value})} className="form-input mb-2" rows="3" required></textarea>
                
                <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Aguardar quais Palestrantes/Ministrantes?</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '100px', overflowY: 'auto' }}>
                    {(selectedEvent?.speakers || []).length === 0 ? <span style={{ color: '#64748b' }}>Nenhum ministrante cadastrado no evento.</span> : null}
                    {(selectedEvent?.speakers || []).map(spk => {
                      const isAssigned = assignmentData.ministranteIds.includes(spk.id);
                      return (
                        <label key={spk.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={isAssigned} onChange={() => {
                            setAssignmentData(prev => ({
                              ...prev,
                              ministranteIds: isAssigned ? prev.ministranteIds.filter(id => id !== spk.id) : [...prev.ministranteIds, spk.id]
                            }))
                          }} /> {spk.nome} ({spk.papel})
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: '#0ea5e9', border: 'none' }}>Delegar Função</button>
              </form>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Escala de Monitores Gerada</h2>
            <div className="card" style={{ padding: '1.5rem' }}>
              {(!selectedEvent?.monitorAssignments || selectedEvent.monitorAssignments.length === 0) ? (
                <p style={{ color: 'var(--text-secondary)' }}>Nenhuma função delegada ainda.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedEvent.monitorAssignments.map((assig, idx) => {
                    const monitor = monitors.find(m => m.email === assig.monitorEmail);
                    return (
                      <div key={idx} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Monitor: {monitor ? monitor.nome : assig.monitorEmail}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          <strong>Dia:</strong> {assig.dia} | <strong>Horário:</strong> {assig.horario} <br/>
                          <strong>Local:</strong> {assig.local}
                        </p>
                        <div style={{ padding: '0.5rem', backgroundColor: '#e0f2fe', borderRadius: '4px', fontSize: '0.875rem', color: '#0369a1' }}>
                          <strong>Função:</strong> {assig.funcao}
                        </div>
                      </div>
                    );
                  })}
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
          
          <div className="card mb-6" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', padding: '0.25rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold', color: '#0369a1' }}>Geral</span>
              <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>Credenciamento Geral do Evento</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Controle de entrada principal para quem chegou no evento.</p>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {ingressos.filter(ing => ing.eventId === selectedEvent?.id).length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Nenhum participante inscrito ainda.</p>
              ) : (
                <table style={{ width: '100%', fontSize: '0.875rem' }}>
                  <tbody>
                    {ingressos.filter(ing => ing.eventId === selectedEvent?.id).map((ing, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '0.75rem' }}>{ing.nome}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'flex-end' }}>
                            <div style={{ position: 'relative' }}>
                              <div 
                                style={{ width: '48px', height: '24px', backgroundColor: (ing.presenca && ing.presenca['GERAL']) ? '#10b981' : '#cbd5e1', borderRadius: '9999px', transition: 'background-color 0.3s', display: 'flex', alignItems: 'center', padding: '2px' }} 
                                onClick={() => {
                                  if(onUpdateIngresso) {
                                    const newPresenca = { ...(ing.presenca || {}) };
                                    newPresenca['GERAL'] = !newPresenca['GERAL'];
                                    onUpdateIngresso(ing.id, { presenca: newPresenca });
                                  }
                                }}
                              >
                                <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transform: (ing.presenca && ing.presenca['GERAL']) ? 'translateX(24px)' : 'translateX(0)', transition: 'transform 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}></div>
                              </div>
                            </div>
                            <span style={{ marginLeft: '0.5rem', fontWeight: 'bold', color: (ing.presenca && ing.presenca['GERAL']) ? '#10b981' : '#64748b' }}>
                              {(ing.presenca && ing.presenca['GERAL']) ? 'Confirmado' : 'Presente'}
                            </span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
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
                  {ingressos.filter(ing => ing.eventId === selectedEvent.id && (ing.atividades || '').includes(act.name)).length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Nenhum participante inscrito nesta atividade ainda.</p>
                  ) : (
                    <table style={{ width: '100%', fontSize: '0.875rem' }}>
                      <tbody>
                        {ingressos.filter(ing => ing.eventId === selectedEvent.id && (ing.atividades || '').includes(act.name)).map((ing, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '0.75rem' }}>{ing.nome}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'flex-end' }}>
                                <div style={{ position: 'relative' }}>
                                  <div 
                                    style={{ width: '48px', height: '24px', backgroundColor: (ing.presenca && ing.presenca[act.name]) ? '#10b981' : '#cbd5e1', borderRadius: '9999px', transition: 'background-color 0.3s', display: 'flex', alignItems: 'center', padding: '2px' }} 
                                    onClick={() => {
                                      if(onUpdateIngresso) {
                                        const newPresenca = { ...(ing.presenca || {}) };
                                        newPresenca[act.name] = !newPresenca[act.name];
                                        onUpdateIngresso(ing.id, { presenca: newPresenca });
                                      }
                                    }}
                                  >
                                    <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transform: (ing.presenca && ing.presenca[act.name]) ? 'translateX(24px)' : 'translateX(0)', transition: 'transform 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}></div>
                                  </div>
                                </div>
                                <span style={{ marginLeft: '0.5rem', fontWeight: 'bold', color: (ing.presenca && ing.presenca[act.name]) ? '#10b981' : '#64748b' }}>
                                  {(ing.presenca && ing.presenca[act.name]) ? 'Confirmado' : 'Presente'}
                                </span>
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

      {/* Aba de Credenciais com QR Code */}
      {activeTab === 'credenciais-qr' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={24} /> Credenciais dos Participantes
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Visualize e baixe os crachás com QR Code de cada participante inscrito neste evento.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {ingressos.filter(ing => ing.eventId === selectedEvent?.id).length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum participante inscrito ainda.</p>
            ) : (
              ingressos.filter(ing => ing.eventId === selectedEvent?.id).map((ing, i) => (
                <div key={i} className="card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{ing.nome}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>{ing.userEmail}</p>
                  
                  <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                    <QRCodeCanvas id={`qr-${ing.id}`} value={ing.id} size={120} level={"H"} includeMargin={true} />
                  </div>
                  
                  <button 
                    onClick={() => {
                      const qrCanvas = document.getElementById(`qr-${ing.id}`);
                      if (qrCanvas) {
                        const canvas = document.createElement('canvas');
                        canvas.width = 300;
                        canvas.height = 400;
                        const ctx = canvas.getContext('2d');
                        
                        // Fundo branco
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // Borda
                        ctx.strokeStyle = '#e2e8f0';
                        ctx.lineWidth = 4;
                        ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
                        
                        // Logo ou Header do Evento
                        ctx.fillStyle = '#3b82f6';
                        ctx.fillRect(2, 2, canvas.width - 4, 80);
                        
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 18px Arial';
                        ctx.textAlign = 'center';
                        // Quebra de linha simples para o título do evento se for muito longo
                        let title = selectedEvent?.title || 'Evento';
                        if(title.length > 25) title = title.substring(0, 22) + '...';
                        ctx.fillText(title, canvas.width / 2, 40);
                        ctx.font = '14px Arial';
                        ctx.fillText('Credencial Oficial', canvas.width / 2, 65);
                        
                        // Nome do participante
                        ctx.fillStyle = '#0f172a';
                        ctx.font = 'bold 20px Arial';
                        let nome = ing.nome;
                        if(nome.length > 20) nome = nome.substring(0, 17) + '...';
                        ctx.fillText(nome, canvas.width / 2, 120);
                        
                        // Email / Info
                        ctx.fillStyle = '#64748b';
                        ctx.font = '14px Arial';
                        ctx.fillText(ing.userEmail, canvas.width / 2, 145);
                        
                        // QR Code
                        ctx.drawImage(qrCanvas, 75, 170, 150, 150);
                        
                        // Instrução
                        ctx.fillStyle = '#94a3b8';
                        ctx.font = '12px Arial';
                        ctx.fillText('Apresente no credenciamento', canvas.width / 2, 350);
                        
                        const url = canvas.toDataURL("image/png");
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `credencial-${ing.nome.replace(/\\s+/g, '-')}.png`;
                        a.click();
                      }
                    }}
                    className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <FileDown size={16} /> Baixar Credencial
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Aba de Relatórios */}
      {activeTab === 'relatorios' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={24} /> Relatórios e Fichas de Impressão
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Selecione um dos relatórios abaixo para gerar uma ficha pronta para impressão (A4).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card text-center" style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--border-color)' }} onClick={() => setViewingReport('credenciamento')} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
              <Users size={32} style={{ margin: '0 auto 1rem', color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Ficha de Credenciamento</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Lista de todos os inscritos no evento para controle de entrada e assinaturas.</p>
            </div>
            <div className="card text-center" style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--border-color)' }} onClick={() => setViewingReport('oficinas')} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
              <ClipboardList size={32} style={{ margin: '0 auto 1rem', color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Fichas de Oficinas/Minicursos</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Listas de presença separadas por atividade com o nome dos alunos matriculados.</p>
            </div>
            <div className="card text-center" style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--border-color)' }} onClick={() => setViewingReport('monitores')} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
              <MonitorPlay size={32} style={{ margin: '0 auto 1rem', color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Escala de Monitores</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Lista da equipe de monitores com campos para registrar função, horários e assinatura.</p>
            </div>
            <div className="card text-center" style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--border-color)' }} onClick={() => setViewingReport('trabalhos')} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
              <GraduationCap size={32} style={{ margin: '0 auto 1rem', color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Ficha de Trabalhos Aceitos</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Lista com todos os trabalhos aprovados, seus códigos, autores e local de apresentação.</p>
            </div>
          </div>
        </div>
      )}

      {/* Aba de Ranking */}
      {activeTab === 'ranking' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={24} /> Ranking de Apresentações
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Acompanhe os melhores trabalhos avaliados in-loco pela comissão científica.</p>
          
          {(() => {
            // Filtrar trabalhos que possuem avaliação de apresentação
            const evaluatedWorks = submissions.filter(sub => sub.avaliacoesApresentacao && sub.avaliacoesApresentacao.length > 0);
            
            if (evaluatedWorks.length === 0) {
              return (
                <div className="card text-center" style={{ padding: '3rem', color: 'var(--text-secondary)' }}>
                  <p>Nenhuma apresentação foi avaliada ainda.</p>
                </div>
              );
            }

            // Calcular médias e agrupar por categoria
            const rankedWorks = evaluatedWorks.map(sub => {
              const avaliacoes = sub.avaliacoesApresentacao || [];
              const media = avaliacoes.reduce((acc, curr) => acc + (curr.total || 0), 0) / avaliacoes.length;
              
              // Descobrir a área através do ingresso do usuário
              const ingresso = ingressos.find(ing => ing.userEmail === sub.userEmail && ing.eventId === sub.eventId);
              const curso = ingresso ? (ingresso.curso || 'Outro') : 'Outro';
              
              let categoria = 'Geral';
              if (curso.toLowerCase().includes('física') || curso.toLowerCase().includes('fisica')) categoria = 'Física';
              if (curso.toLowerCase().includes('matemática') || curso.toLowerCase().includes('matematica')) categoria = 'Matemática';

              return { ...sub, mediaFinal: media, categoriaAutor: categoria, qtdAvaliadores: avaliacoes.length };
            }).sort((a, b) => b.mediaFinal - a.mediaFinal);

            const fisicaTop = rankedWorks.filter(w => w.categoriaAutor === 'Física').slice(0, 3);
            const matTop = rankedWorks.filter(w => w.categoriaAutor === 'Matemática').slice(0, 3);
            const geralTop = [...rankedWorks].slice(0, 3);

            const renderPodium = (title, works, color) => (
              <div className="card mb-6" style={{ padding: '1.5rem', borderTop: `4px solid ${color}` }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: color }}>{title}</h3>
                {works.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nenhum trabalho avaliado nesta categoria.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {works.map((w, i) => (
                      <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : '#cd7f32', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem', flexShrink: 0 }}>
                          {i + 1}º
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{w.trabalho}</h4>
                          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Autor(a): {w.usuario} | Código: {w.detalhesApresentacao?.numeroPoster || w.id.slice(-4)}</p>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                            <strong>Avaliadores:</strong> {w.avaliacoesApresentacao.map(av => {
                              const avr = avaliadores.find(a => a.email === av.avaliadorEmail);
                              return `${avr ? avr.nome : av.avaliadorEmail} (${av.total})`;
                            }).join(', ')}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>{w.mediaFinal.toFixed(1)}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Média</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderPodium('Melhores Trabalhos - Física', fisicaTop, '#3b82f6')}
                {renderPodium('Melhores Trabalhos - Matemática', matTop, '#ef4444')}
                <div className="lg:col-span-2">
                  {renderPodium('Top 3 Geral (Misto)', geralTop, '#10b981')}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* MODAL DE IMPRESSÃO (TELA CHEIA) */}
      {viewingReport && (
        <div className="print-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 99999, overflowY: 'auto' }}>
          <div className="no-print" style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9', padding: '1rem', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <button onClick={() => setViewingReport(null)} className="btn btn-outline flex items-center gap-2">
              <ArrowLeft size={16} /> Voltar
            </button>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select className="form-input" style={{ padding: '0.5rem', height: '100%' }} value={sharingMonitorId} onChange={(e) => setSharingMonitorId(e.target.value)}>
                <option value="">Compartilhar com...</option>
                <option value="ALL">Todos os Monitores</option>
                {monitors.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
              <button 
                onClick={() => {
                   if(!sharingMonitorId) return alert('Selecione um monitor para compartilhar');
                   if (sharingMonitorId === 'ALL') {
                       monitors.forEach(m => {
                           const relatoriosPermitidos = m.relatoriosPermitidos || [];
                           if (!relatoriosPermitidos.includes(viewingReport)) {
                               onUpdateMonitor(m.id, { relatoriosPermitidos: [...relatoriosPermitidos, viewingReport] });
                           }
                       });
                   } else {
                       const monitor = monitors.find(m => m.id === sharingMonitorId);
                       if (monitor) {
                           const relatoriosPermitidos = monitor.relatoriosPermitidos || [];
                           if (!relatoriosPermitidos.includes(viewingReport)) {
                               onUpdateMonitor(monitor.id, { relatoriosPermitidos: [...relatoriosPermitidos, viewingReport] });
                           }
                       }
                   }
                   alert('Relatório compartilhado com sucesso!');
                   setSharingMonitorId('');
                }} 
                className="btn btn-outline" style={{ borderColor: '#3b82f6', color: '#3b82f6', height: '100%' }}>
                Enviar Relatório
              </button>
              <button onClick={handlePrint} className="btn btn-primary" style={{ backgroundColor: '#16a34a', border: 'none', height: '100%' }}>
                Imprimir Relatório
              </button>
            </div>
          </div>

          <div className="print-area" style={{ padding: '2rem 4rem', color: 'black', fontFamily: 'Arial, sans-serif' }}>
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
                            const monitor = monitors.find(m => m.email === assig.monitorEmail);
                            const nome = monitor ? monitor.nome : assig.monitorEmail;
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
                  {submissions.filter(s => s.status === 'aprovado').map((sub, idx) => {
                    const autores = sub.coAutores ? `${sub.usuario}, ${sub.coAutores}` : sub.usuario;
                    const monitor = monitors.find(m => m.email === sub.monitorEmail);
                    const monitorNome = monitor ? monitor.nome : '';
                    
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
                  {submissions.filter(s => s.status === 'aprovado').length === 0 && (
                    <tr><td colSpan="6" style={{ border: '1px solid #000', padding: '1rem', textAlign: 'center' }}>Nenhum trabalho aprovado.</td></tr>
                  )}
                </tbody>
              </table>
            )}
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
