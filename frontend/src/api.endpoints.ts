export const ApiEndpoints = {
  // Admin-Routen
  ADMIN_EVENT: '/api/admin/event',
  ADMIN_UPDATE_EVENT: '/api/admin/event',
  ADMIN_EVENTS: '/api/admin/events',
  ADMIN_ENEMIES: '/api/admin/enemies',
  ADMIN_ENEMY_BY_ID: (id: number) => `/api/admin/enemy/${id}`,

  // Öffentliche Routen (ohne Login)
  PUBLIC_ENEMIES: '/api/public/game-client/enemies',
  PUBLIC_ACTIVE_ENEMIES: '/api/public/game-client/active-enemies',
  PUBLIC_ENEMY_BY_ID: (id: number) => `/api/public/game-client/enemy/${id}`,

  // Authentifizierungs-Routen
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_CHECK: '/api/auth/check',

  // Discord Bot (Umfragen)
  START_SURVEY: '/api/discord-bot/startQuestionnaire',   // POST
  END_SURVEY: '/api/discord-bot/endQuestionnaire',      // POST
  ALL_SURVEYS: '/api/discord-bot/allQuestionnaires',     // GET
  SURVEY_RESULTS: (questionnaireID: number) => `/api/discord-bot/results/${questionnaireID}`, // GET
};
