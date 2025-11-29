from openai import OpenAI
from .config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_impostor_answer(question: str, player_answers: list[str]) -> str:
    """
    Generates an AI answer that tries to blend in with player answers.
    """
    # Inject answers into prompt
    # Format answers as a clean bulleted list
    formatted_answers = "\n".join([f"{a}" for a in player_answers])
    
    prompt = f"""
    You are playing a party game where you need to blend in with other players.
    
    Question: "{question}"
    
    Here are the answers from the human players:
    {formatted_answers}
    
    Your goal is to write ONE new answer to the question that blends in perfectly.
    
    CRITICAL: To blend in, you may pick one of the answers from the list above mimic its style, length, and punctuation patterns, but with different content.
    Try not to copy an answer exactly, but blend in with the group.
    Instructions:
    - Do NOT directly copy the content of any answer. Write something new.
    - Mimic the "voice" of one of the humans exactly (e.g. if they use short words, you use short words).
    - Be humorous, casual, and human-like.
    - Do not use hashtags or emojis unless the human answers did.
    - Output ONLY the raw answer text. No quotes, no explanations.
    - Your answer MUST be in all lowercase letters.
    - Do not wrap your answer in quotes.
    """
    
    print(f"DEBUG: AI Prompt:\n{prompt}")

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini", # Cost-effective and fast
            messages=[
                {"role": "system", "content": "You are a player in a casual party game trying to blend in."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.9, # High creativity
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return "I honestly have no idea." # Fallback answer

