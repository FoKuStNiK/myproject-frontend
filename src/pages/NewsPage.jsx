import React, { useState, useEffect } from 'react';
import { getNews } from '../api/newsApi';
import './Pages.css';

function NewsPage() {
    const [news, setNews] = useState('Загрузка новостей...');

    useEffect(() => {
        const loadNews = async () => {
            try {
                const data = await getNews();
                setNews(data.message);
            } catch (error) {
                console.error('Ошибка загрузки новостей:', error);
                setNews('❌ Не удалось загрузить новости');
            }
        };

        loadNews();
    }, []);

    return (
        <div className="page-container">
            <h1>📰 Новости</h1>
            <div className="content-card">
                <p>{news}</p>
            </div>
        </div>
    );
}

export default NewsPage;
