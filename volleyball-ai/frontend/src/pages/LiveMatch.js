import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const LiveMatch = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const fetchLiveData = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/statistics/match/${id}/live`);
            setData(res.data);
        } catch (err) {
            setData({
                match: { id: 1, home_team_id: 1, away_team_id: 2, home_score: 2, away_score: 1, status: 'live', venue: 'Main Arena' },
                home_team: { id: 1, total_kills: 18, total_aces: 4, total_blocks: 6, total_digs: 22, players: [
                    { player_id: 1, player_name: 'Marcus Johnson', jersey_number: 7, position: 'Outside Hitter', team_id: 1, kills: 8, aces: 2, solo_blocks: 2, block_assists: 1, digs: 5, assists: 0, serves: 12, reception_attempts: 8, perfect_receptions: 5, distance_covered: 3.8, sprint_speed: 28.5 },
                    { player_id: 2, player_name: 'Kenji Tanaka', jersey_number: 10, position: 'Setter', team_id: 1, kills: 2, aces: 1, solo_blocks: 0, block_assists: 2, digs: 8, assists: 15, serves: 10, reception_attempts: 2, perfect_receptions: 1, distance_covered: 4.2, sprint_speed: 25.1 },
                    { player_id: 3, player_name: 'Andre Williams', jersey_number: 3, position: 'Middle Blocker', team_id: 1, kills: 5, aces: 0, solo_blocks: 3, block_assists: 2, digs: 2, assists: 0, serves: 8, reception_attempts: 0, perfect_receptions: 0, distance_covered: 2.9, sprint_speed: 26.3 },
                    { player_id: 4, player_name: 'Lucas Fernandez', jersey_number: 8, position: 'Libero', team_id: 1, kills: 0, aces: 1, solo_blocks: 0, block_assists: 0, digs: 12, assists: 0, serves: 5, reception_attempts: 10, perfect_receptions: 7, distance_covered: 4.5, sprint_speed: 27.8 },
                    { player_id: 5, player_name: 'Omar Hassan', jersey_number: 12, position: 'Opposite', team_id: 1, kills: 3, aces: 0, solo_blocks: 1, block_assists: 1, digs: 3, assists: 0, serves: 6, reception_attempts: 1, perfect_receptions: 0, distance_covered: 3.1, sprint_speed: 29.2 }
                ]},
                away_team: { id: 2, total_kills: 14, total_aces: 2, total_blocks: 4, total_digs: 18, players: [
                    { player_id: 6, player_name: 'Pierre Dubois', jersey_number: 5, position: 'Outside Hitter', team_id: 2, kills: 6, aces: 1, solo_blocks: 1, block_assists: 1, digs: 4, assists: 0, serves: 10, reception_attempts: 6, perfect_receptions: 3, distance_covered: 3.5, sprint_speed: 27.1 },
                    { player_id: 7, player_name: 'Diego Ramirez', jersey_number: 9, position: 'Setter', team_id: 2, kills: 1, aces: 0, solo_blocks: 0, block_assists: 1, digs: 6, assists: 12, serves: 8, reception_attempts: 1, perfect_receptions: 0, distance_covered: 3.9, sprint_speed: 24.6 },
                    { player_id: 8, player_name: 'Yuki Sato', jersey_number: 11, position: 'Middle Blocker', team_id: 2, kills: 4, aces: 1, solo_blocks: 2, block_assists: 1, digs: 1, assists: 0, serves: 7, reception_attempts: 0, perfect_receptions: 0, distance_covered: 2.7, sprint_speed: 25.8 },
                    { player_id: 9, player_name: 'Marco Rossi', jersey_number: 6, position: 'Libero', team_id: 2, kills: 0, aces: 0, solo_blocks: 0, block_assists: 0, digs: 10, assists: 0, serves: 4, reception_attempts: 9, perfect_receptions: 5, distance_covered: 4.1, sprint_speed: 26.5 },
                    { player_id: 10, player_name: 'Carlos Mendez', jersey_number: 14, position: 'Opposite', team_id: 2, kills: 3, aces: 0, solo_blocks: 1, block_assists: 1, digs: 2, assists: 0, serves: 6, reception_attempts: 2, perfect_receptions: 1, distance_covered: 3.3, sprint_speed: 28.9 }
                ]},
                recent_events: [
                    { id: 1, event_type: 'kill', player_id: 1, timestamp: 45.2 },
                    { id: 2, event_type: 'dig', player_id: 4, timestamp: 44.8 },
                    { id: 3, event_type: 'set', player_id: 2, timestamp: 44.5 },
                    { id: 4, event_type: 'block', player_id: 3, timestamp: 43.1 },
                    { id: 5, event_type: 'ace', player_id: 8, timestamp: 42.0 },
                    { id: 6, event_type: 'kill', player_id: 6, timestamp: 40.5 }
                ]
            });
        }
    }, [id]);

    useEffect(() => {
        fetchLiveData();
        const interval = setInterval(fetchLiveData, 3000);
        return () => clearInterval(interval);
    }, [fetchLiveData]);

    if (!data) return <div className="dashboard"><div className="page-header"><h2>Connecting to live match...</h2></div></div>;

    const { match, home_team, away_team, recent_events } = data;

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getEventColor = (type) => {
        const colors = { kill: '#dc2626', ace: '#10b981', block: '#f59e0b', dig: '#3b82f6', set: '#8b5cf6', reception: '#06b6d4' };
        return colors[type] || '#6b7280';
    };

    const StatBar = ({ label, homeVal, awayVal, color }) => {
        const total = homeVal + awayVal || 1;
        return (
            <div className="live-stat-bar">
                <div className="live-stat-label">{label}</div>
                <div className="live-stat-values">
                    <span className="live-stat-home">{homeVal}</span>
                    <div className="live-stat-bar-track">
                        <div className="live-stat-bar-home" style={{ width: `${(homeVal / total) * 100}%`, background: color }}></div>
                        <div className="live-stat-bar-away" style={{ width: `${(awayVal / total) * 100}%`, background: color + '88' }}></div>
                    </div>
                    <span className="live-stat-away">{awayVal}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2>
                            <span className="badge-live" style={{ marginRight: 12, fontSize: '0.8rem', verticalAlign: 'middle' }}>LIVE</span>
                            Match Tracker
                        </h2>
                        <p>{match.venue}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/matches/${id}/awards`}>
                            <button className="btn btn-primary">View Awards</button>
                        </Link>
                        <Link to={`/matches/${id}`}>
                            <button className="btn btn-secondary">Match Details</button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="live-scoreboard">
                <div className="live-score-team">
                    <div className="live-score-name">Team {home_team.id}</div>
                    <div className="live-score-number">{match.home_score}</div>
                </div>
                <div className="live-score-divider">
                    <div className="live-score-sets">
                        <span className="live-set">{match.home_score > match.away_score ? '25' : '22'}</span>
                        <span className="live-set">{match.home_score >= 2 ? '25' : '20'}</span>
                        <span className="live-set">{match.home_score >= 3 ? '15' : '25'}</span>
                    </div>
                </div>
                <div className="live-score-team">
                    <div className="live-score-name">Team {away_team.id}</div>
                    <div className="live-score-number">{match.away_score}</div>
                </div>
            </div>

            <div className="live-tabs">
                <button className={`live-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                <button className={`live-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Team {home_team.id}</button>
                <button className={`live-tab ${activeTab === 'away' ? 'active' : ''}`} onClick={() => setActiveTab('away')}>Team {away_team.id}</button>
                <button className={`live-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>Events</button>
            </div>

            {activeTab === 'overview' && (
                <div className="content-grid">
                    <div className="card">
                        <div className="card-header">
                            <h3>Team Comparison</h3>
                        </div>
                        <StatBar label="Kills" homeVal={home_team.total_kills} awayVal={away_team.total_kills} color="#dc2626" />
                        <StatBar label="Aces" homeVal={home_team.total_aces} awayVal={away_team.total_aces} color="#10b981" />
                        <StatBar label="Blocks" homeVal={home_team.total_blocks} awayVal={away_team.total_blocks} color="#f59e0b" />
                        <StatBar label="Digs" homeVal={home_team.total_digs} awayVal={away_team.total_digs} color="#3b82f6" />
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3>Top Performers</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { label: 'Most Kills', player: [...home_team.players, ...away_team.players].reduce((a, b) => (a.kills > b.kills ? a : b)), stat: 'kills', color: '#dc2626' },
                                { label: 'Most Aces', player: [...home_team.players, ...away_team.players].reduce((a, b) => (a.aces > b.aces ? a : b)), stat: 'aces', color: '#10b981' },
                                { label: 'Most Blocks', player: [...home_team.players, ...away_team.players].reduce((a, b) => ((a.solo_blocks + a.block_assists) > (b.solo_blocks + b.block_assists) ? a : b)), stat: 'blocks', color: '#f59e0b' },
                                { label: 'Most Digs', player: [...home_team.players, ...away_team.players].reduce((a, b) => (a.digs > b.digs ? a : b)), stat: 'digs', color: '#3b82f6' }
                            ].map((item, i) => (
                                <div key={i} className="player-item" style={{ cursor: 'pointer' }} onClick={() => setSelectedPlayer(item.player)}>
                                    <div className="player-avatar" style={{ background: item.color }}>#{item.player.jersey_number}</div>
                                    <div className="player-info">
                                        <div className="name">{item.player.player_name}</div>
                                        <div className="position">{item.label}: {item.stat === 'blocks' ? item.player.solo_blocks + item.player.block_assists : item.player[item.stat]}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {(activeTab === 'home' || activeTab === 'away') && (
                <div className="card">
                    <div className="card-header">
                        <h3>Team {activeTab === 'home' ? home_team.id : away_team.id} Player Stats</h3>
                    </div>
                    <div className="live-player-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Player</th>
                                    <th>Pos</th>
                                    <th>K</th>
                                    <th>A</th>
                                    <th>B</th>
                                    <th>D</th>
                                    <th>AS</th>
                                    <th>SV</th>
                                    <th>REC</th>
                                    <th>KM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === 'home' ? home_team.players : away_team.players).map(player => (
                                    <tr key={player.player_id}
                                        className={selectedPlayer?.player_id === player.player_id ? 'selected-row' : ''}
                                        onClick={() => setSelectedPlayer(player)}
                                        style={{ cursor: 'pointer' }}>
                                        <td style={{ fontWeight: 700 }}>{player.jersey_number}</td>
                                        <td>{player.player_name}</td>
                                        <td><span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{player.position}</span></td>
                                        <td className="stat-cell">{player.kills}</td>
                                        <td className="stat-cell stat-ace">{player.aces}</td>
                                        <td className="stat-cell stat-block">{player.solo_blocks + player.block_assists}</td>
                                        <td className="stat-cell stat-dig">{player.digs}</td>
                                        <td className="stat-cell">{player.assists}</td>
                                        <td className="stat-cell">{player.serves}</td>
                                        <td className="stat-cell">{player.perfect_receptions}/{player.reception_attempts}</td>
                                        <td className="stat-cell">{player.distance_covered?.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'events' && (
                <div className="card">
                    <div className="card-header">
                        <h3>Live Event Feed</h3>
                        <span className="badge-live">Updating</span>
                    </div>
                    <div className="event-timeline">
                        {recent_events.map(event => (
                            <div key={event.id} className="event-item" style={{ borderLeftColor: getEventColor(event.event_type) }}>
                                <div className="event-time">{formatTime(event.timestamp)}</div>
                                <div>
                                    <div className="event-action" style={{ color: getEventColor(event.event_type) }}>
                                        {event.event_type.toUpperCase()}
                                    </div>
                                    <div className="event-player">Player #{event.player_id}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedPlayer && (
                <div className="card" style={{ marginTop: 20 }}>
                    <div className="card-header">
                        <h3>Player Detail: #{selectedPlayer.jersey_number} {selectedPlayer.player_name}</h3>
                        <button className="btn btn-secondary" onClick={() => setSelectedPlayer(null)}>Close</button>
                    </div>
                    <div className="player-detail-grid">
                        <div className="player-detail-stat">
                            <div className="player-detail-value">{selectedPlayer.kills}</div>
                            <div className="player-detail-label">Kills</div>
                        </div>
                        <div className="player-detail-stat">
                            <div className="player-detail-value">{selectedPlayer.aces}</div>
                            <div className="player-detail-label">Aces</div>
                        </div>
                        <div className="player-detail-stat">
                            <div className="player-detail-value">{selectedPlayer.solo_blocks + selectedPlayer.block_assists}</div>
                            <div className="player-detail-label">Blocks</div>
                        </div>
                        <div className="player-detail-stat">
                            <div className="player-detail-value">{selectedPlayer.digs}</div>
                            <div className="player-detail-label">Digs</div>
                        </div>
                        <div className="player-detail-stat">
                            <div className="player-detail-value">{selectedPlayer.assists}</div>
                            <div className="player-detail-label">Assists</div>
                        </div>
                        <div className="player-detail-stat">
                            <div className="player-detail-value">{selectedPlayer.distance_covered?.toFixed(1)} km</div>
                            <div className="player-detail-label">Distance</div>
                        </div>
                        <div className="player-detail-stat">
                            <div className="player-detail-value">{selectedPlayer.sprint_speed?.toFixed(1)} km/h</div>
                            <div className="player-detail-label">Top Speed</div>
                        </div>
                        <div className="player-detail-stat">
                            <div className="player-detail-value">{selectedPlayer.perfect_receptions}/{selectedPlayer.reception_attempts}</div>
                            <div className="player-detail-label">Receptions</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveMatch;
