// src/services/api.js
const API_URL = 'https://plant-monitor-api.onrender.com';

export async function getSensorData(limit = 50) {
  const response = await fetch(`${API_URL}/api/sensor-data?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch sensor data');
  return response.json();
}

export async function getLatestReading() {
  const response = await fetch(`${API_URL}/api/readings/latest`);
  if (!response.ok) throw new Error('Failed to fetch latest reading');
  return response.json();
}