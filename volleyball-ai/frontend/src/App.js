import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import LiveMatch from './pages/LiveMatch';
import MatchAwards from './pages/MatchAwards';
import CoachDashboard from './pages/CoachDashboard';
import PlayerRankings from './pages/PlayerRankings';
import RallyAnalysis from './pages/RallyAnalysis';
import Players from './pages/Players';
import UploadVideo from './pages/UploadVideo';
import Navbar from './components/Navbar';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/matches" element={<Matches />} />
                        <Route path="/matches/:id" element={<MatchDetail />} />
                        <Route path="/matches/:id/live" element={<LiveMatch />} />
                        <Route path="/matches/:id/awards" element={<MatchAwards />} />
                        <Route path="/matches/:id/coach" element={<CoachDashboard />} />
                        <Route path="/matches/:id/rallies" element={<RallyAnalysis />} />
                        <Route path="/rankings" element={<PlayerRankings />} />
                        <Route path="/players" element={<Players />} />
                        <Route path="/upload" element={<UploadVideo />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
