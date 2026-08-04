import React from 'react';
import Table from '../components/Table/Table';
import './Pages.css';

function HomePage() {
    return (
        <div className="page-container">
            <h1 style={{ color: 'red' }}>Главная страница</h1>
            <p>Добро пожаловать! Заполните таблицу:</p>
            <Table />
        </div>
    );
}

export default HomePage;