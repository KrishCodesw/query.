import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.ai.gemini import Gemini
from src.ai.querycorrector import QueryCorrector
from src.ai.queryexplainer import QueryExplainer
from src.ai.test_sql_json import SQLtoER
from typing import List, Optional
from dotenv import load_dotenv
load_dotenv()

#Load system prompt 
def load_system_prompt():
    base_dir=os.path.dirname(os.path.abspath(__file__))
    prompt_path=os.path.join(base_dir,"prompts","system_prompt.md")
    with open(prompt_path,encoding="utf-8") as f:
        return f.read()

system_prompt=load_system_prompt()

gemini_api_key = os.getenv("GEMINI_API_KEY")

# gemini = Gemini(api_key=gemini_api_key, system_prompt=system_prompt)

ai_platform=Gemini(api_key=gemini_api_key,system_prompt=system_prompt)


#Load query corrector prompt 

def load_query_corrector_prompt():
    base_dir=os.path.dirname(os.path.abspath(__file__))
    prompt_path=os.path.join(base_dir,"prompts","query_correctorsystemprompt.md")
    with open(prompt_path,encoding="utf-8") as f:
        return f.read()
    
querycorrector_prompt=load_query_corrector_prompt()

query_corrector_platform = QueryCorrector(api_key=gemini_api_key, query_correctorsystemprompt=querycorrector_prompt)

def load_query_explainer_system_prompt():
        base_dir=os.path.dirname(os.path.abspath(__file__))
        prompt_path=os.path.join(base_dir,"prompts","queryexplainer_systemprompt.md")
        with open(prompt_path,encoding="utf-8") as f:
            return f.read()

queryexplainer_prompt=load_query_explainer_system_prompt()
query_explainer_platform=QueryExplainer(api_key=gemini_api_key,queryexplainer_systemprompt=queryexplainer_prompt)

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins (change to ["http://localhost:3000"] for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    response: str


@app.get("/")
async def root():
    return {"message":"This API is working"}

@app.post("/chat",response_model=ChatResponse)
async def chat(request:ChatRequest):
    response_text=ai_platform.chat(request.prompt)
    return ChatResponse(response=response_text)



class QueryCorrectorRequest(BaseModel):
    sql_query: str


class QueryCorrectorResponse(BaseModel):
    original_query: str
    corrected_query: str
    type: str 
    changes_made: List[str]
    risk_level: str 
    confidence: Optional[float]


@app.post("/correctquery", response_model=QueryCorrectorResponse)
async def correct_query(request: QueryCorrectorRequest):
    result =  query_corrector_platform.chat(request.sql_query)

    if not isinstance(result, dict):
        raise ValueError("QueryCorrector did not return a valid dict response")

    return QueryCorrectorResponse(**result)



class QueryExplainerRequest(BaseModel):
    sql_query: str

class SummaryModel(BaseModel):
    purpose: str
    complexity_level: str

class AggregationModel(BaseModel):
    grouping_criteria: str
    metrics_calculated: str

class DetailedAnalysisModel(BaseModel):
    tables_involved: List[str]
    filters_applied: List[str]
    joins: List[str]
    aggregation: AggregationModel
    final_output: str

class QueryExplainerResponse(BaseModel):
    summary: SummaryModel
    detailed_analysis: DetailedAnalysisModel
    risks_and_notes: List[str]


@app.post("/explainquery",response_model=QueryExplainerResponse)
async def explainquery(request:QueryExplainerRequest):
    result=query_explainer_platform.chat(request.sql_query)
    if not isinstance(result, dict):
        raise ValueError("QueryExplainer did not return a valid dict response")

    return QueryExplainerResponse(**result)


def load_Sqltoer_system_prompt():
        base_dir=os.path.dirname(os.path.abspath(__file__))
        prompt_path=os.path.join(base_dir,"prompts","structure_sql_ai_systemprompt.md")
        with open(prompt_path,encoding="utf-8") as f:
            return f.read()

sqltoer_prompt=load_Sqltoer_system_prompt()
sqltoer_platform=SQLtoER(api_key=gemini_api_key,structure_sql_ai_systemprompt=sqltoer_prompt)

class SQLStructureRequest(BaseModel):
    sql_ddl: str

class EntityModel(BaseModel):
    name: str
    type: str
    attributes: List[Dict[str, Any]]
    ownerEntity: Optional[str] = None

class RelationshipModel(BaseModel):
    name: str
    type: str
    entities: List[Dict[str, Any]]
    attributes: List[Any] = []

class SpecializationModel(BaseModel):
    superclass: str
    subclasses: List[str]   
    type: str
    participation: str

class ERModelSchema(BaseModel):
    entities: List[EntityModel]
    relationships: List[RelationshipModel]
    specializations: Optional[List[SpecializationModel]] = []

class SQLStructureResponse(BaseModel):
    conceptual_er_model: ERModelSchema

@app.post("/structure_sql", response_model=SQLStructureResponse)
async def structure_sql(request: SQLStructureRequest):
   
    result = sqltoer_platform.chat(request.sql_ddl)

    # Basic validation to ensure the result is a dictionary/JSON object
    if not isinstance(result, dict):
        raise ValueError("SQLtoER did not return a valid dict response")

    # The result matches the JSON structure, so we wrap it in our response model
    return SQLStructureResponse(conceptual_er_model=result)