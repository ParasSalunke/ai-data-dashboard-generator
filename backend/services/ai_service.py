import json
import os
import logging
import re
import asyncio
from typing import Any, Literal

from pydantic import BaseModel

logger = logging.getLogger(__name__)


class Insight(BaseModel):
    title: str
    content: str
    type: Literal["trend", "anomaly", "correlation", "summary", "recommendation"]


class InsightsOutput(BaseModel):
    insights: list[Insight]


class AIService:

    def __init__(self) -> None:
        self.mock_mode = str(os.getenv("MOCK_AI", "false")).lower() in ("true", "1", "yes", "on")
        
        api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
        
        if self.mock_mode:
            self.client = None
            logger.info("MOCK_AI enabled — AI features will use placeholders")
        elif api_key and api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                self.client: Any = genai.Client(api_key=api_key)
                self._model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
                self._fallback_models = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-3.8-flash"]
                if self._model not in self._fallback_models:
                    self._candidate_models = [self._model] + self._fallback_models
                else:
                    self._candidate_models = [self._model] + [m for m in self._fallback_models if m != self._model]
                logger.info(f"Gemini client initialized (primary: {self._model}, candidates: {self._candidate_models})")
            except ImportError:
                self.client = None
                logger.warning("google-genai package not installed — run: pip install google-genai")
        else:
            self.client = None
            logger.warning("GEMINI_API_KEY not configured — AI features use placeholders")

    async def generate_insights(self, dataset_summary: dict) -> list[dict]:
        if not self.client:
            return self._placeholder_insights(dataset_summary)
        prompt = self._build_insights_prompt(dataset_summary)
        
        from google.genai import types as genai_types

        system = (
            "You are a senior data analyst. Generate exactly 5 specific, actionable "
            "business insights from the dataset summary. Each insight MUST reference "
            "actual statistics from the provided data. Never invent numbers. "
            "Respond ONLY with valid JSON matching this schema exactly:\n"
            '{"insights": [{"title": "string", "content": "string", '
            '"type": "trend|anomaly|correlation|summary|recommendation"}, ...]}'
        )

        candidate_models = getattr(self, "_candidate_models", [getattr(self, "_model", "gemini-3.5-flash")])
        last_error = None

        for model_name in candidate_models:
            try:
                response = await asyncio.to_thread(
                    self.client.models.generate_content,
                    model=model_name,
                    contents=prompt,
                    config=genai_types.GenerateContentConfig(
                        system_instruction=system,
                        temperature=0.3,
                        response_mime_type="application/json",
                    ),
                )

                raw = response.text.strip()
                # Strip markdown code fences if present
                raw = re.sub(r"^```(?:json)?\s*", "", raw)
                raw = re.sub(r"\s*```$", "", raw)

                data = json.loads(raw)
                parsed = InsightsOutput(**data)
                return [i.model_dump() for i in parsed.insights]

            except Exception as e:
                last_error = e
                logger.warning(f"Gemini insights error with {model_name}: {e}. Trying next candidate.")
                continue

        logger.error(f"All Gemini models failed for insights: {last_error}")
        return self._placeholder_insights(dataset_summary)

    async def answer_question(self, dataset_summary: dict, question: str, raw_csv: str = None) -> dict:
        if not self.client:
            msg = "AI Q&A requires GEMINI_API_KEY. Please set it in backend/.env.local"
            return {
                "answer": msg,
                "chart": None,
            }
        try:
            from google.genai import types as genai_types
            import tempfile
            import os

            system = (
                "You are an expert data analyst. You have access to both dataset summary statistics and raw data. "
                "Answer questions about the dataset as accurately as possible. If the question requires looking at "
                "the raw data, do so. Cite actual numbers, find correlations, or point out specific rows if asked. "
                "Be concise, specific, and highly accurate. Keep answers under 200 words."
            )
            # Use raw_csv as a file to prevent token limit errors
            prompt = self._build_qa_prompt(dataset_summary, question, None)
            contents = [prompt]
            
            uploaded_file = None
            tmp_path = None
            if raw_csv:
                fd, tmp_path = tempfile.mkstemp(suffix=".csv")
                with os.fdopen(fd, 'w', encoding='utf-8') as f:
                    f.write(raw_csv)
                uploaded_file = await asyncio.to_thread(self.client.files.upload, file=tmp_path)
                contents.insert(0, uploaded_file)

            try:
                candidate_models = getattr(self, "_candidate_models", [getattr(self, "_model", "gemini-3.5-flash")])
                response = None
                last_err = None
                for model_name in candidate_models:
                    try:
                        response = await asyncio.to_thread(
                            self.client.models.generate_content,
                            model=model_name,
                            contents=contents,
                            config=genai_types.GenerateContentConfig(
                                system_instruction=system,
                                temperature=0.2,
                                max_output_tokens=500,
                            ),
                        )
                        if response and response.text:
                            break
                    except Exception as err:
                        last_err = err
                        logger.warning(f"Gemini Q&A error with {model_name}: {err}. Trying fallback.")
                        continue

                if not response or not response.text:
                    logger.error(f"All Gemini models failed for Q&A: {last_err}")
                    return {"answer": "I'm having trouble analyzing the data right now. Please try again shortly.", "chart": None}

                return {"answer": response.text, "chart": None}
            finally:
                if uploaded_file:
                    try:
                        await asyncio.to_thread(self.client.files.delete, name=uploaded_file.name)
                    except Exception:
                        pass
                if tmp_path and os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except Exception:
                        pass

        except Exception as e:
            logger.error(f"Gemini Q&A error: {e}")
            return {"answer": "Sorry, I cannot answer due to a temporary problem. Please try again.", "chart": None}

    # ── prompt builders ────────────────────────────────────────────────────

    def _build_insights_prompt(self, summary: dict) -> str:
        lines = [
            f"Dataset: {summary.get('row_count', '?')} rows × {summary.get('col_count', '?')} columns",
            "",
            "Columns:",
        ]
        for col in summary.get("columns", []):
            line = f"  - {col['name']} ({col['dtype']}, {col.get('null_pct', 0)}% null)"
            if "stats" in col:
                s = col["stats"]
                line += f": mean={s.get('mean')}, min={s.get('min')}, max={s.get('max')}, std={s.get('std')}"
            elif "top_values" in col:
                top = list(col["top_values"].items())[:3]
                line += f": top = {top}"
            elif "date_range" in col:
                line += f": {col['date_range']}"
            lines.append(line)
        lines += [
            "",
            "Generate exactly 5 insights. Each must reference specific numbers from above.",
            "Types: trend | anomaly | correlation | summary | recommendation",
        ]
        return "\n".join(lines)

    def _build_qa_prompt(self, summary: dict, question: str, raw_csv: str = None) -> str:
        col_lines = []
        for col in summary.get("columns", []):
            line = f"  - {col['name']} ({col['dtype']})"
            if "stats" in col:
                s = col["stats"]
                line += f": mean={s.get('mean')}, range=[{s.get('min')}, {s.get('max')}]"
            elif "top_values" in col:
                top = list(col["top_values"].items())[:3]
                line += f": top values = {top}"
            col_lines.append(line)

        prompt = (
            f"Dataset: {summary.get('row_count', '?')} rows × {summary.get('col_count', '?')} columns\n"
            "Columns:\n" + "\n".join(col_lines) + "\n\n"
            f"Question: {question}\n\n"
        )
        
        if raw_csv:
            prompt += "--- RAW DATA (FULL OR SAMPLE) ---\n"
            prompt += raw_csv + "\n\n"
            prompt += "Answer the user's question using the raw data provided above. Be accurate and concise."
        else:
            prompt += "Answer based ONLY on the data above. Be concise."
            
        return prompt

    def _placeholder_insights(self, summary: dict) -> list[dict]:
        cols = summary.get("columns", [])
        numeric = [c for c in cols if c["dtype"] == "numeric"]
        categorical = [c for c in cols if c["dtype"] == "categorical"]
        datetime_cols = [c for c in cols if c["dtype"] == "datetime"]
        bool_cols = [c for c in cols if c["dtype"] == "boolean"]
        rows = summary.get("row_count", "?")
        n_cols = summary.get("col_count", "?")

        insights: list[dict] = []

        # 1. Overview
        col_breakdown = []
        if numeric:
            col_breakdown.append(f"{len(numeric)} numeric")
        if categorical:
            col_breakdown.append(f"{len(categorical)} categorical")
        if datetime_cols:
            col_breakdown.append(f"{len(datetime_cols)} datetime")
        if bool_cols:
            col_breakdown.append(f"{len(bool_cols)} boolean")
        insights.append({
            "title": "Dataset Overview",
            "content": (
                f"This dataset contains {rows:,} rows across {n_cols} columns "
                f"({', '.join(col_breakdown)})."
            ),
            "type": "summary",
        })

        # 2-3. Numeric column stats
        for col in numeric[:2]:
            s = col.get("stats", {})
            if s and s.get("mean") is not None:
                mean = round(s["mean"], 2)
                mn = s.get("min")
                mx = s.get("max")
                std = round(s.get("std") or 0, 2)
                name = col["name"].replace("_", " ").title()
                insights.append({
                    "title": f"{name} Distribution",
                    "content": (
                        f"{name} ranges from {mn:,} to {mx:,} "
                        f"with a mean of {mean:,} and std deviation of {std:,}."
                    ),
                    "type": "trend",
                })

        # 4. Top category
        for col in categorical[:2]:
            tv = col.get("top_values", {})
            if tv:
                top_item = next(iter(tv.items()))
                name = col["name"].replace("_", " ").title()
                pct = round(top_item[1] / max(rows, 1) * 100, 1)
                insights.append({
                    "title": f"Top {name}",
                    "content": (
                        f"'{top_item[0]}' is the most common {name}, "
                        f"appearing {top_item[1]} times ({pct}% of records)."
                    ),
                    "type": "summary",
                })
            if len(insights) >= 4:
                break

        # 5. Datetime range
        for col in datetime_cols[:1]:
            dr = col.get("date_range")
            if dr:
                name = col["name"].replace("_", " ").title()
                insights.append({
                    "title": f"{name} Range",
                    "content": f"Records span the period: {dr}.",
                    "type": "trend",
                })

        # Pad if fewer than 5 (Removed placeholder recommendation)

        return insights[:5]
