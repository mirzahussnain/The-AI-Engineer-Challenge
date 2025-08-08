# Import required FastAPI components for building the API
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
# Import Pydantic for data validation and settings management
from pydantic import BaseModel, field_validator
# Import OpenAI client for interacting with OpenAI's API
from openai import OpenAI
import os
from typing import Optional
import httpx
import json

# Initialize FastAPI application with a title
app = FastAPI(title="AI Engineer Challenge Chat API")

# Configure CORS (Cross-Origin Resource Sharing) middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the data model for chat requests using Pydantic
class ChatRequest(BaseModel):
    developer_message: str  # Message from the developer/system
    user_message: str      # Message from the user
    model: Optional[str] = "gpt-4.1-mini"  # Optional model selection with default
    api_key: Optional[str] = None          # OpenAI API key for authentication
    provider: Optional[str] = "openai"    # 'openai' or 'openrouter'
    openrouter_api_key: Optional[str] = None # OpenRouter API key
    openrouter_model: Optional[str] = "openai/gpt-3.5-turbo" # Default OpenRouter model

    @field_validator('provider')
    @classmethod
    def validate_provider(cls, v):
        if v not in ['openai', 'openrouter']:
            raise ValueError('Provider must be either "openai" or "openrouter"')
        return v

    @field_validator('api_key', 'openrouter_api_key')
    @classmethod
    def validate_api_keys(cls, v, info):
        provider = info.data.get('provider', 'openai')
        field_name = info.field_name
        
        if field_name == 'api_key' and provider == 'openai' and not v:
            raise ValueError('OpenAI API key is required when provider is "openai"')
        if field_name == 'openrouter_api_key' and provider == 'openrouter' and not v:
            raise ValueError('OpenRouter API key is required when provider is "openrouter"')
        return v

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        if request.provider == "openrouter":
            if not request.openrouter_api_key:
                raise HTTPException(status_code=400, detail="OpenRouter API key required for OpenRouter provider.")
            # Use OpenRouter's OpenAI-compatible API endpoint
            url = "https://openrouter.ai/api/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {request.openrouter_api_key}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": request.openrouter_model or "openai/gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": request.developer_message},
                    {"role": "user", "content": request.user_message}
                ],
                "stream": True
            }
            async def generate():
                async with httpx.AsyncClient(timeout=60.0) as client:
                    async with client.stream("POST", url, headers=headers, json=payload) as response:
                        async for line in response.aiter_lines():
                            if line.startswith("data: "):
                                data = line.removeprefix("data: ")
                                if data == "[DONE]":
                                    break
                                try:
                                    chunk = json.loads(data)
                                    # Try delta.content (OpenAI style)
                                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                                    content = delta.get("content")
                                    if content:
                                        print(f"[OpenRouter] delta.content: {content}")
                                        yield content
                                        continue
                                    # Try message.content (OpenRouter sometimes uses this)
                                    message = chunk.get("choices", [{}])[0].get("message", {})
                                    message_content = message.get("content")
                                    if message_content:
                                        print(f"[OpenRouter] message.content: {message_content}")
                                        yield message_content
                                        continue
                                    # Fallback: yield the whole chunk for debugging
                                    print(f"[OpenRouter] raw chunk: {chunk}")
                                except Exception as ex:
                                    print(f"[OpenRouter] JSON decode error: {ex}")
                                    continue
            return StreamingResponse(generate(), media_type="text/plain")
        else:
            # Default: OpenAI
            if not request.api_key:
                raise HTTPException(status_code=400, detail="OpenAI API key required for OpenAI provider.")
            client = OpenAI(api_key=request.api_key)
            async def generate():
                stream = client.chat.completions.create(
                    model=request.model,
                    messages=[
                        {"role": "system", "content": request.developer_message},
                        {"role": "user", "content": request.user_message}
                    ],
                    stream=True
                )
                for chunk in stream:
                    if chunk.choices[0].delta.content is not None:
                        yield chunk.choices[0].delta.content
            return StreamingResponse(generate(), media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)