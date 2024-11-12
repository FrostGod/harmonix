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
import ssl
from fastapi.middleware.cors import CORSMiddleware
import logging
from fastapi.middleware.cors import CORSMiddleware
import traceback
from solana.rpc.async_api import AsyncClient
from solana.transaction import Transaction
import base64
# from metaplex.metadata import create_metadata_instruction, Data  # Comment out or remove this line
import json
import time

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "chrome-extension://*"],  # Allow Chrome extension
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
      
    if output_type == "music":
        generate_music(summary, "music.mp3")
    
    # For now, we'll just return a mock audio URL
    # In real implementation, this would integrate with audio generation service
    return f"https://api.harmonix.com/audio/{output_type}/{hash(summary)}.mp3"

@app.post("/process")
async def process_website(website: WebsiteContent):
    try:
        logger.info(f"Received request for {website.output_type}")
        logger.info(f"URL: {website.url}")
        logger.info(f"Content length: {len(website.content)}")
        
        # Process content using LlamaIndex
        summary = process_content_with_llama(website.content)
        print(f"Generated summary: {summary}")
        
        if website.output_type == "music":
            # Return audio URL for music
            audio_url = generate_music(summary, "music.mp3")
            return {"audio_url": audio_url}
        
        # For podcast and EDM, continue with file response
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        temp_path = temp_file.name
        temp_file.close()
        
        if website.output_type == "podcast":
            generate_audio_summary(summary, temp_path)
        elif website.output_type == "edm":
            generate_edm(summary, temp_path)
        
        if not os.path.exists(temp_path) or os.path.getsize(temp_path) == 0:
            raise HTTPException(status_code=500, detail=f"Failed to generate {website.output_type} file")
        
        return FileResponse(
            temp_path,
            media_type='audio/mpeg',
            headers={
                'Content-Disposition': f'attachment; filename="{website.output_type}.mp3"'
            },
            background=None
        )
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/test")
async def test_connection():
    return {"status": "Backend is running"}

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
            duration_seconds=10,  # Increased duration for EDM
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

def generate_music(summary: str, output_file_name: str):
    try:
        logger.info(f"Generating music for summary: {summary[:100]}...")  # Log first 100 chars
        
        # Clean and format the summary for the API
        formatted_prompt = f"generate song based story about the website with the following content: {summary[:500]}"  # Limit length
        
        # First attempt to generate clip IDs
        max_retries = 3
        retry_count = 0
        clip_ids = None
        
        while retry_count < max_retries and not clip_ids:
            try:
                response = requests.post(
                    "https://api.aimlapi.com/v2/generate/audio/suno-ai/clip",
                    headers={
                        "Authorization": f"Bearer {os.getenv('AIMLAPI_API_KEY')}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "gpt_description_prompt": formatted_prompt,
                    },
                    timeout=30  # Add timeout
                )
                
                response.raise_for_status()
                data = response.json()
                clip_ids = data.get("clip_ids")
                
                if not clip_ids:
                    raise ValueError("No clip IDs received from API")
                    
            except requests.exceptions.RequestException as e:
                retry_count += 1
                logger.error(f"Attempt {retry_count} failed: {str(e)}")
                if retry_count == max_retries:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to generate music after {max_retries} attempts"
                    )
                time.sleep(2)  # Wait before retrying
        
        logger.info(f"Generated clip ids: {clip_ids}")
        
        # Now fetch the clip
        retry_count = 0
        audio_url = None
        
        while retry_count < max_retries and not audio_url:
            try:
                response = requests.get(
                    "https://api.aimlapi.com/v2/generate/audio/suno-ai/clip",
                    params={
                        "clip_id": clip_ids[0],
                        "status": "streaming",
                    },
                    headers={
                        "Authorization": f"Bearer {os.getenv('AIMLAPI_API_KEY')}",
                        "Content-Type": "application/json",
                    },
                    timeout=30
                )
                
                response.raise_for_status()
                data = response.json()
                audio_url = data.get("audio_url")
                
                if not audio_url:
                    raise ValueError("No audio URL received from API")
                    
            except requests.exceptions.RequestException as e:
                retry_count += 1
                logger.error(f"Attempt {retry_count} to fetch clip failed: {str(e)}")
                if retry_count == max_retries:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to fetch audio clip after {max_retries} attempts"
                    )
                time.sleep(2)
        
        logger.info(f"Successfully generated music. Audio URL: {audio_url}")
        return audio_url
        
    except Exception as e:
        logger.error(f"Error in generate_music: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Return a fallback audio URL if available
        fallback_url = "https://your-fallback-audio-url.com/default-music.mp3"
        logger.info(f"Returning fallback audio URL: {fallback_url}")
        return fallback_url

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

# Add these new imports and setup
solana_client = AsyncClient("https://api.devnet.solana.com")

class NFTRequest(BaseModel):
    audio_data: str
    metadata: dict

@app.post("/mint-nft")
async def mint_nft(request: NFTRequest):
    try:
        logger.info("Starting NFT minting process")
        audio_bytes = base64.b64decode(request.audio_data)
        
        audio_url = "https://arweave.net/mock-audio-url"
        
        # Create metadata JSON
        metadata = {
            "name": request.metadata["name"],
            "description": request.metadata["description"],
            "image": "https://arweave.net/mock-image-url",  # Optional image
            "animation_url": audio_url,  # This is where the audio will be played from
            "attributes": request.metadata["attributes"],
            "properties": {
                "files": [
                    {
                        "uri": audio_url,
                        "type": "audio/mp3"
                    }
                ]
            }
        }
        
        # For now, return mock data
        # In production, you would:
        # 1. Upload audio to Arweave/IPFS
        # 2. Create metadata JSON and upload
        # 3. Mint NFT using Metaplex
        # 4. Return the mint address
        
        return {
            "success": True,
            "mint_address": "mock_mint_address",
            "metadata_uri": "https://arweave.net/mock-metadata-uri",
            "transaction_signature": "mock_signature"
        }
        
    except Exception as e:
        logger.error(f"Error minting NFT: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    try:
        logger.info("Starting server with SSL...")
        ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        ssl_context.load_cert_chain(
            certfile="localhost.crt",
            keyfile="localhost.key"
        )
        
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=8000,
            ssl_certfile="localhost.crt",
            ssl_keyfile="localhost.key",
            log_level="info"
        )
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        logger.error(traceback.format_exc())