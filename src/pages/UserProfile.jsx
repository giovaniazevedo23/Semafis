import { useState, useEffect } from 'react';
import { User, Mail, CreditCard, GraduationCap, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UserProfile({ user, userProfile, setUserProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    nomeSocial: '',
    cpf: '',
    matricula: '',
    curso: '',
    genero: ''
  });

  // Carrega os dados quando entra na tela
  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
    } else if (user) {
      setFormData(prev => ({ ...prev, nome: user.displayName || '' }));
    }
  }, [userProfile, user]);

  if (!user) {
    return (
      <div className="container text-center" style={{ paddingTop: '5rem' }}>
        <h2>Você precisa estar logado para acessar seu perfil.</h2>
        <Link to="/login" className="btn btn-primary mt-4" style={{ textDecoration: 'none' }}>Fazer Login</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setUserProfile(formData);
    setIsEditing(false);
    alert('Perfil atualizado com sucesso!');
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Meu Perfil</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Gerencie suas informações pessoais e dados acadêmicos.</p>

      <div className="card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div className="flex items-center gap-4 mb-8" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
            {formData.nome ? formData.nome.charAt(0).toUpperCase() : <User size={40} />}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{formData.nomeSocial || formData.nome || 'Usuário'}</h2>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Mail size={16} /> {user.email}
            </div>
          </div>
        </div>

        {!isEditing ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-8">
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block' }}>Nome Completo:</span>
                <strong style={{ fontSize: '1.1rem' }}>{formData.nome || '-'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block' }}>Nome Social:</span>
                <strong style={{ fontSize: '1.1rem' }}>{formData.nomeSocial || '-'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block' }}>CPF / Passaporte:</span>
                <strong style={{ fontSize: '1.1rem' }}>{formData.cpf || '-'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block' }}>Gênero:</span>
                <strong style={{ fontSize: '1.1rem' }}>{formData.genero || '-'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block' }}>Matrícula:</span>
                <strong style={{ fontSize: '1.1rem' }}>{formData.matricula || '-'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block' }}>Titulação / Curso:</span>
                <strong style={{ fontSize: '1.1rem' }}>{formData.curso || '-'}</strong>
              </div>
            </div>
            <button onClick={() => setIsEditing(true)} className="btn btn-outline" style={{ width: '100%' }}>Editar Perfil</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Nome Social</label>
              <input type="text" name="nomeSocial" value={formData.nomeSocial} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">CPF / Passaporte</label>
              <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Gênero</label>
              <select name="genero" value={formData.genero} onChange={handleChange} className="form-input">
                <option value="">Selecione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Não-binário">Não-binário</option>
                <option value="Prefiro não responder">Prefiro não responder</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Matrícula</label>
              <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Titulação / Curso</label>
              <input type="text" name="curso" value={formData.curso} onChange={handleChange} className="form-input" />
            </div>
            
            <div className="flex gap-4 md:col-span-2 mt-4">
              <button onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={handleSave} className="btn btn-primary" style={{ flex: 2 }}>Salvar Alterações</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
