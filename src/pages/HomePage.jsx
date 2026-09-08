import React from 'react';
import Table from '../components/Table/Table';
import './Pages.css';

function HomePage() {
    return (
        <div className="page-container">
            <h1 className="home-title">Главная страница</h1>
            <p>Добро пожаловать! Заполните таблицу:</p>
            <Table />
        </div>
    );
}

export default HomePage;