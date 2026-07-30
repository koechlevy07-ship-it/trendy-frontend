import numpy as np
from collections import deque


class BallTracker:
    def __init__(self, max_history=60, kalman_process_noise=0.03, kalman_measurement_noise=5.0):
        self.max_history = max_history
        self.positions = deque(maxlen=max_history)
        self.velocities = deque(maxlen=max_history)
        self.accelerations = deque(maxlen=max_history)
        self.timestamps = deque(maxlen=max_history)

        self.kf = KalmanFilter3D()
        self.kf.process_noise = kalman_process_noise
        self.kf.measurement_noise = kalman_measurement_noise

        self.is_tracking = False
        self.lost_frames = 0
        self.max_lost = 10

        self.trajectory = []
        self.bounce_points = []
        self.last_height = None

    def update(self, position, timestamp):
        if position is None:
            self.lost_frames += 1
            if self.lost_frames > self.max_lost:
                self.is_tracking = False
            return self.get_predicted_position()

        self.is_tracking = True
        self.lost_frames = 0

        predicted = self.kf.predict()
        self.kf.update(position)

        self.positions.append(position)
        self.timestamps.append(timestamp)
        self.trajectory.append(position)

        if len(self.positions) >= 2:
            dt = timestamp - self.timestamps[-2] if len(self.timestamps) >= 2 else 1/30
            if dt > 0:
                vx = (position[0] - self.positions[-2][0]) / dt
                vy = (position[1] - self.positions[-2][1]) / dt
                self.velocities.append((vx, vy))

        if len(self.velocities) >= 2:
            v1 = self.velocities[-2]
            v2 = self.velocities[-1]
            dt = 1/30
            ax = (v2[0] - v1[0]) / dt
            ay = (v2[1] - v1[1]) / dt
            self.accelerations.append((ax, ay))

        if self.last_height is not None and position[1] is not None:
            if self.last_height > position[1] and len(self.positions) > 3:
                prev_positions = list(self.positions)[-5:]
                heights = [p[1] for p in prev_positions if p[1] is not None]
                if len(heights) >= 3:
                    if heights[-3] > heights[-2] and heights[-1] > heights[-2]:
                        self.bounce_points.append(position)

        self.last_height = position[1] if position[1] is not None else self.last_height

        return position

    def get_predicted_position(self):
        if not self.is_tracking:
            return None
        return self.kf.predict()

    def get_speed(self):
        if not self.velocities:
            return 0
        v = self.velocities[-1]
        return np.sqrt(v[0]**2 + v[1]**2)

    def get_speed_kmh(self):
        pixel_speed = self.get_speed()
        meters_per_pixel = 18.0 / 1.0
        return pixel_speed * meters_per_pixel * 3.6

    def get_acceleration(self):
        if not self.accelerations:
            return 0
        a = self.accelerations[-1]
        return np.sqrt(a[0]**2 + a[1]**2)

    def get_direction(self):
        if len(self.positions) < 2:
            return None

        p1 = self.positions[-2]
        p2 = self.positions[-1]

        dx = p2[0] - p1[0]
        dy = p2[1] - p1[1]

        angle = np.degrees(np.arctan2(dy, dx))
        return angle

    def get_trajectory_curvature(self):
        if len(self.positions) < 5:
            return 0

        points = np.array(list(self.positions)[-10:])
        if len(points) < 5:
            return 0

        dx = np.gradient(points[:, 0])
        dy = np.gradient(points[:, 1])

        ddx = np.gradient(dx)
        ddy = np.gradient(dy)

        curvature = np.abs(dx * ddy - dy * ddx) / (dx**2 + dy**2 + 1e-6)**1.5
        return float(np.mean(curvature))

    def get_height(self, court_detector=None):
        if not self.positions:
            return 0

        pos = self.positions[-1]
        if court_detector and court_detector.homography is not None:
            court_pt = court_detector.pixel_to_court(pos)
            if court_pt:
                return court_pt[1]

        return pos[1] if pos[1] is not None else 0

    def is_crossing_net(self, court_detector):
        if len(self.positions) < 2 or court_detector is None:
            return False

        p1 = self.positions[-2]
        p2 = self.positions[-1]

        court1 = court_detector.pixel_to_court(p1)
        court2 = court_detector.pixel_to_court(p2)

        if court1 and court2:
            net_x = court_detector.real_court_length / 2
            if (court1[0] < net_x and court2[0] > net_x) or \
               (court1[0] > net_x and court2[0] < net_x):
                return True

        return False

    def detect_spin(self):
        if len(self.positions) < 10:
            return False

        points = np.array(list(self.positions)[-10:])
        dx = np.diff(points[:, 0])
        dy = np.diff(points[:, 1])

        sign_changes = np.sum(np.diff(np.sign(dx)) != 0)

        return sign_changes > 3

    def get_full_info(self, court_detector=None):
        return {
            'position': list(self.positions[-1]) if self.positions else None,
            'speed': self.get_speed(),
            'speed_kmh': self.get_speed_kmh(),
            'acceleration': self.get_acceleration(),
            'direction': self.get_direction(),
            'height': self.get_height(court_detector),
            'curvature': self.get_trajectory_curvature(),
            'bounce_detected': len(self.bounce_points),
            'spin_detected': self.detect_spin(),
            'is_tracking': self.is_tracking,
            'trajectory_length': len(self.trajectory)
        }

    def get_trajectory(self):
        return list(self.trajectory)

    def get_bounce_points(self):
        return list(self.bounce_points)

    def reset(self):
        self.positions.clear()
        self.velocities.clear()
        self.accelerations.clear()
        self.timestamps.clear()
        self.trajectory.clear()
        self.bounce_points.clear()
        self.is_tracking = False
        self.lost_frames = 0
        self.last_height = None
        self.kf.reset()


class KalmanFilter3D:
    def __init__(self):
        self.state = np.zeros(6)
        self.P = np.eye(6) * 100

        self.F = np.eye(6)
        self.F[0, 3] = 1
        self.F[1, 4] = 1
        self.F[2, 5] = 1

        self.H = np.zeros((3, 6))
        self.H[0, 0] = 1
        self.H[1, 1] = 1
        self.H[2, 2] = 1

        self.R = np.eye(3) * 5.0

        self.process_noise = 0.03
        self.Q = np.eye(6) * self.process_noise

        self.initialized = False

    def predict(self):
        if not self.initialized:
            return self.state[:3]

        self.state = self.F @ self.state
        self.P = self.F @ self.P @ self.F.T + self.Q

        return self.state[:3]

    def update(self, measurement):
        if not self.initialized:
            self.state[:3] = measurement
            self.initialized = True
            return

        self.R = np.eye(3) * self.process_noise * 100

        z = np.array(measurement)
        y = z - self.H @ self.state

        S = self.H @ self.P @ self.H.T + self.R
        K = self.P @ self.H.T @ np.linalg.inv(S)

        self.state = self.state + K @ y
        self.P = (np.eye(6) - K @ self.H) @ self.P

    def reset(self):
        self.state = np.zeros(6)
        self.P = np.eye(6) * 100
        self.initialized = False
