// Utilitário para obter a URL base do backend a partir do .env do Vite
export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001';

export function getCharacterAvatarUrl(avatarUrl) {
  if (!avatarUrl) return '';
  if (/^https?:\/\//.test(avatarUrl)) return avatarUrl;
  // Garante barra única entre base e path
  return `${BACKEND_BASE_URL.replace(/\/$/, '')}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
}
