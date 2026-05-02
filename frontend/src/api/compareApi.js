import client from "./axios";

export async function compareContracts(files) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f.file));
  const { data } = await client.post("/api/compare", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}