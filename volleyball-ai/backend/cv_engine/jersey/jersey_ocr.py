import cv2
import numpy as np
import re


class JerseyOCR:
    def __init__(self):
        self.number_history = {}
        self.min_confidence = 0.4

    def detect_jersey_number(self, frame, player_bbox):
        x1, y1, x2, y2 = player_bbox
        player_h = y2 - y1
        player_w = x2 - x1

        jersey_region = self._extract_jersey_region(frame, player_bbox)
        if jersey_region is None:
            return None

        number = self._read_number(jersey_region)

        if number is not None and 0 <= number <= 99:
            return number

        return None

    def _extract_jersey_region(self, frame, bbox):
        x1, y1, x2, y2 = bbox
        h = y2 - y1
        w = x2 - x1

        jersey_top = int(y1 + h * 0.2)
        jersey_bottom = int(y1 + h * 0.7)
        jersey_left = int(x1 + w * 0.15)
        jersey_right = int(x2 - w * 0.15)

        if jersey_bottom <= jersey_top or jersey_right <= jersey_left:
            return None

        jersey = frame[jersey_top:jersey_bottom, jersey_left:jersey_right]

        if jersey.size == 0:
            return None

        return jersey

    def _read_number(self, jersey_img):
        gray = cv2.cvtColor(jersey_img, cv2.COLOR_BGR2GRAY)

        blurred = cv2.GaussianBlur(gray, (3, 3), 0)

        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, 11, 2
        )

        kernel = np.ones((2, 2), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if len(contours) < 1 or len(contours) > 4:
            return None

        digit_boxes = []
        for c in contours:
            x, y, w, h = cv2.boundingRect(c)
            aspect = w / max(h, 1)
            area = w * h

            if 0.2 < aspect < 1.5 and area > 20:
                digit_boxes.append((x, y, w, h))

        if len(digit_boxes) < 1 or len(digit_boxes) > 2:
            return None

        digit_boxes.sort(key=lambda b: b[0])

        number_str = ''
        for box in digit_boxes:
            x, y, w, h = box
            digit_img = thresh[y:y+h, x:x+w]

            digit_img = cv2.resize(digit_img, (20, 30))

            digit = self._classify_digit(digit_img)
            if digit is not None:
                number_str += str(digit)

        if number_str:
            try:
                return int(number_str)
            except ValueError:
                return None

        return None

    def _classify_digit(self, digit_img):
        templates = self._get_digit_templates()

        best_match = -1
        best_score = 0

        for digit, template in templates.items():
            resized = cv2.resize(template, (20, 30))
            result = cv2.matchTemplate(digit_img, resized, cv2.TM_CCOEFF_NORMED)
            score = result.max()

            if score > best_score:
                best_score = score
                best_match = digit

        if best_score > 0.3:
            return best_match

        return None

    def _get_digit_templates(self):
        templates = {}
        for digit in range(10):
            template = np.zeros((30, 20), dtype=np.uint8)

            if digit == 0:
                cv2.ellipse(template, (10, 15), (7, 12), 0, 0, 360, 255, 2)
            elif digit == 1:
                cv2.line(template, (10, 3), (10, 27), 255, 2)
            elif digit == 2:
                cv2.arc(template, (10, 8), (7, 5), 180, 360, 255, 2)
                cv2.line(template, (3, 12), (17, 27), 255, 2)
            elif digit == 3:
                cv2.arc(template, (10, 8), (7, 5), 180, 360, 255, 2)
                cv2.arc(template, (10, 20), (7, 5), 180, 360, 255, 2)
            elif digit == 4:
                cv2.line(template, (3, 3), (3, 18), 255, 2)
                cv2.line(template, (3, 18), (17, 18), 255, 2)
                cv2.line(template, (15, 3), (15, 27), 255, 2)
            elif digit == 5:
                cv2.line(template, (15, 3), (3, 3), 255, 2)
                cv2.line(template, (3, 3), (3, 15), 255, 2)
                cv2.arc(template, (10, 20), (7, 5), 180, 360, 255, 2)
            elif digit == 6:
                cv2.ellipse(template, (10, 20), (7, 8), 0, 0, 360, 255, 2)
                cv2.line(template, (3, 3), (3, 20), 255, 2)
            elif digit == 7:
                cv2.line(template, (3, 3), (17, 3), 255, 2)
                cv2.line(template, (15, 3), (8, 27), 255, 2)
            elif digit == 8:
                cv2.ellipse(template, (10, 10), (6, 6), 0, 0, 360, 255, 2)
                cv2.ellipse(template, (10, 21), (6, 6), 0, 0, 360, 255, 2)
            elif digit == 9:
                cv2.ellipse(template, (10, 10), (7, 8), 0, 0, 360, 255, 2)
                cv2.line(template, (17, 10), (17, 27), 255, 2)

            templates[digit] = template

        return templates

    def update_tracking(self, player_id, detected_number):
        if detected_number is None:
            return

        if player_id not in self.number_history:
            self.number_history[player_id] = []

        self.number_history[player_id].append(detected_number)

        if len(self.number_history[player_id]) > 10:
            self.number_history[player_id].pop(0)

    def get_consensus_number(self, player_id):
        if player_id not in self.number_history or not self.number_history[player_id]:
            return None

        from collections import Counter
        counts = Counter(self.number_history[player_id])
        most_common = counts.most_common(1)[0]

        if most_common[1] >= 3:
            return most_common[0]

        return None

    def reset(self):
        self.number_history.clear()
