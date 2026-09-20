import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

export function AIChat({ events }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Olá! Sou o Daniel, o assistente virtual da Semafis. Como posso ajudar você hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateAIResponse = (userText) => {
    const text = userText.toLowerCase();
    
    if (text.includes('data') || text.includes('quando') || text.includes('dia')) {
      if (events && events.length > 0) {
        return `O próximo evento é o "${events[0].title}" e vai acontecer no dia ${new Date(events[0].date).toLocaleDateString('pt-BR')}.`;
      }
      return "No momento não temos eventos agendados. Fique ligado para novidades!";
    }
    
    if (text.includes('local') || text.includes('onde')) {
      if (events && events.length > 0) {
        return `O evento "${events[0].title}" será realizado no local: ${events[0].location}.`;
      }
      return "O local dos próximos eventos ainda será definido.";
    }

    if (text.includes('certificado') || text.includes('horas')) {
      return "Os certificados são gerados automaticamente após o término do evento e o registro de presença pelo credenciamento.";
    }

    if (text.includes('submiss') || text.includes('trabalho') || text.includes('artigo')) {
      return "Para submeter um trabalho, você precisa estar inscrito no evento na modalidade 'Apresentador' ou similar e acessar a aba de submissão.";
    }

    if (text.includes('valor') || text.includes('preço') || text.includes('custo') || text.includes('pagar')) {
      if (events && events.length > 0 && events[0].packages) {
        const pkgs = events[0].packages.map(p => `${p.name} (R$ ${p.price})`).join(', ');
        return `Temos as seguintes opções de inscrição para o evento atual: ${pkgs}.`;
      }
      return "Os valores de inscrição dependem do evento. Verifique na página do evento escolhido.";
    }

    if (text.includes('monitor') || text.includes('avaliador') || text.includes('organiza')) {
      return "Os membros da equipe (Monitores, Avaliadores, Organização) possuem painéis específicos. Se você faz parte, faça login e acesse pelo menu!";
    }

    return "Desculpe, não entendi muito bem. Posso ajudar com informações sobre datas, locais, valores, certificados e submissões de trabalhos. O que você gostaria de saber?";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const botResponseText = generateAIResponse(input.trim());

    // Simula atraso na resposta (1.5s a 2.5s)
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: botResponseText }]);
    }, Math.random() * 1000 + 1500);
  };

  return (
    <>
      {!isOpen && (
        <button 
          className="floating-avatar"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#0f172a',
            color: 'white',
            border: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            cursor: 'pointer',
            padding: 0
          }}
        >
          <img src="/avatar.png" alt="Chat" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '15px', height: '15px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></div>
        </button>
      )}

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '350px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          {/* Header */}
          <div style={{ 
            backgroundColor: '#0f172a', 
            color: 'white', 
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src="/avatar.png" alt="IA Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Daniel - Assistente</h3>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span> Daniel | Online
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ 
                display: 'flex', 
                alignItems: 'flex-end', 
                gap: '0.5rem',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}>
                {msg.sender === 'ai' && (
                  <img src="/avatar.png" alt="IA" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                )}
                <div style={{ 
                  backgroundColor: msg.sender === 'user' ? '#3b82f6' : 'white',
                  color: msg.sender === 'user' ? 'white' : '#0f172a',
                  padding: '0.75rem 1rem',
                  borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  border: msg.sender === 'ai' ? '1px solid #e2e8f0' : 'none',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-start', maxWidth: '85%' }}>
                <img src="/avatar.png" alt="IA" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '16px 16px 16px 0',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: '4px'
                }}>
                  <span className="typing-dot"></span>
                  <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
                  <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Digite sua dúvida..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: input.trim() ? '#3b82f6' : '#e2e8f0',
                color: 'white',
                border: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s'
              }}
            >
              <Send size={16} style={{ marginLeft: '2px' }} />
            </button>
          </div>
        </div>
      )}
      <style>{`
        .typing-dot {
          width: 6px;
          height: 6px;
          background-color: #94a3b8;
          border-radius: 50%;
          animation: typing 1s infinite ease-in-out;
        }
        @keyframes typing {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .floating-avatar {
          animation: float 3s ease-in-out infinite;
          transition: transform 0.2s;
        }
        .floating-avatar:hover {
          transform: scale(1.1);
        }
      `}</style>
    </>
  );
}
