import React, { useState, useEffect } from 'react';
import { getSupport } from '../api/supportApi';
import './Pages.css';

function SupportPage() {
    const [support, setSupport] = useState('Загрузка...');

    useEffect(() => {
        const loadSupport = async () => {
            try {
                const data = await getSupport();
                setSupport(data.message);
            } catch (error) {
                console.error('Ошибка загрузки поддержки:', error);
                setSupport('❌ Не удалось загрузить данные поддержки');
            }
        };

        loadSupport();
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
