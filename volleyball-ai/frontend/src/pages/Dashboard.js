import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const Dashboard = () => {
    const [stats, setStats] = useState({ matches: 0, players: 0, teams: 0, events: 0 });
    const [recentMatches, setRecentMatches] = useState([]);
    const [topPlayers, setTopPlayers] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [teamsRes, playersRes, matchesRes] = await Promise.all([
                axios.get(`${API}/teams/`),
                axios.get(`${API}/players/`),
                axios.get(`${API}/matches/`)
            ]);

            setStats({
                matches: matchesRes.data.length,
                players: playersRes.data.length,
                teams: teamsRes.data.length,
                events: 0
            });

            setRecentMatches(matchesRes.data.slice(0, 5));
            setTopPlayers(playersRes.data.slice(0, 5));
        } catch (err) {
            console.log('Using demo data');
            setStats({ matches: 12, players: 48, teams: 8, events: 2847 });
            setRecentMatches([
                { id: 1, home_team_id: 1, away_team_id: 2, date: '2025-07-14', status: 'completed', home_score: 3, away_score: 1, venue: 'Main Arena' },
                { id: 2, home_team_id: 3, away_team_id: 4, date: '2025-07-13', status: 'completed', home_score: 3, away_score: 2, venue: 'Court A' },
                { id: 3, home_team_id: 5, away_team_id: 6, date: '2025-07-15', status: 'upcoming', home_score: 0, away_score: 0, venue: 'Main Arena' }
            ]);
            setTopPlayers([
                { id: 1, name: 'Marcus Johnson', jersey_number: 7, position: 'Outside Hitter', team_id: 1 },
                { id: 2, name: 'Kenji Tanaka', jersey_number: 10, position: 'Setter', team_id: 2 },
                { id: 3, name: 'Diego Ramirez', jersey_number: 14, position: 'Middle Blocker', team_id: 3 }
            ]);
        }
    };

    return (
        <div className="dashboard">
            <div className="page-header">
                <h2>Dashboard</h2>
                <p>AI-powered volleyball analytics overview</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#1e3a5f' }}>🏐</div>
                    <div className="stat-value">{stats.matches}</div>
                    <div className="stat-label">Matches Analyzed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#1f4d2e' }}>👤</div>
                    <div className="stat-value">{stats.players}</div>
                    <div className="stat-label">Players Tracked</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#4a1d6e' }}>🏟️</div>
                    <div className="stat-value">{stats.teams}</div>
                    <div className="stat-label">Teams</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#6e1d1d' }}>⚡</div>
                    <div className="stat-value">{stats.events.toLocaleString()}</div>
                    <div className="stat-label">Events Detected</div>
                </div>
            </div>

            <div className="content-grid">
                <div className="card">
                    <div className="card-header">
                        <h3>Recent Matches</h3>
                        <span className="badge">{recentMatches.length} matches</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Teams</th>
                                <th>Date</th>
                                <th>Venue</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentMatches.map(match => (
                                <tr key={match.id}>
                                    <td>
                                        Team {match.home_team_id} vs Team {match.away_team_id}
                                        {match.status === 'completed' && ` (${match.home_score}-${match.away_score})`}
                                    </td>
                                    <td>{match.date}</td>
                                    <td>{match.venue}</td>
                                    <td>
                                        <span className={`badge-${match.status}`}>
                                            {match.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>Top Players</h3>
                    </div>
                    <div className="player-list">
                        {topPlayers.map(player => (
                            <div key={player.id} className="player-item">
                                <div className="player-avatar">#{player.jersey_number}</div>
                                <div className="player-info">
                                    <div className="name">{player.name}</div>
                                    <div className="position">{player.position}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
