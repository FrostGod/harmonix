from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
from llama_index.core import Document, VectorStoreIndex
import openai
from dotenv import load_dotenv
import os
import uvicorn

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="Harmonix Backend")

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Define request models
class WebsiteContent(BaseModel):
    url: str
    content: str
    output_type: Literal["edm", "music", "podcast"]
    
class ProcessedResponse(BaseModel):
    summary: str
    audio_url: str

# Initialize content processing pipeline
def process_content_with_llama(content: str) -> str:
    # Create a document from the scraped content
    documents = [Document(text=content)]
    index = VectorStoreIndex.from_documents(documents)
    
    # Create a query engine
    query_engine = index.as_query_engine()
    
    # Generate a concise summary
    response = query_engine.query(
        "Generate a concise summary of this content focusing on main themes and mood."
    )
    
    return str(response)

def generate_audio_content(summary: str, output_type: str) -> str:
    # Different prompts based on output type
    prompts = {
        "edm": "Generate EDM background music that matches this theme: ",
        "music": "Create a custom music track that captures this mood: ",
        "podcast": "Create a podcast script summarizing this content: "
    }
    
    # For now, we'll just return a mock audio URL
    # In real implementation, this would integrate with audio generation service
    return f"https://api.harmonix.com/audio/{output_type}/{hash(summary)}.mp3"

@app.post("/process", response_model=ProcessedResponse)
async def process_website(website: WebsiteContent):
    try:
        # Step 1: Process content using LlamaIndex
        summary = process_content_with_llama(website.content)
        
        print("DEBUG ", summary)

        return ProcessedResponse(
            summary=summary,
            audio_url="None"
        )

        # TODO: Add appwrite integration here, to store the summary
        # and next steps would be to generate audio content based on the summary

        # Step 2: Generate audio content based on the summary
        audio_url = generate_audio_content(summary, website.output_type)
        
        return ProcessedResponse(
            summary=summary,
            audio_url=audio_url
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)