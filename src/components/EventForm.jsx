import { useState } from 'react';
import { Calendar, MapPin, Type, Image as ImageIcon, FileText, DollarSign, Clock, PlusCircle, Trash2, CalendarClock } from 'lucide-react';

export function EventForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    priceWithSubmission: '',
    priceWithoutSubmission: '',
    dataInicioInscricao: '',
    dataFimInscricao: '',
    schedule: '',
    imageUrl: '',
    logoUrl: '',
    activities: [] // { type, name, minister, startTime, endTime, room }
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'cover') {
        setFormData(prev => ({ ...prev, imageUrl: url }));
        setImagePreview(url);
      } else {
        setFormData(prev => ({ ...prev, logoUrl: url }));
        setLogoPreview(url);
      }
    }
  };

  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, { type: 'Palestra', name: '', minister: '', startTime: '', endTime: '', room: '' }]
    }));
  };

  const updateActivity = (index, field, value) => {
    const newActivities = [...formData.activities];
    newActivities[index][field] = value;
    setFormData(prev => ({ ...prev, activities: newActivities }));
  };

  const removeActivity = (index) => {
    const newActivities = formData.activities.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, activities: newActivities }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, id: Date.now().toString() });
    setFormData({ title: '', date: '', location: '', description: '', priceWithSubmission: '', priceWithoutSubmission: '', dataInicioInscricao: '', dataFimInscricao: '', schedule: '', imageUrl: '', logoUrl: '', activities: [] });
    setImagePreview(null);
    setLogoPreview(null);
    alert('Evento criado com sucesso!');
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Criar Novo Evento Acadêmico</h2>
      
      <div className="form-group">
        <label className="form-label">
          <div className="flex items-center gap-2 mb-2">
            Título do Evento
          </div>
        </label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input" placeholder="Ex: Simpósio Nacional 2026" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2">Data Principal (Início do Evento)</div>
          </label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-input" required />
        </div>

        <div className="form-group">
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2">Local Principal</div>
          </label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} className="form-input" placeholder="Ex: Universidade Federal" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ backgroundColor: '#fdf4ff', padding: '1rem', borderRadius: '8px', border: '1px solid #f5d0fe', marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2" style={{ color: '#86198f' }}>Início das Inscrições</div>
          </label>
          <input type="date" name="dataInicioInscricao" value={formData.dataInicioInscricao} onChange={handleChange} className="form-input" required />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2" style={{ color: '#86198f' }}>Término das Inscrições</div>
          </label>
          <input type="date" name="dataFimInscricao" value={formData.dataFimInscricao} onChange={handleChange} className="form-input" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2">Inscrição COM Submissão (R$)</div>
          </label>
          <input type="number" name="priceWithSubmission" value={formData.priceWithSubmission} onChange={handleChange} className="form-input" placeholder="Ex: 100.00" step="0.01" min="0" />
        </div>

        <div className="form-group">
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2">Inscrição SEM Submissão (R$)</div>
          </label>
          <input type="number" name="priceWithoutSubmission" value={formData.priceWithoutSubmission} onChange={handleChange} className="form-input" placeholder="Ex: 50.00" step="0.01" min="0" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2">Imagem de Capa</div>
          </label>
          <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} className="form-input" style={{ padding: '0.5rem 1rem' }} />
          {imagePreview && (
            <div style={{ marginTop: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '100px' }}>
              <img src={imagePreview} alt="Capa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2">Logo do Evento (Usada no Ingresso)</div>
          </label>
          <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'logo')} className="form-input" style={{ padding: '0.5rem 1rem' }} />
          {logoPreview && (
            <div style={{ marginTop: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
              <img src={logoPreview} alt="Logo" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <div className="flex items-center gap-2 mb-2">Cronograma Geral (Visual)</div>
        </label>
        <textarea name="schedule" value={formData.schedule} onChange={handleChange} className="form-input" rows="3" placeholder="Ex:&#10;08:00 - Credenciamento&#10;09:00 - Abertura"></textarea>
      </div>

      {/* Gerenciador de Minicursos/Atividades */}
      <div className="form-group" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          <label className="form-label" style={{ margin: 0 }}>
            Atividades Extras (Minicursos, Oficinas, Palestras)
          </label>
          <button type="button" onClick={addActivity} className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
            <PlusCircle size={16} /> Adicionar Atividade
          </button>
        </div>
        
        {formData.activities.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nenhuma atividade extra cadastrada.</p>
        )}

        {formData.activities.map((act, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #cbd5e1', position: 'relative' }}>
            <button type="button" onClick={() => removeActivity(index)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
              <Trash2 size={16} />
            </button>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Tipo de Atividade</label>
              <select value={act.type || 'Palestra'} onChange={(e) => updateActivity(index, 'type', e.target.value)} className="form-input">
                <option value="Palestra">Palestra</option>
                <option value="Minicurso">Minicurso</option>
                <option value="Oficina">Oficina</option>
                <option value="Mesa Redonda">Mesa Redonda</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Título</label>
              <input type="text" placeholder="Ex: Introdução ao React" value={act.name} onChange={(e) => updateActivity(index, 'name', e.target.value)} className="form-input" />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Ministrante</label>
              <input type="text" placeholder="Nome do Professor/Especialista" value={act.minister} onChange={(e) => updateActivity(index, 'minister', e.target.value)} className="form-input" />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Local / Sala</label>
              <input type="text" placeholder="Ex: Laboratório 1" value={act.room} onChange={(e) => updateActivity(index, 'room', e.target.value)} className="form-input" />
            </div>

            <div className="grid grid-cols-2 gap-2" style={{ gridColumn: '1 / -1' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Horário Inicial</label>
                <input type="time" value={act.startTime || ''} onChange={(e) => updateActivity(index, 'startTime', e.target.value)} className="form-input" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Horário Final</label>
                <input type="time" value={act.endTime || ''} onChange={(e) => updateActivity(index, 'endTime', e.target.value)} className="form-input" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="form-group">
        <label className="form-label">
          <div className="flex items-center gap-2 mb-2">Descrição Longa</div>
        </label>
        <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" rows="4" required></textarea>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>Publicar Evento</button>
    </form>
  );
}
