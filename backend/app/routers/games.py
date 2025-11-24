from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
import random, string

from ..db import SessionLocal
from .. import models, schemas
from ..game_logic import create_rounds_safe
from ..ai import generate_impostor_answer

router = APIRouter(prefix="/games", tags=["games"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create", response_model=schemas.CreateGameResponse)
def create_game(db: Session = Depends(get_db)):
    # Generate short code, e.g. 4-digit numeric or base36
    code = "".join(random.choices(string.digits, k=4))

    game = models.Game(code=code)
    db.add(game)
    db.commit()
    db.refresh(game)
    return schemas.CreateGameResponse(game_id=game.id, code=game.code)


@router.post("/join", response_model=schemas.JoinGameResponse)
def join_game(req: schemas.JoinGameRequest, db: Session = Depends(get_db)):
    game = db.query(models.Game).filter(models.Game.code == req.code).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    # Check if player exists (Rejoin logic)
    existing_player = db.query(models.Player).filter(
        models.Player.game_id == game.id,
        models.Player.name == req.name
    ).first()

    if existing_player:
        return schemas.JoinGameResponse(
            player_id=existing_player.id,
            game_id=game.id,
            code=game.code,
        )

    if game.status != "lobby":
        raise HTTPException(status_code=400, detail="Game already started")

    player = models.Player(game_id=game.id, name=req.name)
    db.add(player)
    db.commit()
    db.refresh(player)

    return schemas.JoinGameResponse(
        player_id=player.id,
        game_id=game.id,
        code=game.code,
    )

@router.post("/{code}/start")
def start_game(code: str, db: Session = Depends(get_db)):
    game = db.query(models.Game).filter(models.Game.code == code).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Count players
    player_count = db.query(models.Player).filter(models.Player.game_id == game.id).count()
    if player_count < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 players to start")

    game.status = "setup_questions"
    game.round_number = 0
    db.commit()
    
    return {"status": "setup_questions"}


@router.post("/{code}/set-question-count")
def set_question_count(code: str, req: schemas.SetQuestionCountRequest, db: Session = Depends(get_db)):
    game = db.query(models.Game).filter(models.Game.code == code).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.status != "setup_questions": 
        # We expect status to be "setup_questions" after start_game
        # But just in case, or if resuming
        pass

    game.questions_per_player = req.count
    game.status = "write_questions"
    db.commit()
    return {"status": "write_questions", "count": req.count}


@router.post("/{code}/submit-question")
def submit_question(code: str, req: schemas.SubmitQuestionRequest, db: Session = Depends(get_db)):
    game = db.query(models.Game).filter(models.Game.code == code).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status != "write_questions":
        raise HTTPException(status_code=400, detail="Not in question writing phase")

    # Check if player already submitted enough questions
    count = db.query(models.Question).filter(
        models.Question.game_id == game.id,
        models.Question.player_id == req.player_id
    ).count()

    if count >= game.questions_per_player:
        raise HTTPException(status_code=400, detail="Max questions reached for this player")

    question = models.Question(
        game_id=game.id,
        player_id=req.player_id,
        text=req.text
    )
    db.add(question)
    db.commit()
    
    # Check if all players have submitted all questions
    total_players = db.query(models.Player).filter(models.Player.game_id == game.id).count()
    total_questions = db.query(models.Question).filter(models.Question.game_id == game.id).count()
    
    if total_questions >= total_players * game.questions_per_player:
        # All questions submitted! Advance to first round
        create_rounds_safe(db, game)

    return {"status": "submitted"}


@router.post("/{code}/submit-answer")
def submit_answer(code: str, req: schemas.SubmitAnswerRequest, db: Session = Depends(get_db)):
    game = db.query(models.Game).filter(models.Game.code == code).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status != "answering":
        raise HTTPException(status_code=400, detail="Not in answering phase")

    current_round = (
        db.query(models.Round)
        .filter(models.Round.game_id == game.id, models.Round.round_index == game.round_number)
        .first()
    )
    if not current_round:
        raise HTTPException(status_code=500, detail="Current round not found")

    # Check if already answered
    existing = db.query(models.Answer).filter(
        models.Answer.round_id == current_round.id,
        models.Answer.player_id == req.player_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already answered this round")

    answer = models.Answer(
        round_id=current_round.id,
        player_id=req.player_id,
        text=req.text
    )
    db.add(answer)
    db.commit()

    # Check if all players answered
    # Note: In a real game, we might want to exclude the player who wrote the question?
    # Requirement said: "Each player view shows the current question and a submission box for their answer"
    # Doesn't explicitly say the author is excluded. Assuming all players answer for now.
    
    total_players = db.query(models.Player).filter(models.Player.game_id == game.id).count()
    total_answers = db.query(models.Answer).filter(models.Answer.round_id == current_round.id).count()

    if total_answers >= total_players:
        # All answers in. Generate AI Impostor Answer
        current_answers = db.query(models.Answer).filter(models.Answer.round_id == current_round.id).all()
        answer_texts = [a.text for a in current_answers]
        
        print(f"DEBUG: Generating AI answer for question: {current_round.question_text}")
        print(f"DEBUG: Player answers: {answer_texts}")
        
        ai_text = generate_impostor_answer(current_round.question_text, answer_texts)
        
        ai_answer = models.Answer(
            round_id=current_round.id,
            player_id=None, # AI
            text=ai_text
        )
        db.add(ai_answer)
        
        # Update Round with the AI answer ID
        db.flush() # Get ID
        current_round.ai_answer_id = ai_answer.id
        
        # Transition to voting
        game.status = "voting"
        db.commit()

    return {"status": "submitted"}


@router.post("/{code}/submit-vote")
def submit_vote(code: str, req: schemas.SubmitVoteRequest, db: Session = Depends(get_db)):
    game = db.query(models.Game).filter(models.Game.code == code).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status != "voting":
        raise HTTPException(status_code=400, detail="Not in voting phase")

    current_round = (
        db.query(models.Round)
        .filter(models.Round.game_id == game.id, models.Round.round_index == game.round_number)
        .first()
    )
    
    # Check if already voted
    existing = db.query(models.Vote).filter(
        models.Vote.round_id == current_round.id,
        models.Vote.voter_player_id == req.player_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already voted")

    vote = models.Vote(
        round_id=current_round.id,
        voter_player_id=req.player_id,
        answer_id_voted_for=req.answer_id
    )
    db.add(vote)
    db.commit()
    
    # Check if all votes in
    total_players = db.query(models.Player).filter(models.Player.game_id == game.id).count()
    total_votes = db.query(models.Vote).filter(models.Vote.round_id == current_round.id).count()
    
    if total_votes >= total_players:
        # Reveal phase
        game.status = "reveal"
        
        # Calculate scores
        votes = db.query(models.Vote).filter(models.Vote.round_id == current_round.id).all()
        ai_answer_id = current_round.ai_answer_id
        
        round_answers = db.query(models.Answer).filter(models.Answer.round_id == current_round.id).all()
        answer_author_map = {a.id: a.player_id for a in round_answers}

        for vote in votes:
            voter = db.query(models.Player).filter(models.Player.id == vote.voter_player_id).first()
            
            if vote.answer_id_voted_for == ai_answer_id:
                # Correct
                voter.streak += 1
                # Bonus: 500 base + (streak-1)*50 bonus
                bonus = (voter.streak - 1) * 50
                if bonus < 0: bonus = 0
                points = 500 + bonus
                voter.score += points
            else:
                # Incorrect
                voter.streak = 0
                voter.score -= 250
                
                # Award the writer of the answer (if human)
                author_id = answer_author_map.get(vote.answer_id_voted_for)
                if author_id:
                    author = db.query(models.Player).filter(models.Player.id == author_id).first()
                    if author:
                        author.score += 250
        
        db.commit()

    return {"status": "voted"}


@router.post("/{code}/next-round")
def next_round(code: str, db: Session = Depends(get_db)):
    game = db.query(models.Game).filter(models.Game.code == code).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
        
    # Check if next round exists
    next_round_index = game.round_number + 1
    next_round_obj = db.query(models.Round).filter(
        models.Round.game_id == game.id,
        models.Round.round_index == next_round_index
    ).first()
    
    if next_round_obj:
        game.round_number = next_round_index
        game.status = "answering"
    else:
        game.status = "finished"
        
    db.commit()
    return {"status": game.status}


@router.get("/{code}/state", response_model=schemas.GameState)
def get_game_state(code: str, db: Session = Depends(get_db)):
    game = db.query(models.Game).filter(models.Game.code == code).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    players = db.query(models.Player).filter(models.Player.game_id == game.id).all()

    # get current round (if any)
    current_round = (
        db.query(models.Round)
        .filter(models.Round.game_id == game.id, models.Round.round_index == game.round_number)
        .first()
    )

    answers = []
    question_text = None
    current_round_id = None

    if current_round:
        current_round_id = current_round.id
        question_text = current_round.question_text
        answers = (
            db.query(models.Answer)
            .filter(models.Answer.round_id == current_round.id)
            .all()
        )

    return schemas.GameState(
        game_id=game.id,
        code=game.code,
        status=game.status,
        round_number=game.round_number,
        questions_per_player=game.questions_per_player,
        players=players,
        current_round_id=current_round_id,
        question_text=question_text,
        answers=answers,
        votes=current_round and db.query(models.Vote).filter(models.Vote.round_id == current_round.id).all() or []
    )


@router.delete("/{code}")
def delete_game(code: str, db: Session = Depends(get_db)):
    game = db.query(models.Game).filter(models.Game.code == code).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # 1. Break circular dependency between Round and Answer (ai_answer_id)
    # Set ai_answer_id to NULL for all rounds in this game
    rounds = db.query(models.Round).filter(models.Round.game_id == game.id).all()
    for r in rounds:
        r.ai_answer_id = None
    db.commit() # Commit to release the foreign key constraint

    # 2. Delete Votes
    db.query(models.Vote).filter(models.Vote.round_id.in_(
        db.query(models.Round.id).filter(models.Round.game_id == game.id)
    )).delete(synchronize_session=False)
    
    # 3. Delete Answers
    db.query(models.Answer).filter(models.Answer.round_id.in_(
        db.query(models.Round.id).filter(models.Round.game_id == game.id)
    )).delete(synchronize_session=False)
    
    # 4. Delete Questions (Moved before Rounds because Questions reference Rounds)
    db.query(models.Question).filter(models.Question.game_id == game.id).delete(synchronize_session=False)

    # 5. Delete Rounds
    db.query(models.Round).filter(models.Round.game_id == game.id).delete(synchronize_session=False)
    
    # 6. Delete Players
    db.query(models.Player).filter(models.Player.game_id == game.id).delete(synchronize_session=False)
    
    # 7. Delete Game
    db.delete(game)
    db.commit()
    
    return {"status": "deleted"}
