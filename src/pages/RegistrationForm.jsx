import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, CreditCard, FileUp, ArrowLeft, CheckCircle } from 'lucide-react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

// Inicializa com a chave pública fornecida pelo usuário
initMercadoPago('APP_USR-3991bf48-57bf-43b3-b17d-89afeaf263ad');

export function RegistrationForm({ events, user, userProfile, onSubmitWork }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = events.find(e => e.id === id);
  const [step, setStep] = useState(1);
  const [pixData, setPixData] = useState(null);

  const [formData, setFormData] = useState({
    nome: userProfile?.nome || user?.displayName || '',
    nomeSocial: userProfile?.nomeSocial || '',
    cpf: userProfile?.cpf || '',
    matricula: userProfile?.matricula || '',
    curso: userProfile?.curso || '',
    genero: userProfile?.genero || '',
    modalidade: 'sem_submissao',
    tipoApresentacao: 'poster', // poster, oral
    atividadesExtras: []
  });
  
  const [trabalhoFile, setTrabalhoFile] = useState(null);

  if (!event) return <div className="container">Evento não encontrado.</div>;
  if (!user) {
    return (
      <div className="container text-center" style={{ paddingTop: '5rem' }}>
        <h2>Você precisa estar logado para se inscrever.</h2>
        <Link to="/login" className="btn btn-primary mt-4" style={{ textDecoration: 'none' }}>Fazer Login</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (actName) => {
    setFormData(prev => {
      const selected = prev.atividadesExtras.includes(actName)
        ? prev.atividadesExtras.filter(n => n !== actName)
        : [...prev.atividadesExtras, actName];
      return { ...prev, atividadesExtras: selected };
    });
  };

  const precoAtual = formData.modalidade === 'com_submissao' 
    ? Number(event.priceWithSubmission || 0) 
    : Number(event.priceWithoutSubmission || 0);

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCheckout = () => {
    setStep(3);
    if (formData.modalidade === 'com_submissao' && trabalhoFile) {
      onSubmitWork(event.id, {
        usuario: formData.nome || user.displayName,
        trabalho: trabalhoFile.name,
        modalidade: formData.tipoApresentacao,
        status: 'em_analise',
        data: new Date().toISOString()
      });
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline mb-4" style={{ border: 'none', paddingLeft: 0 }}>
        <ArrowLeft size={16} /> Voltar
      </button>

      {step < 3 && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Inscrição: {event.title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Logado como: <strong>{user.email}</strong></p>

          {step === 1 && (
            <form onSubmit={handleNext}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nome Social (Opcional)</label>
                  <input type="text" name="nomeSocial" value={formData.nomeSocial} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">CPF / Passaporte</label>
                  <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gênero</label>
                  <select name="genero" value={formData.genero} onChange={handleChange} className="form-input" required>
                    <option value="">Selecione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Não-binário">Não-binário</option>
                    <option value="Prefiro não responder">Prefiro não responder</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Matrícula (Se estudante)</label>
                  <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Titulação / Curso</label>
                  <input type="text" name="curso" value={formData.curso} onChange={handleChange} className="form-input" placeholder="Ex: Graduando em Física" required />
                </div>
              </div>

              <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

              <h3 style={{ marginBottom: '1rem' }}>Categoria de Inscrição</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div 
                  className={`card ${formData.modalidade === 'sem_submissao' ? 'active-border' : ''}`} 
                  style={{ padding: '1.5rem', cursor: 'pointer', border: formData.modalidade === 'sem_submissao' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)' }}
                  onClick={() => setFormData(p => ({ ...p, modalidade: 'sem_submissao' }))}
                >
                  <h4>Estudante / Presencial (Ouvinte)</h4>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--text-primary)' }}>R$ {Number(event.priceWithoutSubmission || 0).toFixed(2).replace('.', ',')}</p>
                </div>

                <div 
                  className={`card ${formData.modalidade === 'com_submissao' ? 'active-border' : ''}`} 
                  style={{ padding: '1.5rem', cursor: 'pointer', border: formData.modalidade === 'com_submissao' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)' }}
                  onClick={() => setFormData(p => ({ ...p, modalidade: 'com_submissao' }))}
                >
                  <h4>Comunicação/Apresentador (Com submissão)</h4>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--text-primary)' }}>R$ {Number(event.priceWithSubmission || 0).toFixed(2).replace('.', ',')}</p>
                </div>
              </div>

              {formData.modalidade === 'com_submissao' && (
                <div className="form-group" style={{ backgroundColor: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', border: '1px dashed var(--accent-primary)', marginBottom: '2rem' }}>
                  
                  <div className="mb-4">
                    <label className="form-label">Tipo de Apresentação</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="tipoApresentacao" value="poster" checked={formData.tipoApresentacao === 'poster'} onChange={handleChange} /> Pôster (PO)
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="tipoApresentacao" value="oral" checked={formData.tipoApresentacao === 'oral'} onChange={handleChange} /> Comunicação Oral
                      </label>
                    </div>
                  </div>

                  <label className="form-label flex items-center gap-2">
                    <FileUp size={18} /> Enviar Arquivo do Trabalho (PDF, DOCX)
                  </label>
                  <input type="file" onChange={(e) => setTrabalhoFile(e.target.files[0])} className="form-input" required />
                </div>
              )}

              {event.activities && event.activities.length > 0 && (
                <>
                  <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />
                  <h3 style={{ marginBottom: '1rem' }}>Inscrição em Minicursos e Oficinas</h3>
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {event.activities.map((act, idx) => (
                      <label key={idx} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px solid var(--border-color)' }}>
                        <input type="checkbox" checked={formData.atividadesExtras.includes(act.name)} onChange={() => handleCheckboxChange(act.name)} style={{ width: '20px', height: '20px' }} />
                        <div>
                          <strong>{act.name}</strong>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{act.minister} | {act.time} | {act.room}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.1rem' }}>
                Avançar para Pagamento
              </button>
            </form>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}><CreditCard size={20} style={{ display: 'inline', marginRight: '8px' }} /> Resumo do Pedido (Carrinho)</h3>
              <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <div className="flex justify-between mb-2">
                  <span>Inscrição: {event.title}</span>
                  <strong>R$ {precoAtual.toFixed(2).replace('.', ',')}</strong>
                </div>
                <div className="flex justify-between mb-2 text-secondary" style={{ fontSize: '0.875rem' }}>
                  <span>Categoria: {formData.modalidade === 'com_submissao' ? 'Com submissão de trabalho' : 'Estudante - Presencial'}</span>
                </div>
                {formData.atividadesExtras.length > 0 && (
                  <div className="mt-2 text-secondary" style={{ fontSize: '0.875rem' }}>
                    <strong>Atividades Selecionadas:</strong>
                    <ul style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                      {formData.atividadesExtras.map((act, i) => <li key={i}>{act}</li>)}
                    </ul>
                  </div>
                )}
                <hr style={{ margin: '1rem 0' }} />
                <div className="flex justify-between" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                  <span>Total a Pagar</span>
                  <span style={{ color: 'var(--accent-primary)' }}>R$ {precoAtual.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              
              <div className="mt-8">
                {pixData ? (
                  <div className="card text-center" style={{ padding: '3rem', backgroundColor: 'var(--bg-primary)' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#10b981' }}>Escaneie o QR Code para pagar</h3>
                    <img 
                      src={`data:image/jpeg;base64,${pixData.qr_code_base64}`} 
                      alt="QR Code PIX" 
                      style={{ width: '250px', height: '250px', margin: '0 auto', display: 'block', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                    />
                    
                    <div className="mt-6">
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ou utilize o código Copia e Cola:</p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={pixData.qr_code} 
                          className="form-input" 
                          style={{ fontFamily: 'monospace', fontSize: '0.875rem' }} 
                        />
                        <button 
                          className="btn btn-outline" 
                          onClick={() => {
                            navigator.clipboard.writeText(pixData.qr_code);
                            alert("Código copiado!");
                          }}
                        >
                          Copiar
                        </button>
                      </div>
                    </div>

                    <div className="mt-8">
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Após realizar o pagamento no seu banco, clique no botão abaixo para gerar sua credencial.
                      </p>
                      <button onClick={handleCheckout} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                        Já realizei o pagamento
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 style={{ marginBottom: '1rem' }}>Selecione a forma de pagamento:</h4>
                    <div style={{ minHeight: '400px' }}>
                  <Payment
                    initialization={{ amount: precoAtual, preferenceId: undefined }}
                    customization={{
                      paymentMethods: {
                        creditCard: 'all',
                        debitCard: 'all',
                        ticket: 'all',
                        bankTransfer: 'all'
                      }
                    }}
                    onSubmit={async ({ formData }) => {
                      console.log("Enviando dados para o servidor de pagamentos...", formData);
                      return new Promise(async (resolve, reject) => {
                        try {
                          const response = await fetch("/process_payment", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify(formData),
                          });
                          
                          const data = await response.json();
                          
                          if (response.ok) {
                            console.log("Pagamento efetuado/solicitado com sucesso", data);
                            
                            if (data.payment_method_id === 'pix' && data.point_of_interaction) {
                              setPixData(data.point_of_interaction.transaction_data);
                              resolve();
                            } else {
                              handleCheckout(); // Avança para a tela final (Ticket)
                              resolve();
                            }
                          } else {
                            console.error("Erro na resposta do servidor:", data);
                            alert("Ocorreu um problema ao processar o pagamento: " + (data.error || "Tente novamente."));
                            reject();
                          }
                        } catch (err) {
                          console.error("Erro na comunicação com o servidor:", err);
                          alert("Não foi possível conectar ao servidor de pagamentos.");
                          reject();
                        }
                      });
                    }}
                    onReady={() => console.log('Mercado Pago Brick is ready')}
                    onError={(error) => console.error('Mercado Pago Error', error)}
                  />
                </div>
              </>
            )}
          </div>

              <div className="flex gap-4 mt-4">
                <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>Voltar</button>
                {/* O botão de confirmar foi removido pois o Brick gera seu próprio botão */}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TELA FINAL: COMPROVANTE (TICKET) NO NOVO FORMATO */}
      {step === 3 && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="text-center mb-4">
            <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto', marginBottom: '1rem' }} />
            <h2>Pagamento Confirmado!</h2>
          </div>

          <div style={{ backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            
            {/* Header Ticket */}
            <div className="flex justify-between items-center" style={{ borderBottom: '2px solid #cbd5e1', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>DOCUMENTO DE INSCRIÇÃO</h1>
              {event.logoUrl ? (
                <img src={event.logoUrl} alt="Logo" style={{ height: '50px', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--accent-primary)' }}>{event.title}</div>
              )}
            </div>

            {/* Nome/Profile */}
            <div className="flex items-center gap-4 mb-8">
              {event.logoUrl && (
                <img src={event.logoUrl} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
              )}
              <div>
                <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Nome:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>
                  {formData.nomeSocial || formData.nome}
                </span>
              </div>
            </div>

            {/* Dados Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '2rem', marginBottom: '2rem' }}>
              
              {/* Coluna Esquerda */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>E-mail:</span>
                  <strong style={{ color: '#0f172a' }}>{user.email}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>CPF/Passaporte:</span>
                  <strong style={{ color: '#0f172a' }}>{formData.cpf}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Titulação/Curso:</span>
                  <strong style={{ color: '#0f172a' }}>{formData.curso}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Crachá:</span>
                  <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{(formData.nomeSocial || formData.nome).split(' ')[0]}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Categoria de inscrição:</span>
                  <strong style={{ color: '#0f172a' }}>
                    {formData.modalidade === 'com_submissao' ? `Apresentador - ${formData.tipoApresentacao.toUpperCase()}` : 'Estudante - Presencial'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Data de inscrição:</span>
                  <strong style={{ color: '#0f172a' }}>{new Date().toLocaleString('pt-BR')}</strong>
                </div>
              </div>

              {/* Coluna Direita */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <div className="flex justify-between">
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Valor da inscrição:</span>
                  <span style={{ fontWeight: '600', color: '#64748b' }}>R$ {precoAtual.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Acréscimo:</span>
                  <span style={{ fontWeight: '600', color: '#64748b' }}>R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Desconto:</span>
                  <span style={{ fontWeight: '600', color: '#64748b' }}>R$ 0,00</span>
                </div>
                
                <div className="flex justify-between mt-2 pt-2" style={{ borderTop: '1px solid #cbd5e1' }}>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Valor Total:</span>
                  <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0f172a' }}>R$ {precoAtual.toFixed(2).replace('.', ',')}</span>
                </div>

                <div className="mt-4">
                  <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Status de pagamento:</span>
                  <div style={{ backgroundColor: '#475569', color: 'white', padding: '0.5rem', textAlign: 'center', fontWeight: '500' }}>
                    Paga - Concluída
                  </div>
                </div>
              </div>

            </div>

            {/* Código de Barras (Visual) */}
            <div style={{ marginTop: '1rem', opacity: 0.8 }}>
              {/* Uma simulação boba de código de barras feita com divs */}
              <div style={{ display: 'flex', height: '40px', gap: '2px', alignItems: 'flex-end' }}>
                {Array.from({length: 45}).map((_, i) => (
                  <div key={i} style={{ width: Math.random() > 0.5 ? '4px' : '2px', backgroundColor: 'black', height: Math.random() > 0.2 ? '100%' : '80%' }}></div>
                ))}
              </div>
            </div>

          </div>

          <div className="text-center mt-8">
            <Link to="/painel-usuario" className="btn btn-outline mr-4" style={{ textDecoration: 'none' }}>Ver Meus Trabalhos</Link>
            <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>Voltar ao Portal</Link>
          </div>
        </div>
      )}

    </div>
  );
}
