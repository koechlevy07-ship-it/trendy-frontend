import numpy as np
from collections import defaultdict


class SimpleTracker:
    def __init__(self, max_disappeared=30, max_distance=80):
        self.next_id = 0
        self.objects = {}
        self.disappeared = {}
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance
        self.trajectories = defaultdict(list)

    def _compute_centroid(self, bbox):
        x1, y1, x2, y2 = bbox
        return np.array([(x1 + x2) / 2, (y1 + y2) / 2])

    def register(self, bbox):
        self.objects[self.next_id] = bbox
        self.disappeared[self.next_id] = 0
        self.trajectories[self.next_id].append(self._compute_centroid(bbox))
        self.next_id += 1

    def deregister(self, object_id):
        del self.objects[object_id]
        del self.disappeared[object_id]

    def update(self, detections):
        if len(detections) == 0:
            for object_id in list(self.disappeared.keys()):
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    self.deregister(object_id)
            return self.objects

        if len(self.objects) == 0:
            for det in detections:
                self.register(det['bbox'])
            return self.objects

        object_ids = list(self.objects.keys())
        object_centroids = [self._compute_centroid(self.objects[oid]) for oid in object_ids]

        detection_bboxes = [det['bbox'] for det in detections]
        detection_centroids = [self._compute_centroid(bbox) for bbox in detection_bboxes]

        distances = np.zeros((len(object_centroids), len(detection_centroids)))
        for i, oc in enumerate(object_centroids):
            for j, dc in enumerate(detection_centroids):
                distances[i, j] = np.linalg.norm(oc - dc)

        rows = distances.min(axis=1).argsort()
        cols = distances.argmin(axis=1)[rows]

        used_rows = set()
        used_cols = set()

        for (row, col) in zip(rows, cols):
            if row in used_rows or col in used_cols:
                continue
            if distances[row, col] > self.max_distance:
                continue

            object_id = object_ids[row]
            self.objects[object_id] = detection_bboxes[col]
            self.disappeared[object_id] = 0
            self.trajectories[object_id].append(detection_centroids[col])

            used_rows.add(row)
            used_cols.add(col)

        unused_rows = set(range(len(object_centroids))) - used_rows
        for row in unused_rows:
            object_id = object_ids[row]
            self.disappeared[object_id] += 1
            if self.disappeared[object_id] > self.max_disappeared:
                self.deregister(object_id)

        unused_cols = set(range(len(detection_centroids))) - used_cols
        for col in unused_cols:
            self.register(detection_bboxes[col])

        return self.objects

    def get_trajectory(self, object_id):
        return self.trajectories.get(object_id, [])

    def get_all_trajectories(self):
        return dict(self.trajectories)
