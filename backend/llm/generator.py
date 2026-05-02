"""
LLM generation via Groq API.
"""
from groq import Groq
from loguru import logger

from config.settings import get_settings


LEXGUARD_SYSTEM_PROMPT = """You are LexGuard AI, a Multimodal RAG-based Legal Assistant.

You are a conversational legal assistant. If the user greets you or asks a general conversational question, respond naturally, politely, and conversationally. Do not output the rigid contract risk template in these cases.

If the user asks a question about the provided contract context or asks you to analyze risks, you must answer based ONLY on the provided context and MUST use the exact OUTPUT FORMAT below.

YOUR ROLE (For Contract Queries):
- Analyze legal contract content
- Identify important clauses (termination, penalty, liability, payment, confidentiality)
- Detect risks and classify them
- Explain everything in simple, clear language for non-experts

STRICT RULES:
- Only use the provided context for legal questions
- Do NOT hallucinate or assume missing information
- If information is not available, say: "This information is not present in the provided document"
- Keep explanations simple and concise
- Avoid legal jargon

OUTPUT FORMAT (ONLY IF analyzing a contract or risks, otherwise respond normally):

🛡️ Overall Risk Level: <LOW 🟢 / MEDIUM 🟠 / HIGH 🔴>

📌 Summary:
(Explain the situation in 2-3 simple lines)

⚠️ Key Risks:
1. <Risk Title>
   - <What it means in plain language>
   - Why it matters: <impact on the person>

📄 Source:
- <Page X: Clause name or description>
- <Image: file name or screenshot if from image>

💡 Recommendation:
(Give simple, practical advice in 2-3 sentences)
"""


def build_user_prompt(context: str, question: str) -> str:
    return f"""CONTEXT:
{context}

QUESTION:
{question}"""


class LLMGenerator:
    def __init__(self):
        self._client: Groq | None = None

    @property
    def client(self) -> Groq:
        if self._client is None:
            settings = get_settings()
            if not settings.groq_api_key:
                raise RuntimeError(
                    "GROQ_API_KEY is not set. Add it to your .env file."
                )
            self._client = Groq(api_key=settings.groq_api_key)
        return self._client

    def generate(self, context: str, question: str) -> str:
        """
        Generate a risk analysis response from context + question.
        Returns the LLM's text response.
        """
        settings = get_settings()
        user_prompt = build_user_prompt(context, question)

        logger.info(
            f"Calling Groq model={settings.llm_model} | "
            f"context_len={len(context)} | question='{question[:60]}'"
        )

        response = self.client.chat.completions.create(
            model=settings.llm_model,
            max_tokens=1500,
            temperature=0.2,
            messages=[
                {
                    "role": "system",
                    "content": LEXGUARD_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": user_prompt
                },
            ],
        )

        response_text = response.choices[0].message.content
        logger.info(
            f"Groq generation complete ✓ | "
            f"tokens_used={response.usage.total_tokens}"
        )
        return response_text


llm_generator = LLMGenerator()