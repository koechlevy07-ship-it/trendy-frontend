from ultralytics import YOLO
import cv2
import numpy as np


class YOLODetector:
    def __init__(self, model_path='yolov8x.pt', confidence=0.5):
        self.model = YOLO(model_path)
        self.confidence = confidence
        self.player_class_id = 0
        self.ball_class_id = 32

    def detect_players(self, frame):
        results = self.model(frame, conf=self.confidence, classes=[self.player_class_id])
        detections = []

        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = box.conf[0].cpu().numpy()
                detections.append({
                    'bbox': [int(x1), int(y1), int(x2), int(y2)],
                    'confidence': float(conf),
                    'class': 'player'
                })

        return detections

    def detect_ball(self, frame):
        results = self.model(frame, conf=self.confidence, classes=[self.ball_class_id])
        detections = []

        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = box.conf[0].cpu().numpy()
                cx = (x1 + x2) / 2
                cy = (y1 + y2) / 2
                detections.append({
                    'bbox': [int(x1), int(y1), int(x2), int(y2)],
                    'center': [float(cx), float(cy)],
                    'confidence': float(conf),
                    'class': 'ball'
                })

        return detections

    def detect_all(self, frame):
        results = self.model(frame, conf=self.confidence, classes=[self.player_class_id, self.ball_class_id])
        players = []
        balls = []

        for result in results:
            boxes = result.boxes
            for box in boxes:
                class_id = int(box.cls[0].cpu().numpy())
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = box.conf[0].cpu().numpy()

                detection = {
                    'bbox': [int(x1), int(y1), int(x2), int(y2)],
                    'confidence': float(conf),
                    'class': 'player' if class_id == self.player_class_id else 'ball'
                }

                if class_id == self.player_class_id:
                    players.append(detection)
                else:
                    detection['center'] = [float((x1 + x2) / 2), float((y1 + y2) / 2)]
                    balls.append(detection)

        return {'players': players, 'balls': balls}
