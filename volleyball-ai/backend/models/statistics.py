from backend.server import db
from datetime import datetime


class PlayerStatistic(db.Model):
    __tablename__ = 'player_statistics'

    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    match_id = db.Column(db.Integer, db.ForeignKey('matches.id'), nullable=False)

    serves = db.Column(db.Integer, default=0)
    aces = db.Column(db.Integer, default=0)
    service_errors = db.Column(db.Integer, default=0)

    attack_attempts = db.Column(db.Integer, default=0)
    successful_attacks = db.Column(db.Integer, default=0)
    kills = db.Column(db.Integer, default=0)
    attack_errors = db.Column(db.Integer, default=0)
    blocked_attacks = db.Column(db.Integer, default=0)

    solo_blocks = db.Column(db.Integer, default=0)
    block_assists = db.Column(db.Integer, default=0)

    digs = db.Column(db.Integer, default=0)
    saves = db.Column(db.Integer, default=0)

    reception_attempts = db.Column(db.Integer, default=0)
    perfect_receptions = db.Column(db.Integer, default=0)
    reception_errors = db.Column(db.Integer, default=0)

    assists = db.Column(db.Integer, default=0)
    setting_errors = db.Column(db.Integer, default=0)

    distance_covered = db.Column(db.Float, default=0.0)
    number_of_jumps = db.Column(db.Integer, default=0)
    highest_jump = db.Column(db.Float, default=0.0)
    avg_jump_height = db.Column(db.Float, default=0.0)
    sprint_speed = db.Column(db.Float, default=0.0)
    avg_movement_speed = db.Column(db.Float, default=0.0)

    playing_time_seconds = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'player_id': self.player_id,
            'match_id': self.match_id,
            'serves': self.serves,
            'aces': self.aces,
            'service_errors': self.service_errors,
            'attack_attempts': self.attack_attempts,
            'successful_attacks': self.successful_attacks,
            'kills': self.kills,
            'attack_errors': self.attack_errors,
            'blocked_attacks': self.blocked_attacks,
            'solo_blocks': self.solo_blocks,
            'block_assists': self.block_assists,
            'digs': self.digs,
            'saves': self.saves,
            'reception_attempts': self.reception_attempts,
            'perfect_receptions': self.perfect_receptions,
            'reception_errors': self.reception_errors,
            'assists': self.assists,
            'setting_errors': self.setting_errors,
            'distance_covered': self.distance_covered,
            'number_of_jumps': self.number_of_jumps,
            'highest_jump': self.highest_jump,
            'avg_jump_height': self.avg_jump_height,
            'sprint_speed': self.sprint_speed,
            'avg_movement_speed': self.avg_movement_speed,
            'playing_time_seconds': self.playing_time_seconds
        }
