import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from backend.server import db
from backend.models.match import Match
from backend.models.statistics import PlayerStatistic

video_bp = Blueprint('video', __name__)

ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@video_bp.route('/upload/<int:match_id>', methods=['POST'])
def upload_video(match_id):
    match = Match.query.get_or_404(match_id)

    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(f"match_{match_id}_{file.filename}")
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        match.video_path = filepath
        db.session.commit()

        return jsonify({
            'message': 'Video uploaded successfully',
            'filename': filename,
            'path': filepath
        }), 201

    return jsonify({'error': 'File type not allowed'}), 400


@video_bp.route('/stream/<int:match_id>', methods=['GET'])
def stream_video(match_id):
    match = Match.query.get_or_404(match_id)
    if not match.video_path:
        return jsonify({'error': 'No video found for this match'}), 404

    directory = os.path.dirname(match.video_path)
    filename = os.path.basename(match.video_path)
    return send_from_directory(directory, filename)


@video_bp.route('/process/<int:match_id>', methods=['POST'])
def process_video(match_id):
    match = Match.query.get_or_404(match_id)
    if not match.video_path:
        return jsonify({'error': 'No video found for this match'}), 404

    from cv_engine.pipeline import VideoProcessor
    processor = VideoProcessor()
    result = processor.process_match(match.id, match.video_path)

    final_stats = result.get('final_statistics', {})
    for tracking_id, stat_data in final_stats.items():
        from backend.models.player import Player
        player = Player.query.filter_by(tracking_id=tracking_id).first()
        if not player:
            continue

        stat = PlayerStatistic.query.filter_by(
            player_id=player.id, match_id=match.id
        ).first()
        if not stat:
            stat = PlayerStatistic(player_id=player.id, match_id=match.id)
            db.session.add(stat)

        for field in [
            'serves', 'aces', 'service_errors',
            'attack_attempts', 'successful_attacks', 'kills',
            'attack_errors', 'blocked_attacks',
            'solo_blocks', 'block_assists',
            'digs', 'saves',
            'reception_attempts', 'perfect_receptions', 'reception_errors',
            'assists', 'setting_errors',
            'distance_covered', 'number_of_jumps', 'highest_jump',
            'avg_jump_height', 'sprint_speed', 'avg_movement_speed',
            'playing_time_seconds'
        ]:
            if field in stat_data:
                setattr(stat, field, stat_data[field])

    match.processed = True
    db.session.commit()

    return jsonify({
        'message': 'Video processed successfully',
        'events_detected': len(result.get('events', [])),
        'players_tracked': result.get('players_tracked', 0),
        'statistics_saved': len(final_stats)
    })
