import axios from "axios";

const client = axios.create({
  baseURL: "http://127.0.0.1:8080",
  timeout: 300000,    // 5 min for OCR + embedding
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    let msg = err?.response?.data?.message || err?.message || "Unexpected error";
    if (err?.response?.data?.detail) {
      if (Array.isArray(err.response.data.detail)) {
        msg = err.response.data.detail.map(d => d.msg).join(", ");
      } else if (typeof err.response.data.detail === "string") {
        msg = err.response.data.detail;
      } else {
        msg = JSON.stringify(err.response.data.detail);
      }
    }
    return Promise.reject(new Error(msg));
  }
);

export default client;