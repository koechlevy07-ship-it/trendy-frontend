from flask import Blueprint, request, jsonify
from backend.server import db
from backend.models.team import Team

teams_bp = Blueprint('teams', __name__)


@teams_bp.route('/', methods=['GET'])
def get_teams():
    teams = Team.query.all()
    return jsonify([t.to_dict() for t in teams])


@teams_bp.route('/<int:team_id>', methods=['GET'])
def get_team(team_id):
    team = Team.query.get_or_404(team_id)
    return jsonify(team.to_dict())


@teams_bp.route('/', methods=['POST'])
def create_team():
    data = request.get_json()
    team = Team(
        name=data['name'],
        logo_url=data.get('logo_url'),
        country=data.get('country')
    )
    db.session.add(team)
    db.session.commit()
    return jsonify(team.to_dict()), 201


@teams_bp.route('/<int:team_id>', methods=['PUT'])
def update_team(team_id):
    team = Team.query.get_or_404(team_id)
    data = request.get_json()
    team.name = data.get('name', team.name)
    team.logo_url = data.get('logo_url', team.logo_url)
    team.country = data.get('country', team.country)
    db.session.commit()
    return jsonify(team.to_dict())


@teams_bp.route('/<int:team_id>', methods=['DELETE'])
def delete_team(team_id):
    team = Team.query.get_or_404(team_id)
    db.session.delete(team)
    db.session.commit()
    return jsonify({'message': 'Team deleted'})
