import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Smartphone,
  Upload,
  Link2,
  Trash2,
  Edit3,
  Star,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { uploadFile, uploadFileWithProgress } from '../services/db';

const DEFAULT_INSTALL_STEPS = [
  'Clique em "Baixar" no seu celular Android (ou escaneie o QR Code pelo celular).',
  'Aguarde a conclusão do download do arquivo.',
  'Toque no arquivo baixado na barra de notificações ou no gerenciador de arquivos.',
  'Se solicitado, ative "Instalar apps desconhecidos" para o navegador.',
  'Toque em "Instalar" e aproveite o aplicativo!',
].join('\n');

const DEFAULT_REQUIREMENTS = [
  'Android 9.0 ou superior',
  'Permitir instalação de fontes desconhecidas no Android',
].join('\n');

const EMPTY_FORM = {
  id: '',
  name: '',
  subtitle: '',
  category: 'Física & Matemática',
  status: 'available',
  featured: false,
  version: '1.0.0',
  packageName: '',
  platform: 'Android (APK)',
  architecture: 'ARM64 (arm64-v8a)',
  engine: 'Unity',
  size: '',
  releaseYear: new Date().getFullYear().toString(),
  icon: '',
  downloadUrl: '',
  fileName: '',
  description: '',
  highlightsText: '',
  requirementsText: DEFAULT_REQUIREMENTS,
  installStepsText: DEFAULT_INSTALL_STEPS,
  tagsText: 'Android, SEMAFIS',
};

function formatFileSize(bytes) {
  if (!bytes || Number.isNaN(bytes)) return '';
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2).replace('.', ',')} GB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

function normalizeDownloadUrl(rawUrl) {
  const url = (rawUrl || '').trim();
  if (!url) return '';

  // Converte link de visualização do Google Drive em link de download direto
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (driveFileMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveFileMatch[1]}`;
  }
  const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/i);
  if (driveOpenMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveOpenMatch[1]}`;
  }

  return url;
}

function compressIconToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(reader.result);
      img.onload = () => {
        const maxSize = 256;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png', 0.9));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function OrganizerAppsManager({ apps = [], onSaveApp, onDeleteApp, onBack }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [sourceMode, setSourceMode] = useState('upload'); // 'upload' | 'url'
  const [appFile, setAppFile] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setAppFile(null);
    setIconFile(null);
    setUploadProgress(0);
    setSourceMode('upload');
  };

  const handleEditApp = (app) => {
    setEditingId(app.id);
    setForm({
      id: app.id,
      name: app.name || '',
      subtitle: app.subtitle || '',
      category: app.category || 'Física & Matemática',
      status: app.status || 'available',
      featured: Boolean(app.featured),
      version: app.version || '1.0.0',
      packageName: app.packageName || '',
      platform: app.platform || 'Android (APK)',
      architecture: app.architecture || '',
      engine: app.engine || '',
      size: app.size || '',
      releaseYear: app.releaseYear || new Date().getFullYear().toString(),
      icon: app.icon || '',
      downloadUrl: app.downloadUrl || '',
      fileName: app.fileName || '',
      description: app.description || '',
      highlightsText: (app.highlights || []).join('\n'),
      requirementsText: (app.requirements || []).join('\n'),
      installStepsText: (app.installSteps || []).join('\n'),
      tagsText: (app.tags || []).join(', '),
    });
    setSourceMode('url');
    setAppFile(null);
    setIconFile(null);
    setStatusMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAppFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAppFile(file);
    if (file) {
      setForm((prev) => ({
        ...prev,
        fileName: file.name,
        size: formatFileSize(file.size),
        name: prev.name || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!form.name.trim()) {
      setStatusMessage({ type: 'error', text: 'Informe o nome do aplicativo.' });
      return;
    }

    if (form.status !== 'coming-soon' && !appFile && !form.downloadUrl.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Envie o arquivo do aplicativo (.apk, .zip, etc.) ou informe uma URL de download.',
      });
      return;
    }

    setIsSaving(true);
    setUploadProgress(0);

    try {
      let finalDownloadUrl = normalizeDownloadUrl(form.downloadUrl);
      let finalFileName = form.fileName.trim();
      let finalSize = form.size.trim();

      if (appFile) {
        const safeName = appFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `apps/${Date.now()}_${safeName}`;
        try {
          finalDownloadUrl = await uploadFileWithProgress(storagePath, appFile, (pct) => {
            setUploadProgress(pct);
          });
          finalFileName = appFile.name;
          if (!finalSize) finalSize = formatFileSize(appFile.size);
        } catch (uploadErr) {
          console.error('Erro no upload do APK para o Firebase Storage:', uploadErr);
          setStatusMessage({
            type: 'error',
            text:
              'Não foi possível enviar o arquivo diretamente para o Firebase Storage (verifique as regras/plano do Storage). Alternativa imediata: mude para a aba "Link Direto (URL)" e cole o link do Google Drive ou GitHub Releases.',
          });
          setIsSaving(false);
          return;
        }
      }

      let finalIconUrl = form.icon.trim();
      if (iconFile) {
        const safeIconName = iconFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        try {
          finalIconUrl = await uploadFile(`apps/icons/${Date.now()}_${safeIconName}`, iconFile);
        } catch (iconErr) {
          console.warn('Fallback: salvando ícone comprimido inline:', iconErr);
          finalIconUrl = await compressIconToDataUrl(iconFile);
        }
      }

      if (!finalIconUrl) {
        finalIconUrl = '/logo.png';
      }

      if (!finalFileName && finalDownloadUrl) {
        const lastPart = finalDownloadUrl.split('/').pop()?.split('?')[0];
        finalFileName = lastPart && lastPart.includes('.') ? lastPart : `${form.name.trim().replace(/\s+/g, '_')}.apk`;
      }

      const splitLines = (text) =>
        (text || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);

      const appId =
        editingId ||
        form.name
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') +
          '-' +
          Date.now().toString().slice(-4);

      const payload = {
        id: appId,
        name: form.name.trim(),
        subtitle: form.subtitle.trim() || `Aplicativo oficial ${form.category.trim() || 'SEMAFIS'}`,
        category: form.category.trim() || 'Educacional',
        status: form.status,
        featured: Boolean(form.featured),
        version: form.version.trim() || '1.0.0',
        packageName: form.packageName.trim(),
        platform: form.platform.trim() || 'Android (APK)',
        architecture: form.architecture.trim(),
        engine: form.engine.trim(),
        size: finalSize || 'N/I',
        releaseYear: form.releaseYear.trim() || new Date().getFullYear().toString(),
        icon: finalIconUrl,
        downloadUrl: finalDownloadUrl,
        fileName: finalFileName,
        description: form.description.trim(),
        highlights: splitLines(form.highlightsText),
        requirements: splitLines(form.requirementsText),
        installSteps: splitLines(form.installStepsText),
        tags: (form.tagsText || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        hidden: false,
        updatedAt: new Date().toISOString(),
      };

      await onSaveApp(payload);

      setStatusMessage({
        type: 'success',
        text: editingId
          ? `Aplicativo "${payload.name}" atualizado com sucesso!`
          : `Aplicativo "${payload.name}" publicado na área /apps com sucesso!`,
      });
      resetForm();
    } catch (err) {
      console.error('Erro ao salvar aplicativo:', err);
      setStatusMessage({
        type: 'error',
        text: 'Ocorreu um erro ao salvar o aplicativo. Tente novamente.',
      });
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  const handleToggleFeatured = async (app) => {
    await onSaveApp({ ...app, featured: !app.featured, updatedAt: new Date().toISOString() });
  };

  const handleDelete = async (app) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja remover o aplicativo "${app.name}" da página pública /apps?`
    );
    if (!confirmed) return;
    await onDeleteApp(app.id);
    if (editingId === app.id) resetForm();
  };

  return (
    <div className="container" style={{ marginTop: '2rem', paddingBottom: '3rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <button onClick={onBack} className="btn btn-outline flex items-center gap-2">
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>

        <Link
          to="/apps"
          className="btn btn-outline"
          style={{ textDecoration: 'none', color: 'var(--accent-primary)', borderColor: '#bfdbfe' }}
        >
          <ExternalLink size={16} /> Ver Página Pública de Apps (/apps)
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '0.25rem',
          }}
        >
          <Smartphone size={28} color="var(--accent-primary)" />
          Gerenciar e Hospedar Apps SEMAFIS
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Publique novos aplicativos (enviando o arquivo APK ou colando um link direto), atualize
          versões e escolha qual app fica em destaque em <strong>/apps</strong>.
        </p>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${statusMessage.type === 'success' ? '#86efac' : '#fca5a5'}`,
            color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
            fontWeight: '500',
          }}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Formulário de Hospedagem / Edição */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} color="var(--accent-primary)" />
              {editingId ? `Editando: ${form.name}` : 'Hospedar Novo Aplicativo'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
              >
                Cancelar Edição
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Nome do Aplicativo *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex.: COSMO VR"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Subtítulo / Chamada Curta</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex.: Exploração Imersiva do Sistema Solar em Realidade Virtual"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Categoria *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex.: Astrofísica & VR"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Plataforma</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex.: Android (APK)"
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Versão</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="1.0.0"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Tamanho</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="48,2 MB"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="available">Disponível</option>
                  <option value="coming-soon">Em breve</option>
                </select>
              </div>
            </div>

            {/* Fonte do arquivo (Upload ou URL) */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
              }}
            >
              <label className="form-label" style={{ marginBottom: '0.6rem' }}>
                Arquivo / Hospedagem do Aplicativo *
              </label>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  className={`btn ${sourceMode === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1, fontSize: '0.85rem' }}
                >
                  <Upload size={15} /> Enviar Arquivo (.apk)
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('url')}
                  className={`btn ${sourceMode === 'url' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1, fontSize: '0.85rem' }}
                >
                  <Link2 size={15} /> Link Direto (URL)
                </button>
              </div>

              {sourceMode === 'upload' ? (
                <div>
                  <input
                    type="file"
                    accept=".apk,.aab,.zip,.exe,.msi,.dmg,.ipa,application/vnd.android.package-archive"
                    onChange={handleAppFileChange}
                    className="form-input"
                  />
                  {appFile && (
                    <p style={{ margin: '0.45rem 0 0 0', fontSize: '0.82rem', color: '#0369a1' }}>
                      Selecionado: <strong>{appFile.name}</strong> ({formatFileSize(appFile.size)})
                    </p>
                  )}
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Envia diretamente para o armazenamento em nuvem da plataforma (Firebase Storage).
                  </p>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://drive.google.com/file/d/... ou /downloads/meu_app.apk"
                    value={form.downloadUrl}
                    onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
                  />
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Aceita links públicos do Google Drive (convertido automaticamente para download
                    direto), GitHub Releases ou caminhos locais como <code>/downloads/...</code>.
                  </p>
                </div>
              )}

              {isSaving && uploadProgress > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: '#0369a1',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span>Enviando arquivo do aplicativo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${uploadProgress}%`,
                        height: '100%',
                        backgroundColor: '#2563eb',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ícone do App */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
              }}
            >
              <label className="form-label">Ícone do Aplicativo (Imagem ou URL)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                className="form-input"
                style={{ marginBottom: '0.5rem' }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Ou cole a URL do ícone (ex.: /downloads/cosmo-vr-icon.png)"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Descrição Completa *</label>
              <textarea
                rows="3"
                className="form-input"
                placeholder="Explique o que o aplicativo faz, seu propósito educacional e recursos principais..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Destaques / Recursos (1 por linha)</label>
              <textarea
                rows="3"
                className="form-input"
                placeholder={'Experiência interativa 3D\nGratuito para estudantes\nFunciona offline'}
                value={form.highlightsText}
                onChange={(e) => setForm({ ...form, highlightsText: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Pacote (opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="com.semafis.meuapp"
                  value={form.packageName}
                  onChange={(e) => setForm({ ...form, packageName: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Motor / Tecnologia</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Unity, Flutter, Web..."
                  value={form.engine}
                  onChange={(e) => setForm({ ...form, engine: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Requisitos Técnicos (1 por linha)</label>
              <textarea
                rows="2"
                className="form-input"
                value={form.requirementsText}
                onChange={(e) => setForm({ ...form, requirementsText: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Passo a Passo de Instalação (1 por linha)</label>
              <textarea
                rows="3"
                className="form-input"
                value={form.installStepsText}
                onChange={(e) => setForm({ ...form, installStepsText: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Tags (separadas por vírgula)</label>
              <input
                type="text"
                className="form-input"
                placeholder="VR, Física, Simulação, Android"
                value={form.tagsText}
                onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
              />
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.92rem',
                color: '#0f172a',
              }}
            >
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              Exibir este aplicativo em Destaque no topo de /apps e na Página Inicial
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: '700' }}
            >
              {isSaving
                ? uploadProgress > 0
                  ? `Enviando APK (${uploadProgress}%)...`
                  : 'Salvando Aplicativo...'
                : editingId
                  ? 'Salvar Alterações do App'
                  : 'Publicar Aplicativo na Plataforma'}
            </button>
          </form>
        </div>

        {/* Lista de Apps Hospedados */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>
            Aplicativos Hospedados ({apps.length})
          </h2>

          {apps.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              Nenhum aplicativo publicado ainda. Use o formulário ao lado para hospedar o primeiro.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {apps.map((app) => (
                <div
                  key={app.id}
                  style={{
                    padding: '1.1rem',
                    borderRadius: '14px',
                    border: app.featured ? '1.5px solid #38bdf8' : '1px solid var(--border-color)',
                    backgroundColor: app.featured ? '#f0f9ff' : '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.95rem', alignItems: 'center' }}>
                    <img
                      src={app.icon || '/logo.png'}
                      alt={app.name}
                      style={{
                        width: '62px',
                        height: '62px',
                        borderRadius: '14px',
                        objectFit: 'cover',
                        border: '1px solid var(--border-color)',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
                          {app.name}
                        </h3>
                        {app.featured && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              backgroundColor: '#0284c7',
                              color: '#ffffff',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '999px',
                            }}
                          >
                            Destaque
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            backgroundColor: app.status === 'available' ? '#dcfce7' : '#fef3c7',
                            color: app.status === 'available' ? '#166534' : '#92400e',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                          }}
                        >
                          {app.status === 'available' ? 'Disponível' : 'Em breve'}
                        </span>
                      </div>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#475569' }}>
                        {app.category} • v{app.version} • {app.size} • {app.platform}
                      </p>
                      {app.downloadUrl && (
                        <p
                          style={{
                            margin: '0.2rem 0 0 0',
                            fontSize: '0.75rem',
                            color: '#64748b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={app.downloadUrl}
                        >
                          Arquivo: {app.downloadUrl}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleEditApp(app)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.8rem', backgroundColor: '#fff' }}
                    >
                      <Edit3 size={14} /> Editar / Atualizar APK
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(app)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.8rem', backgroundColor: '#fff' }}
                    >
                      <Star
                        size={14}
                        fill={app.featured ? '#f59e0b' : 'none'}
                        color={app.featured ? '#f59e0b' : 'currentColor'}
                      />
                      {app.featured ? 'Remover Destaque' : 'Destacar'}
                    </button>

                    {app.downloadUrl && (
                      <a
                        href={app.downloadUrl}
                        download={app.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        style={{
                          fontSize: '0.82rem',
                          padding: '0.45rem 0.8rem',
                          textDecoration: 'none',
                          backgroundColor: '#fff',
                        }}
                      >
                        <Download size={14} /> Testar
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(app)}
                      className="btn btn-outline"
                      style={{
                        fontSize: '0.82rem',
                        padding: '0.45rem 0.8rem',
                        color: '#dc2626',
                        borderColor: '#fecaca',
                        backgroundColor: '#fff',
                        marginLeft: 'auto',
                      }}
                    >
                      <Trash2 size={14} /> Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
