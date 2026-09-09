export const environment = {
  production: false,
  googleAnalyticsId: '',
  // Local backend. `docker compose up` in pokemon-roulette-backend serves this,
  // and its CORS allowlist includes http://localhost:4200.
  apiBaseUrl: 'http://localhost:8080',
};
