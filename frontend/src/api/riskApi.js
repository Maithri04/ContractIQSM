import client from "./axios";

export async function getRiskScore(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await client.post("/api/risk-score", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}