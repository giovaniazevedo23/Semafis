import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Smartphone,
  Sparkles,
  CheckCircle2,
  QrCode,
  Search,
  HardDrive,
  Cpu,
  ShieldCheck,
  Info,
  X,
  Copy,
  Check,
  Rocket,
  Layers,
  Package,
  Settings,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { APPS_CATALOG } from '../data/appsCatalog';
import './AppsPortal.css';

export function AppsPortal({ apps = APPS_CATALOG }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [modalApp, setModalApp] = useState(null);
  const [modalTab, setModalTab] = useState('qrcode'); // 'qrcode' | 'install'
  const [copiedId, setCopiedId] = useState(null);
  const isOrganizer = sessionStorage.getItem('userRole') === 'organizador';

  const catalog = apps && apps.length > 0 ? apps : APPS_CATALOG;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalApp(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(catalog.map((app) => app.category).filter(Boolean)));
    return ['Todos', ...unique];
  }, [catalog]);

  const featuredApp = useMemo(
    () => catalog.find((app) => app.featured && app.status === 'available') || catalog[0],
    [catalog]
  );

  const filteredApps = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return catalog.filter((app) => {
      const matchesCategory = selectedCategory === 'Todos' || app.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      return (
        (app.name || '').toLowerCase().includes(query) ||
        (app.subtitle || '').toLowerCase().includes(query) ||
        (app.description || '').toLowerCase().includes(query) ||
        (app.category || '').toLowerCase().includes(query) ||
        (app.tags || []).some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [catalog, searchTerm, selectedCategory]);

  const availableCount = catalog.filter((a) => a.status === 'available').length;

  const getAbsoluteDownloadUrl = (downloadUrl) => {
    if (!downloadUrl) return '';
    if (typeof window === 'undefined') return downloadUrl;
    if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) {
      return downloadUrl;
    }
    return `${window.location.origin}${downloadUrl}`;
  };

  const getDownloadLinkProps = (app) => {
    const isExternal = /^https?:\/\//i.test(app?.downloadUrl || '');
    return {
      href: app?.downloadUrl || '#',
      download: app?.fileName || undefined,
      ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    };
  };

  const handleCopyLink = async (app) => {
    try {
      const url = getAbsoluteDownloadUrl(app.downloadUrl);
      await navigator.clipboard.writeText(url);
      setCopiedId(app.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const openModal = (app, tab = 'qrcode') => {
    setModalApp(app);
    setModalTab(tab);
  };

  return (
    <div className="container apps-page">
      {/* Hero Banner */}
      <section className="apps-hero">
        <div className="apps-hero-inner">
          <span className="apps-hero-badge">
            <Rocket size={16} />
            SEMAFIS Apps • Hub Oficial de Aplicativos
          </span>
          <h1>Aplicativos Desenvolvidos para a SEMAFIS</h1>
          <p>
            Espaço dedicado exclusivamente aos aplicativos interativos, simulações científicas e
            experiências imersivas em Física, Astrofísica e Matemática. Baixe gratuitamente direto
            da plataforma.
          </p>
          <div className="apps-hero-stats">
            <span className="apps-stat-pill">
              <Smartphone size={16} color="#38bdf8" />
              {availableCount} {availableCount === 1 ? 'App Disponível' : 'Apps Disponíveis'}
            </span>
            <span className="apps-stat-pill">
              <ShieldCheck size={16} color="#34d399" />
              Hospedagem Oficial & Download Direto
            </span>
            <span className="apps-stat-pill">
              <Sparkles size={16} color="#facc15" />
              Novos Apps em Desenvolvimento
            </span>
            {isOrganizer && (
              <Link
                to="/organizador?tab=apps"
                className="apps-stat-pill"
                style={{
                  textDecoration: 'none',
                  background: 'rgba(56, 189, 248, 0.22)',
                  borderColor: 'rgba(56, 189, 248, 0.6)',
                  fontWeight: '700',
                }}
              >
                <Settings size={16} color="#7dd3fc" />
                Gerenciar / Hospedar Apps
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured App Spotlight */}
      {featuredApp && (
        <section className="featured-app-card" aria-label={`Destaque: ${featuredApp.name}`}>
          <div className="featured-app-layout">
            <div className="featured-app-icon-wrap">
              <img
                src={featuredApp.icon}
                alt={`Ícone do aplicativo ${featuredApp.name}`}
                className="featured-app-icon"
              />
              <span
                style={{
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                }}
              >
                {featuredApp.packageName}
              </span>
            </div>

            <div>
              <div className="featured-app-meta-row">
                <span className="app-badge-live">
                  <CheckCircle2 size={14} /> Disponível para Download
                </span>
                <span className="app-badge-dark">
                  <Sparkles size={13} /> Destaque
                </span>
                <span className="app-badge-dark">{featuredApp.category}</span>
                <span className="app-badge-dark">v{featuredApp.version}</span>
                <span className="app-badge-dark">{featuredApp.platform}</span>
                <span className="app-badge-dark">{featuredApp.size}</span>
              </div>

              <h2 className="featured-app-title">{featuredApp.name}</h2>
              <p className="featured-app-subtitle">{featuredApp.subtitle}</p>
              <p className="featured-app-desc">{featuredApp.description}</p>

              {(featuredApp.highlights || []).length > 0 && (
                <div className="featured-highlights">
                  {featuredApp.highlights.map((item, idx) => (
                    <div key={idx} className="featured-highlight-item">
                      <CheckCircle2
                        size={17}
                        color="#38bdf8"
                        style={{ flexShrink: 0, marginTop: '2px' }}
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="featured-actions">
                <a
                  {...getDownloadLinkProps(featuredApp)}
                  className="btn-download-primary"
                >
                  <Download size={20} />
                  Baixar {featuredApp.name} ({featuredApp.size})
                </a>

                <button
                  type="button"
                  onClick={() => openModal(featuredApp, 'qrcode')}
                  className="btn-glass-secondary"
                >
                  <QrCode size={18} />
                  QR Code para Celular
                </button>

                <button
                  type="button"
                  onClick={() => openModal(featuredApp, 'install')}
                  className="btn-glass-secondary"
                >
                  <Info size={18} />
                  Como Instalar
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Catalog Section Header & Filters */}
      <section>
        <div className="apps-toolbar">
          <div>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <Layers size={24} color="var(--accent-primary)" />
              Catálogo de Aplicativos
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>
              Todos os aplicativos lançados e hospedados nesta seção exclusiva da plataforma.
            </p>
          </div>

          <div style={{ position: 'relative', minWidth: '260px', flex: '0 1 340px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aplicativo..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.9rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
              }}
            />
          </div>
        </div>

        <div className="apps-categories" style={{ marginBottom: '1.75rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`apps-category-btn ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Apps Grid */}
        <div className="apps-catalog-grid">
          {filteredApps.map((app) => (
            <article key={app.id} className="app-catalog-card">
              <div className="app-card-header">
                <img src={app.icon} alt={app.name} className="app-card-icon" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.2rem',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>{app.name}</h3>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '999px',
                        backgroundColor: app.status === 'available' ? '#dcfce7' : '#fef3c7',
                        color: app.status === 'available' ? '#166534' : '#92400e',
                      }}
                    >
                      {app.status === 'available' ? 'Disponível' : 'Em breve'}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: 'var(--accent-primary)',
                      fontWeight: '600',
                    }}
                  >
                    {app.category}
                  </p>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.55, flex: 1 }}>
                {app.description}
              </p>

              <div className="app-card-specs">
                <span className="app-spec-chip">
                  <Smartphone size={13} /> {app.platform}
                </span>
                <span className="app-spec-chip">
                  <HardDrive size={13} /> {app.size}
                </span>
                <span className="app-spec-chip">
                  <Package size={13} /> v{app.version}
                </span>
                {app.architecture && (
                  <span className="app-spec-chip">
                    <Cpu size={13} /> {app.architecture}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.65rem',
                  marginTop: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                {app.status === 'available' ? (
                  <>
                    <a
                      {...getDownloadLinkProps(app)}
                      className="btn btn-primary"
                      style={{ flex: 1, textDecoration: 'none', padding: '0.7rem 1rem' }}
                    >
                      <Download size={17} /> Baixar APK
                    </a>
                    <button
                      type="button"
                      onClick={() => openModal(app, 'qrcode')}
                      className="btn btn-outline"
                      title="Abrir QR Code para baixar no celular"
                      style={{ padding: '0.7rem 0.85rem' }}
                    >
                      <QrCode size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal(app, 'install')}
                      className="btn btn-outline"
                      title="Detalhes e instruções de instalação"
                      style={{ padding: '0.7rem 0.85rem' }}
                    >
                      <Info size={18} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="btn btn-outline"
                    style={{ width: '100%', opacity: 0.65, cursor: 'not-allowed' }}
                  >
                    Em breve
                  </button>
                )}
              </div>
            </article>
          ))}

          {/* Placeholder card for upcoming apps */}
          <div className="app-coming-soon-card">
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: '#dbeafe',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={28} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
              Novos Aplicativos em Breve
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '300px', lineHeight: 1.55 }}>
              Esta área foi preparada para receber todos os próximos aplicativos de Física,
              Matemática e Realidade Virtual desenvolvidos para a SEMAFIS.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Android Install Guide */}
      {featuredApp && (featuredApp.installSteps || []).length > 0 && (
        <section className="install-guide-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={24} color="#10b981" />
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>
              Como instalar aplicativos Android (.APK) com segurança
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Como nossos aplicativos são hospedados diretamente aqui na plataforma oficial da SEMAFIS
            (fora da Play Store), basta seguir estes passos rápidos no seu celular Android:
          </p>

          <div className="install-steps-grid">
            {featuredApp.installSteps.map((step, index) => (
              <div key={index} className="install-step-card">
                <span className="install-step-num">{index + 1}</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* QR Code & Installation Modal */}
      {modalApp && (
        <div
          className="apps-modal-backdrop"
          onClick={() => setModalApp(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="apps-modal-title"
        >
          <div className="apps-modal-card" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <img
                  src={modalApp.icon}
                  alt={modalApp.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: '1px solid var(--border-color)',
                  }}
                />
                <div>
                  <h3 id="apps-modal-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                    {modalApp.name}
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    v{modalApp.version} • {modalApp.size} • {modalApp.platform}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalApp(null)}
                className="btn btn-outline"
                style={{ padding: '0.4rem', borderRadius: '50%' }}
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setModalTab('qrcode')}
                className={`btn ${modalTab === 'qrcode' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1 }}
              >
                <QrCode size={16} /> QR Code / Link
              </button>
              <button
                type="button"
                onClick={() => setModalTab('install')}
                className={`btn ${modalTab === 'install' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1 }}
              >
                <Info size={16} /> Instalação & Requisitos
              </button>
            </div>

            {modalTab === 'qrcode' ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                  Aponte a câmera do seu celular Android para baixar{' '}
                  <strong>{modalApp.fileName}</strong> diretamente:
                </p>

                <div
                  style={{
                    display: 'inline-flex',
                    padding: '1.25rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-md)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <QRCodeCanvas
                    value={getAbsoluteDownloadUrl(modalApp.downloadUrl)}
                    size={210}
                    level="M"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <a
                    {...getDownloadLinkProps(modalApp)}
                    className="btn btn-primary"
                    style={{ flex: 1, textDecoration: 'none', padding: '0.75rem 1rem' }}
                  >
                    <Download size={18} /> Baixar Agora ({modalApp.size})
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(modalApp)}
                    className="btn btn-outline"
                    style={{ padding: '0.75rem 1rem' }}
                  >
                    {copiedId === modalApp.id ? (
                      <>
                        <Check size={17} color="#10b981" /> Link Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={17} /> Copiar Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.6rem' }}>Requisitos Técnicos</h4>
                  <ul style={{ paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {(modalApp.requirements || ['Android 9.0 ou superior']).map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.6rem' }}>Passo a Passo</h4>
                  <ol style={{ paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {(modalApp.installSteps || ['Baixe o arquivo e abra no dispositivo para instalar.']).map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '0.9rem 1rem',
                    fontSize: '0.82rem',
                    color: '#475569',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <strong>Pacote:</strong> {modalApp.packageName}
                  </div>
                  <div>
                    <strong>Versão:</strong> {modalApp.version}
                  </div>
                  <div>
                    <strong>Motor:</strong> {modalApp.engine}
                  </div>
                  <div>
                    <strong>Arquitetura:</strong> {modalApp.architecture}
                  </div>
                </div>

                <a
                  {...getDownloadLinkProps(modalApp)}
                  className="btn btn-primary"
                  style={{ width: '100%', textDecoration: 'none', padding: '0.8rem 1rem' }}
                >
                  <Download size={18} /> Baixar {modalApp.fileName} ({modalApp.size})
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
