from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel

class PlayerBase(BaseModel):
    id: UUID
    name: str
    score: int
    streak: int = 0

    class Config:
        from_attributes = True


class AnswerBase(BaseModel):
    id: UUID
    player_id: Optional[UUID]
    text: str

    class Config:
        from_attributes = True


class VoteBase(BaseModel):
    id: UUID
    voter_player_id: UUID
    answer_id_voted_for: UUID

    class Config:
        from_attributes = True


class GameState(BaseModel):
    game_id: UUID
    code: str
    status: str
    round_number: int
    questions_per_player: int = 2
    players: List[PlayerBase]
    current_round_id: Optional[UUID]
    question_text: Optional[str]
    answers: List[AnswerBase]
    votes: List[VoteBase] = []
    # can add more later as needed


class CreateGameResponse(BaseModel):
    game_id: UUID
    code: str


class JoinGameRequest(BaseModel):
    name: str
    code: str


class JoinGameResponse(BaseModel):
    player_id: UUID
    game_id: UUID
    code: str

class SetQuestionCountRequest(BaseModel):
    count: int

class SubmitQuestionRequest(BaseModel):
    player_id: UUID
    text: str

class SubmitAnswerRequest(BaseModel):
    player_id: UUID
    text: str

class SubmitVoteRequest(BaseModel):
    player_id: UUID
    answer_id: UUID
