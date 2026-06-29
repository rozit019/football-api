const API_URL = "https://web-production-12ce1.up.railway.app/api";

export const fetchGames = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/games?${query}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

export const fetchTodayGames = async () => {
  const response = await fetch(`${API_URL}/games/today`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

export const fetchLiveGames = async () => {
  const response = await fetch(`${API_URL}/games/live`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};
