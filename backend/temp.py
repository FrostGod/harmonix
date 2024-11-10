

# working auto EDM code

# from elevenlabs import ElevenLabs
# import os
# client = ElevenLabs(
#     api_key=os.getenv("ELEVENLABS_API_KEY"),
# )
# response = client.text_to_sound_effects.convert(
#     text="Create an energetic EDM track at 120 BPM with pulsating synths, driving basslines, and uplifting melodies. Infuse the music with dynamic build-ups and drops to enhance the atmosphere of a hackathon event, encouraging creativity and collaboration among participants. Incorporate glitch effects and vocal chops for a modern and innovative feel, keeping the energy high throughout the track to inspire experimentation and networking.",
#     duration_seconds=10,
#     prompt_influence=1,
# )

# # Save the audio response to an MP3 file
# with open("output.mp3", "wb") as audio_file:
#     # Iterate through the generator and write each chunk
#     for chunk in response:
#         audio_file.write(chunk)

# print("Audio file saved as output.mp3")


# Other alternative code

# import requests
# from dotenv import load_dotenv
# import os

# # Load environment variables from .env
# load_dotenv()

# url = "https://api.musicfy.lol/v1/generate-music"

# payload = {"prompt": "Electronic guitar"}
# headers = {
#     "Content-Type": "application/json",
#     "Authorization": f"Bearer {os.getenv('MUSICFY_API_KEY')}"
# }

# response = requests.request("POST", url, json=payload, headers=headers)

# print(response.text)

import requests


def main():
  response = requests.post(
        "https://api.aimlapi.com/v2/generate/audio/suno-ai/clip",
        headers={
            "Authorization": "Bearer ",
            "Content-Type": "application/json",
        },
        json={
            "gpt_description_prompt": "A story about frogs.",
        },
    )
  response.raise_for_status()
  data = response.json()
  clip_ids = data["clip_ids"]

  print("Generated clip ids:", clip_ids)


def fetch():
  response = requests.get(
      "https://api.aimlapi.com/v2/generate/audio/suno-ai/clip",
      params={
          "clip_id": "136c66f6-a581-45e0-a82f-fbb3bc122e2d",
          "status": "streaming",
      },
      headers={
          "Authorization": "Bearer ",
          "Content-Type": "application/json",
      },
  )

  response.raise_for_status()
  data = response.json()
  print("Clip data:", data)

if __name__ == "__main__":
    # main()
    fetch()


