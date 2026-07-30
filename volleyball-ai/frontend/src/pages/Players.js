import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const Players = () => {
    const [players, setPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            const res = await axios.get(`${API}/players/`);
            setPlayers(res.data);
        } catch (err) {
            setPlayers([
                { id: 1, name: 'Marcus Johnson', jersey_number: 7, position: 'Outside Hitter', team_id: 1 },
                { id: 2, name: 'Kenji Tanaka', jersey_number: 10, position: 'Setter', team_id: 1 },
                { id: 3, name: 'Diego Ramirez', jersey_number: 14, position: 'Middle Blocker', team_id: 2 },
                { id: 4, name: 'Pierre Dubois', jersey_number: 3, position: 'Libero', team_id: 2 },
                { id: 5, name: 'Carlos Silva', jersey_number: 5, position: 'Opposite', team_id: 3 }
            ]);
        }
    };

    const getPositionColor = (position) => {
        const colors = {
            'Outside Hitter': '#3b82f6',
            'Setter': '#8b5cf6',
            'Middle Blocker': '#f59e0b',
            'Libero': '#10b981',
            'Opposite': '#ef4444',
            'Server': '#06b6d4'
        };
        return colors[position] || '#6b7280';
    };

    return (
        <div className="dashboard">
            <div className="page-header">
                <h2>Players</h2>
                <p>All tracked volleyball players</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: 30 }}>
                {['Outside Hitter', 'Setter', 'Middle Blocker', 'Libero', 'Opposite'].map(pos => {
                    const count = players.filter(p => p.position === pos).length;
                    return (
                        <div key={pos} className="stat-card">
                            <div className="stat-icon" style={{ background: getPositionColor(pos) + '33', color: getPositionColor(pos) }}>●</div>
                            <div className="stat-value">{count}</div>
                            <div className="stat-label">{pos}s</div>
                        </div>
                    );
                })}
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>All Players</h3>
                    <span className="badge">{players.length} players</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Position</th>
                            <th>Team</th>
                            <th>Tracking ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map(player => (
                            <tr key={player.id} onClick={() => setSelectedPlayer(player)} style={{ cursor: 'pointer' }}>
                                <td style={{ fontWeight: 700 }}>{player.jersey_number}</td>
                                <td>{player.name}</td>
                                <td>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        background: getPositionColor(player.position) + '22',
                                        color: getPositionColor(player.position),
                                        fontSize: '0.8rem'
                                    }}>
                                        {player.position}
                                    </span>
                                </td>
                                <td>Team {player.team_id}</td>
                                <td>{player.tracking_id || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Players;
