
// Input sanitization utilities
export function sanitizeString(input: string, maxLength: number = 50): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ""); // Remove HTML-like characters
}

export function sanitizeNickname(nickname: string): string {
  return sanitizeString(nickname, 20);
}

export function validateRoomId(roomId: unknown): roomId is string {
  return typeof roomId === "string" && /^[a-f0-9-]{36}$/.test(roomId);
}

export function validatePlayerId(playerId: unknown): playerId is string {
  return typeof playerId === "string" && /^[a-f0-9-]{36}$/.test(playerId);
}
