import numpy as np
from collections import defaultdict


class StatisticsGenerator:
    def __init__(self):
        self.player_stats = defaultdict(lambda: {
            'serves': 0, 'aces': 0, 'service_errors': 0,
            'attack_attempts': 0, 'successful_attacks': 0,
            'kills': 0, 'attack_errors': 0, 'blocked_attacks': 0,
            'solo_blocks': 0, 'block_assists': 0,
            'digs': 0, 'saves': 0,
            'reception_attempts': 0, 'perfect_receptions': 0, 'reception_errors': 0,
            'assists': 0, 'setting_errors': 0,
            'distance_covered': 0.0, 'number_of_jumps': 0,
            'highest_jump': 0.0, 'avg_jump_height': 0.0,
            'sprint_speed': 0.0, 'avg_movement_speed': 0.0,
            'playing_time_seconds': 0
        })

        self.player_positions = defaultdict(list)
        self.player_speeds = defaultdict(list)
        self.player_jumps = defaultdict(list)
        self.player_heatmaps = defaultdict(lambda: np.zeros((20, 20)))

    def process_event(self, event):
        player_id = event.get('player_id')
        action = event.get('action')
        timestamp = event.get('timestamp', 0)

        if player_id is None or action is None:
            return

        stats = self.player_stats[player_id]

        action_map = {
            'serve': lambda s: s.__setitem__('serves', s['serves'] + 1),
            'serve_ace': lambda s: (
                s.__setitem__('aces', s['aces'] + 1),
                s.__setitem__('serves', s['serves'] + 1)
            ),
            'service_error': lambda s: (
                s.__setitem__('service_errors', s['service_errors'] + 1),
                s.__setitem__('serves', s['serves'] + 1)
            ),
            'spike': lambda s: s.__setitem__('attack_attempts', s['attack_attempts'] + 1),
            'kill': lambda s: (
                s.__setitem__('kills', s['kills'] + 1),
                s.__setitem__('successful_attacks', s['successful_attacks'] + 1),
                s.__setitem__('attack_attempts', s['attack_attempts'] + 1)
            ),
            'attack_error': lambda s: (
                s.__setitem__('attack_errors', s['attack_errors'] + 1),
                s.__setitem__('attack_attempts', s['attack_attempts'] + 1)
            ),
            'block': lambda s: s.__setitem__('solo_blocks', s['solo_blocks'] + 1),
            'dig': lambda s: s.__setitem__('digs', s['digs'] + 1),
            'reception': lambda s: s.__setitem__('reception_attempts', s['reception_attempts'] + 1),
            'set': lambda s: s.__setitem__('assists', s['assists'] + 1),
            'free_ball': lambda s: s.__setitem__('digs', s['digs'] + 1)
        }

        if action in action_map:
            action_map[action](stats)

    def update_tracking_data(self, player_id, position, speed=0, jump_height=0, is_jumping=False):
        self.player_positions[player_id].append(position)

        self.player_speeds[player_id].append(speed)

        if is_jumping:
            self.player_jumps[player_id].append(jump_height)

        if position:
            court_x = int(np.clip(position[0] * 20, 0, 19))
            court_y = int(np.clip(position[1] * 20, 0, 19))
            self.player_heatmaps[player_id][court_y][court_x] += 1

    def calculate_final_stats(self, player_id, match_duration_seconds):
        stats = self.player_stats[player_id]
        positions = self.player_positions[player_id]
        speeds = self.player_speeds[player_id]
        jumps = self.player_jumps[player_id]

        if positions and len(positions) > 1:
            total_distance = 0
            for i in range(1, len(positions)):
                if positions[i] and positions[i-1]:
                    dx = positions[i][0] - positions[i-1][0]
                    dy = positions[i][1] - positions[i-1][1]
                    total_distance += np.sqrt(dx**2 + dy**2)
            stats['distance_covered'] = total_distance * 18.0

        if speeds:
            stats['avg_movement_speed'] = np.mean(speeds)
            stats['sprint_speed'] = np.max(speeds)

        if jumps:
            stats['number_of_jumps'] = len(jumps)
            stats['highest_jump'] = max(jumps)
            stats['avg_jump_height'] = np.mean(jumps)

        stats['playing_time_seconds'] = match_duration_seconds

        return stats

    def get_heatmap(self, player_id):
        heatmap = self.player_heatmaps.get(player_id)
        if heatmap is not None:
            heatmap_normalized = heatmap / (heatmap.max() + 1e-6)
            return heatmap_normalized.tolist()
        return None

    def get_all_stats(self):
        return dict(self.player_stats)

    def reset(self):
        self.player_stats.clear()
        self.player_positions.clear()
        self.player_speeds.clear()
        self.player_jumps.clear()
        self.player_heatmaps.clear()
