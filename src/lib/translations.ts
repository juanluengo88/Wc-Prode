export type Lang = "es" | "en";

const translations = {
  es: {
    // App global
    appTitle: "MUNDIAL PRODE",
    appTagline: "Muestra tus conocimientos",

    // TopNavbar
    nav_adminConsole: "Consola Admin",
    nav_adminConsoleMobile: "Admin",
    nav_logout: "Salir",
    nav_defaultUser: "Usuario",

    // BottomNav
    bottomNav_fixture: "Fixture",
    bottomNav_predictions: "Mis Pronósticos",
    bottomNav_leaderboard: "Posiciones",

    // LoginView
    login_subtitle: "Demuestra tus conocimientos y compite con amigos",
    login_tabLogin: "Iniciar Sesión",
    login_tabSignUp: "Crear Cuenta",
    login_labelName: "Nombre Completo",
    login_placeholderName: "Nombre y Apellido",
    login_labelEmail: "Correo Electrónico",
    login_placeholderEmail: "correo@ejemplo.com",
    login_labelPassword: "Contraseña",
    login_btnSubmit: "Entrar",
    login_btnSignUp: "Crear Cuenta",
    login_btnLoading: "Procesando...",
    login_orContinueWith: "o continúa con",
    login_btnGoogle: "Acceder con Google",
    login_btnMicrosoft: "Acceder con Microsoft",
    login_errUserNotFound: "No existe una cuenta con ese email.",
    login_errWrongPassword: "Contraseña incorrecta.",
    login_errEmailInUse: "Ya existe una cuenta con ese email.",
    login_errWeakPassword: "La contraseña debe tener al menos 6 caracteres.",
    login_errInvalidEmail: "El formato del email no es válido.",
    login_errPopupClosed: "Se cerró la ventana de Google.",
    login_errInvalidCredential: "Email o contraseña incorrectos.",
    login_errGeneric: "Ocurrió un error. Intentá de nuevo.",

    // ProfileView
    profile_title: "Mi Perfil",
    profile_subtitle: "Edita tus datos de participante",
    profile_btnLogout: "Cerrar Sesión",
    profile_competitiveSummary: "Resumen Competitivo",
    profile_defaultUser: "Usuario",
    profile_points: "Puntos",
    profile_rank: "Puesto",
    profile_photoSection: "Foto de Perfil",
    profile_photoHelper:
      "Pulsa sobre el círculo o el botón inferior para cargar una imagen desde tu dispositivo.",
    profile_btnBrowse: "Buscar Archivo",
    profile_labelName: "Nombre de Participante",
    profile_placeholderName: "Ingresa tu nombre",
    profile_labelEmail: "Correo Electrónico (No editable)",
    profile_successMessage: "¡Perfil actualizado exitosamente!",
    profile_btnSave: "Guardar Cambios",
    profile_btnSaving: "Guardando cambios...",
    profile_uploadPhoto: "Subir Foto",
    profile_errInvalidFile:
      "Por favor, selecciona únicamente archivos de imagen.",
    profile_errFileTooLarge:
      "La imagen es demasiado grande. El límite recomendado es de 2MB.",

    // FixtureView
    fixture_empty: "No hay partidos en esta categoría en este momento.",
    fixture_showing: "Mostrando {start} a {end} de {total} partidos",
    fixture_prev: "Anterior",
    fixture_next: "Siguiente",

    // FixtureNavBar
    fixtureNav_all: "Todos",
    fixtureNav_pending: "Pendientes",
    fixtureNav_live: "En Vivo",
    fixtureNav_finished: "Finalizados",
    fixtureNav_count: "Mostrando {count} partidos",
    fixtureNav_searchPlaceholder: "Buscar selección...",
    fixtureNav_allGroups: "Todos los grupos",
    fixtureNav_allStages: "Todas las fases",

    // MyPredictionsView
    predictions_title: "Mis Pronósticos",
    predictions_subtitle: "Historial y seguimiento de tus apuestas",
    predictions_tabActive: "Activos ({count})",
    predictions_tabFinished: "Finalizados ({count})",
    predictions_emptyActive: "No tienes pronósticos activos en este momento.",
    predictions_emptyFinished:
      "No tienes pronósticos finalizados en este momento.",
    predictions_closesIn: "Cierra en: {time}",
    predictions_closed: "CERRADO (FALTAN < 15 MIN)",
    predictions_live: "En Vivo",
    predictions_exact: "Exacto +3 pts",
    predictions_partial: "Ganador +1 pt",
    predictions_wrong: "Incorrecto 0 pts",
    predictions_real: "Real:",

    // LeaderboardView
    leaderboard_title: "Tabla de Posiciones",
    leaderboard_subtitle: "Ranking competitivo por sesión",
    leaderboard_yourRank: "Tu Puesto en este grupo:",
    leaderboard_selectGroup: "Seleccionar Grupo / Sesión",
    leaderboard_empty:
      "No hay participantes registrados en esta sesión todavía.",
    leaderboard_gold: "Oro",
    leaderboard_silver: "Plata",
    leaderboard_bronze: "Bronce",
    leaderboard_you: "Tú",
    leaderboard_restTitle: "Resto de Participantes",

    // MatchDetailView
    matchDetail_title: "Detalle de Partido",
    matchDetail_closed: "PRONÓSTICOS CERRADOS",
    matchDetail_closesIn: "Cierra en: {time}",
    matchDetail_home: "Local",
    matchDetail_away: "Visitante",
    matchDetail_viewSquad: "Ver Plantel",
    matchDetail_live: "Partido en curso",
    matchDetail_registeredPrediction: "Tu pronóstico registrado",
    matchDetail_enterPrediction: "Ingresa tu pronóstico",
    matchDetail_successSaved: "¡Pronóstico guardado exitosamente!",
    matchDetail_btnSave: "Guardar Pronóstico",
    matchDetail_btnUpdate: "Actualizar Pronóstico",
    matchDetail_btnSaving: "Guardando...",
    matchDetail_pointsEarned: "Puntos obtenidos:",
    matchDetail_marketProbTitle: "Probabilidades del Mercado",
    matchDetail_marketProbSubtitle:
      "Cálculo algorítmico en base a las cuotas de las casas de apuestas",
    matchDetail_draw: "Empate",
    matchDetail_recentMatches: "Últimos partidos de {team}",
    matchDetail_noData: "No hay datos disponibles",
    matchDetail_h2hTitle: "Historial Frente a Frente (H2H)",
    matchDetail_winner: "Ganador:",
    matchDetail_tacticsTitle: "Esquemas Tácticos Iniciales",
    matchDetail_timelineTitle: "Línea de Tiempo del Partido",
    matchDetail_pendingTeams: "Equipos pendientes de clasificación",

    // MatchCard
    card_predicted: "Pronosticado",
    card_live: "En Vivo",
    card_finished: "Finalizado",
    card_tbd: "Por definir",
    card_closed: "Cerrado",
    card_open: "Abierto",
    card_teamsPending: "Equipos\npendientes",
    card_teamsPendingConfirm: "Equipos por confirmar",
    card_inProgress: "En curso",
    card_exact: "Exacto +3 pts",
    card_partial: "Ganador +1 pt",
    card_wrong: "0 pts",
    card_noPrediction: "Sin pronóstico",
    card_closedNoPrediction: "Cerrado sin apuesta",
    card_btnSave: "Guardar",
    card_btnUpdate: "Actualizar",
    card_notStarted: "Sin iniciar",
    card_modify: "Modificar",
    card_yourBet: "Tu apuesta",

    // TeamView
    team_badge: "Selección Nacional",
    team_coachPrefix: "DT:",
    team_noCoach: "No especificado",
    team_tournamentId: "ID Torneo:",
    team_squadTitle: "Lista de Convocados",
    team_posGK: "Arqueros",
    team_posDF: "Defensores",
    team_posMF: "Mediocampistas",
    team_posFW: "Delanteros",
    team_posOther: "Otros puestos",
    team_native: "Nativo",
    team_loading: "Cargando plantel del equipo...",
    team_errorTitle: "Hubo un inconveniente",
    team_errorMsg: "No se encontraron datos de este equipo.",

    // GroupCard
    group_noDescription: "Sin descripción",
    group_btnInvite: "Invitar",
    group_btnCopied: "¡Copiado!",
    group_btnAddUser: "Agregar Usuario",
    group_btnDelete: "Borrar",
    group_btnDeleting: "Borrando...",
    group_confirmDelete:
      '¿Estás seguro de que deseas borrar el grupo "{name}"? Esta acción no se puede deshacer.',
    group_errDelete: "Error al borrar el grupo. Intenta de nuevo.",
    group_membersTitle: "Participantes del Grupo ({count})",
    group_emptyMembers: "Aún no se han unido participantes a este grupo.",
    group_loadingMembers: "Cargando participantes...",
    group_modalTitle: "Agregar Usuarios",
    group_modalSearch: "Buscar usuario...",
    group_modalLoading: "Cargando usuarios...",
    group_modalAllInGroup: "Todos los usuarios ya están en el grupo.",
    group_modalNoResults: "Sin resultados para tu búsqueda.",
    group_modalSelectedOne: "1 seleccionado",
    group_modalSelectedMany: "{n} seleccionados",
    group_modalSelectedNone: "Ninguno seleccionado",
    group_btnCancel: "Cancelar",
    group_btnAdd: "Agregar",
    group_btnAdding: "Agregando...",

    // MotivationalBanner
    banner_badge: "REGLAMENTO OFICIAL",
    banner_title: "¡Completa tus pronósticos a tiempo!",
    banner_descPart1: "Los partidos se bloquean automáticamente",
    banner_descBold: "15 minutos antes",
    banner_descPart2: "de la hora de inicio oficial. Gana",
    banner_descPart3: "por acertar marcador exacto o",
    banner_descPart4: " por acertar ganador/empate.",
    banner_exactPoints: "3 puntos",
    banner_partialPoints: "1 punto",
    banner_exactLabel: "Exacto",
    banner_partialLabel: "Parcial",

    // AdminConsoleView
    admin_tabUsers: "Participantes",
    admin_tabGroups: "Grupos y Fases",
    admin_searchPlaceholder: "Buscar usuario por nombre o correo...",
    admin_loadingUsers: "Cargando base de datos de usuarios...",
    admin_noUsers: "No se encontraron usuarios.",
    admin_staffBadge: "Staff",
    admin_defaultName: "Sin nombre",
    admin_createGroupTitle: "Crear Nuevo Grupo / Fase",
    admin_labelGroupName: "Nombre del Grupo",
    admin_placeholderGroupName: "Ej: Grupo A, Octavos de Final",
    admin_labelGroupDesc: "Descripción (Opcional)",
    admin_placeholderGroupDesc: "Ej: Fase de grupos inicial",
    admin_successGroup:
      "¡Grupo añadido/borrado correctamente en la base de datos!",
    admin_btnCreateGroup: "Confirmar y Crear Grupo",
    admin_btnSavingGroup: "Guardando en Firebase...",
    admin_existingGroups: "Grupos y Fases Registradas",
    admin_loadingGroups: "Cargando lista de grupos oficiales...",
    admin_noGroups: "No hay ningún grupo creado todavía en Firestore.",
  },

  en: {
    // App global
    appTitle: "WORLD CUP PRODE",
    appTagline: "Show off your knowledge",

    // TopNavbar
    nav_adminConsole: "Admin Console",
    nav_adminConsoleMobile: "Admin",
    nav_logout: "Logout",
    nav_defaultUser: "User",

    // BottomNav
    bottomNav_fixture: "Fixture",
    bottomNav_predictions: "My Predictions",
    bottomNav_leaderboard: "Standings",

    // LoginView
    login_subtitle: "Show off your knowledge and compete with friends",
    login_tabLogin: "Sign In",
    login_tabSignUp: "Create Account",
    login_labelName: "Full Name",
    login_placeholderName: "First and Last Name",
    login_labelEmail: "Email Address",
    login_placeholderEmail: "email@example.com",
    login_labelPassword: "Password",
    login_btnSubmit: "Sign In",
    login_btnSignUp: "Create Account",
    login_btnLoading: "Processing...",
    login_orContinueWith: "or continue with",
    login_btnGoogle: "Continue with Google",
    login_btnMicrosoft: "Continue with Microsoft",
    login_errUserNotFound: "No account found with that email.",
    login_errWrongPassword: "Incorrect password.",
    login_errEmailInUse: "An account with that email already exists.",
    login_errWeakPassword: "Password must be at least 6 characters.",
    login_errInvalidEmail: "Invalid email format.",
    login_errPopupClosed: "Google sign-in window was closed.",
    login_errInvalidCredential: "Incorrect email or password.",
    login_errGeneric: "An error occurred. Please try again.",

    // ProfileView
    profile_title: "My Profile",
    profile_subtitle: "Edit your participant details",
    profile_btnLogout: "Sign Out",
    profile_competitiveSummary: "Competitive Summary",
    profile_defaultUser: "User",
    profile_points: "Points",
    profile_rank: "Rank",
    profile_photoSection: "Profile Photo",
    profile_photoHelper:
      "Tap the circle or the button below to upload an image from your device.",
    profile_btnBrowse: "Browse File",
    profile_labelName: "Participant Name",
    profile_placeholderName: "Enter your name",
    profile_labelEmail: "Email Address (Not editable)",
    profile_successMessage: "Profile updated successfully!",
    profile_btnSave: "Save Changes",
    profile_btnSaving: "Saving changes...",
    profile_uploadPhoto: "Upload Photo",
    profile_errInvalidFile: "Please select image files only.",
    profile_errFileTooLarge: "Image is too large. Recommended limit is 2MB.",

    // FixtureView
    fixture_empty: "No matches in this category at this time.",
    fixture_showing: "Showing {start} to {end} of {total} matches",
    fixture_prev: "Previous",
    fixture_next: "Next",

    // FixtureNavBar
    fixtureNav_all: "All",
    fixtureNav_pending: "Upcoming",
    fixtureNav_live: "Live",
    fixtureNav_finished: "Finished",
    fixtureNav_count: "Showing {count} matches",
    fixtureNav_searchPlaceholder: "Search team...",
    fixtureNav_allGroups: "All groups",
    fixtureNav_allStages: "All stages",

    // MyPredictionsView
    predictions_title: "My Predictions",
    predictions_subtitle: "History and tracking of your bets",
    predictions_tabActive: "Active ({count})",
    predictions_tabFinished: "Finished ({count})",
    predictions_emptyActive: "You have no active predictions at this time.",
    predictions_emptyFinished: "You have no finished predictions at this time.",
    predictions_closesIn: "Closes in: {time}",
    predictions_closed: "CLOSED (< 15 MIN LEFT)",
    predictions_live: "Live",
    predictions_exact: "Exact +3 pts",
    predictions_partial: "Winner +1 pt",
    predictions_wrong: "Wrong 0 pts",
    predictions_real: "Real:",

    // LeaderboardView
    leaderboard_title: "Standings",
    leaderboard_subtitle: "Competitive ranking by session",
    leaderboard_yourRank: "Your Rank in this group:",
    leaderboard_selectGroup: "Select Group / Session",
    leaderboard_empty: "No registered participants in this session yet.",
    leaderboard_gold: "Gold",
    leaderboard_silver: "Silver",
    leaderboard_bronze: "Bronze",
    leaderboard_you: "You",
    leaderboard_restTitle: "Other Participants",

    // MatchDetailView
    matchDetail_title: "Match Detail",
    matchDetail_closed: "PREDICTIONS CLOSED",
    matchDetail_closesIn: "Closes in: {time}",
    matchDetail_home: "Home",
    matchDetail_away: "Away",
    matchDetail_viewSquad: "View Squad",
    matchDetail_live: "Match in progress",
    matchDetail_registeredPrediction: "Your registered prediction",
    matchDetail_enterPrediction: "Enter your prediction",
    matchDetail_successSaved: "Prediction saved successfully!",
    matchDetail_btnSave: "Save Prediction",
    matchDetail_btnUpdate: "Update Prediction",
    matchDetail_btnSaving: "Saving...",
    matchDetail_pointsEarned: "Points earned:",
    matchDetail_marketProbTitle: "Market Probabilities",
    matchDetail_marketProbSubtitle:
      "Algorithmic calculation based on betting odds",
    matchDetail_draw: "Draw",
    matchDetail_recentMatches: "Last matches of {team}",
    matchDetail_noData: "No data available",
    matchDetail_h2hTitle: "Head-to-Head History (H2H)",
    matchDetail_winner: "Winner:",
    matchDetail_tacticsTitle: "Starting Tactical Formations",
    matchDetail_timelineTitle: "Match Timeline",
    matchDetail_pendingTeams: "Teams pending qualification",

    // MatchCard
    card_predicted: "Predicted",
    card_live: "Live",
    card_finished: "Finished",
    card_tbd: "TBD",
    card_closed: "Closed",
    card_open: "Open",
    card_teamsPending: "Teams\npending",
    card_teamsPendingConfirm: "Teams to be confirmed",
    card_inProgress: "In progress",
    card_exact: "Exact +3 pts",
    card_partial: "Winner +1 pt",
    card_wrong: "0 pts",
    card_noPrediction: "No prediction",
    card_closedNoPrediction: "Closed no bet",
    card_btnSave: "Save",
    card_btnUpdate: "Update",
    card_notStarted: "Not started",
    card_modify: "Edit",
    card_yourBet: "Your bet",

    // TeamView
    team_badge: "National Team",
    team_coachPrefix: "Coach:",
    team_noCoach: "Not specified",
    team_tournamentId: "Tournament ID:",
    team_squadTitle: "Squad List",
    team_posGK: "Goalkeepers",
    team_posDF: "Defenders",
    team_posMF: "Midfielders",
    team_posFW: "Forwards",
    team_posOther: "Other positions",
    team_native: "Native",
    team_loading: "Loading team squad...",
    team_errorTitle: "Something went wrong",
    team_errorMsg: "No data found for this team.",

    // GroupCard
    group_noDescription: "No description",
    group_btnInvite: "Invite",
    group_btnCopied: "Copied!",
    group_btnAddUser: "Add User",
    group_btnDelete: "Delete",
    group_btnDeleting: "Deleting...",
    group_confirmDelete:
      'Are you sure you want to delete the group "{name}"? This action cannot be undone.',
    group_errDelete: "Error deleting the group. Please try again.",
    group_membersTitle: "Group Members ({count})",
    group_emptyMembers: "No participants have joined this group yet.",
    group_loadingMembers: "Loading participants...",
    group_modalTitle: "Add Users",
    group_modalSearch: "Search user...",
    group_modalLoading: "Loading users...",
    group_modalAllInGroup: "All users are already in the group.",
    group_modalNoResults: "No results for your search.",
    group_modalSelectedOne: "1 selected",
    group_modalSelectedMany: "{n} selected",
    group_modalSelectedNone: "None selected",
    group_btnCancel: "Cancel",
    group_btnAdd: "Add",
    group_btnAdding: "Adding...",

    // MotivationalBanner
    banner_badge: "OFFICIAL RULES",
    banner_title: "Complete your predictions on time!",
    banner_descPart1: "Matches are automatically locked",
    banner_descBold: "15 minutes before",
    banner_descPart2: "the official start time. Earn",
    banner_descPart3: "for an exact score or",
    banner_descPart4: " for a correct winner/draw.",
    banner_exactPoints: "3 points",
    banner_partialPoints: "1 point",
    banner_exactLabel: "Exact",
    banner_partialLabel: "Partial",

    // AdminConsoleView
    admin_tabUsers: "Participants",
    admin_tabGroups: "Groups & Stages",
    admin_searchPlaceholder: "Search user by name or email...",
    admin_loadingUsers: "Loading user database...",
    admin_noUsers: "No users found.",
    admin_staffBadge: "Staff",
    admin_defaultName: "No name",
    admin_createGroupTitle: "Create New Group / Stage",
    admin_labelGroupName: "Group Name",
    admin_placeholderGroupName: "E.g.: Group A, Round of 16",
    admin_labelGroupDesc: "Description (Optional)",
    admin_placeholderGroupDesc: "E.g.: Initial group stage",
    admin_successGroup: "Group successfully added/deleted in the database!",
    admin_btnCreateGroup: "Confirm & Create Group",
    admin_btnSavingGroup: "Saving to Firebase...",
    admin_existingGroups: "Registered Groups & Stages",
    admin_loadingGroups: "Loading official groups list...",
    admin_noGroups: "No groups have been created yet in Firestore.",
  },
} as const;

export type TranslationKey = keyof typeof translations.es;

export function localizeGroupOrStage(value: string, lang: Lang): string {
  if (lang === "es") return value;
  if (value.startsWith("Grupo ")) return value.replace("Grupo ", "Group ");
  const map: Record<string, string> = {
    "Fase de Grupos": "Group Stage",
    "Octavos de Final": "Round of 16",
    "Dieciseisavos de Final": "Round of 32",
    "Cuartos de Final": "Quarter-finals",
    "Semifinal": "Semi-finals",
    "Tercer Puesto": "Third Place",
    "Final": "Final",
  };
  return map[value] ?? value;
}

export function createTranslator(lang: Lang) {
  return function t(
    key: TranslationKey,
    params?: Record<string, string | number>,
  ): string {
    let str = translations[lang][key] as string;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };
}
