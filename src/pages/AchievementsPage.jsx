import React, { useState, useEffect } from 'react';
import { getAchievements } from '../api/achievementsApi';
import './Pages.css';

function AchievementsPage() {
    const [achievements, setAchievements] = useState('Загрузка достижений...');

    useEffect(() => {
        const loadAchievements = async () => {
            try {
                const data = await getAchievements();
                setAchievements(data.message);
            } catch (error) {
                console.error('Ошибка загрузки достижений:', error);
                setAchievements('❌ Не удалось загрузить достижения');
            }
        };

        loadAchievements();
    }, []);

    return (
        <div className="page-container">
            <h1>🏆 Достижения</h1>
            <div className="content-card">
                <p>{achievements}</p>
            </div>
        </div>
    );
}

export default AchievementsPage;
