import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, Text, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .db import Base

class Game(Base):
    __tablename__ = "games"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(10), unique=True, nullable=False)
    status = Column(String(20), nullable=False, default="lobby")
    round_number = Column(Integer, nullable=False, default=0)
    questions_per_player = Column(Integer, nullable=False, default=2)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    players = relationship("Player", back_populates="game")
    rounds = relationship("Round", back_populates="game")
    questions = relationship("Question", back_populates="game")


class Player(Base):
    __tablename__ = "players"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id"), nullable=False)
    name = Column(String(64), nullable=False)
    score = Column(Integer, nullable=False, default=0)
    streak = Column(Integer, nullable=False, default=0)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    game = relationship("Game", back_populates="players")


class Round(Base):
    __tablename__ = "rounds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    ai_answer_id = Column(UUID(as_uuid=True), ForeignKey("answers.id", use_alter=True, name="fk_round_ai_answer"), nullable=True)
    round_index = Column(Integer, nullable=False, default=0)

    game = relationship("Game", back_populates="rounds")
    answers = relationship("Answer", back_populates="round", foreign_keys="[Answer.round_id]")


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id"), nullable=False)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    text = Column(Text, nullable=False)
    used_in_round_id = Column(UUID(as_uuid=True), ForeignKey("rounds.id"), nullable=True)

    game = relationship("Game", back_populates="questions")
    player = relationship("Player")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    round_id = Column(UUID(as_uuid=True), ForeignKey("rounds.id"), nullable=False)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=True)
    text = Column(Text, nullable=False)

    round = relationship("Round", back_populates="answers", foreign_keys=[round_id])


class Vote(Base):
    __tablename__ = "votes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    round_id = Column(UUID(as_uuid=True), ForeignKey("rounds.id"), nullable=False)
    voter_player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    answer_id_voted_for = Column(UUID(as_uuid=True), ForeignKey("answers.id"), nullable=False)
