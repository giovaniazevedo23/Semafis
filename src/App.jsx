import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ClientPortal } from './pages/ClientPortal';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { EventDetails } from './pages/EventDetails';
import { RegistrationForm } from './pages/RegistrationForm';
import { Login } from './pages/Login';
import { UserDashboard } from './pages/UserDashboard';
import { UserProfile } from './pages/UserProfile';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const DUMMY_EVENTS = [
  {
    id: '1',
    title: 'Simpósio Nacional de Tecnologia 2026',
    date: '2026-11-15',
    location: 'Centro de Convenções, São Paulo',
    priceWithSubmission: '150.00',
    priceWithoutSubmission: '50.00',
    schedule: '08:00 - Credenciamento\n09:30 - Palestra de Abertura\n13:00 - Apresentação de Artigos\n17:00 - Encerramento',
    description: 'Junte-se aos pesquisadores e líderes da indústria para explorar o futuro da inteligência artificial.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    logoUrl: '',
    packages: [
      { id: '1', name: 'Ouvinte', price: '50.00', description: 'Acesso a todas as palestras\nCertificado de 40h', requireSubmission: false, highlight: false },
      { id: '2', name: 'Apresentador', price: '100.00', description: 'Acesso completo\nApresentação de trabalho\nCertificado de Apresentador', requireSubmission: true, highlight: true },
      { id: '3', name: 'VIP', price: '150.00', description: 'Acesso a minicursos\nKit do Evento\nLugar reservado', requireSubmission: false, highlight: false }
    ],
    activities: [
      { name: 'Minicurso de React Avançado', minister: 'João Silva', time: '14:00 - 16:00', room: 'Sala 101' },
      { name: 'Oficina de Design Systems', minister: 'Maria Santos', time: '16:00 - 18:00', room: 'Laboratório 2' }
    ]
  }
];

import { MonitorDashboard } from './pages/MonitorDashboard';
import { EvaluatorDashboard } from './pages/EvaluatorDashboard';
import { ValidarCredencial } from './pages/ValidarCredencial';
import { listenCollection, listenDocument, addDocument, setDocument, updateDocument } from './services/db';
import { AIChat } from './components/AIChat';

