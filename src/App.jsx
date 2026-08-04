import React, { useState } from 'react';
import { Toaster } from 'sonner';
import Sidebar from './components/Sidebar/Sidebar';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import AchievementsPage from './pages/AchievementsPage';
import SupportPage from './pages/SupportPage';
import './App.css';

function App() {
    const [currentPage, setCurrentPage] = useState('home');

    const renderPage = () => {
        switch (currentPage) {
            case 'home': return <HomePage key="home" />;
            case 'news': return <NewsPage key="news" />;
            case 'achievements': return <AchievementsPage key="achievements" />;
            case 'support': return <SupportPage key="support" />;
            default: return <HomePage key="default" />;
        }
    };

    return (
        <div className="app">
            <Sidebar activePage={currentPage} onPageChange={setCurrentPage} />
            <Toaster position="top-center" richColors /> 
            <div className="main-content">
                {renderPage()}
            </div>
        </div>
    );
}

export default App;