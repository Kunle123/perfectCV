"""
OpenAI client utility for API interactions.
"""
import json
import logging
import os
from typing import Dict, Any, List, Optional

import openai
from openai import OpenAI

logger = logging.getLogger(__name__)

class OpenAIError(Exception):
    """Exception raised for errors in OpenAI API interactions."""
    pass

def get_openai_client():
    """
    Get an initialized OpenAI client.
    
    Returns:
        OpenAI client instance
    """
    api_key = os.environ.get("OPENAI_API_KEY", "dummy_key_for_development")
    return OpenAI(api_key=api_key)

async def create_chat_completion(
    prompt: str,
    system_message: str = "You are a helpful assistant.",
    model: str = "gpt-3.5-turbo",
    temperature: float = 0.5,
    max_tokens: int = 1000
) -> str:
    """
    Create a chat completion using OpenAI's API.
    
    Args:
        prompt: User prompt
        system_message: System message to set the context
        model: OpenAI model to use
        temperature: Temperature parameter for response randomness
        max_tokens: Maximum tokens in the response
        
    Returns:
        Response text
        
    Raises:
        OpenAIError: If API call fails
    """
    try:
        client = get_openai_client()
        
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        raise OpenAIError(f"Failed to create chat completion: {str(e)}")

async def create_json_chat_completion(
    prompt: str,
    system_message: str = "You are a helpful assistant. Always respond with valid JSON.",
    model: str = "gpt-3.5-turbo",
    temperature: float = 0.2,
    max_tokens: int = 2000
) -> str:
    """
    Create a chat completion that returns valid JSON.
    
    Args:
        prompt: User prompt
        system_message: System message to set the context
        model: OpenAI model to use
        temperature: Temperature parameter for response randomness
        max_tokens: Maximum tokens in the response
        
    Returns:
        JSON response as a string
        
    Raises:
        OpenAIError: If API call fails or response is not valid JSON
    """
    try:
        # Add explicit instruction to return JSON
        enhanced_prompt = f"{prompt}\n\nRespond with valid JSON only."
        
        response_text = await create_chat_completion(
            prompt=enhanced_prompt,
            system_message=system_message,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        # Try to parse JSON to validate it
        try:
            json.loads(response_text)
            return response_text
        except json.JSONDecodeError:
            # If the response isn't valid JSON, try to extract JSON from it
            # Sometimes the model includes markdown code blocks or explanatory text
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                # Validate the extracted JSON
                json.loads(json_str)
                return json_str
            
            # If we can't extract valid JSON, try one more time with a more explicit prompt
            retry_prompt = f"""
            Your previous response was not valid JSON. Please provide a response in valid JSON format only.
            No explanations, no markdown, just the JSON object.
            
            Original request:
            {prompt}
            """
            
            retry_response = await create_chat_completion(
                prompt=retry_prompt,
                system_message=system_message,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            # Try to parse the retry response
            try:
                json.loads(retry_response)
                return retry_response
            except json.JSONDecodeError:
                # If still not valid JSON, raise an error
                logger.error(f"Failed to get valid JSON response after retry")
                raise OpenAIError("Failed to get valid JSON response from OpenAI")
                
    except OpenAIError as e:
        # Re-raise OpenAIError
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in create_json_chat_completion: {str(e)}")
        raise OpenAIError(f"Failed to create JSON chat completion: {str(e)}")

async def create_embedding(text: str) -> List[float]:
    """
    Create an embedding for the given text.
    
    Args:
        text: Text to create embedding for
        
    Returns:
        Embedding vector
        
    Raises:
        OpenAIError: If API call fails
    """
    try:
        client = get_openai_client()
        
        response = client.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        )
        
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"OpenAI API error in create_embedding: {str(e)}")
        raise OpenAIError(f"Failed to create embedding: {str(e)}")
