/**
 * Catálogo oficial de aplicativos da plataforma SEMAFIS.
 *
 * Para adicionar um novo aplicativo no futuro:
 * 1. Coloque o arquivo instalador (ex.: .apk) e o ícone em `public/downloads/`.
 * 2. Adicione um novo objeto neste array `APPS_CATALOG`.
 *    Ele aparecerá automaticamente na página `/apps`.
 */
export const APPS_CATALOG = [
  {
    id: 'cosmo-vr',
    name: 'COSMO VR',
    subtitle: 'Exploração Imersiva do Sistema Solar em Realidade Virtual',
    category: 'Astrofísica & VR',
    status: 'available', // 'available' | 'beta' | 'coming-soon'
    featured: true,
    version: '0.1.0',
    packageName: 'com.cosmovr.astrofisica',
    platform: 'Android (APK)',
    architecture: 'ARM64 (arm64-v8a)',
    engine: 'Unity',
    size: '48,2 MB',
    releaseYear: '2026',
    icon: '/downloads/cosmo-vr-icon.png',
    downloadUrl: '/downloads/COSMO_VR.apk',
    fileName: 'COSMO_VR.apk',
    accentColor: '#38bdf8',
    description:
      'Mergulhe em uma jornada interativa pelo espaço com o COSMO VR. Desenvolvido para aproximar estudantes e entusiastas da Astrofísica e da Física, o aplicativo permite explorar planetas, órbitas e escalas cósmicas em Realidade Virtual diretamente no seu smartphone Android.',
    highlights: [
      'Experiência interativa 3D em Realidade Virtual',
      'Visualização do Sistema Solar, planetas e órbitas',
      'Desenvolvido com foco educacional em Física e Astrofísica',
      'Gratuito e hospedado oficialmente na plataforma SEMAFIS',
    ],
    requirements: [
      'Smartphone Android 9.0 ou superior (arquitetura 64-bit / ARM64)',
      'Aproximadamente 120 MB de espaço livre após a instalação',
      'Permitir instalação de aplicativos de fontes desconhecidas no Android',
    ],
    installSteps: [
      'Clique em "Baixar APK" no seu celular Android (ou escaneie o QR Code pelo celular).',
      'Aguarde a conclusão do download do arquivo COSMO_VR.apk (48,2 MB).',
      'Toque no arquivo baixado na barra de notificações ou no gerenciador de arquivos.',
      'Se o Android solicitar, ative a permissão "Instalar apps desconhecidos" para o navegador.',
      'Toque em "Instalar" e, ao finalizar, abra o COSMO VR e explore o universo!',
    ],
    tags: ['VR', 'Astrofísica', 'Sistema Solar', 'Física', 'Unity', 'Android'],
  },
];
