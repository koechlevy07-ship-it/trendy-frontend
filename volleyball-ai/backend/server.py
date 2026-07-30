from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('MYSQL_USER')}:{os.getenv('MYSQL_PASSWORD')}@{os.getenv('MYSQL_HOST')}/{os.getenv('MYSQL_DB')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), os.getenv('UPLOAD_FOLDER', 'uploads'))

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)
    CORS(app)

    from routes.players import players_bp
    from routes.teams import teams_bp
    from routes.matches import matches_bp
    from routes.statistics import statistics_bp
    from routes.video import video_bp
    from routes.analytics import analytics_bp

    app.register_blueprint(players_bp, url_prefix='/api/players')
    app.register_blueprint(teams_bp, url_prefix='/api/teams')
    app.register_blueprint(matches_bp, url_prefix='/api/matches')
    app.register_blueprint(statistics_bp, url_prefix='/api/statistics')
    app.register_blueprint(video_bp, url_prefix='/api/video')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
