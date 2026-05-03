/**
 * uploadApi.js — Fixed to handle NDJSON streaming response from backend.
 *
 * The backend streams progress events as newline-delimited JSON.
 * We must use fetch() with ReadableStream, not axios, to read each chunk.
 *
 * @param {Object}   options
 * @param {File}     options.pdfFile     - Contract PDF/DOCX/TXT (optional)
 * @param {File}     options.imageFile   - Clause screenshot (optional)
 * @param {Function} options.onStep      - Called with step name as each stage completes
 *                                         e.g. onStep("extracting") / onStep("chunking")
 * @returns {Promise<Object>}            - Final result object from backend
 */
export async function uploadFiles({ pdfFile, imageFile, onStep }) {
  const form = new FormData();
  if (pdfFile)   form.append("pdf_file",   pdfFile);
  if (imageFile) form.append("image_file", imageFile);

  // Use fetch() — axios cannot stream NDJSON line-by-line
  const response = await fetch("/api/upload", {
    method: "POST",
    body: form,
    // Do NOT set Content-Type — browser sets it automatically with boundary for FormData
  });

  if (!response.ok) {
    // Try to parse error detail from FastAPI
    let errorMsg = `Upload failed: HTTP ${response.status}`;
    try {
      const errData = await response.json();
      if (errData?.detail) {
        errorMsg = Array.isArray(errData.detail)
          ? errData.detail.map((d) => d.msg).join(", ")
          : String(errData.detail);
      } else if (errData?.message) {
        errorMsg = errData.message;
      }
    } catch (_) {
      // ignore JSON parse error, use default message
    }
    throw new Error(errorMsg);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let finalResult = null;

  // Read the stream chunk by chunk
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Each line in the buffer is a complete JSON object (NDJSON)
    const lines = buffer.split("\n");
    // Keep the last incomplete line in the buffer
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let parsed;
      try {
        parsed = JSON.parse(trimmed);
      } catch (e) {
        console.warn("Could not parse stream line:", trimmed);
        continue;
      }

      if (parsed.step && typeof onStep === "function") {
        // Notify the UI of the current processing step
        onStep(parsed.step);
      }

      if (parsed.error) {
        throw new Error(parsed.error);
      }

      if (parsed.result) {
        finalResult = parsed.result;
      }
    }
  }

  // Handle any remaining data in buffer after stream ends
  if (buffer.trim()) {
    try {
      const parsed = JSON.parse(buffer.trim());
      if (parsed.result) finalResult = parsed.result;
      if (parsed.error) throw new Error(parsed.error);
    } catch (_) {
      // ignore
    }
  }

  if (!finalResult) {
    throw new Error("No result received from server. The file may have failed to process.");
  }

  return finalResult;
}