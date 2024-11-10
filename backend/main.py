from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
from llama_index.core import Document, VectorStoreIndex
import openai;
from dotenv import load_dotenv
import os
import uvicorn
import requests
from elevenlabs import ElevenLabs



### PROMPT SECTION ###
EDM_GENERATION_PROMPT = """Given this website summary: "{summary}"

Generate an EDM music prompt by:
1. First analyze if this is for studying, shopping, technical work, or entertainment
2. Then create a music prompt that would enhance that specific activity
3. Include:
   - Suggested BPM
   - Key musical elements to include
   - Overall mood/atmosphere
   - Any specific production techniques

Make the prompt engaging and specific to the user's likely needs based on the website context.
and the only output should be the prompt, nothing else.

Example format:
For a Wikipedia article about neuroscience:
"Create a focused ambient EDM track at 85 BPM with soft piano melodies and gentle sidechained pads. Layer in subtle binaural beats and low-fi textures to enhance concentration. Maintain a consistent, hypnotic groove with minimal variations to support deep learning."
"""

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
        generate_audio_summary(summary, "podcast.mp3")

    if output_type == "edm":
        generate_edm(summary, "edm.mp3")
    
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


def generate_edm(summary: str, output_file_name: str):
    try:
        # Create a document and index from the summary
        documents = [Document(text=summary)]
        index = VectorStoreIndex.from_documents(documents)
        
        # Create a query engine and generate EDM prompt
        query_engine = index.as_query_engine()
        edm_prompt_response = query_engine.query(EDM_GENERATION_PROMPT.format(summary=summary))
        edm_prompt = str(edm_prompt_response)  # Convert to string explicitly

        print("Generated EDM Prompt:", edm_prompt)
        print("Prompt type:", type(edm_prompt))

        client = ElevenLabs(
            api_key=elevenlabs_api_key,
        )
        
        print("Calling ElevenLabs API with prompt length:", len(edm_prompt))
        response = client.text_to_sound_effects.convert(
            text=edm_prompt,
            duration_seconds=10,
            prompt_influence=1,
        )

        # Save the audio response
        with open(output_file_name, "wb") as audio_file:
            for chunk in response:
                audio_file.write(chunk)
                
        print(f"Successfully saved audio to {output_file_name}")
        
    except Exception as e:
        print(f"Error in generate_edm: {str(e)}")
        print(f"Error type: {type(e)}")
        raise  # Re-raise the exception after logging

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
              
  return


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)