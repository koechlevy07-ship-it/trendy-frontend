from backend.server import db
from datetime import datetime


class Player(db.Model):
    __tablename__ = 'players'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    jersey_number = db.Column(db.Integer, nullable=False)
    position = db.Column(db.String(50))
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    tracking_id = db.Column(db.Integer, unique=True)
    image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    statistics = db.relationship('PlayerStatistic', backref='player', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'jersey_number': self.jersey_number,
            'position': self.position,
            'team_id': self.team_id,
            'tracking_id': self.tracking_id,
            'image_url': self.image_url
        }
