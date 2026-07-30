import cv2
import time
import numpy as np
from collections import defaultdict

from detection.yolo_detector import YOLODetector
from tracking.byte_track import SimpleTracker
from pose.pose_estimator import PoseEstimator
from action_recognition.action_classifier import ActionClassifier
from action_recognition.statistics_generator import StatisticsGenerator


class VideoProcessor:
    def __init__(self, model_path=None):
        self.detector = YOLODetector(model_path='yolov8x.pt', confidence=0.5)
        self.tracker = SimpleTracker(max_disappeared=30, max_distance=80)
        self.pose_estimator = PoseEstimator()
        self.action_classifier = ActionClassifier(model_path=None)
        self.stats_generator = StatisticsGenerator()

        self.events = []
        self.ball_positions = []
        self.frame_count = 0
        self.fps = 30

    def process_match(self, match_id, video_path, callback=None):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {video_path}")

        self.fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        player_positions_prev = {}
        player_positions_curr = {}

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            self.frame_count += 1
            timestamp = self.frame_count / self.fps

            detections = self.detector.detect_all(frame)

            tracked_players = self.tracker.update(detections['players'])

            ball_info = None
            if detections['balls']:
                ball = detections['balls'][0]
                ball_info = {
                    'position': ball['center'],
                    'speed': self._calculate_ball_speed(ball['center']),
                    'height': ball['center'][1] / frame.shape[0]
                }
                self.ball_positions.append(ball['center'])

            for player_id, bbox in tracked_players.items():
                x1, y1, x2, y2 = bbox
                center_x = (x1 + x2) / 2 / frame.shape[1]
                center_y = (y1 + y2) / 2 / frame.shape[0]
                position = [center_x, center_y]

                player_positions_curr[player_id] = position

                speed = 0
                if player_id in player_positions_prev:
                    prev_pos = player_positions_prev[player_id]
                    dx = position[0] - prev_pos[0]
                    dy = position[1] - prev_pos[1]
                    speed = np.sqrt(dx**2 + dy**2) * self.fps

                crop = frame[y1:y2, x1:x2]
                if crop.size > 0:
                    pose_result = self.pose_estimator.estimate_pose(crop)
                    body_features = {}
                    if pose_result:
                        body_features = self.pose_estimator.extract_body_features(
                            pose_result['landmarks']
                        )

                    action_result = self.action_classifier.predict(body_features, ball_info)

                    if action_result and action_result['confidence'] > 0.6:
                        event = {
                            'player_id': player_id,
                            'action': action_result['action'],
                            'confidence': action_result['confidence'],
                            'frame_number': self.frame_count,
                            'timestamp': timestamp,
                            'position': position,
                            'ball_info': ball_info
                        }
                        self.events.append(event)
                        self.stats_generator.process_event(event)

                    is_jumping = body_features.get('is_jumping', False)
                    jump_height = body_features.get('height', 0) if is_jumping else 0
                    self.stats_generator.update_tracking_data(
                        player_id, position, speed, jump_height, is_jumping
                    )

            player_positions_prev = player_positions_curr.copy()
            player_positions_curr = {}

            if callback:
                callback(self.frame_count, total_frames, self.events[-1] if self.events else None)

        cap.release()
        self.pose_estimator.release()

        match_duration = self.frame_count / self.fps
        final_stats = {}
        for player_id in self.tracker.objects.keys():
            final_stats[player_id] = self.stats_generator.calculate_final_stats(
                player_id, match_duration
            )

        return {
            'events': self.events,
            'players_tracked': len(self.tracker.objects),
            'final_statistics': final_stats,
            'heatmaps': {
                pid: self.stats_generator.get_heatmap(pid)
                for pid in self.tracker.objects.keys()
            },
            'total_frames': self.frame_count,
            'match_duration': match_duration
        }

    def _calculate_ball_speed(self, current_pos):
        if len(self.ball_positions) < 2:
            return 0

        prev_pos = self.ball_positions[-1]
        dx = current_pos[0] - prev_pos[0]
        dy = current_pos[1] - prev_pos[1]
        pixel_speed = np.sqrt(dx**2 + dy**2) * self.fps

        meters_per_pixel = 18.0 / 1.0
        speed_ms = pixel_speed * meters_per_pixel
        speed_kmh = speed_ms * 3.6

        return speed_kmh

    def get_current_events(self):
        return self.events
