from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
from llama_index.core import Document, VectorStoreIndex
import openai
from dotenv import load_dotenv
import os
import uvicorn
import requests

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="Harmonix Backend")

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")
elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
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
        "Generate a concise summary of this content focusing of the webpage content"
    )
    
    return str(response)

def generate_audio_content(summary: str, output_type: str) -> str:
    # Different prompts based on output type
    prompts = {
        "edm": "Generate EDM background music that matches this theme: ",
        "music": "Create a custom music track that captures this mood: ",
        "podcast": "Create a podcast script summarizing this content: "
    }

    if output_type == "podcast":
        generate_audio_summary(summary, "output.mp3")
    
    # For now, we'll just return a mock audio URL
    # In real implementation, this would integrate with audio generation service
    return f"https://api.harmonix.com/audio/{output_type}/{hash(summary)}.mp3"

@app.post("/process", response_model=ProcessedResponse)
async def process_website(website: WebsiteContent):
    try:
        # Step 1: Process content using LlamaIndex
        summary = process_content_with_llama(website.content)
        
        print("DEBUG ", summary)

        # Step 2: Generate audio content based on the summary
        audio_url = generate_audio_content(summary, website.output_type)
        
        return ProcessedResponse(
            summary=summary,
            audio_url="None"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


def generate_audio_summary(summary: str, output_file_name: str):
  print(output_file_name)
  CHUNK_SIZE = 1024
  url = "https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x"

  headers = {
    "Accept": "audio/mpeg",
    "Content-Type": "application/json",
    "xi-api-key": elevenlabs_api_key
  }

  data = {
    "text": summary,
    "model_id": "eleven_monolingual_v1",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.5
    }
  }

  response = requests.post(url, json=data, headers=headers)
  print(response)
  with open(output_file_name, 'wb') as f:
      for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
          if chunk:
              f.write(chunk)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)