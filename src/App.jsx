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

function App() {
  const [events, setEvents] = useState(DUMMY_EVENTS);
  const [submissions, setSubmissions] = useState([]);
  const [ingressos, setIngressos] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [avaliadores, setAvaliadores] = useState([]);
  const [notifications, setNotifications] = useState([]);
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
    const unsubNotifications = listenCollection('notifications', setNotifications);

    return () => {
      unsubEvents();
      unsubSubmissions();
      unsubIngressos();
      unsubMonitors();
      unsubAvaliadores();
      unsubNotifications();
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
        unsubProfile = listenDocument('userProfiles', currentUser.email, setUserProfile);
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
    await updateDocument('submissions', subId, updates);
  };

  const handleAddMonitor = async (monitorData) => {
    await addDocument('monitors', monitorData);
  };

  const handleAddAvaliador = async (avaliadorData) => {
    await addDocument('avaliadores', avaliadorData);
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
    await updateDocument('ingressos', id, updates);
  };

  const allIngressos = [
    ...ingressos, 
    ...JSON.parse(localStorage.getItem('fallback_ingressos') || '[]').filter(local => !ingressos.find(fb => fb.id === local.id))
  ];

  const allSubmissions = [
    ...submissions,
    ...JSON.parse(localStorage.getItem('fallback_submissions') || '[]').filter(local => !submissions.find(fb => fb.id === local.id))
  ];

  return (
    <Router>
      <div className="page-wrapper">
        <Navbar user={user} userProfile={userProfile} monitors={monitors} avaliadores={avaliadores} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ClientPortal events={events} />} />
            <Route path="/login" element={<Login setUser={setUser} monitors={monitors} avaliadores={avaliadores} />} />
            <Route path="/perfil" element={<UserProfile user={user} userProfile={userProfile} setUserProfile={setUserProfile} />} />
            <Route path="/evento/:id" element={<EventDetails events={events} />} />
            <Route path="/evento/:id/inscricao" element={<RegistrationForm events={events} user={user} userProfile={userProfile} onSubmitWork={handleSubmitWork} onRegister={handleRegister} monitors={monitors} />} />
            <Route path="/organizador" element={<OrganizerDashboard events={events} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} submissions={allSubmissions} onUpdateSubmission={handleUpdateSubmission} monitors={monitors} onAddMonitor={handleAddMonitor} avaliadores={avaliadores} onAddAvaliador={handleAddAvaliador} ingressos={allIngressos} onUpdateIngresso={handleUpdateIngresso} />} />
            <Route path="/painel-usuario" element={<UserDashboard submissions={allSubmissions.filter(s => !user || s.userEmail === user.email)} ingressos={allIngressos.filter(i => !user || i.userEmail === user.email)} events={events} user={user} onSubmitWork={handleSubmitWork} onUpdateSubmission={handleUpdateSubmission} notifications={notifications.filter(n => !user || n.userEmail === user.email)} />} />
            <Route path="/painel-monitor" element={<MonitorDashboard user={user} monitors={monitors} submissions={submissions} avaliadores={avaliadores} events={events} ingressos={ingressos} />} />
            <Route path="/painel-avaliador" element={<EvaluatorDashboard user={user} avaliadores={avaliadores} submissions={submissions} events={events} onUpdateSubmission={handleUpdateSubmission} onSendNotification={handleSendNotification} />} />
            <Route path="/validar" element={<ValidarCredencial />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
