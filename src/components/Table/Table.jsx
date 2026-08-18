import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DefaultApi from '../../api-js/src/api/DefaultApi';
import './Table.css';

const api = new DefaultApi();

const getTableData = () => {
    return new Promise((resolve, reject) => {
        api.getTableData((error, data) => {
            if (error) reject(error);
            else resolve(data);
        });
    });
};

const saveTableCell = (row, col, value) => {
    return new Promise((resolve, reject) => {
        api.updateTableCell({ row, col, value }, (error, data) => {
            if (error) reject(error);
            else resolve(data);
        });
    });
};

const clearTableData = () => {
    return new Promise((resolve, reject) => {
        api.clearTableData((error, data) => {
            if (error) reject(error);
            else resolve(data);
        });
    });
};

const updateTableCell = (table, rowToUpdate, colToUpdate, value) => {
    return table.map((row, rowIndex) =>
        rowIndex === rowToUpdate
            ? row.map((cell, colIndex) => colIndex === colToUpdate ? value : cell)
            : row
    );
};

function Table() {
    const [tableData, setTableData] = useState([]);
    const [previousData, setPreviousData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTableData = async () => {
            try {
                const data = await getTableData();
                setTableData(data);
                setPreviousData(data);
            } catch (error) {
                console.error('Ошибка загрузки:', error);
                toast.error('❌ Ошибка загрузки таблицы');
            } finally {
                setLoading(false);
            }
        };

        loadTableData();
    }, []);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const socketUrl =
            process.env.REACT_APP_WS_URL ||
            `${protocol}://${window.location.hostname}:5000`;

        let socket = null;
        let reconnectTimer = null;
        let closedByReact = false;

        const connectSocket = () => {
            if (closedByReact) return;

            console.log('🔄 Подключение к WebSocket...');
            socket = new WebSocket(socketUrl);

            socket.onopen = async () => {
                if (closedByReact) {
                    socket.close();
                    return;
                }

                console.log('✅ WebSocket подключён');

                try {
                    const data = await getTableData();
                    setTableData(data);
                    setPreviousData(data);
                } catch (error) {
                    console.error('Ошибка синхронизации таблицы:', error);
                }
            };

            socket.onmessage = event => {
                if (closedByReact) return;

                try {
                    const message = JSON.parse(event.data);

                    if (message.type === 'cell:updated') {
                        setTableData(previousTable =>
                            updateTableCell(previousTable, message.row, message.col, message.value)
                        );
                        setPreviousData(previousTable =>
                            updateTableCell(previousTable, message.row, message.col, message.value)
                        );
                    }

                    if (message.type === 'table:cleared') {
                        setTableData(message.data);
                        setPreviousData(message.data);
                    }
                } catch (error) {
                    console.error('Ошибка обработки WebSocket сообщения:', error);
                }
            };

            socket.onerror = error => {
                if (!closedByReact) {
                    console.error('Ошибка WebSocket:', error);
                }
            };

            socket.onclose = () => {
                if (closedByReact) return;

                console.log('⚠️ WebSocket отключён');
                reconnectTimer = setTimeout(connectSocket, 3000);
            };
        };

        connectSocket();

        return () => {
            closedByReact = true;
            if (reconnectTimer) clearTimeout(reconnectTimer);

            if (socket?.readyState === WebSocket.CONNECTING) {
                socket.onopen = () => socket.close();
            } else if (socket?.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, []);

    const handleCellChange = (rowIndex, colIndex, value) => {
        setTableData(previousTable =>
            updateTableCell(previousTable, rowIndex, colIndex, value)
        );
    };

    const handleSaveCell = async (rowIndex, colIndex) => {
        const currentValue = tableData[rowIndex][colIndex];
        const previousValue = previousData[rowIndex]?.[colIndex];

        if (currentValue === previousValue) return;

        try {
            await saveTableCell(rowIndex, colIndex, currentValue);
            setPreviousData(previousTable =>
                updateTableCell(previousTable, rowIndex, colIndex, currentValue)
            );
            toast.success(`✅ Ячейка (${rowIndex + 1}, ${colIndex + 1}) сохранена`);
        } catch (error) {
            console.error('Ошибка сохранения ячейки:', error);
            toast.error(`❌ ${error.message}`);
        }
    };

    const clearTable = async () => {
        try {
            const data = await clearTableData();
            setTableData(data);
            setPreviousData(data);
            toast.success('🗑️ Таблица очищена');
        } catch (error) {
            console.error('Ошибка очистки:', error);
            toast.error('❌ Ошибка очистки таблицы');
        }
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
                                        onChange={event =>
                                            handleCellChange(rowIndex, colIndex, event.target.value)
                                        }
                                        onBlur={() => handleSaveCell(rowIndex, colIndex)}
                                        onKeyDown={event => {
                                            if (event.key === 'Enter') event.currentTarget.blur();
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
