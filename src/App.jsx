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

function App() {
  const [events, setEvents] = useState(DUMMY_EVENTS);
  const [submissions, setSubmissions] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [avaliadores, setAvaliadores] = useState([]);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Estado do perfil do usuário

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddEvent = (newEvent) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  const handleSubmitWork = (eventId, submissionData) => {
    setSubmissions(prev => [...prev, { id: Date.now().toString(), eventId, ...submissionData }]);
  };

  const handleUpdateSubmission = (subId, updates) => {
    setSubmissions(prev => prev.map(sub => sub.id === subId ? { ...sub, ...updates } : sub));
  };

  const handleAddMonitor = (monitorData) => {
    setMonitors(prev => [...prev, { id: Date.now().toString(), ...monitorData }]);
  };

  const handleAddAvaliador = (avaliadorData) => {
    setAvaliadores(prev => [...prev, { id: Date.now().toString(), ...avaliadorData }]);
  };

  return (
    <Router>
      <div className="page-wrapper">
        <Navbar user={user} monitors={monitors} avaliadores={avaliadores} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ClientPortal events={events} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/perfil" element={<UserProfile user={user} userProfile={userProfile} setUserProfile={setUserProfile} />} />
            <Route path="/evento/:id" element={<EventDetails events={events} />} />
            <Route path="/evento/:id/inscricao" element={<RegistrationForm events={events} user={user} userProfile={userProfile} onSubmitWork={handleSubmitWork} monitors={monitors} />} />
            <Route path="/organizador" element={<OrganizerDashboard events={events} onAddEvent={handleAddEvent} submissions={submissions} onUpdateSubmission={handleUpdateSubmission} monitors={monitors} onAddMonitor={handleAddMonitor} avaliadores={avaliadores} onAddAvaliador={handleAddAvaliador} />} />
            <Route path="/painel-usuario" element={<UserDashboard submissions={submissions.filter(s => !user || s.usuario === user.displayName)} events={events} />} />
            <Route path="/painel-monitor" element={<MonitorDashboard user={user} monitors={monitors} submissions={submissions} avaliadores={avaliadores} events={events} />} />
            <Route path="/painel-avaliador" element={<EvaluatorDashboard user={user} avaliadores={avaliadores} submissions={submissions} events={events} onUpdateSubmission={handleUpdateSubmission} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
