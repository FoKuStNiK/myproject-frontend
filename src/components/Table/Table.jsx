import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import './Table.css';
// Это комментарий — он не влияет на работу кода
// hi

function Table() {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previousData, setPreviousData] = useState([]);
    const socketRef = useRef(null);
    const savedCellsRef = useRef([]);

    // 1. Загрузка данных (одна функция)
    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const socketUrl = process.env.REACT_APP_WS_URL || `${protocol}://${window.location.hostname}:5000`;
        const socket = new WebSocket(socketUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            setLoading(true);
            socket.send(JSON.stringify({ type: 'table:get' }));
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'table:data') {
                setTableData(message.data);
                setPreviousData(message.data);
                setLoading(false);
            }

            if (message.type === 'cell:updated') {
                setTableData(prev => prev.map((row, r) =>
                    r === message.row
                        ? row.map((cell, c) => c === message.col ? message.value : cell)
                        : row
                ));
                setPreviousData(prev => prev.map((row, r) =>
                    r === message.row
                        ? row.map((cell, c) => c === message.col ? message.value : cell)
                        : row
                ));
            }

            if (message.type === 'cell:saved') {
                const savedCell = savedCellsRef.current.shift();
                if (message.success && savedCell) {
                    toast.success(`✅ Ячейка (${savedCell.row + 1}, ${savedCell.col + 1}) сохранена`);
                } else if (!message.success) {
                    toast.error('❌ Ошибка: ' + (message.message || 'Неизвестная ошибка'));
                }
            }

            if (message.type === 'table:cleared') {
                setTableData(message.data);
                setPreviousData(message.data);
            }

            if (message.type === 'table:clear:result' && message.success) {
                toast.success('🗑️ Таблица очищена');
            }

            if (message.type === 'error') {
                console.error('Ошибка WebSocket:', message.message);
                toast.error('❌ ' + message.message);
            }
        };

        socket.onerror = (error) => {
            console.error('Ошибка WebSocket:', error);
            toast.error('❌ Ошибка соединения с сервером');
            setLoading(false);
        };

        return () => socket.close();
    }, []);

    // 2. Изменение ячейки (локально)
    const handleCellChange = (rowIndex, colIndex, value) => {
        const newData = tableData.map((row, r) =>
            r === rowIndex
                ? row.map((cell, c) => c === colIndex ? value : cell)
                : row
        );
        setTableData(newData);
    };

    // 3. Сохранение ячейки (одна функция)
    const handleSaveCell = (rowIndex, colIndex) => {
        const currentValue = tableData[rowIndex][colIndex];
        const previousValue = previousData[rowIndex]?.[colIndex];

        if (currentValue === previousValue) return;

        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            toast.error('❌ Ошибка соединения с сервером');
            return;
        }

        savedCellsRef.current.push({ row: rowIndex, col: colIndex });
        socketRef.current.send(JSON.stringify({
            type: 'cell:update',
            row: rowIndex,
            col: colIndex,
            value: currentValue
        }));
    };
    // 4. Очистка таблицы (одна функция)
    const clearTable = () => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            toast.error('❌ Ошибка очистки таблицы');
            return;
        }

        socketRef.current.send(JSON.stringify({ type: 'table:clear' }));
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="table-container">
            <h3>📊 Таблица 6×4</h3>
            <p className="table-hint">Кликните на ячейку и введите данные</p>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Столбец 1</th>
                        <th>Столбец 2</th>
                        <th>Столбец 3</th>
                        <th>Столбец 4</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, colIndex) => (
                                <td key={colIndex}>
                                    <input
                                        type="text"
                                        value={cell}
                                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                        onBlur={() => handleSaveCell(rowIndex, colIndex)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSaveCell(rowIndex, colIndex);
                                            }
                                        }}
                                        placeholder={`Строка ${rowIndex + 1}`}
                                        className="table-input"
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="table-footer">
                <span>Строк: 6 | Столбцов: 4</span>
                <button onClick={clearTable} className="clear-button">🗑️ Очистить</button>
            </div>
        </div>
    );
}

export default Table;
