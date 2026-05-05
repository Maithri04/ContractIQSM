import client from "./axios";

export async function getHistory() {
  const { data } = await client.get("/api/history");
  return data;
}

export async function getHistoryItem(hash) {
  const { data } = await client.get(`/api/history/${hash}`);
  return data;
}

export function getFileUrl(hash) {
  return `http://127.0.0.1:8080/api/history/${hash}/file`;
}

export async function deleteHistory(hash) {
  const { data } = await client.delete(`/api/history/${hash}`);
  return data;
}

export async function updateHistory(hash, payload) {
  const { data } = await client.put(`/api/history/${hash}`, payload);
  return data;
}

export async function generateSummary(hash) {
  const { data } = await client.post(`/api/history/${hash}/summary`);
  return data;
}