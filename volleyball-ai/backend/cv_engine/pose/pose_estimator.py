import mediapipe as mp
import numpy as np
import cv2


class PoseEstimator:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=2,
            smooth_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def estimate_pose(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb_frame)

        if not results.pose_landmarks:
            return None

        landmarks = []
        for lm in results.pose_landmarks.landmark:
            landmarks.append({
                'x': lm.x,
                'y': lm.y,
                'z': lm.z,
                'visibility': lm.visibility
            })

        return {
            'landmarks': landmarks,
            'pose_landmarks': results.pose_landmarks
        }

    def extract_body_features(self, landmarks):
        if not landmarks:
            return {}

        left_shoulder = landmarks[11]
        right_shoulder = landmarks[12]
        left_hip = landmarks[23]
        right_hip = landmarks[24]
        left_knee = landmarks[25]
        right_knee = landmarks[26]
        left_ankle = landmarks[27]
        right_ankle = landmarks[28]
        left_wrist = landmarks[15]
        right_wrist = landmarks[16]
        nose = landmarks[0]

        shoulder_center_y = (left_shoulder['y'] + right_shoulder['y']) / 2
        hip_center_y = (left_hip['y'] + right_hip['y']) / 2

        torso_length = abs(hip_center_y - shoulder_center_y)
        left_arm_length = self._distance(left_shoulder, left_wrist)
        right_arm_length = self._distance(right_shoulder, right_wrist)
        left_leg_length = self._distance(left_hip, left_ankle)
        right_leg_length = self._distance(right_hip, right_ankle)

        arm_span = self._distance(left_wrist, right_wrist)
        height = self._distance(nose, left_ankle)

        is_jumping = shoulder_center_y < 0.35
        is_reaching_up = left_wrist['y'] < shoulder_center_y or right_wrist['y'] < shoulder_center_y
        is_low_position = hip_center_y > 0.7
        arm_raised = left_wrist['y'] < nose['y'] or right_wrist['y'] < nose['y']

        left_knee_angle = self._calculate_angle(left_hip, left_knee, left_ankle)
        right_knee_angle = self._calculate_angle(right_hip, right_knee, right_ankle)
        left_elbow_angle = self._calculate_angle(left_shoulder, landmarks[13], left_wrist)
        right_elbow_angle = self._calculate_angle(right_shoulder, landmarks[14], right_wrist)

        return {
            'torso_length': torso_length,
            'arm_span': arm_span,
            'height': height,
            'left_arm_length': left_arm_length,
            'right_arm_length': right_arm_length,
            'left_leg_length': left_leg_length,
            'right_leg_length': right_leg_length,
            'is_jumping': is_jumping,
            'is_reaching_up': is_reaching_up,
            'is_low_position': is_low_position,
            'arm_raised': arm_raised,
            'left_knee_angle': left_knee_angle,
            'right_knee_angle': right_knee_angle,
            'left_elbow_angle': left_elbow_angle,
            'right_elbow_angle': right_elbow_angle,
            'shoulder_center_y': shoulder_center_y,
            'hip_center_y': hip_center_y,
            'left_wrist_y': left_wrist['y'],
            'right_wrist_y': right_wrist['y']
        }

    def _distance(self, p1, p2):
        return np.sqrt((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2)

    def _calculate_angle(self, p1, p2, p3):
        v1 = np.array([p1['x'] - p2['x'], p1['y'] - p2['y']])
        v2 = np.array([p3['x'] - p2['x'], p3['y'] - p2['y']])

        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
        angle = np.arccos(np.clip(cos_angle, -1.0, 1.0))
        return np.degrees(angle)

    def draw_pose(self, frame, pose_landmarks):
        self.mp_drawing.draw_landmarks(
            frame,
            pose_landmarks,
            self.mp_pose.POSE_CONNECTIONS,
            self.mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
            self.mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2)
        )
        return frame

    def release(self):
        self.pose.close()
