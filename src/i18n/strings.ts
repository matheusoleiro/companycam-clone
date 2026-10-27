/**
 * Internationalization strings
 * Support for Portuguese and English
 */

export type Language = 'pt' | 'en';

export const strings = {
  pt: {
    // Navigation & Header
    header: {
      title: 'CompanyCam',
    },

    // Projects Page
    projects: {
      title: 'Projetos',
      newProject: 'Novo Projeto',
      createProject: 'Criar Projeto',
      editProject: 'Editar Projeto',
      deleteProject: 'Deletar Projeto',
      noProjects: 'Nenhum projeto encontrado',
      projectName: 'Nome do Projeto',
      address: 'Endereço',
      description: 'Descrição',
      startDate: 'Data de Início',
    },

    // Photo Management
    photos: {
      title: 'Fotos',
      addPhotos: 'Adicionar Fotos',
      uploadPhotos: 'Enviar Fotos',
      downloading: 'Baixando...',
      uploadingProgress: 'Enviando {completed}/{total}...',
      deletePhoto: 'Deletar Foto',
      editPhotoName: 'Editar Nome da Foto',
      photoName: 'Nome da Foto',
      downloadPhoto: 'Baixar Foto',
      downloadAll: 'Baixar Tudo',
      download: 'Baixar',
      noPhotos: 'Nenhuma foto encontrada',
    },

    // Photo Viewer
    photoViewer: {
      photoCount: '{current} de {total}',
      nextPhoto: 'Próxima Foto',
      previousPhoto: 'Foto Anterior',
      closeViewer: 'Fechar Visualizador',
    },

    // Photo Quality Selection
    photoQuality: {
      title: 'Tamanho da Foto',
      selected: 'Selecionou {count} foto(s)',
      confirm: 'Enviar',
      cancel: 'Cancelar',

      high: {
        label: '🖼️ Grande',
        description: 'Máximo 4096px • Sem compressão',
      },
      medium: {
        label: '📱 Médio',
        description: 'Máximo 2048px • 75% qualidade',
      },
      low: {
        label: '⚡ Pequeno',
        description: 'Máximo 1024px • 50% qualidade',
      },
    },

    // View Modes
    viewMode: {
      grid: 'Grid',
      timeline: 'Timeline',
      sortNewest: 'Mais recentes',
      sortOldest: 'Mais antigas',
    },

    // File Sizes
    fileSize: {
      mb: 'MB',
      gb: 'GB',
    },

    // Auth
    auth: {
      login: 'Entrar',
      signup: 'Criar Conta',
      logout: 'Sair',
      email: 'Email',
      password: 'Senha',
      resetPassword: 'Redefinir Senha',
      forgotPassword: 'Esqueceu sua senha?',
    },

    // Common Actions
    actions: {
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Deletar',
      edit: 'Editar',
      close: 'Fechar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
    },
  },

  en: {
    // Navigation & Header
    header: {
      title: 'CompanyCam',
    },

    // Projects Page
    projects: {
      title: 'Projects',
      newProject: 'New Project',
      createProject: 'Create Project',
      editProject: 'Edit Project',
      deleteProject: 'Delete Project',
      noProjects: 'No projects found',
      projectName: 'Project Name',
      address: 'Address',
      description: 'Description',
      startDate: 'Start Date',
    },

    // Photo Management
    photos: {
      title: 'Photos',
      addPhotos: 'Add Photos',
      uploadPhotos: 'Upload Photos',
      downloading: 'Downloading...',
      uploadingProgress: 'Uploading {completed}/{total}...',
      deletePhoto: 'Delete Photo',
      editPhotoName: 'Edit Photo Name',
      photoName: 'Photo Name',
      downloadPhoto: 'Download Photo',
      downloadAll: 'Download All',
      download: 'Download',
      noPhotos: 'No photos found',
    },

    // Photo Viewer
    photoViewer: {
      photoCount: '{current} of {total}',
      nextPhoto: 'Next Photo',
      previousPhoto: 'Previous Photo',
      closeViewer: 'Close Viewer',
    },

    // Photo Quality Selection
    photoQuality: {
      title: 'Photo Size',
      selected: 'Selected {count} photo(s)',
      confirm: 'Upload',
      cancel: 'Cancel',

      high: {
        label: '🖼️ High',
        description: 'Maximum 4096px • No compression',
      },
      medium: {
        label: '📱 Medium',
        description: 'Maximum 2048px • 75% quality',
      },
      low: {
        label: '⚡ Low',
        description: 'Maximum 1024px • 50% quality',
      },
    },

    // View Modes
    viewMode: {
      grid: 'Grid',
      timeline: 'Timeline',
      sortNewest: 'Newest',
      sortOldest: 'Oldest',
    },

    // File Sizes
    fileSize: {
      mb: 'MB',
      gb: 'GB',
    },

    // Auth
    auth: {
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      resetPassword: 'Reset Password',
      forgotPassword: 'Forgot password?',
    },

    // Common Actions
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
  },
} as const;

// Helper function to get strings for a language
export const getStrings = (language: Language = 'pt') => strings[language];

// Type-safe string access
export type Strings = typeof strings.pt;
