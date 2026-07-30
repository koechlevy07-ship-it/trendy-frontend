from flask import Blueprint, request, jsonify
from backend.server import db
from backend.models.player import Player

players_bp = Blueprint('players', __name__)


@players_bp.route('/', methods=['GET'])
def get_players():
    team_id = request.args.get('team_id')
    if team_id:
        players = Player.query.filter_by(team_id=team_id).all()
    else:
        players = Player.query.all()
    return jsonify([p.to_dict() for p in players])


@players_bp.route('/<int:player_id>', methods=['GET'])
def get_player(player_id):
    player = Player.query.get_or_404(player_id)
    return jsonify(player.to_dict())


@players_bp.route('/', methods=['POST'])
def create_player():
    data = request.get_json()
    player = Player(
        name=data['name'],
        jersey_number=data['jersey_number'],
        position=data.get('position'),
        team_id=data['team_id'],
        tracking_id=data.get('tracking_id'),
        image_url=data.get('image_url')
    )
    db.session.add(player)
    db.session.commit()
    return jsonify(player.to_dict()), 201


@players_bp.route('/<int:player_id>', methods=['PUT'])
def update_player(player_id):
    player = Player.query.get_or_404(player_id)
    data = request.get_json()
    player.name = data.get('name', player.name)
    player.jersey_number = data.get('jersey_number', player.jersey_number)
    player.position = data.get('position', player.position)
    player.tracking_id = data.get('tracking_id', player.tracking_id)
    player.image_url = data.get('image_url', player.image_url)
    db.session.commit()
    return jsonify(player.to_dict())


@players_bp.route('/<int:player_id>', methods=['DELETE'])
def delete_player(player_id):
    player = Player.query.get_or_404(player_id)
    db.session.delete(player)
    db.session.commit()
    return jsonify({'message': 'Player deleted'})
