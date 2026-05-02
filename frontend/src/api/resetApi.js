import client from "./axios";

export async function resetSystem() {
  const { data } = await client.post("/api/reset");
  return data;
}
