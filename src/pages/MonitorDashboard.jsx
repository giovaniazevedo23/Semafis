import { useState } from 'react';
import { Users, FileText, CheckCircle, Calendar, Camera, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';

export function MonitorDashboard({ user, monitors, submissions, avaliadores, events, ingressos = [] }) {
  const [activeTab, setActiveTab] = useState('escala'); // 'escala', 'trabalhos', 'credenciamento'
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUserId, setScannedUserId] = useState(null);
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

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button onClick={() => setActiveTab('escala')} className={`btn ${activeTab === 'escala' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Sua Escala de Trabalho
        </button>
        <button onClick={() => setActiveTab('trabalhos')} className={`btn ${activeTab === 'trabalhos' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Trabalhos Sob Sua Supervisão
        </button>
        <button onClick={() => setActiveTab('credenciamento')} className={`btn ${activeTab === 'credenciamento' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none' }}>
          Credenciamento e Check-in
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
                            {sub.detalhesApresentacao.numeroPoster && <li><strong>Pôster:</strong> {sub.detalhesApresentacao.numeroPoster}</li>}
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
            <button 
              onClick={() => setIsScanning(!isScanning)} 
              className={`btn ${isScanning ? 'btn-outline' : 'btn-primary'} flex items-center gap-2`}
            >
              <Camera size={18} /> {isScanning ? 'Fechar Câmera' : 'Ler QR Code'}
            </button>
          </div>

          {isScanning && (
            <div className="card mb-8" style={{ padding: '1.5rem', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', padding: '1.5rem' }}>
                <h4 style={{ color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <QrCode size={20} /> Leitura Manual
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>A câmera foi desativada temporariamente para evitar travamentos no seu dispositivo.</p>
                <input 
                  type="text" 
                  placeholder="Digite o ID ou Email do Participante" 
                  className="form-input"
                  style={{ borderColor: '#cbd5e1' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      setScannedUserId(e.target.value);
                      alert(`Usuário ${e.target.value} lido com sucesso!`);
                      setIsScanning(false);
                    }
                  }} 
                />
              </div>
              <p style={{ color: 'white', marginTop: '1rem' }}>Digite o identificador e pressione ENTER para confirmar.</p>
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
                          <input type="checkbox" className="sr-only" style={{ display: 'none' }} defaultChecked={isHighlighted} onChange={(e) => {
                            if (e.target.checked) alert(`Presença confirmada para ${ing.nome}`);
                          }} />
                          <div style={{ width: '48px', height: '24px', backgroundColor: isHighlighted ? '#10b981' : '#cbd5e1', borderRadius: '9999px', transition: 'background-color 0.3s', display: 'flex', alignItems: 'center', padding: '2px' }}>
                            <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transform: isHighlighted ? 'translateX(24px)' : 'translateX(0)', transition: 'transform 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}></div>
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
    </div>
  );
}
