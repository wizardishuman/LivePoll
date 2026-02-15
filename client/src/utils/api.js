import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Browser fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  return btoa(fingerprint);
};

export const createPoll = async (pollData) => {
  const response = await api.post('/polls', pollData);
  return response.data;
};

export const getPoll = async (pollId) => {
  const response = await api.get(`/polls/${pollId}`);
  return response.data;
};

export const vote = async (pollId, optionIndex) => {
  const fingerprint = generateFingerprint();
  const response = await api.post(`/votes/${pollId}`, { optionIndex }, {
    headers: {
      'X-Fingerprint': fingerprint
    }
  });
  return response.data;
};
