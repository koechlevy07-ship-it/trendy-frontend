from backend.server import db
from datetime import datetime


class Match(db.Model):
    __tablename__ = 'matches'

    id = db.Column(db.Integer, primary_key=True)
    home_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    away_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    venue = db.Column(db.String(200))
    status = db.Column(db.String(20), default='scheduled')
    home_score = db.Column(db.Integer, default=0)
    away_score = db.Column(db.Integer, default=0)
    video_path = db.Column(db.String(500))
    processed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    statistics = db.relationship('PlayerStatistic', backref='match', lazy=True)
    events = db.relationship('MatchEvent', backref='match', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'home_team_id': self.home_team_id,
            'away_team_id': self.away_team_id,
            'date': self.date.isoformat() if self.date else None,
            'venue': self.venue,
            'status': self.status,
            'home_score': self.home_score,
            'away_score': self.away_score,
            'video_path': self.video_path,
            'processed': self.processed
        }


class MatchEvent(db.Model):
    __tablename__ = 'match_events'

    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('matches.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'))
    event_type = db.Column(db.String(50), nullable=False)
    frame_number = db.Column(db.Integer)
    timestamp = db.Column(db.Float)
    details = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    player = db.relationship('Player', backref='events')

    def to_dict(self):
        return {
            'id': self.id,
            'match_id': self.match_id,
            'player_id': self.player_id,
            'event_type': self.event_type,
            'frame_number': self.frame_number,
            'timestamp': self.timestamp,
            'details': self.details
        }
