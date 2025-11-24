import random
from sqlalchemy.orm import Session
from . import models

def create_rounds(db: Session, game: models.Game):
    # Fetch all questions for this game
    questions = db.query(models.Question).filter(models.Question.game_id == game.id).all()
    
    # Group questions by player to ensure fair mixing
    # (Assuming we want to round-robin them to avoid consecutive player questions)
    questions_by_player = {}
    for q in questions:
        if q.player_id not in questions_by_player:
            questions_by_player[q.player_id] = []
        questions_by_player[q.player_id].append(q)
    
    # Shuffle each player's questions internally so they aren't in submission order
    player_ids = list(questions_by_player.keys())
    for pid in player_ids:
        random.shuffle(questions_by_player[pid])
        
    # Create the round order
    round_questions = []
    
    # Simple round robin
    # While there are still questions left
    while any(questions_by_player.values()):
        # Shuffle player order each "lap" to add variety, or keep fixed?
        # If we shuffle player order each lap, we might get Player A (end of lap 1) -> Player A (start of lap 2).
        # Safer to keep a fixed order of players, or ensure check.
        
        # Let's just shuffle players once, then cycle through
        random.shuffle(player_ids) 
        
        for pid in player_ids:
            if questions_by_player[pid]:
                # Check if previous question was from same player (only matters if laps allow it)
                # With simple round robin on shuffled players, collision is possible if 
                # Lap 1: [A, B, C] -> Lap 2: [C, B, A]. C follows C? 
                # No, Lap 1 ends with C, Lap 2 starts with C.
                
                # To strictly enforce "no consecutive", we can build a list and just pick valid next.
                # Given MVP and small counts, simple round robin with fixed player order is safest against consecutive.
                pass 

        # Actually, strictly alternating A, B, C, A, B, C is safest.
        # We just shuffle the initial player order.
    
    # Re-do with fixed order for safety
    fixed_player_order = list(questions_by_player.keys())
    random.shuffle(fixed_player_order)
    
    max_questions = 0
    for qs in questions_by_player.values():
        max_questions = max(max_questions, len(qs))
        
    for i in range(max_questions):
        for pid in fixed_player_order:
            if i < len(questions_by_player[pid]):
                round_questions.append(questions_by_player[pid][i])
                
    # Create Round objects
    for idx, question in enumerate(round_questions):
        round = models.Round(
            game_id=game.id,
            question_text=question.text,
            round_index=idx + 1 # 1-based indexing for rounds
        )
        db.add(round)
        
        # Link question to round if needed (we have used_in_round_id)
        question.used_in_round_id = round.id # Wait, round.id isn't available until flush/commit if we want it now.
        # But we can do it after commit or let SQLAlchemy handle it if we mapped it right.
        # Easier: just commit rounds first.
    
    db.commit()
    
    # Now update questions with round ids
    # Re-query rounds to get IDs? Or db.refresh(round) inside loop.
    # Better: 
    #   round = ...
    #   db.add(round)
    #   db.flush() # gets ID
    #   question.used_in_round_id = round.id
    
    # Let's rewrite loop for that
    pass

def create_rounds_safe(db: Session, game: models.Game):
    questions = db.query(models.Question).filter(models.Question.game_id == game.id).all()
    
    questions_by_player = {}
    for q in questions:
        if q.player_id not in questions_by_player:
            questions_by_player[q.player_id] = []
        questions_by_player[q.player_id].append(q)
        
    player_ids = list(questions_by_player.keys())
    random.shuffle(player_ids) # Randomize seat order
    
    # Shuffle questions for each player
    for pid in player_ids:
        random.shuffle(questions_by_player[pid])
        
    ordered_questions = []
    max_q = max(len(qs) for qs in questions_by_player.values()) if questions_by_player else 0
    
    for i in range(max_q):
        for pid in player_ids:
            if questions_by_player[pid]:
                ordered_questions.append(questions_by_player[pid].pop(0))
                
    # Create Rounds
    for i, q in enumerate(ordered_questions):
        new_round = models.Round(
            game_id=game.id,
            question_text=q.text,
            round_index=i + 1
        )
        db.add(new_round)
        db.flush() # Populate new_round.id
        
        q.used_in_round_id = new_round.id
        db.add(q)
        
    # Update Game
    game.status = "answering"
    game.round_number = 1
    db.add(game)
    db.commit()