function App() {
  const [events, setEvents] = useState(DUMMY_EVENTS);
  const [submissions, setSubmissions] = useState([]);
  const [ingressos, setIngressos] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [avaliadores, setAvaliadores] = useState([]);
  const [monitorApplications, setMonitorApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [news, setNews] = useState([]);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubEvents = listenCollection('events', (data) => {
      if (data && data.length > 0) setEvents(data);
    });
    const unsubSubmissions = listenCollection('submissions', setSubmissions);
    const unsubIngressos = listenCollection('ingressos', setIngressos);
    const unsubMonitors = listenCollection('monitors', setMonitors);
    const unsubAvaliadores = listenCollection('avaliadores', setAvaliadores);
    const unsubMonitorApplications = listenCollection('monitorApplications', setMonitorApplications);
    const unsubNotifications = listenCollection('notifications', setNotifications);
    const unsubNews = listenCollection('news', setNews);

    return () => {
      unsubEvents();
      unsubSubmissions();
      unsubIngressos();
      unsubMonitors();
      unsubAvaliadores();
      unsubMonitorApplications();
      unsubNotifications();
      unsubNews();
    };
  }, []);

  useEffect(() => {
    let unsubProfile = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        });
        unsubProfile = listenDocument('userProfiles', currentUser.email, (data) => {
          if (data) {
            setUserProfile(data);
          } else {
            const local = JSON.parse(localStorage.getItem('fallback_profiles') || '{}');
            if (local[currentUser.email]) setUserProfile(local[currentUser.email]);
            else setUserProfile(null);
          }
        });
      } else {
        setUser(null);
        setUserProfile(null);
        if (unsubProfile) unsubProfile();
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const handleAddEvent = async (newEvent) => {
    await addDocument('events', newEvent);
  };

  const handleUpdateEvent = async (eventId, updates) => {
    await updateDocument('events', eventId, updates);
  };

  const handleSubmitWork = async (eventId, submissionData) => {
    const subId = 'SUB-' + Date.now().toString().slice(-6);
    
    const cleanData = Object.fromEntries(
      Object.entries(submissionData).map(([k, v]) => [k, v === undefined ? '' : v])
    );
    
    const workFinal = { id: subId, eventId, ...cleanData };

    try {
      await setDocument('submissions', subId, workFinal);
      console.log('Trabalho salvo com sucesso no Firestore');
    } catch (e) {
      console.error('Falha ao salvar trabalho no Firestore. Usando plano B (Armazenamento Local)', e);
      
      const localSubmissions = JSON.parse(localStorage.getItem('fallback_submissions') || '[]');
      localSubmissions.push(workFinal);
      localStorage.setItem('fallback_submissions', JSON.stringify(localSubmissions));
      
      setSubmissions(prev => [...prev, workFinal]);
      
      alert('Aviso: O seu trabalho foi salvo localmente porque o servidor recusou a conexão. Ele já está visível para você.');
    }
  };

  const handleUpdateSubmission = async (subId, updates) => {
    try {
      await updateDocument('submissions', subId, updates);
    } catch (e) {
      console.error('Falha ao atualizar no Firestore, atualizando localmente', e);
    }
    
    // Sempre atualiza o estado local para garantir que a UI reflita a mudança
    setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, ...updates } : s));
    
    // Atualiza o fallback
    const local = JSON.parse(localStorage.getItem('fallback_submissions') || '[]');
    const index = local.findIndex(s => s.id === subId);
    if (index >= 0) {
      local[index] = { ...local[index], ...updates };
      localStorage.setItem('fallback_submissions', JSON.stringify(local));
    }
  };

  const handleAddMonitor = async (monitorData) => {
    await addDocument('monitors', monitorData);
  };

  const handleUpdateMonitor = async (monitorId, updates) => {
    await updateDocument('monitors', monitorId, updates);
  };

  const handleAddAvaliador = async (avaliadorData) => {
    await addDocument('avaliadores', avaliadorData);
  };

  const handleAddMonitorApplication = async (appData) => {
    const id = 'MAPP-' + Date.now().toString().slice(-6);
    const finalData = { id, timestamp: new Date().toISOString(), ...appData };
    try {
      await setDocument('monitorApplications', id, finalData);
    } catch (e) {
      console.error('Falha ao salvar candidatura no Firestore.', e);
      const localApps = JSON.parse(localStorage.getItem('fallback_monitor_apps') || '[]');
      localApps.push(finalData);
      localStorage.setItem('fallback_monitor_apps', JSON.stringify(localApps));
      setMonitorApplications(prev => [finalData, ...prev]);
    }
  };

  const handleUpdateMonitorApplication = async (appId, updates) => {
    try {
      await updateDocument('monitorApplications', appId, updates);
    } catch (e) {
      console.error('Falha ao atualizar candidatura no Firestore.', e);
    }
    setMonitorApplications(prev => prev.map(a => a.id === appId ? { ...a, ...updates } : a));
    const local = JSON.parse(localStorage.getItem('fallback_monitor_apps') || '[]');
    const index = local.findIndex(a => a.id === appId);
    if (index >= 0) {
      local[index] = { ...local[index], ...updates };
      localStorage.setItem('fallback_monitor_apps', JSON.stringify(local));
    }
  };

  const handleAddNews = async (newsData) => {
    const id = 'NEWS-' + Date.now().toString().slice(-6);
    const finalData = { id, timestamp: new Date().toISOString(), ...newsData };
    try {
      await setDocument('news', id, finalData);
    } catch (e) {
      console.error('Falha ao salvar notícia no Firestore.', e);
      const localNews = JSON.parse(localStorage.getItem('fallback_news') || '[]');
      localNews.push(finalData);
      localStorage.setItem('fallback_news', JSON.stringify(localNews));
      setNews(prev => [finalData, ...prev]);
    }
  };

  const handleSendNotification = async (notificationData) => {
    const id = 'NOTIF-' + Date.now().toString().slice(-6);
    const cleanData = Object.fromEntries(
      Object.entries(notificationData).map(([k, v]) => [k, v === undefined ? '' : v])
    );
    const notifFinal = { id, timestamp: new Date().toISOString(), ...cleanData };

    // Disparar o e-mail real via EmailJS (não bloqueia o fluxo principal)
    if (notifFinal.userEmail) {
      import('./services/email.js').then(({ sendEmailNotification }) => {
        sendEmailNotification(
          notifFinal.userEmail, 
          notifFinal.userEmail.split('@')[0], // Nome provisório
          notifFinal.title, 
          notifFinal.content
        );
      });
    }

    try {
      await setDocument('notifications', id, notifFinal);
    } catch (e) {
      console.error('Falha ao salvar notificacao no Firestore. Usando plano B', e);
      const localNotif = JSON.parse(localStorage.getItem('fallback_notifications') || '[]');
      localNotif.push(notifFinal);
      localStorage.setItem('fallback_notifications', JSON.stringify(localNotif));
      setNotifications(prev => [...prev, notifFinal]);
    }
  };

  const handleMarkNotificationRead = async (notifId, userEmail) => {
    try {
      const notif = notifications.find(n => n.id === notifId);
      if (!notif) return;
      const readBy = notif.readBy || [];
      if (!readBy.includes(userEmail)) {
        await updateDocument('notifications', notifId, { readBy: [...readBy, userEmail] });
      }
    } catch (e) {
      console.error("Local fallback for mark read", e);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, readBy: [...(n.readBy||[]), userEmail] } : n));
    }
  };

  const handleMarkNotificationUnread = async (notifId, userEmail) => {
    try {
      const notif = notifications.find(n => n.id === notifId);
      if (!notif) return;
      const readBy = notif.readBy || [];
      await updateDocument('notifications', notifId, { readBy: readBy.filter(e => e !== userEmail) });
    } catch (e) {
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, readBy: (n.readBy||[]).filter(e => e !== userEmail) } : n));
    }
  };

  const handleRegister = async (ingressoData) => {
    const id = 'ING-' + Date.now().toString().slice(-6);
    
    const cleanData = Object.fromEntries(
      Object.entries(ingressoData).map(([k, v]) => [k, v === undefined ? '' : v])
    );
    
    const ticketFinal = { id, timestamp: new Date().toISOString(), ...cleanData };

    try {
      await setDocument('ingressos', id, ticketFinal);
      console.log('Ingresso salvo com sucesso no Firestore');
    } catch (e) {
      console.error('Falha ao salvar ingresso no Firestore. Usando plano B (Armazenamento Local)', e);
      
      const localIngressos = JSON.parse(localStorage.getItem('fallback_ingressos') || '[]');
      localIngressos.push(ticketFinal);
      localStorage.setItem('fallback_ingressos', JSON.stringify(localIngressos));
      
      setIngressos(prev => [...prev, ticketFinal]);
      
      alert('Aviso: O seu ingresso foi salvo localmente porque o servidor recusou a conexão (permissões de segurança do banco de dados). Ele já está disponível nos seus ingressos!');
    }
  };

  const handleUpdateIngresso = async (id, updates) => {
    try {
      await updateDocument('ingressos', id, updates);
    } catch (e) {
      console.error('Falha ao atualizar no Firestore, atualizando localmente', e);
    }
    
    setIngressos(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    
    const local = JSON.parse(localStorage.getItem('fallback_ingressos') || '[]');
    const index = local.findIndex(i => i.id === id);
    if (index >= 0) {
      local[index] = { ...local[index], ...updates };
      localStorage.setItem('fallback_ingressos', JSON.stringify(local));
    }
  };

  const allIngressos = [
    ...ingressos, 
    ...JSON.parse(localStorage.getItem('fallback_ingressos') || '[]').filter(local => !ingressos.find(fb => fb.id === local.id))
  ];

  const allSubmissions = [
    ...submissions,
    ...JSON.parse(localStorage.getItem('fallback_submissions') || '[]').filter(local => !submissions.find(fb => fb.id === local.id))
  ];

  const allNews = [
    ...news,
    ...JSON.parse(localStorage.getItem('fallback_news') || '[]').filter(local => !news.find(fb => fb.id === local.id))
  ].sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));

  const allMonitorApplications = [
    ...monitorApplications,
    ...JSON.parse(localStorage.getItem('fallback_monitor_apps') || '[]').filter(local => !monitorApplications.find(fb => fb.id === local.id))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Router>
      <div className="page-wrapper">
        <Navbar 
          user={user} 
          userProfile={userProfile} 
          monitors={monitors} 
          avaliadores={avaliadores} 
          events={events} 
          notifications={notifications.filter(n => (user && n.userEmail === user.email) || !n.userEmail)}
          onMarkRead={handleMarkNotificationRead}
          onMarkUnread={handleMarkNotificationUnread}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ClientPortal events={events} news={allNews} user={user} notifications={notifications.filter(n => (user && n.userEmail === user.email) || !n.userEmail)} onMarkRead={handleMarkNotificationRead} onMarkUnread={handleMarkNotificationUnread} />} />
            <Route path="/login" element={<Login setUser={setUser} monitors={monitors} avaliadores={avaliadores} />} />
            <Route path="/perfil" element={<UserProfile user={user} userProfile={userProfile} setUserProfile={setUserProfile} />} />
            <Route path="/evento/:id" element={<EventDetails events={events} />} />
            <Route path="/evento/:id/inscricao" element={<RegistrationForm events={events} user={user} userProfile={userProfile} onSubmitWork={handleSubmitWork} onRegister={handleRegister} monitors={monitors} />} />
            <Route path="/organizador" element={<OrganizerDashboard events={events} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} submissions={allSubmissions} onUpdateSubmission={handleUpdateSubmission} monitors={monitors} onAddMonitor={handleAddMonitor} onUpdateMonitor={handleUpdateMonitor} avaliadores={avaliadores} onAddAvaliador={handleAddAvaliador} ingressos={allIngressos} onUpdateIngresso={handleUpdateIngresso} news={allNews} onAddNews={handleAddNews} monitorApplications={allMonitorApplications} onUpdateMonitorApplication={handleUpdateMonitorApplication} />} />
            <Route path="/painel-usuario" element={<UserDashboard submissions={allSubmissions.filter(s => user && s.userEmail === user.email)} ingressos={allIngressos.filter(i => user && i.userEmail === user.email)} events={events} user={user} onSubmitWork={handleSubmitWork} onUpdateSubmission={handleUpdateSubmission} notifications={notifications.filter(n => user && n.userEmail === user.email)} onUpdateIngresso={handleUpdateIngresso} monitorApplications={allMonitorApplications.filter(m => user && m.userEmail === user.email)} onAddMonitorApplication={handleAddMonitorApplication} />} />
            <Route path="/painel-monitor" element={<MonitorDashboard user={user} monitors={monitors} submissions={allSubmissions} avaliadores={avaliadores} events={events} ingressos={allIngressos} onUpdateIngresso={handleUpdateIngresso} />} />
            <Route path="/painel-avaliador" element={<EvaluatorDashboard user={user} avaliadores={avaliadores} submissions={allSubmissions} events={events} onUpdateSubmission={handleUpdateSubmission} onSendNotification={handleSendNotification} />} />
            <Route path="/validar" element={<ValidarCredencial />} />
          </Routes>
        </main>
        <footer style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '2rem', textAlign: 'center', marginTop: 'auto', borderTop: '1px solid #e2e8f0' }}>
          <div className="container">
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '1.1rem' }}>© 2026 Todos os direitos reservados da SEMAFIS.</p>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569' }}>Semana da Matemática e da Física do Instituto Federal - Ministério da Educação / Governo Federal</p>
          </div>
        </footer>
        <AIChat events={events} />
      </div>
    </Router>
  );
}

export default App;
