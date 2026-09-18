import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ClientPortal } from './pages/ClientPortal';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { EventDetails } from './pages/EventDetails';
import { RegistrationForm } from './pages/RegistrationForm';
import { Login } from './pages/Login';
import { UserDashboard } from './pages/UserDashboard';
import { UserProfile } from './pages/UserProfile';

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

function App() {
  const [events, setEvents] = useState(DUMMY_EVENTS);
  const [submissions, setSubmissions] = useState([]);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Estado do perfil do usuário

  const handleAddEvent = (newEvent) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  const handleSubmitWork = (eventId, submissionData) => {
    setSubmissions(prev => [...prev, { id: Date.now().toString(), eventId, ...submissionData }]);
  };

  const handleUpdateSubmission = (subId, updates) => {
    setSubmissions(prev => prev.map(sub => sub.id === subId ? { ...sub, ...updates } : sub));
  };

  return (
    <Router>
      <div className="page-wrapper">
        <Navbar user={user} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ClientPortal events={events} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/perfil" element={<UserProfile user={user} userProfile={userProfile} setUserProfile={setUserProfile} />} />
            <Route path="/evento/:id" element={<EventDetails events={events} />} />
            <Route path="/evento/:id/inscricao" element={<RegistrationForm events={events} user={user} userProfile={userProfile} onSubmitWork={handleSubmitWork} />} />
            <Route path="/organizador" element={<OrganizerDashboard events={events} onAddEvent={handleAddEvent} submissions={submissions} onUpdateSubmission={handleUpdateSubmission} />} />
            <Route path="/painel-usuario" element={<UserDashboard submissions={submissions.filter(s => !user || s.usuario === user.displayName)} events={events} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
