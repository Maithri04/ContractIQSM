import client from "./axios";

export async function uploadFiles({ pdfFile, imageFile }) {
  const form = new FormData();
  if (pdfFile)   form.append("pdf_file",   pdfFile);
  if (imageFile) form.append("image_file", imageFile);
  const { data } = await client.post("/api/upload", form);
  return data;
}

export async function askQuestion(question) {
  const { data } = await client.post("/api/ask", { question });
  return data;
}