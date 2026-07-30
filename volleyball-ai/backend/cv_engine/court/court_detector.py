import cv2
import numpy as np


class CourtDetector:
    def __init__(self):
        self.court_vertices = None
        self.net_line = None
        self.attack_lines = None
        self.service_lines = None
        self.court_mask = None
        self.homography = None

        self.real_court_length = 18.0
        self.real_court_width = 9.0
        self.real_net_height = 2.43

        self.court_keypoints = {
            'bottom_left': (0, 9),
            'bottom_right': (18, 9),
            'top_left': (0, 0),
            'top_right': (18, 0),
            'net_left': (9, 0),
            'net_right': (9, 9),
            'attack_line_left': (3, 0),
            'attack_line_right': (3, 9),
            'service_line_left': (6, 0),
            'service_line_right': (6, 9)
        }

    def detect_court(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)

        kernel = np.ones((3, 3), np.uint8)
        edges = cv2.dilate(edges, kernel, iterations=1)
        edges = cv2.erode(edges, kernel, iterations=1)

        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=80,
                                minLineLength=100, maxLineGap=10)

        if lines is None:
            return None

        court_lines = self._filter_court_lines(lines, frame.shape)

        if len(court_lines) < 4:
            return None

        self.court_vertices = self._find_court_corners(court_lines, frame.shape)

        if self.court_vertices is not None:
            self.net_line = self._find_net_line(self.court_vertices)
            self.attack_lines = self._find_attack_lines(self.court_vertices)
            self.service_lines = self._find_service_lines(self.court_vertices)
            self.court_mask = self._create_court_mask(self.court_vertices, frame.shape)
            self.homography = self._compute_homography(self.court_vertices)

        return self.court_vertices

    def _filter_court_lines(self, lines, frame_shape):
        h, w = frame_shape[:2]
        filtered = []

        for line in lines:
            x1, y1, x2, y2 = line[0]
            length = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)

            if length < 80:
                continue

            angle = np.degrees(np.arctan2(y2 - y1, x2 - x1)) % 180

            if (angle < 15 or angle > 165) or (75 < angle < 105):
                filtered.append(line[0])

        return filtered

    def _find_court_corners(self, lines, frame_shape):
        h, w = frame_shape[:2]
        endpoints = []
        for x1, y1, x2, y2 in lines:
            endpoints.append((x1, y1))
            endpoints.append((x2, y2))

        if len(endpoints) < 4:
            return None

        endpoints = np.array(endpoints)

        left = endpoints[endpoints[:, 0] < w * 0.3]
        right = endpoints[endpoints[:, 0] > w * 0.7]
        top = endpoints[endpoints[:, 1] < h * 0.3]
        bottom = endpoints[endpoints[:, 1] > h * 0.7]

        if len(left) == 0 or len(right) == 0 or len(top) == 0 or len(bottom) == 0:
            return None

        tl = top[top[:, 0] == top[:, 0].min()][0] if len(top) > 0 else (0, 0)
        tr = top[top[:, 0] == top[:, 0].max()][0] if len(top) > 0 else (w, 0)
        bl = bottom[bottom[:, 0] == bottom[:, 0].min()][0] if len(bottom) > 0 else (0, h)
        br = bottom[bottom[:, 0] == bottom[:, 0].max()][0] if len(bottom) > 0 else (w, h)

        corners = np.array([tl, tr, br, bl], dtype=np.float32)
        return corners

    def _find_net_line(self, corners):
        if corners is None:
            return None
        mid_top = ((corners[0][0] + corners[1][0]) / 2, (corners[0][1] + corners[1][1]) / 2)
        mid_bottom = ((corners[2][0] + corners[3][0]) / 2, (corners[2][1] + corners[3][1]) / 2)
        return (mid_top, mid_bottom)

    def _find_attack_lines(self, corners):
        if corners is None:
            return None
        left_mid = corners[0] * 2 / 3 + corners[3] * 1 / 3
        right_mid = corners[1] * 2 / 3 + corners[2] * 1 / 3
        return ((tuple(left_mid.astype(int)), tuple(right_mid.astype(int))))

    def _find_service_lines(self, corners):
        if corners is None:
            return None
        left_mid = corners[0] * 1 / 3 + corners[3] * 2 / 3
        right_mid = corners[1] * 1 / 3 + corners[2] * 2 / 3
        return ((tuple(left_mid.astype(int)), tuple(right_mid.astype(int))))

    def _create_court_mask(self, corners, frame_shape):
        mask = np.zeros(frame_shape[:2], dtype=np.uint8)
        pts = corners.astype(np.int32).reshape((-1, 1, 2))
        cv2.fillConvexPoly(mask, pts, 255)
        return mask

    def _compute_homography(self, corners):
        if corners is None:
            return None

        src = corners.astype(np.float32)
        dst = np.array([
            [0, 0],
            [self.real_court_length, 0],
            [self.real_court_length, self.real_court_width],
            [0, self.real_court_width]
        ], dtype=np.float32)

        H, _ = cv2.findHomography(src, dst, cv2.RANSAC, 5.0)
        return H

    def pixel_to_court(self, pixel_point):
        if self.homography is None:
            return None

        pt = np.array([pixel_point[0], pixel_point[1], 1.0])
        court_pt = self.homography @ pt
        court_pt /= court_pt[2]

        return (court_pt[0], court_pt[1])

    def court_to_pixel(self, court_point):
        if self.homography is None:
            return None

        H_inv = np.linalg.inv(self.homography)
        pt = np.array([court_point[0], court_point[1], 1.0])
        pixel_pt = H_inv @ pt
        pixel_pt /= pixel_pt[2]

        return (int(pixel_pt[0]), int(pixel_pt[1]))

    def is_in_court(self, pixel_point):
        if self.court_mask is None:
            return True
        x, y = int(pixel_point[0]), int(pixel_point[1])
        if 0 <= y < self.court_mask.shape[0] and 0 <= x < self.court_mask.shape[1]:
            return self.court_mask[y, x] > 0
        return False

    def is_in_opponent_court(self, pixel_point, team_side='left'):
        court_pt = self.pixel_to_court(pixel_point)
        if court_pt is None:
            return False

        if team_side == 'left':
            return court_pt[0] > self.real_court_length / 2
        else:
            return court_pt[0] < self.real_court_length / 2

    def get_zone(self, pixel_point):
        court_pt = self.pixel_to_court(pixel_point)
        if court_pt is None:
            return None

        x, y = court_pt

        if x < 3:
            return 'back_left'
        elif x < 6:
            return 'mid_left'
        elif x < 9:
            return 'front_left'
        elif x < 12:
            return 'front_right'
        elif x < 15:
            return 'mid_right'
        else:
            return 'back_right'

    def draw_court(self, frame):
        if self.court_vertices is None:
            return frame

        overlay = frame.copy()
        pts = self.court_vertices.astype(np.int32).reshape((-1, 1, 2))
        cv2.polylines(overlay, [pts], True, (0, 255, 0), 2)

        if self.net_line:
            cv2.line(overlay, self.net_line[0], self.net_line[1], (255, 255, 0), 2)

        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        return frame
