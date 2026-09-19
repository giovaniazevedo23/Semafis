import { useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EvaluatorDashboard({ user, avaliadores, submissions, events, onUpdateSubmission, onSendNotification }) {
  const [evaluatingSubId, setEvaluatingSubId] = useState(null);
  const [evaluationData, setEvaluationData] = useState({ nota: '', comentario: '' });

  if (!user) {
    return (
      <div className="container text-center" style={{ paddingTop: '5rem' }}>
        <h2>Acesso Negado</h2>
        <p>Você precisa estar logado para acessar esta página.</p>
        <Link to="/login" className="btn btn-primary mt-4" style={{ textDecoration: 'none' }}>Fazer Login</Link>
      </div>
    );
  }

  const isAvaliador = avaliadores.some(a => a.email === user.email);

  if (!isAvaliador) {
    return (
      <div className="container text-center" style={{ paddingTop: '5rem' }}>
        <h2>Acesso Negado</h2>
        <p>Apenas membros da comissão científica podem acessar este painel.</p>
      </div>
    );
  }

  const mySubmissions = submissions.filter(sub => 
    sub.avaliadoresEmails && sub.avaliadoresEmails.includes(user.email)
  );

  const handleEvaluateClick = (subId) => {
    setEvaluatingSubId(subId);
    setEvaluationData({ nota: '', comentario: '' });
  };

  const submitEvaluation = (e, sub) => {
    e.preventDefault();
    const nota = Number(evaluationData.nota);
    
    if (isNaN(nota) || nota < 0 || nota > 100) {
      alert("Por favor, insira uma nota válida de 0 a 100.");
      return;
    }

    const newAvaliacao = {
      avaliadorEmail: user.email,
      nota,
      comentario: evaluationData.comentario,
      data: new Date().toISOString()
    };

    const updatedAvaliacoes = (sub.avaliacoes || []).filter(a => a.avaliadorEmail !== user.email);
    updatedAvaliacoes.push(newAvaliacao);
    
    const updates = { avaliacoes: updatedAvaliacoes };

    // Lógica de Aprovação Automática (80% da média)
    // Só calcula a média se todos os avaliadores vinculados já tiverem dado a nota
    if (updatedAvaliacoes.length >= sub.avaliadoresEmails.length) {
      const soma = updatedAvaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
      const media = soma / updatedAvaliacoes.length;
      const novoStatus = media >= 80 ? 'aprovado' : 'rejeitado';
      updates.status = novoStatus;

      // Gerar a notificação para o usuário (Carta de Aceite ou Rejeição)
      if (onSendNotification) {
        let title = '';
        let content = '';

        if (novoStatus === 'aprovado') {
          title = `Resultado da Submissão: Trabalho APROVADO - SEMAFIS`;
          content = `Prezado(a) ${sub.usuario.toUpperCase()},

É com grande satisfação que a comissão científica da Semana da Física do Instituto Federal do Piauí (IFPI) - Campus Teresina Central informa que o seu trabalho intitulado "${sub.trabalho.toUpperCase()}" foi APROVADO para apresentação em nosso evento!

Parabenizamos pela qualidade da pesquisa e pela contribuição para o debate acadêmico em nossa área.

Detalhes da Apresentação:
Data: A definir pela organização
Horário: A definir pela organização
Local/Sala: A definir pela organização
Modalidade: ${sub.modalidade === 'poster' ? 'Pôster (PO)' : 'Comunicação Oral'}

Solicitamos que acesse a aba "Meus Ingressos" ou a tela inicial do site para adquirir o seu ingresso da categoria "Apresentador" e confirmar a sua participação oficial no evento. Lembre-se de que o dia e o horário informados podem sofrer pequenos ajustes até a divulgação da programação final.

Nos vemos no evento!

Atenciosamente,
Comissão Científica - SEMAFIS`;
        } else {
          title = `Resultado da Submissão - SEMAFIS`;
          const notasCriterios = updatedAvaliacoes.map(av => `Nota: ${av.nota}/100 - Parecer: ${av.comentario || 'Sem observações'}`).join('\n\n');
          
          content = `Prezado(a) ${sub.usuario.toUpperCase()},

Agradecemos o envio do seu trabalho intitulado "${sub.trabalho.toUpperCase()}" para a Semana da Física do Instituto Federal do Piauí (IFPI) - Campus Teresina Central.

Informamos que, após uma análise cuidadosa da nossa comissão científica, o seu projeto não foi selecionado para apresentação nesta edição do evento. A avaliação levou em consideração a média das notas (Média final alcançada: ${media.toFixed(1)}/100, sendo necessário no mínimo 80/100 para aprovação).

Os pareceres detalhados dos avaliadores, contendo sugestões e observações construtivas, seguem abaixo:

${notasCriterios}

Esperamos que esse feedback seja valioso para o aperfeiçoamento da sua pesquisa. Valorizamos muito o seu interesse e esforço, e o encorajamos fortemente a continuar desenvolvendo seus estudos e a submeter novos trabalhos em nossas futuras edições.

Você continua sendo nosso(a) convidado(a) especial para participar de todas as palestras, minicursos e debates da SEMAFIS.

Atenciosamente,
Comissão Científica - SEMAFIS`;
        }

        onSendNotification({
          userEmail: sub.userEmail,
          type: novoStatus,
          title,
          content
        });
      }
    }

    onUpdateSubmission(sub.id, updates);
    setEvaluatingSubId(null);
    alert("Avaliação registrada com sucesso!");
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div className="flex justify-between items-center mb-8" style={{ marginTop: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#16a34a' }}>Painel do Avaliador</h1>
          <p>Olá, {user.displayName || user.email}! Avalie os trabalhos atribuídos a você.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div className="flex items-center gap-4">
            <FileText size={32} color="#16a34a" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#14532d' }}>{mySubmissions.length}</h3>
              <span style={{ color: '#15803d', fontSize: '0.875rem' }}>Trabalhos Atribuídos</span>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Trabalhos para Avaliar</h2>
      
      {mySubmissions.length === 0 ? (
        <div className="card text-center mb-8" style={{ padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
          <CheckCircle size={48} style={{ margin: '0 auto', marginBottom: '1rem', color: '#10b981', opacity: 0.5 }} />
          <p>Você ainda não foi designado para avaliar nenhum trabalho.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 mb-8">
          {mySubmissions.map(sub => {
            const event = events.find(e => e.id === sub.eventId);
            const myEvaluation = (sub.avaliacoes || []).find(a => a.avaliadorEmail === user.email);
            const isEvaluating = evaluatingSubId === sub.id;

            return (
              <div key={sub.id} className="card" style={{ padding: '2rem', borderLeft: '4px solid #16a34a' }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{sub.trabalho}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Autor(a): <strong>{sub.usuario}</strong></p>
                    {sub.coAutores && <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Co-autores: {sub.coAutores}</p>}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Evento: {event ? event.title : 'Desconhecido'}</p>
                  </div>
                  <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                    {sub.modalidade.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  {sub.arquivoUrl ? (
                    <button onClick={() => window.open(sub.arquivoUrl, '_blank')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} /> Baixar Arquivo do Trabalho
                    </button>
                  ) : (
                    <button className="btn btn-outline" disabled style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, cursor: 'not-allowed' }}>
                      <FileText size={16} /> Arquivo indisponível
                    </button>
                  )}
                </div>

                <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border-color)' }} />

                {myEvaluation ? (
                  <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#0f172a' }}>
                        <CheckCircle size={18} color="#10b981" /> Avaliação Realizada
                      </h4>
                      <div style={{ backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '50px', fontWeight: 'bold' }}>
                        Nota: {myEvaluation.nota}
                      </div>
                    </div>
                    {myEvaluation.comentario && (
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Seu Parecer:</strong>
                        <p style={{ margin: 0, color: 'var(--text-primary)', backgroundColor: 'white', padding: '1rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{myEvaluation.comentario}</p>
                      </div>
                    )}
                    <button onClick={() => {
                        setEvaluatingSubId(sub.id);
                        setEvaluationData({ nota: myEvaluation.nota, comentario: myEvaluation.comentario });
                      }} 
                      className="btn mt-4" style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', fontSize: '0.875rem' }}
                    >
                      Editar Avaliação
                    </button>
                  </div>
                ) : isEvaluating ? (
                  <form onSubmit={(e) => submitEvaluation(e, sub)} style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #16a34a' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Edit3 size={18} /> Dar Nota e Parecer</h4>
                    
                    <div className="form-group mb-4">
                      <label className="form-label">Nota Final (0 a 100)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={evaluationData.nota} 
                        onChange={e => setEvaluationData({...evaluationData, nota: e.target.value})} 
                        className="form-input" 
                        style={{ maxWidth: '150px' }}
                        required 
                      />
                      <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>Média de 80% entre os avaliadores aprovará o trabalho automaticamente.</small>
                    </div>

                    <div className="form-group mb-4">
                      <label className="form-label">Comentários da Comissão / Parecer (Aparecerá para o autor)</label>
                      <textarea 
                        value={evaluationData.comentario} 
                        onChange={e => setEvaluationData({...evaluationData, comentario: e.target.value})} 
                        className="form-input" 
                        rows="4"
                        placeholder="Escreva os pontos fortes, pontos de melhoria, ou observações..."
                      ></textarea>
                    </div>

                    <div className="flex gap-4">
                      <button type="button" onClick={() => setEvaluatingSubId(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancelar</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 2, backgroundColor: '#16a34a', border: 'none' }}>Salvar Avaliação</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ backgroundColor: '#fffbeb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <div className="flex justify-between items-center">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706' }}>
                        <AlertCircle size={20} />
                        <strong>Pendente de Avaliação</strong>
                      </div>
                      <button onClick={() => handleEvaluateClick(sub.id)} className="btn btn-primary" style={{ backgroundColor: '#d97706', border: 'none' }}>
                        Avaliar Agora
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
