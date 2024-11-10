### Product Description
Harmonix is an innovative Chrome extension that transforms your browsing experience by generating personalized audio content based on the websites you visit. Whether you're exploring a blog, reading an article, or browsing an e-commerce store, Harmonix dynamically creates music, EDM tracks, or podcast summaries tailored to the content of the page. Users can choose their preferred audio format—whether they want to enjoy a custom music track, an energetic EDM beat, or a concise podcast summary of the website's content.

Once generated, all audio content can be seamlessly saved to your Spotify account for easy access and playback anytime. Harmonix offers a unique way to engage with web content through sound, making it perfect for users who prefer auditory experiences over reading or those who want to enrich their browsing with custom soundscapes.

## Product workflow
1 - Content Scraping: When the Harmonix Chrome extension is active, it scrapes the website's content and sends it to our backend for processing.
2 - Backend Processing:
The backend condenses the website's content into a concise summary.
This summary is used to generate three possible outputs:
A - EDM Background Music: Designed to help users focus while navigating or reading through the website.
B - Custom Music Tracks: Tailored music based on the theme and mood of the website content.
C - Podcast Summary: A spoken-word summary of the entire website, which can be added directly to your Spotify podcast playlist.
3 - After the Backend processing, send it back to the caller, where it is played in the browser itself in the mp3 format

## Tools used
LLama index, open AI, appwrite as backend tool, fast api, tweleve labs


## Temp
Next steps would be:
Implement actual audio generation integration
Add error handling and validation
Set up Appwrite integration for data persistence
Add authentication and rate limiting
Implement caching for processed content
Would you like me to elaborate on any of these components or move forward with implementing any of the next steps?