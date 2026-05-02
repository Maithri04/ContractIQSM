import client from "./axios";

export async function askQuestion(question) {
  const { data } = await client.post("/api/ask", { question });
  return data;
}