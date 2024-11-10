## Instructions
# Podcast feature
1 - First the API  calls are not made correctly I don't want to call the serverices directly, instead I want to call my backend API's, whcih are running locally
# EDM
2 - Now lets focus on the edm too similar to the podcast, based on website content, EDM will be generated, the endpoint remains the same but need to change the output type
3 - The next functionality would be the EDM should automatically be generated and played whenever he visits any new page, but user can pause it in the chrome extension





## API endpoint
class WebsiteContent(BaseModel):
    url: str
    content: str
    output_type: Literal["edm", "music", "podcast"]
Sample request body
{
  "url": "string",
  "content": "Website scraped content",
  "output_type": "podcast"
}
curl -X 'POST' \
  'http://0.0.0.0:8000/process' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "url": "string",
  "content": "website scrapped content",
  "output_type": "podcast"
}'