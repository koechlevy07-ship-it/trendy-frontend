import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const PlayerRankings = () => {
    const [rankings, setRankings] = useState([]);
    const [category, setCategory] = useState('overall');

    useEffect(() => {
        fetchRankings();
    }, [category]);

    const fetchRankings = async () => {
        try {
            const res = await axios.get(`${API}/analytics/rankings?category=${category}&limit=20`);
            setRankings(res.data);
        } catch (err) {
            const demoData = [
                { rank: 1, player_id: 1, name: 'Marcus Johnson', jersey_number: 7, position: 'Outside Hitter', team_id: 1, matches_played: 12, kills: 156, aces: 28, blocks: 34, digs: 89, assists: 12, score: 642, hitting_pct: 0.312, serve_pct: 12.5, reception_pct: 62.3 },
                { rank: 2, player_id: 2, name: 'Kenji Tanaka', jersey_number: 10, position: 'Setter', team_id: 1, matches_played: 12, kills: 45, aces: 18, blocks: 12, digs: 120, assists: 234, score: 548, hitting_pct: 0.285, serve_pct: 10.2, reception_pct: 71.5 },
                { rank: 3, player_id: 3, name: 'Andre Williams', jersey_number: 3, position: 'Middle Blocker', team_id: 1, matches_played: 12, kills: 98, aces: 12, blocks: 56, digs: 34, assists: 5, score: 487, hitting_pct: 0.345, serve_pct: 8.1, reception_pct: 0 },
                { rank: 4, player_id: 4, name: 'Lucas Fernandez', jersey_number: 8, position: 'Libero', team_id: 1, matches_played: 12, kills: 2, aces: 8, blocks: 2, digs: 189, assists: 8, score: 412, hitting_pct: 0.1, serve_pct: 6.5, reception_pct: 78.2 },
                { rank: 5, player_id: 5, name: 'Omar Hassan', jersey_number: 12, position: 'Opposite', team_id: 1, matches_played: 12, kills: 112, aces: 15, blocks: 28, digs: 45, assists: 8, score: 398, hitting_pct: 0.298, serve_pct: 9.8, reception_pct: 55.1 },
                { rank: 6, player_id: 6, name: 'Pierre Dubois', jersey_number: 5, position: 'Outside Hitter', team_id: 2, matches_played: 11, kills: 134, aces: 22, blocks: 28, digs: 76, assists: 10, score: 489, hitting_pct: 0.288, serve_pct: 11.2, reception_pct: 58.9 },
                { rank: 7, player_id: 7, name: 'Diego Ramirez', jersey_number: 9, position: 'Setter', team_id: 2, matches_played: 11, kills: 38, aces: 14, blocks: 8, digs: 98, assists: 198, score: 456, hitting_pct: 0.265, serve_pct: 9.5, reception_pct: 68.4 },
                { rank: 8, player_id: 8, name: 'Yuki Sato', jersey_number: 11, position: 'Middle Blocker', team_id: 2, matches_played: 11, kills: 87, aces: 10, blocks: 48, digs: 28, assists: 3, score: 423, hitting_pct: 0.328, serve_pct: 7.8, reception_pct: 0 }
            ];
            setRankings(demoData);
        }
    };

    const categories = [
        { key: 'overall', label: 'Overall', icon: '🏆' },
        { key: 'attacking', label: 'Attacking', icon: '⚡' },
        { key: 'serving', label: 'Serving', icon: '📡' },
        { key: 'blocking', label: 'Blocking', icon: '🧱' },
        { key: 'defense', label: 'Defense', icon: '🛡️' },
        { key: 'setting', label: 'Setting', icon: '🎯' },
        { key: 'receiving', label: 'Receiving', icon: '📥' }
    ];

    const getRankBadge = (rank) => {
        if (rank === 1) return { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', text: '#1a1a2e' };
        if (rank === 2) return { bg: 'linear-gradient(135deg, #9ca3af, #6b7280)', text: '#1a1a2e' };
        if (rank === 3) return { bg: 'linear-gradient(135deg, #d97706, #b45309)', text: '#1a1a2e' };
        return { bg: '#1f2937', text: '#9ca3af' };
    };

    return (
        <div className="dashboard">
            <div className="page-header">
                <h2>Player Rankings</h2>
                <p>AI-computed player performance rankings across all categories</p>
            </div>

            <div className="ranking-categories">
                {categories.map(cat => (
                    <button key={cat.key}
                        className={`ranking-cat-btn ${category === cat.key ? 'active' : ''}`}
                        onClick={() => setCategory(cat.key)}>
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>{categories.find(c => c.key === category)?.icon} {categories.find(c => c.key === category)?.label} Rankings</h3>
                    <span className="badge">{rankings.length} players</span>
                </div>

                {rankings.length > 0 && (
                    <div className="podium">
                        {rankings.slice(0, 3).map((player, i) => (
                            <div key={player.player_id} className={`podium-item podium-${i + 1}`}>
                                <div className="podium-rank" style={{ background: getRankBadge(player.rank).bg, color: getRankBadge(player.rank).text }}>
                                    #{player.rank}
                                </div>
                                <div className="podium-avatar">#{player.jersey_number}</div>
                                <div className="podium-name">{player.name}</div>
                                <div className="podium-position">{player.position}</div>
                                <div className="podium-score">{player.score}</div>
                                <div className="podium-stat">
                                    {category === 'overall' && `${player.kills}K ${player.aces}A ${player.blocks}B`}
                                    {category === 'attacking' && `${player.kills} kills`}
                                    {category === 'serving' && `${player.aces} aces`}
                                    {category === 'blocking' && `${player.blocks} blocks`}
                                    {category === 'defense' && `${player.digs} digs`}
                                    {category === 'setting' && `${player.assists} assists`}
                                    {category === 'receiving' && `${player.reception_pct}%`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Team</th>
                            <th>Matches</th>
                            <th>K</th>
                            <th>A</th>
                            <th>B</th>
                            <th>D</th>
                            <th>AS</th>
                            <th>Hitting %</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankings.map(player => (
                            <tr key={player.player_id} className={player.rank <= 3 ? 'top-rank-row' : ''}>
                                <td>
                                    <span className="rank-badge" style={{ background: getRankBadge(player.rank).bg, color: getRankBadge(player.rank).text }}>
                                        #{player.rank}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="player-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>#{player.jersey_number}</div>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{player.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{player.position}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>Team {player.team_id}</td>
                                <td>{player.matches_played}</td>
                                <td>{player.kills}</td>
                                <td style={{ color: '#10b981' }}>{player.aces}</td>
                                <td style={{ color: '#f59e0b' }}>{player.blocks}</td>
                                <td style={{ color: '#3b82f6' }}>{player.digs}</td>
                                <td>{player.assists}</td>
                                <td>{player.hitting_pct}</td>
                                <td style={{ fontWeight: 700, color: '#f59e0b' }}>{player.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlayerRankings;
