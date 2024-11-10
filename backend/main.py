from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Literal
from llama_index.core import Document, VectorStoreIndex
import openai;
from dotenv import load_dotenv
import os
import uvicorn
import requests
from elevenlabs import ElevenLabs
import tempfile



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
Output only the prompt, nothing else.

Example format:
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

@app.post("/process")
async def process_website(website: WebsiteContent):
    temp_path = None
    try:
        # Process content using LlamaIndex
        summary = process_content_with_llama(website.content)
        print(f"Generated summary: {summary}")
        
        # Create a temporary file for the audio
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        temp_path = temp_file.name
        temp_file.close()
        
        print(f"Processing {website.output_type} generation...")
        if website.output_type == "podcast":
            generate_audio_summary(summary, temp_path)
        elif website.output_type == "edm":
            generate_edm(summary, temp_path)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported output type: {website.output_type}")
        
        if not os.path.exists(temp_path) or os.path.getsize(temp_path) == 0:
            raise HTTPException(status_code=500, detail=f"Failed to generate {website.output_type} file")
        
        print(f"Returning {website.output_type} file: {temp_path}")
        return FileResponse(
            temp_path,
            media_type='audio/mpeg',
            headers={
                'Content-Disposition': f'attachment; filename="{website.output_type}.mp3"'
            },
            background=None
        )
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
                print(f"Cleaned up temporary file: {temp_path}")
            except Exception as e:
                print(f"Failed to delete temporary file: {e}")

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
        edm_prompt = str(edm_prompt_response)

        print("Generated EDM Prompt:", edm_prompt)

        client = ElevenLabs(
            api_key=elevenlabs_api_key,
        )
        
        print("Generating EDM sound effects...")
        response = client.text_to_sound_effects.convert(
            text=edm_prompt,
            duration_seconds=30,  # Increased duration for EDM
            prompt_influence=1,
        )

        print(f"Writing EDM to file: {output_file_name}")
        with open(output_file_name, "wb") as audio_file:
            for chunk in response:
                audio_file.write(chunk)
                
        print(f"Successfully saved EDM to {output_file_name}")
        
        # Verify file size
        file_size = os.path.getsize(output_file_name)
        print(f"EDM file size: {file_size} bytes")
        
        if file_size == 0:
            raise Exception("Generated EDM file is empty")
            
    except Exception as e:
        print(f"Error in generate_edm: {str(e)}")
        print(f"Error type: {type(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate EDM: {str(e)}")

def generate_audio_summary(summary: str, output_file_name: str):
    print(f"Generating audio summary to: {output_file_name}")
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
    if not response.ok:
        print(f"ElevenLabs API error: {response.status_code} - {response.text}")
        raise HTTPException(status_code=500, detail="Failed to generate audio from ElevenLabs")

    print(f"Writing audio response to file: {output_file_name}")
    with open(output_file_name, 'wb') as f:
        for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
            if chunk:
                f.write(chunk)
                
    print(f"Audio file created successfully. Size: {os.path.getsize(output_file_name)} bytes")
    return


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)