from flask import Blueprint, request, jsonify
from backend.server import db
from backend.models.match import Match, MatchEvent

matches_bp = Blueprint('matches', __name__)


@matches_bp.route('/', methods=['GET'])
def get_matches():
    matches = Match.query.order_by(Match.date.desc()).all()
    return jsonify([m.to_dict() for m in matches])


@matches_bp.route('/<int:match_id>', methods=['GET'])
def get_match(match_id):
    match = Match.query.get_or_404(match_id)
    return jsonify(match.to_dict())


@matches_bp.route('/', methods=['POST'])
def create_match():
    data = request.get_json()
    match = Match(
        home_team_id=data['home_team_id'],
        away_team_id=data['away_team_id'],
        date=data['date'],
        venue=data.get('venue'),
        status=data.get('status', 'scheduled')
    )
    db.session.add(match)
    db.session.commit()
    return jsonify(match.to_dict()), 201


@matches_bp.route('/<int:match_id>', methods=['PUT'])
def update_match(match_id):
    match = Match.query.get_or_404(match_id)
    data = request.get_json()
    match.home_score = data.get('home_score', match.home_score)
    match.away_score = data.get('away_score', match.away_score)
    match.status = data.get('status', match.status)
    match.processed = data.get('processed', match.processed)
    db.session.commit()
    return jsonify(match.to_dict())


@matches_bp.route('/<int:match_id>', methods=['DELETE'])
def delete_match(match_id):
    match = Match.query.get_or_404(match_id)
    db.session.delete(match)
    db.session.commit()
    return jsonify({'message': 'Match deleted'})


@matches_bp.route('/<int:match_id>/events', methods=['GET'])
def get_match_events(match_id):
    events = MatchEvent.query.filter_by(match_id=match_id).order_by(MatchEvent.frame_number).all()
    return jsonify([e.to_dict() for e in events])


@matches_bp.route('/<int:match_id>/events', methods=['POST'])
def create_match_event(match_id):
    data = request.get_json()
    event = MatchEvent(
        match_id=match_id,
        player_id=data.get('player_id'),
        event_type=data['event_type'],
        frame_number=data.get('frame_number'),
        timestamp=data.get('timestamp'),
        details=data.get('details')
    )
    db.session.add(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201
