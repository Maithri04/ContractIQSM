🚀 ContractIQSM


https://github.com/user-attachments/assets/4662d26c-9bd7-4272-bb61-c7b4b9bb5989



🧠 Smart AI Contract Intelligence System

ContractIQSM is an AI-powered platform that helps users analyze, understand, and interact with legal contracts effortlessly.
It combines OCR, Retrieval-Augmented Generation (RAG), and LLMs to transform complex legal documents into clear insights, risk analysis, and actionable decisions.

---

🎯 Problem Statement

Legal contracts are:

- ❌ Difficult to understand for non-legal users
- ❌ Filled with complex language and hidden clauses
- ❌ Hard to compare across multiple documents
- ❌ Risky without proper analysis

👉 Most users sign contracts without fully understanding the implications.

---

💡 Solution

ContractIQSM solves this by:

- Converting contracts (PDF/images) into readable text
- Using AI to analyze risks and clauses
- Allowing users to ask questions like ChatGPT
- Enabling comparison of multiple contracts
- Generating real-world scenarios (If–Then analysis)

👉 Making contracts simple, transparent, and decision-friendly

---

⚙️ Features

📄 Upload & Analyze

- Upload PDFs or images
- OCR-based text extraction (EasyOCR)
- AI-powered risk scoring
- Clause-level understanding

---

🤖 AI Chat Assistant

- Ask questions about your contract
- Get instant, contextual answers
- Works like ChatGPT but contract-specific

---

🔍 Compare Contracts

- Upload multiple files
- Compare clauses across documents
- Identify risky differences

---

🧠 If–Then Scenario Generator

- Generate real-world questions:
  - “What if I leave early?”
  - “What happens if payment is delayed?”
- AI provides contextual answers

---

📂 History 

- Stores previously uploaded files
- Summarizes saved files 

---

🔐 Privacy Focused

- Local storage-based caching
- User-controlled deletion
- No unnecessary data exposure

---

⚙️ Workflow

User Uploads File
        ↓
Text Extraction
  (PDF → PyMuPDF)
  (Image → OCR)
        ↓
Text Chunking
        ↓
Embeddings (MiniLM)
        ↓
FAISS Vector Storage
        ↓
AI Processing (LLM)
        ↓
Output:
- Risk Analysis
- Summary
- Q&A
- Scenarios
- Comparison

---

🧱 Tech Stack

🔧 Backend

- FastAPI
- PaddleOCR
- PyMuPDF
- Sentence Transformers (MiniLM)
- FAISS
- LLM (Groq / OpenAI compatible)

---

🎨 Frontend

- React.js
- Tailwind CSS
- Axios

---

⚙️ Tools & Concepts

- RAG (Retrieval-Augmented Generation)
- OCR (Optical Character Recognition)
- Vector Search
- Async APIs

---

🚀 How to Run the Project

---

1️⃣ Clone Repository

git clone https://github.com/your-username/ContractIQSM.git
cd ContractIQSM

---

🔧 Backend Setup

cd backend
pip install -r requirements.txt

▶️ Run Backend

uvicorn main:app --port 8080

👉 Backend runs on:
"http://127.0.0.1:8000"

---

🔑 Environment Variables

Create ".env" file in backend folder:

GROQ_API_KEY=your_api_key
LLM_MODEL=llama-3.1-8b-instant
LLM_PROVIDER=groq

---

🎨 Frontend Setup

cd frontend
npm install

▶️ Run Frontend

npm start

👉 Frontend runs on:
"http://localhost:3000"

---

🔗 API Connection

Ensure one of the following:

Option 1 (Recommended):

"proxy": "http://127.0.0.1:8080"

OR

Option 2:

baseURL: "http://127.0.0.1:8000"

---

📸 Screenshots
<img width="700" height="400" alt="Screenshot 2026-05-06 002556" src="https://github.com/user-attachments/assets/a36509fa-211d-4dc9-8f13-5a8a16102a61" />
<img width="700" height="400" alt="Screenshot 2026-05-06 002631" src="https://github.com/user-attachments/assets/6e8551f7-1585-48aa-a09e-0a64b87ba85f" />
<img width="700" height="400" alt="Screenshot 2026-05-06 002824" src="https://github.com/user-attachments/assets/92dce6f8-fca1-4714-8eb3-4f251c2f1b6d" />
<img width="700" height="400" alt="Screenshot 2026-05-06 002910" src="https://github.com/user-attachments/assets/1bc900ea-4504-43ad-bab9-2be3af44891d" />
<img width="700" height="400" alt="Screenshot 2026-05-06 002918" src="https://github.com/user-attachments/assets/8473f171-43c9-46ff-8f0d-e7eedac2c507" />
<img width="700" height="400" alt="Screenshot 2026-05-06 002957" src="https://github.com/user-attachments/assets/9a66e9bf-07a9-41ed-a944-d7dfec59e457" />
<img width="700" height="400" alt="Screenshot 2026-05-06 003006" src="https://github.com/user-attachments/assets/dfa11f30-9b36-4973-8db6-1ad8af3a0faf" />



---

💡 Unique Highlights

- 🔥 AI + Legal Intelligence combined
- ⚡ Fast processing with caching
- 🧠 Scenario-based reasoning
- 📊 Multi-contract comparison
- 🤖 Interactive chatbot

---

🎯 Future Enhancements

- Contract negotiation simulator
- Risk visualization dashboard
- Multi-language support
- Cloud storage integration

---

👨‍💻 Author

Maithri M

---

⭐ Support

If you found this useful:
👉 Star ⭐ this repository
👉 Share with others

---
