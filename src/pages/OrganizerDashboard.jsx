import { useState } from 'react';
import { EventForm } from '../components/EventForm';
import { EventCard } from '../components/EventCard';
import { FileDown, Users, Check, X } from 'lucide-react';

export function OrganizerDashboard({ events, onAddEvent, submissions, onUpdateSubmission, monitors = [], onAddMonitor, avaliadores = [], onAddAvaliador }) {
  const [approvingSubId, setApprovingSubId] = useState(null);
  const [approvalData, setApprovalData] = useState({
    dataApresentacao: '',
    horaApresentacao: '',
    localApresentacao: '',
    numeroPoster: ''
  });

  const [monitorData, setMonitorData] = useState({ nome: '', email: '', matricula: '', ira: '', telefone: '' });
  const [avaliadorData, setAvaliadorData] = useState({ nome: '', email: '', matricula: '', telefone: '', fotoUrl: '' });

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

  const handleApproveClick = (subId) => {
    setApprovingSubId(subId);
  };

  const handleConfirmApproval = () => {
    onUpdateSubmission(approvingSubId, { status: 'aprovado', detalhesApresentacao: approvalData });
    setApprovingSubId(null);
    setApprovalData({ dataApresentacao: '', horaApresentacao: '', localApresentacao: '', numeroPoster: '' });
  };

  const handleReject = (subId) => {
    if (window.confirm("Deseja rejeitar este trabalho?")) {
      onUpdateSubmission(subId, { status: 'rejeitado' });
    }
  };

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-8" style={{ marginTop: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '700' }}>Painel do Organizador</h1>
          <p>Gerencie seus eventos e avalie as submissões de trabalhos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1" style={{ gap: '2rem', gridTemplateColumns: 'minmax(0, 1fr) 400px' }}>
        <div style={{ order: 2 }}>
          <div style={{ position: 'sticky', top: '100px' }}>
            <EventForm onSubmit={onAddEvent} />
          </div>
        </div>
        
        <div style={{ order: 1 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Trabalhos Submetidos para Avaliação</h2>
          
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
                            <button onClick={() => handleApproveClick(sub.id)} className="btn" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem' }}>
                              <Check size={16} /> Aprovar
                            </button>
                            <button onClick={() => handleReject(sub.id)} className="btn" style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem' }}>
                              <X size={16} /> Rejeitar
                            </button>
                          </div>
                        )}
                        {approvingSubId === sub.id && (
                          <div className="flex gap-2 mb-2">
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Aguardando preenchimento...</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <select 
                            className="form-input" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} 
                            value={sub.monitorEmail || ''} 
                            onChange={(e) => onUpdateSubmission(sub.id, { monitorEmail: e.target.value })}
                          >
                            <option value="">Atribuir Monitor...</option>
                            {monitors.map(m => <option key={m.id} value={m.email}>{m.nome}</option>)}
                          </select>
                          <select 
                            className="form-input" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} 
                            value={sub.avaliadorEmail || ''} 
                            onChange={(e) => onUpdateSubmission(sub.id, { avaliadorEmail: e.target.value })}
                          >
                            <option value="">Atribuir Avaliador...</option>
                            {avaliadores.map(a => <option key={a.id} value={a.email}>{a.nome}</option>)}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Seus Eventos Publicados</h2>
          {events.length === 0 ? (
            <div className="card text-center mb-8" style={{ padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <p>Você ainda não publicou nenhum evento.</p>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 mb-8" style={{ gap: '1.5rem' }}>
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>Cadastro de Monitores</h2>
          <div className="card mb-8" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <form onSubmit={handleMonitorSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" style={{ paddingBottom: '2rem', borderBottom: '1px dashed var(--border-color)' }}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input type="text" value={monitorData.nome} onChange={e => setMonitorData({...monitorData, nome: e.target.value})} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input type="email" value={monitorData.email} onChange={e => setMonitorData({...monitorData, email: e.target.value})} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Matrícula</label>
                <input type="text" value={monitorData.matricula} onChange={e => setMonitorData({...monitorData, matricula: e.target.value})} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">I.R.A Acadêmico</label>
                <input type="text" value={monitorData.ira} onChange={e => setMonitorData({...monitorData, ira: e.target.value})} className="form-input" placeholder="Ex: 8.5" required />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input type="tel" value={monitorData.telefone} onChange={e => setMonitorData({...monitorData, telefone: e.target.value})} className="form-input" placeholder="(00) 00000-0000" required />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Cadastrar Monitor</button>
              </div>
            </form>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Lista de Monitores Cadastrados</h3>
            {monitors.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum monitor cadastrado ainda.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Nome</th>
                    <th style={{ padding: '0.75rem' }}>E-mail</th>
                    <th style={{ padding: '0.75rem' }}>Matrícula</th>
                    <th style={{ padding: '0.75rem' }}>I.R.A</th>
                    <th style={{ padding: '0.75rem' }}>Telefone</th>
                  </tr>
                </thead>
                <tbody>
                  {monitors.map(monitor => (
                    <tr key={monitor.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '500' }}>{monitor.nome}</td>
                      <td style={{ padding: '0.75rem' }}>{monitor.email}</td>
                      <td style={{ padding: '0.75rem' }}>{monitor.matricula}</td>
                      <td style={{ padding: '0.75rem' }}>{monitor.ira}</td>
                      <td style={{ padding: '0.75rem' }}>{monitor.telefone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>Cadastro de Avaliadores</h2>
          <div className="card mb-8" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <form onSubmit={handleAvaliadorSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" style={{ paddingBottom: '2rem', borderBottom: '1px dashed var(--border-color)' }}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input type="text" value={avaliadorData.nome} onChange={e => setAvaliadorData({...avaliadorData, nome: e.target.value})} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail Institucional</label>
                <input type="email" value={avaliadorData.email} onChange={e => setAvaliadorData({...avaliadorData, email: e.target.value})} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Matrícula</label>
                <input type="text" value={avaliadorData.matricula} onChange={e => setAvaliadorData({...avaliadorData, matricula: e.target.value})} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input type="tel" value={avaliadorData.telefone} onChange={e => setAvaliadorData({...avaliadorData, telefone: e.target.value})} className="form-input" placeholder="(00) 00000-0000" required />
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">Link da Foto de Perfil (Ex: LinkedIn, Lattes)</label>
                <input type="url" value={avaliadorData.fotoUrl} onChange={e => setAvaliadorData({...avaliadorData, fotoUrl: e.target.value})} className="form-input" placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Cadastrar Avaliador</button>
              </div>
            </form>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Lista de Avaliadores</h3>
            {avaliadores.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum avaliador cadastrado ainda.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Nome</th>
                    <th style={{ padding: '0.75rem' }}>E-mail Institucional</th>
                    <th style={{ padding: '0.75rem' }}>Matrícula</th>
                    <th style={{ padding: '0.75rem' }}>Telefone</th>
                  </tr>
                </thead>
                <tbody>
                  {avaliadores.map(avaliador => (
                    <tr key={avaliador.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {avaliador.fotoUrl ? <img src={avaliador.fotoUrl} alt={avaliador.nome} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} /> : <Users size={32} style={{ color: 'var(--text-secondary)', backgroundColor: '#e2e8f0', borderRadius: '50%', padding: '0.25rem' }} />}
                        {avaliador.nome}
                      </td>
                      <td style={{ padding: '0.75rem' }}>{avaliador.email}</td>
                      <td style={{ padding: '0.75rem' }}>{avaliador.matricula}</td>
                      <td style={{ padding: '0.75rem' }}>{avaliador.telefone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal Renderizado Fora da Tabela */}
      {approvingSubId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', minWidth: '400px', maxWidth: '90%' }}>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Dados da Apresentação</h4>
            
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
            
            <div className="form-group mb-6">
              <label className="form-label" style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Nº do Pôster (Opcional)</label>
              <input type="text" placeholder="Ex: PO - 0281" value={approvalData.numeroPoster} onChange={(e) => setApprovalData({...approvalData, numeroPoster: e.target.value})} className="form-input" />
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setApprovingSubId(null)} className="btn btn-outline" style={{ flex: 1, padding: '0.75rem' }}>Cancelar</button>
              <button onClick={handleConfirmApproval} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }}>Confirmar Aprovação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
