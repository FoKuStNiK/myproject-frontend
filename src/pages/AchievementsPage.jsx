import React, { useState, useEffect } from 'react';
import DefaultApi from '../api-js/src/api/DefaultApi';
import './Pages.css';

const api = new DefaultApi();

function AchievementsPage() {
    const [achievements, setAchievements] = useState('Загрузка достижений...');

    useEffect(() => {
        const loadAchievements = async () => {
            try {
                const data = await new Promise((resolve, reject) => {
                    api.achievementsGet((error, data) => {
                        if (error) reject(error);
                        else resolve(data);
                    });
                });
                setAchievements(data.message);
            } catch (error) {
                console.error('Ошибка загрузки достижений:', error);
                setAchievements('❌ Не удалось загрузить достижения');
            }
        };
        loadAchievements();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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