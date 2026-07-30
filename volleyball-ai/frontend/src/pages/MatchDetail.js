import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const MatchDetail = () => {
    const { id } = useParams();
    const [match, setMatch] = useState(null);
    const [statistics, setStatistics] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchMatchData();
    }, [id]);

    const fetchMatchData = async () => {
        try {
            const [matchRes, statsRes, eventsRes] = await Promise.all([
                axios.get(`${API}/matches/${id}`),
                axios.get(`${API}/statistics/match/${id}`),
                axios.get(`${API}/matches/${id}/events`)
            ]);
            setMatch(matchRes.data);
            setStatistics(statsRes.data);
            setEvents(eventsRes.data);
        } catch (err) {
            setMatch({ id: 1, home_team_id: 1, away_team_id: 2, date: '2025-07-14', status: 'completed', home_score: 3, away_score: 1, venue: 'Main Arena' });
            setStatistics([]);
            setEvents([
                { id: 1, event_type: 'kill', player_id: 7, timestamp: 12.5, frame_number: 375, details: {} },
                { id: 2, event_type: 'ace', player_id: 10, timestamp: 25.3, frame_number: 759, details: {} },
                { id: 3, event_type: 'block', player_id: 14, timestamp: 38.1, frame_number: 1143, details: {} },
                { id: 4, event_type: 'dig', player_id: 5, timestamp: 42.7, frame_number: 1281, details: {} }
            ]);
        }
    };

    if (!match) return <div>Loading...</div>;

    return (
        <div className="dashboard">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2>Match Details</h2>
                        <p>AI-analyzed match statistics and events</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/matches/${id}/live`}>
                            <button className="btn btn-primary">
                                {match.status === 'live' ? 'Go Live' : 'Live View'}
                            </button>
                        </Link>
                        <Link to={`/matches/${id}/awards`}>
                            <button className="btn btn-secondary">View Awards</button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="match-score">
                <div className="team-score">
                    <div className="team-name">Team {match.home_team_id}</div>
                    <div className="score">{match.home_score}</div>
                </div>
                <div className="vs-text">VS</div>
                <div className="team-score">
                    <div className="team-name">Team {match.away_team_id}</div>
                    <div className="score">{match.away_score}</div>
                </div>
            </div>

            <div className="content-grid">
                <div className="card">
                    <div className="card-header">
                        <h3>Event Timeline</h3>
                        <span className="badge">{events.length} events</span>
                    </div>
                    <div className="event-timeline">
                        {events.map(event => (
                            <div key={event.id} className={`event-item event-${event.event_type}`}>
                                <div className="event-time">{formatTime(event.timestamp)}</div>
                                <div>
                                    <div className="event-action">{event.event_type.toUpperCase()}</div>
                                    <div className="event-player">Player #{event.player_id}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>Player Statistics</h3>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Kills</th>
                                <th>Aces</th>
                                <th>Blocks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statistics.length > 0 ? statistics.map(stat => (
                                <tr key={stat.id}>
                                    <td>Player #{stat.player_id}</td>
                                    <td>{stat.kills}</td>
                                    <td>{stat.aces}</td>
                                    <td>{stat.solo_blocks + stat.block_assists}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>No statistics yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default MatchDetail;
