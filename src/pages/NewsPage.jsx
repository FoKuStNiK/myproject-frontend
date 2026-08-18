import React, { useState, useEffect } from 'react';
import DefaultApi from '../api-js/src/api/DefaultApi';
import './Pages.css';

const api = new DefaultApi();

function NewsPage() {
    const [news, setNews] = useState('Загрузка новостей...');

    useEffect(() => {
        const loadNews = async () => {
            try {
                const data = await new Promise((resolve, reject) => {
                    api.newsGet((error, data) => {
                        if (error) reject(error);
                        else resolve(data);
                    });
                });
                setNews(data.message);
            } catch (error) {
                console.error('Ошибка загрузки новостей:', error);
                setNews('❌ Не удалось загрузить новости');
            }
        };
        loadNews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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