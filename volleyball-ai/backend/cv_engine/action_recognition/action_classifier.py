import numpy as np
import torch
import torch.nn as nn
from collections import deque


class VolleyballActionLSTM(nn.Module):
    def __init__(self, input_size=33, hidden_size=128, num_layers=2, num_classes=13):
        super(VolleyballActionLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.3
        )

        self.fc = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)

        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out


ACTION_CLASSES = [
    'serve', 'serve_ace', 'reception', 'set', 'spike',
    'kill', 'block', 'dig', 'free_ball', 'attack_error',
    'service_error', 'net_touch', 'rotation_fault'
]


class ActionClassifier:
    def __init__(self, model_path=None, sequence_length=30, device=None):
        self.sequence_length = sequence_length
        self.device = device or ('cuda' if torch.cuda.is_available() else 'cpu')

        self.model = VolleyballActionLSTM(input_size=33)
        if model_path:
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()

        self.feature_buffer = deque(maxlen=sequence_length)
        self.prediction_buffer = deque(maxlen=5)

    def extract_features(self, body_features, ball_info=None):
        if not body_features:
            return np.zeros(33)

        features = np.array([
            body_features.get('shoulder_center_y', 0),
            body_features.get('hip_center_y', 0),
            body_features.get('left_wrist_y', 0),
            body_features.get('right_wrist_y', 0),
            body_features.get('torso_length', 0),
            body_features.get('height', 0),
            body_features.get('arm_span', 0),
            body_features.get('left_arm_length', 0),
            body_features.get('right_arm_length', 0),
            body_features.get('left_leg_length', 0),
            body_features.get('right_leg_length', 0),
            body_features.get('left_knee_angle', 0) / 180.0,
            body_features.get('right_knee_angle', 0) / 180.0,
            body_features.get('left_elbow_angle', 0) / 180.0,
            body_features.get('right_elbow_angle', 0) / 180.0,
            float(body_features.get('is_jumping', False)),
            float(body_features.get('is_reaching_up', False)),
            float(body_features.get('is_low_position', False)),
            float(body_features.get('arm_raised', False)),
        ])

        ball_features = np.zeros(14)
        if ball_info:
            ball_features = np.array([
                ball_info.get('speed', 0),
                ball_info.get('height', 0),
                ball_info.get('direction_x', 0),
                ball_info.get('direction_y', 0),
                ball_info.get('acceleration', 0),
                ball_info.get('player_action', 0),
                ball_info.get('ball_contact', 0),
                ball_info.get('distance_to_net', 0),
                ball_info.get('trajectory_curvature', 0),
                ball_info.get('spin_detected', 0),
                ball_info.get('bounce_detected', 0),
                ball_info.get('horizontal_position', 0),
                ball_info.get('vertical_position', 0),
                ball_info.get('depth_position', 0),
            ])

        return np.concatenate([features, ball_features])

    def predict(self, body_features, ball_info=None):
        features = self.extract_features(body_features, ball_info)
        self.feature_buffer.append(features)

        if len(self.feature_buffer) < self.sequence_length:
            return None

        sequence = np.array(list(self.feature_buffer))
        sequence_tensor = torch.FloatTensor(sequence).unsqueeze(0).to(self.device)

        with torch.no_grad():
            output = self.model(sequence_tensor)
            probabilities = torch.softmax(output, dim=1)
            confidence, predicted = torch.max(probabilities, 1)

        action = ACTION_CLASSES[predicted.item()]
        conf = confidence.item()

        self.prediction_buffer.append(action)

        if len(self.prediction_buffer) >= 3:
            from collections import Counter
            counts = Counter(self.prediction_buffer)
            most_common = counts.most_common(1)[0]
            if most_common[1] >= 2:
                action = most_common[0]

        return {
            'action': action,
            'confidence': conf,
            'probabilities': probabilities.cpu().numpy().tolist()
        }

    def reset(self):
        self.feature_buffer.clear()
        self.prediction_buffer.clear()
