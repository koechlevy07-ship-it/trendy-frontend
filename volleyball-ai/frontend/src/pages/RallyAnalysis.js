import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const RallyAnalysis = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchRallies();
    }, [id]);

    const fetchRallies = async () => {
        try {
            const res = await axios.get(`${API}/analytics/match/${id}/rallies`);
            setData(res.data);
        } catch (err) {
            setData({
                total_rallies: 24,
                longest_rally: { rally_id: 15, duration: 12.5, touches: 8, final_event: 'kill' },
                shortest_rally: { rally_id: 3, duration: 1.2, touches: 2, final_event: 'ace' },
                average_duration: 5.8,
                average_touches: 4.2,
                max_touches: 8,
                rallies: [
                    { rally_id: 1, duration: 3.2, touches: 3, final_event: 'kill', start_time: 0, events: [{ event_type: 'serve', player_id: 7 }, { event_type: 'reception', player_id: 6 }, { event_type: 'kill', player_id: 7 }] },
                    { rally_id: 2, duration: 5.1, touches: 5, final_event: 'dig', start_time: 4.5, events: [{ event_type: 'serve', player_id: 10 }, { event_type: 'reception', player_id: 7 }, { event_type: 'set', player_id: 10 }, { event_type: 'spike', player_id: 12 }, { event_type: 'dig', player_id: 8 }] },
                    { rally_id: 3, duration: 1.2, touches: 2, final_event: 'ace', start_time: 10.0, events: [{ event_type: 'serve', player_id: 3 }, { event_type: 'ace', player_id: 3 }] },
                    { rally_id: 4, duration: 8.4, touches: 6, final_event: 'attack_error', start_time: 12.0, events: [{ event_type: 'serve', player_id: 5 }, { event_type: 'reception', player_id: 3 }, { event_type: 'set', player_id: 10 }, { event_type: 'spike', player_id: 7 }, { event_type: 'block', player_id: 11 }, { event_type: 'attack_error', player_id: 7 }] },
                    { rally_id: 5, duration: 6.7, touches: 5, final_event: 'kill', start_time: 22.0, events: [{ event_type: 'serve', player_id: 8 }, { event_type: 'reception', player_id: 10 }, { event_type: 'set', player_id: 9 }, { event_type: 'kill', player_id: 5 }, { event_type: 'kill', player_id: 5 }] }
                ]
            });
        }
    };

    if (!data) return <div className="dashboard"><div className="page-header"><h2>Loading rally analysis...</h2></div></div>;

    const getEventIcon = (type) => {
        const icons = { serve: '🏐', ace: '🎯', kill: '⚡', block: '🧱', dig: '🛡️', set: '🎯', reception: '📥', spike: '💥', attack_error: '❌', service_error: '❌', free_ball: '🏐' };
        return icons[type] || '🏐';
    };

    const getEventColor = (type) => {
        const colors = { serve: '#06b6d4', ace: '#10b981', kill: '#dc2626', block: '#f59e0b', dig: '#3b82f6', set: '#8b5cf6', reception: '#06b6d4', spike: '#ef4444', attack_error: '#6b7280', service_error: '#6b7280', free_ball: '#9ca3af' };
        return colors[type] || '#6b7280';
    };

    const durationBuckets = [
        { label: '< 2s', min: 0, max: 2, count: 0 },
        { label: '2-4s', min: 2, max: 4, count: 0 },
        { label: '4-6s', min: 4, max: 6, count: 0 },
        { label: '6-8s', min: 6, max: 8, count: 0 },
        { label: '8-10s', min: 8, max: 10, count: 0 },
        { label: '10s+', min: 10, max: 999, count: 0 }
    ];

    data.rallies.forEach(r => {
        const bucket = durationBuckets.find(b => r.duration >= b.min && r.duration < b.max);
        if (bucket) bucket.count++;
    });

    const maxBucketCount = Math.max(...durationBuckets.map(b => b.count), 1);

    return (
        <div className="dashboard">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2>Rally Analysis</h2>
                        <p>AI-analyzed rally patterns and durations</p>
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

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#1e3a5f' }}>🏐</div>
                    <div className="stat-value">{data.total_rallies}</div>
                    <div className="stat-label">Total Rallies</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#4a1d6e' }}>⏱️</div>
                    <div className="stat-value">{data.average_duration}s</div>
                    <div className="stat-label">Average Duration</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#1f4d2e' }}>👆</div>
                    <div className="stat-value">{data.average_touches}</div>
                    <div className="stat-label">Average Touches</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#6e1d1d' }}>🏆</div>
                    <div className="stat-value">{data.max_touches}</div>
                    <div className="stat-label">Longest Rally (touches)</div>
                </div>
            </div>

            <div className="content-grid">
                <div className="card">
                    <div className="card-header">
                        <h3>Rally Duration Distribution</h3>
                    </div>
                    <div className="rally-chart">
                        {durationBuckets.map((bucket, i) => (
                            <div key={i} className="rally-bar-container">
                                <div className="rally-bar-label">{bucket.label}</div>
                                <div className="rally-bar-track">
                                    <div className="rally-bar-fill" style={{ width: `${(bucket.count / maxBucketCount) * 100}%` }}></div>
                                </div>
                                <div className="rally-bar-count">{bucket.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><h3>Records</h3></div>
                    {data.longest_rally && (
                        <div className="record-item">
                            <div className="record-icon">🏆</div>
                            <div className="record-info">
                                <div className="record-title">Longest Rally</div>
                                <div className="record-value">{data.longest_rally.duration}s — {data.longest_rally.touches} touches</div>
                                <div className="record-detail">Ended with: {data.longest_rally.final_event}</div>
                            </div>
                        </div>
                    )}
                    {data.shortest_rally && (
                        <div className="record-item">
                            <div className="record-icon">⚡</div>
                            <div className="record-info">
                                <div className="record-title">Shortest Rally</div>
                                <div className="record-value">{data.shortest_rally.duration}s — {data.shortest_rally.touches} touches</div>
                                <div className="record-detail">Ended with: {data.shortest_rally.final_event}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="card" style={{ marginTop: 20 }}>
                <div className="card-header">
                    <h3>Rally Timeline</h3>
                    <span className="badge">{data.rallies.length} rallies</span>
                </div>
                <div className="rally-list">
                    {data.rallies.map(rally => (
                        <div key={rally.rally_id} className="rally-item">
                            <div className="rally-item-header">
                                <span className="rally-id">Rally #{rally.rally_id}</span>
                                <span className="rally-duration">{rally.duration}s</span>
                                <span className="rally-touches">{rally.touches} touches</span>
                                <span className="rally-end" style={{ color: getEventColor(rally.final_event) }}>
                                    {getEventIcon(rally.final_event)} {rally.final_event}
                                </span>
                            </div>
                            <div className="rally-events">
                                {rally.events.map((event, i) => (
                                    <span key={i} className="rally-event-chip" style={{ borderColor: getEventColor(event.event_type) }}>
                                        {getEventIcon(event.event_type)} {event.event_type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RallyAnalysis;
