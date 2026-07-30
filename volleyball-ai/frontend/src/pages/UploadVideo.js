import React, { useState, useRef } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const UploadVideo = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [matchId, setMatchId] = useState('');
    const [result, setResult] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    const handleUpload = async () => {
        if (!file || !matchId) {
            alert('Please select a video file and enter a match ID');
            return;
        }

        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append('video', file);

        try {
            const uploadRes = await axios.post(
                `${API}/video/upload/${matchId}`,
                formData,
                { onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)) }
            );

            setResult({ type: 'success', message: 'Video uploaded! Processing with AI...' });

            const processRes = await axios.post(`${API}/video/process/${matchId}`);
            setResult({
                type: 'success',
                message: 'Processing complete!',
                data: processRes.data
            });
        } catch (err) {
            setResult({ type: 'error', message: err.response?.data?.error || 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="dashboard">
            <div className="page-header">
                <h2>Upload Video</h2>
                <p>Upload a volleyball match video for AI analysis</p>
            </div>

            <div className="content-grid">
                <div className="card">
                    <div className="card-header">
                        <h3>Select Video</h3>
                    </div>

                    <div
                        className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            style={{ display: 'none' }}
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <div className="upload-icon">🎥</div>
                        <h3>{file ? file.name : 'Drop video here or click to browse'}</h3>
                        <p>{file ? formatSize(file.size) : 'Supports MP4, AVI, MOV, MKV, WebM'}</p>
                    </div>

                    <div style={{ marginTop: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8, color: '#9ca3af', fontSize: '0.9rem' }}>Match ID</label>
                        <input
                            type="number"
                            value={matchId}
                            onChange={(e) => setMatchId(e.target.value)}
                            placeholder="Enter match ID"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: '#0d1117',
                                border: '1px solid #374151',
                                borderRadius: 8,
                                color: '#e5e7eb',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleUpload}
                            disabled={uploading || !file || !matchId}
                            style={{ flex: 1 }}
                        >
                            {uploading ? 'Processing...' : 'Upload & Analyze'}
                        </button>
                    </div>

                    {uploading && (
                        <div className="progress-bar" style={{ marginTop: 20 }}>
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}

                    {result && (
                        <div style={{
                            marginTop: 20,
                            padding: 16,
                            background: result.type === 'success' ? '#064e3b' : '#7f1d1d',
                            borderRadius: 8,
                            color: result.type === 'success' ? '#6ee7b7' : '#fca5a5'
                        }}>
                            <strong>{result.message}</strong>
                            {result.data && (
                                <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
                                    Players tracked: {result.data.players_tracked} | Events detected: {result.data.events_detected}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>How It Works</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { step: 1, icon: '📹', title: 'Upload Video', desc: 'Upload any volleyball match video' },
                            { step: 2, icon: '🤖', title: 'AI Analysis', desc: 'YOLO detects players and ball, tracks movements' },
                            { step: 3, icon: '🏃', title: 'Action Recognition', desc: 'LSTM model identifies serves, spikes, blocks, digs' },
                            { step: 4, icon: '📊', title: 'Auto Statistics', desc: 'Stats generated automatically in real-time' }
                        ].map(item => (
                            <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 8,
                                    background: '#1f2937', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0
                                }}>{item.icon}</div>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#e5e7eb' }}>{item.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadVideo;
