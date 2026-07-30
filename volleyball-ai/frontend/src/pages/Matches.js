import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const Matches = () => {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await axios.get(`${API}/matches/`);
            setMatches(res.data);
        } catch (err) {
            setMatches([
                { id: 1, home_team_id: 1, away_team_id: 2, date: '2025-07-14', status: 'live', home_score: 2, away_score: 1, venue: 'Main Arena', processed: false },
                { id: 2, home_team_id: 3, away_team_id: 4, date: '2025-07-13', status: 'completed', home_score: 3, away_score: 2, venue: 'Court A', processed: true },
                { id: 3, home_team_id: 5, away_team_id: 6, date: '2025-07-15', status: 'upcoming', home_score: 0, away_score: 0, venue: 'Main Arena', processed: false },
                { id: 4, home_team_id: 7, away_team_id: 8, date: '2025-07-12', status: 'completed', home_score: 3, away_score: 0, venue: 'Court B', processed: true }
            ]);
        }
    };

    const processMatch = async (matchId) => {
        try {
            await axios.post(`${API}/video/process/${matchId}`);
            fetchMatches();
        } catch (err) {
            alert('No video uploaded for this match');
        }
    };

    return (
        <div className="dashboard">
            <div className="page-header">
                <h2>Matches</h2>
                <p>All volleyball matches and their analysis status</p>
            </div>

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Match</th>
                            <th>Date</th>
                            <th>Venue</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>AI Analysis</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map(match => (
                            <tr key={match.id} className={match.status === 'live' ? 'live-row' : ''}>
                                <td>Team {match.home_team_id} vs Team {match.away_team_id}</td>
                                <td>{match.date}</td>
                                <td>{match.venue}</td>
                                <td>
                                    {match.status === 'completed' ? `${match.home_score} - ${match.away_score}` : '-'}
                                </td>
                                <td><span className={`badge-${match.status}`}>{match.status}</span></td>
                                <td>{match.processed ? '✅ Processed' : '⏳ Pending'}</td>
                                <td>
                                    <Link to={`/matches/${match.id}`}>
                                        <button className="btn btn-secondary" style={{ marginRight: 8 }}>View</button>
                                    </Link>
                                    {match.status === 'live' && (
                                        <Link to={`/matches/${match.id}/live`}>
                                            <button className="btn btn-primary" style={{ marginRight: 8, background: '#dc2626' }}>Live</button>
                                        </Link>
                                    )}
                                    {match.status === 'completed' && (
                                        <>
                                            <Link to={`/matches/${match.id}/awards`}>
                                                <button className="btn btn-secondary" style={{ marginRight: 8 }}>Awards</button>
                                            </Link>
                                            <Link to={`/matches/${match.id}/coach`}>
                                                <button className="btn btn-secondary" style={{ marginRight: 8 }}>Coach</button>
                                            </Link>
                                            <Link to={`/matches/${match.id}/rallies`}>
                                                <button className="btn btn-secondary" style={{ marginRight: 8 }}>Rallies</button>
                                            </Link>
                                        </>
                                    )}
                                    {match.status === 'completed' && !match.processed && (
                                        <button className="btn btn-primary" onClick={() => processMatch(match.id)}>
                                            Run AI
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Matches;
