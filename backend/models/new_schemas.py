"""
Additional Pydantic schemas for Compare, Risk Scoring, and Scenarios features.
Paste these into your existing models/schemas.py at the bottom.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


# ── Compare ───────────────────────────────────────────────────────────────────

class ContractClauseData(BaseModel):
    contract_name: str
    penalty: str
    termination: str
    liability: str
    risk_level: str
    risk_score: int


class CompareResponse(BaseModel):
    success: bool
    data: List[ContractClauseData]
    ui_text: str
    comparison_summary: str
    safest_contract: Optional[str] = None
    riskiest_contract: Optional[str] = None


# ── Risk Scoring ──────────────────────────────────────────────────────────────

class RiskBreakdown(BaseModel):
    clause: str
    weight: int
    found: bool
    excerpt: str
    contribution: int


class RiskScoreData(BaseModel):
    score: int
    level: str
    breakdown: List[RiskBreakdown]


class RiskScoreResponse(BaseModel):
    success: bool
    data: RiskScoreData
    ui_text: str


# ── Scenarios ─────────────────────────────────────────────────────────────────

class ScenarioResponse(BaseModel):
    success: bool
    questions: List[str]
    answers: Dict[str, str]
    ui_text: str