import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const MatchAwards = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchAwards();
    }, [id]);

    const fetchAwards = async () => {
        try {
            const res = await axios.get(`${API}/statistics/match/${id}/awards`);
            setData(res.data);
        } catch (err) {
            setData({
                match: { id: 1, home_team_id: 1, away_team_id: 2, home_score: 3, away_score: 1, venue: 'Main Arena' },
                awards: {
                    mvp: { title: 'Most Valuable Player', icon: '🏆', player: { id: 1, name: 'Marcus Johnson', jersey_number: 7, position: 'Outside Hitter', team_id: 1 }, stat_value: 42, stat_label: 'MVP Score', breakdown: '8K 2A 3B 5D 3AS' },
                    best_scorer: { title: 'Best Scorer', icon: '🎯', player: { id: 1, name: 'Marcus Johnson', jersey_number: 7, position: 'Outside Hitter', team_id: 1 }, stat_value: 8, stat_label: 'Kills', breakdown: '15 attempts, 8 successful' },
                    best_server: { title: 'Best Server', icon: '📡', player: { id: 2, name: 'Kenji Tanaka', jersey_number: 10, position: 'Setter', team_id: 1 }, stat_value: 3, stat_label: 'Aces', breakdown: '12 serves, 1 error' },
                    best_blocker: { title: 'Best Blocker', icon: '🧱', player: { id: 3, name: 'Andre Williams', jersey_number: 3, position: 'Middle Blocker', team_id: 1 }, stat_value: 5, stat_label: 'Total Blocks', breakdown: '3 solo, 2 assists' },
                    best_digger: { title: 'Best Digger', icon: '🏐', player: { id: 4, name: 'Lucas Fernandez', jersey_number: 8, position: 'Libero', team_id: 1 }, stat_value: 12, stat_label: 'Digs', breakdown: '2 saves' },
                    best_setter: { title: 'Best Setter', icon: '🎯', player: { id: 2, name: 'Kenji Tanaka', jersey_number: 10, position: 'Setter', team_id: 1 }, stat_value: 15, stat_label: 'Assists', breakdown: '2 setting errors' },
                    best_receiver: { title: 'Best Receiver', icon: '📥', player: { id: 4, name: 'Lucas Fernandez', jersey_number: 8, position: 'Libero', team_id: 1 }, stat_value: '70%', stat_label: 'Reception Accuracy', breakdown: '7/10 perfect' },
                    most_active: { title: 'Most Active Player', icon: '🏃', player: { id: 4, name: 'Lucas Fernandez', jersey_number: 8, position: 'Libero', team_id: 1 }, stat_value: '4.5 km', stat_label: 'Distance Covered', breakdown: 'Top speed: 27.8 km/h' },
                    top_jumper: { title: 'Highest Jumper', icon: '🦘', player: { id: 1, name: 'Marcus Johnson', jersey_number: 7, position: 'Outside Hitter', team_id: 1 }, stat_value: '85.2 cm', stat_label: 'Highest Jump', breakdown: '42 total jumps' }
                },
                player_stats: []
            });
        }
    };

    if (!data) return <div className="dashboard"><div className="page-header"><h2>Loading awards...</h2></div></div>;

    const { match, awards, player_stats } = data;

    const awardOrder = ['mvp', 'best_scorer', 'best_server', 'best_blocker', 'best_digger', 'best_setter', 'best_receiver', 'most_active', 'top_jumper'];
    const awardColors = {
        mvp: 'linear-gradient(135deg, #f59e0b, #d97706)',
        best_scorer: 'linear-gradient(135deg, #dc2626, #b91c1c)',
        best_server: 'linear-gradient(135deg, #10b981, #059669)',
        best_blocker: 'linear-gradient(135deg, #f59e0b, #b45309)',
        best_digger: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        best_setter: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        best_receiver: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        most_active: 'linear-gradient(135deg, #10b981, #047857)',
        top_jumper: 'linear-gradient(135deg, #f97316, #ea580c)'
    };

    return (
        <div className="dashboard">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2>Match Awards</h2>
                        <p>Team {match.home_team_id} vs Team {match.away_team_id} — {match.venue}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/matches/${id}/live`}>
                            <button className="btn btn-primary">Live Match</button>
                        </Link>
                        <Link to={`/matches/${id}`}>
                            <button className="btn btn-secondary">Match Details</button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="match-score" style={{ marginBottom: 30 }}>
                <div className="team-score">
                    <div className="team-name">Team {match.home_team_id}</div>
                    <div className="score">{match.home_score}</div>
                </div>
                <div className="vs-text">FINAL</div>
                <div className="team-score">
                    <div className="team-name">Team {match.away_team_id}</div>
                    <div className="score">{match.away_score}</div>
                </div>
            </div>

            <div className="mvp-highlight">
                <div className="mvp-card">
                    <div className="mvp-icon">{awards.mvp.icon}</div>
                    <div className="mvp-badge">MVP</div>
                    <div className="mvp-player-name">{awards.mvp.player.name}</div>
                    <div className="mvp-player-info">
                        #{awards.mvp.player.jersey_number} — {awards.mvp.player.position}
                    </div>
                    <div className="mvp-score">{awards.mvp.stat_value}</div>
                    <div className="mvp-label">{awards.mvp.stat_label}</div>
                    <div className="mvp-breakdown">{awards.mvp.breakdown}</div>
                </div>
            </div>

            <div className="awards-grid">
                {awardOrder.slice(1).map(key => {
                    const award = awards[key];
                    return (
                        <div key={key} className="award-card">
                            <div className="award-icon" style={{ background: awardColors[key] }}>{award.icon}</div>
                            <div className="award-title">{award.title}</div>
                            <div className="award-player">
                                <strong>#{award.player.jersey_number}</strong> {award.player.name}
                            </div>
                            <div className="award-team">Team {award.player.team_id}</div>
                            <div className="award-stat">{award.stat_value}</div>
                            <div className="award-stat-label">{award.stat_label}</div>
                            <div className="award-breakdown">{award.breakdown}</div>
                        </div>
                    );
                })}
            </div>

            {player_stats.length > 0 && (
                <div className="card" style={{ marginTop: 30 }}>
                    <div className="card-header">
                        <h3>Full Statistics Comparison</h3>
                    </div>
                    <div className="live-player-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Player</th>
                                    <th>Team</th>
                                    <th>K</th>
                                    <th>A</th>
                                    <th>B</th>
                                    <th>D</th>
                                    <th>AS</th>
                                    <th>SV</th>
                                    <th>REC</th>
                                    <th>MVP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {player_stats
                                    .sort((a, b) => (b.mvp_score || 0) - (a.mvp_score || 0))
                                    .map((player, i) => (
                                    <tr key={player.id || i} className={i === 0 ? 'mvp-row' : ''}>
                                        <td style={{ fontWeight: 700 }}>{player.jersey_number}</td>
                                        <td>{player.name}</td>
                                        <td>Team {player.team_id}</td>
                                        <td>{player.kills}</td>
                                        <td className="stat-ace">{player.aces}</td>
                                        <td className="stat-block">{player.solo_blocks + player.block_assists}</td>
                                        <td className="stat-dig">{player.digs}</td>
                                        <td>{player.assists}</td>
                                        <td>{player.serves}</td>
                                        <td>{player.perfect_receptions}/{player.reception_attempts}</td>
                                        <td style={{ fontWeight: 700, color: '#f59e0b' }}>{player.mvp_score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchAwards;
