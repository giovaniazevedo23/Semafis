import { useState } from 'react';
import { Calendar, MapPin, Type, Image as ImageIcon, FileText, DollarSign, Clock, PlusCircle, Trash2 } from 'lucide-react';

export function EventForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    priceWithSubmission: '',
    priceWithoutSubmission: '',
    schedule: '',
    imageUrl: '',
    logoUrl: '',
    activities: [] // { name, minister, time, room }
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
      activities: [...prev.activities, { name: '', minister: '', time: '', room: '' }]
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
    setFormData({ title: '', date: '', location: '', description: '', priceWithSubmission: '', priceWithoutSubmission: '', schedule: '', imageUrl: '', logoUrl: '', activities: [] });
    setImagePreview(null);
    setLogoPreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Criar Novo Evento Acadêmico</h2>
      
      <div className="form-group">
        <label className="form-label">
          <div className="flex items-center gap-2 mb-2">
            <Type size={16} /> Título do Evento
          </div>
        </label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input" placeholder="Ex: Simpósio Nacional 2026" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2"><Calendar size={16} /> Data Principal</div>
          </label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-input" required />
        </div>

        <div className="form-group">
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2"><MapPin size={16} /> Local Principal</div>
          </label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} className="form-input" placeholder="Ex: Universidade Federal" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2"><DollarSign size={16} /> Inscrição COM Submissão (R$)</div>
          </label>
          <input type="number" name="priceWithSubmission" value={formData.priceWithSubmission} onChange={handleChange} className="form-input" placeholder="Ex: 100.00" step="0.01" min="0" />
        </div>

        <div className="form-group">
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2"><DollarSign size={16} /> Inscrição SEM Submissão (R$)</div>
          </label>
          <input type="number" name="priceWithoutSubmission" value={formData.priceWithoutSubmission} onChange={handleChange} className="form-input" placeholder="Ex: 50.00" step="0.01" min="0" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2"><ImageIcon size={16} /> Imagem de Capa</div>
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
            <div className="flex items-center gap-2 mb-2"><ImageIcon size={16} /> Logo do Evento (Usada no Ingresso)</div>
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
          <div className="flex items-center gap-2 mb-2"><Clock size={16} /> Cronograma Geral (Visual)</div>
        </label>
        <textarea name="schedule" value={formData.schedule} onChange={handleChange} className="form-input" rows="3" placeholder="Ex:&#10;08:00 - Credenciamento&#10;09:00 - Abertura"></textarea>
      </div>

      {/* Gerenciador de Minicursos/Atividades */}
      <div className="form-group" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          <label className="form-label" style={{ margin: 0 }}>
            Minicursos, Oficinas e Palestras Extras
          </label>
          <button type="button" onClick={addActivity} className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
            <PlusCircle size={16} /> Adicionar Atividade
          </button>
        </div>
        
        {formData.activities.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nenhuma atividade extra cadastrada.</p>
        )}

        {formData.activities.map((act, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid var(--border-color)', position: 'relative' }}>
            <button type="button" onClick={() => removeActivity(index)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
              <Trash2 size={16} />
            </button>
            <input type="text" placeholder="Nome da Atividade" value={act.name} onChange={(e) => updateActivity(index, 'name', e.target.value)} className="form-input" />
            <input type="text" placeholder="Ministrante" value={act.minister} onChange={(e) => updateActivity(index, 'minister', e.target.value)} className="form-input" />
            <input type="text" placeholder="Horário (Ex: 14:00 - 16:00)" value={act.time} onChange={(e) => updateActivity(index, 'time', e.target.value)} className="form-input" />
            <input type="text" placeholder="Sala / Local" value={act.room} onChange={(e) => updateActivity(index, 'room', e.target.value)} className="form-input" />
          </div>
        ))}
      </div>

      <div className="form-group">
        <label className="form-label">
          <div className="flex items-center gap-2 mb-2"><FileText size={16} /> Descrição Longa</div>
        </label>
        <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" rows="4" required></textarea>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>Publicar Evento</button>
    </form>
  );
}
