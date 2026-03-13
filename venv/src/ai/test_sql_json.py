import google.generativeai as genai
from .base import AIPlatform
from dotenv import load_dotenv
import json

load_dotenv()


class SQLtoER(AIPlatform):
    def __init__(self, api_key: str, structure_sql_ai_systemprompt: str = None):
        self.api_key = api_key

        genai.configure(api_key=self.api_key)

        self.model = genai.GenerativeModel(
            "gemini-2.5-flash",
            system_instruction=structure_sql_ai_systemprompt,
            generation_config={
                "temperature": 0,
                "top_p": 1,
                "top_k": 1,
                "response_mime_type": "application/json"
            }
        )

    def chat(self, prompt: str):
        response = self.model.generate_content(prompt)

        output = "".join(p.text for p in response.candidates[0].content.parts)

        try:
            return json.loads(output)

        except Exception:
            raise ValueError(f"Model did not return valid JSON:\n{output}")
