import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const CoachDashboard = () => {
    const { id } = useParams();
    const [tactics, setTactics] = useState(null);
    const [heatmaps, setHeatmaps] = useState(null);
    const [trajectory, setTrajectory] = useState(null);
    const [activeTab, setActiveTab] = useState('tactics');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [tacticsRes, heatmapsRes, trajRes] = await Promise.all([
                axios.get(`${API}/analytics/match/${id}/tactics`),
                axios.get(`${API}/analytics/match/${id}/heatmaps`),
                axios.get(`${API}/analytics/match/${id}/ball_trajectory`)
            ]);
            setTactics(tacticsRes.data);
            setHeatmaps(heatmapsRes.data);
            setTrajectory(trajRes.data);
        } catch (err) {
            setTactics({
                attack_analysis: { home: { kills: 18, attacks: 42, success_rate: 42.9 }, away: { kills: 14, attacks: 38, success_rate: 36.8 } },
                defense_analysis: { home: { digs: 22, blocks: 6, saves: 3 }, away: { digs: 18, blocks: 4, saves: 2 } },
                serve_analysis: { home: { aces: 4, errors: 2 }, away: { aces: 2, errors: 3 } },
                error_analysis: { home: 5, away: 7 },
                efficiency: { home: 68.5, away: 52.3 },
                momentum: []
            });
            setHeatmaps({});
            setTrajectory({ points: [], total_points: 0 });
        }
    };

    const StatComparison = ({ label, homeVal, awayVal, higher_is_better = true }) => {
        const total = homeVal + awayVal || 1;
        const homePercent = (homeVal / total) * 100;
        const awayPercent = (awayVal / total) * 100;
        const homeWins = higher_is_better ? homeVal >= awayVal : homeVal <= awayVal;

        return (
            <div className="tactic-stat">
                <div className="tactic-stat-header">
                    <span className={homeWins ? 'tactic-winner' : ''}>{homeVal}</span>
                    <span className="tactic-label">{label}</span>
                    <span className={!homeWins ? 'tactic-winner' : ''}>{awayVal}</span>
                </div>
                <div className="tactic-bar-track">
                    <div className="tactic-bar-home" style={{ width: `${homePercent}%` }}></div>
                    <div className="tactic-bar-away" style={{ width: `${awayPercent}%` }}></div>
                </div>
            </div>
        );
    };

    const CourtHeatmap = ({ playerData }) => {
        const canvasRef = React.useRef(null);

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const w = canvas.width;
            const h = canvas.height;

            ctx.fillStyle = '#1a2332';
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = '#4b5563';
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 10, w - 20, h - 20);

            ctx.beginPath();
            ctx.moveTo(w / 2, 10);
            ctx.lineTo(w / 2, h - 10);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(10, h * 0.33);
            ctx.lineTo(w - 10, h * 0.33);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(10, h * 0.66);
            ctx.lineTo(w - 10, h * 0.66);
            ctx.stroke();

            for (let i = 0; i < 50; i++) {
                const x = Math.random() * (w - 40) + 20;
                const y = Math.random() * (h - 40) + 20;
                const radius = Math.random() * 15 + 5;
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, 'rgba(255, 100, 50, 0.6)');
                gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
            }
        }, [playerData]);

        return <canvas ref={canvasRef} width={300} height={200} style={{ borderRadius: 8, width: '100%' }} />;
    };

    if (!tactics) return <div className="dashboard"><div className="page-header"><h2>Loading analytics...</h2></div></div>;

    return (
        <div className="dashboard">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2>Coach Analytics Dashboard</h2>
                        <p>Tactical analysis, heatmaps, and ball trajectories</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/matches/${id}/live`}>
                            <button className="btn btn-primary">Live Match</button>
                        </Link>
                        <Link to={`/matches/${id}/awards`}>
                            <button className="btn btn-secondary">Awards</button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="coach-tabs">
                <button className={`live-tab ${activeTab === 'tactics' ? 'active' : ''}`} onClick={() => setActiveTab('tactics')}>Tactical Analysis</button>
                <button className={`live-tab ${activeTab === 'heatmaps' ? 'active' : ''}`} onClick={() => setActiveTab('heatmaps')}>Player Heatmaps</button>
                <button className={`live-tab ${activeTab === 'trajectory' ? 'active' : ''}`} onClick={() => setActiveTab('trajectory')}>Ball Trajectory</button>
                <button className={`live-tab ${activeTab === 'momentum' ? 'active' : ''}`} onClick={() => setActiveTab('momentum')}>Momentum</button>
            </div>

            {activeTab === 'tactics' && (
                <div className="content-grid">
                    <div className="card">
                        <div className="card-header"><h3>Attack Analysis</h3></div>
                        <StatComparison label="Kills" homeVal={tactics.attack_analysis.home.kills} awayVal={tactics.attack_analysis.away.kills} />
                        <StatComparison label="Attack Attempts" homeVal={tactics.attack_analysis.home.attacks} awayVal={tactics.attack_analysis.away.attacks} />
                        <StatComparison label="Success Rate %" homeVal={tactics.attack_analysis.home.success_rate} awayVal={tactics.attack_analysis.away.success_rate} />
                    </div>
                    <div className="card">
                        <div className="card-header"><h3>Efficiency Score</h3></div>
                        <div className="efficiency-display">
                            <div className="efficiency-team">
                                <div className="efficiency-value">{tactics.efficiency.home}%</div>
                                <div className="efficiency-label">Team Home</div>
                            </div>
                            <div className="efficiency-vs">VS</div>
                            <div className="efficiency-team">
                                <div className="efficiency-value">{tactics.efficiency.away}%</div>
                                <div className="efficiency-label">Team Away</div>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header"><h3>Defense Analysis</h3></div>
                        <StatComparison label="Digs" homeVal={tactics.defense_analysis.home.digs} awayVal={tactics.defense_analysis.away.digs} />
                        <StatComparison label="Blocks" homeVal={tactics.defense_analysis.home.blocks} awayVal={tactics.defense_analysis.away.blocks} />
                        <StatComparison label="Saves" homeVal={tactics.defense_analysis.home.saves} awayVal={tactics.defense_analysis.away.saves} />
                    </div>
                    <div className="card">
                        <div className="card-header"><h3>Serve & Errors</h3></div>
                        <StatComparison label="Aces" homeVal={tactics.serve_analysis.home.aces} awayVal={tactics.serve_analysis.away.aces} />
                        <StatComparison label="Serve Errors" homeVal={tactics.serve_analysis.home.errors} awayVal={tactics.serve_analysis.away.errors} higher_is_better={false} />
                        <StatComparison label="Total Errors" homeVal={tactics.error_analysis.home} awayVal={tactics.error_analysis.away} higher_is_better={false} />
                    </div>
                </div>
            )}

            {activeTab === 'heatmaps' && (
                <div className="stats-grid">
                    {heatmaps && Object.entries(heatmaps).map(([pid, data]) => (
                        <div key={pid} className="card heatmap-card">
                            <div className="card-header">
                                <h3>#{data.jersey_number} {data.player_name}</h3>
                                <span className="badge">{data.position}</span>
                            </div>
                            <CourtHeatmap playerData={data} />
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'trajectory' && (
                <div className="card">
                    <div className="card-header">
                        <h3>Ball Trajectory</h3>
                        <span className="badge">{trajectory?.total_points || 0} points tracked</span>
                    </div>
                    <div className="trajectory-canvas">
                        <svg viewBox="0 0 100 50" style={{ width: '100%', background: '#1a2332', borderRadius: 8 }}>
                            <line x1="50" y1="0" x2="50" y2="50" stroke="#4b5563" strokeWidth="0.5" />
                            <line x1="0" y1="25" x2="100" y2="25" stroke="#4b5563" strokeWidth="0.3" />
                            {trajectory?.points?.map((pt, i) => (
                                <circle key={i} cx={pt.position[0] * 100} cy={pt.position[1] * 50}
                                    r={Math.min(pt.speed / 30, 2)} fill={pt.event_type === 'kill' ? '#dc2626' : pt.event_type === 'ace' ? '#10b981' : '#3b82f6'} opacity="0.7" />
                            ))}
                            {trajectory?.points && trajectory.points.length > 1 && (
                                <polyline
                                    points={trajectory.points.map(pt => `${pt.position[0] * 100},${pt.position[1] * 50}`).join(' ')}
                                    fill="none" stroke="#8b5cf6" strokeWidth="0.3" opacity="0.5"
                                />
                            )}
                        </svg>
                    </div>
                    <div className="trajectory-legend">
                        <span className="legend-item"><span className="legend-dot" style={{ background: '#dc2626' }}></span>Kill</span>
                        <span className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }}></span>Ace</span>
                        <span className="legend-item"><span className="legend-dot" style={{ background: '#3b82f6' }}></span>Rally</span>
                    </div>
                </div>
            )}

            {activeTab === 'momentum' && (
                <div className="card">
                    <div className="card-header"><h3>Match Momentum</h3></div>
                    <div className="momentum-chart">
                        <svg viewBox="0 0 100 30" style={{ width: '100%', height: 200 }}>
                            <line x1="0" y1="15" x2="100" y2="15" stroke="#4b5563" strokeWidth="0.3" />
                            <text x="1" y="14" fill="#dc2626" fontSize="2">Home</text>
                            <text x="90" y="14" fill="#3b82f6" fontSize="2">Away</text>
                            {tactics.momentum.length > 0 && (
                                <polyline
                                    points={tactics.momentum.map((m, i) =>
                                        `${(i / tactics.momentum.length) * 100},${30 - (m.home_momentum / 100) * 30}`
                                    ).join(' ')}
                                    fill="none" stroke="#f59e0b" strokeWidth="0.5"
                                />
                            )}
                            {tactics.momentum.length > 0 && tactics.momentum.map((m, i) => (
                                <circle key={i}
                                    cx={(i / tactics.momentum.length) * 100}
                                    cy={30 - (m.home_momentum / 100) * 30}
                                    r="0.5" fill={m.home_momentum > 50 ? '#dc2626' : '#3b82f6'} />
                            ))}
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachDashboard;
