import React, { useState, useEffect } from 'react';
import DefaultApi from '../api-js/src/api/DefaultApi';
import './Pages.css';

const api = new DefaultApi();

function SupportPage() {
    const [support, setSupport] = useState('Загрузка...');

    useEffect(() => {
        const loadSupport = async () => {
            try {
                const data = await new Promise((resolve, reject) => {
                    api.supportGet((error, data) => {
                        if (error) reject(error);
                        else resolve(data);
                    });
                });
                setSupport(data.message);
            } catch (error) {
                console.error('Ошибка загрузки поддержки:', error);
                setSupport('❌ Не удалось загрузить данные поддержки');
            }
        };
        loadSupport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="page-container">
            <h1>💬 Поддержка</h1>
            <div className="content-card">
                <p>{support}</p>
            </div>
        </div>
    );
}

export default SupportPage;