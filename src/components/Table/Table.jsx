import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DefaultApi from '../../api-js/src/api/DefaultApi';
import './Table.css';

const api = new DefaultApi();

function Table() {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previousData, setPreviousData] = useState([]);

    // =====================================================
    // 1. Загрузка таблицы через HTTP
    // =====================================================
    useEffect(() => {
        const loadTableData = async () => {
            setLoading(true);

            try {
                const data = await new Promise((resolve, reject) => {
                    api.tableDataGet((error, data) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(data);
                        }
                    });
                });
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

    // =====================================================
    // 2. WebSocket для получения изменений + reconnect
    // =====================================================
    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

        const socketUrl =
            process.env.REACT_APP_WS_URL ||
            `${protocol}://${window.location.hostname}:5000`;

        let socket = null;
        let reconnectTimer = null;
        let closedByReact = false;

        const connectSocket = () => {
            // Если компонент уже удалён — новое соединение не создаём
            if (closedByReact) {
                return;
            }
            console.log('🔄 Подключение к WebSocket...');
            socket = new WebSocket(socketUrl);

            socket.onopen = () => {
                // Если React успел вызвать cleanup,
                // пока соединение устанавливалось
                if (closedByReact) {
                    socket.close();
                    return;
                }

                console.log('✅ WebSocket подключён');
            };

            socket.onmessage = (event) => {
                if (closedByReact) {
                    return;
                }

                try {
                    const message = JSON.parse(event.data);

                    // Другой пользователь изменил ячейку
                    if (message.type === 'cell:updated') {
                        setTableData(prev =>
                            prev.map((row, rowIndex) =>
                                rowIndex === message.row
                                    ? row.map((cell, colIndex) =>
                                        colIndex === message.col
                                            ? message.value
                                            : cell
                                    )
                                    : row
                            )
                        );

                        setPreviousData(prev =>
                            prev.map((row, rowIndex) =>
                                rowIndex === message.row
                                    ? row.map((cell, colIndex) =>
                                        colIndex === message.col
                                            ? message.value
                                            : cell
                                    )
                                    : row
                            )
                        );
                    }
                    // Другой пользователь очистил таблицу
                    if (message.type === 'table:cleared') {
                        setTableData(message.data);
                        setPreviousData(message.data);
                    }
                } catch (error) {
                    console.error(
                        'Ошибка обработки WebSocket сообщения:',
                        error
                    );
                }
            };

            socket.onerror = (error) => {
                if (!closedByReact) {
                    console.error('Ошибка WebSocket:', error);
                }
            };

            socket.onclose = () => {
                if (closedByReact) {
                    return;
                }

                console.log('⚠️ WebSocket отключён');

                // Через 3 секунды пробуем подключиться снова
                reconnectTimer = setTimeout(() => {
                    connectSocket();
                }, 3000);
                
            };
        };

        // Первое подключение
        connectSocket();

        return () => {
            closedByReact = true;

            // Если уже запланирован reconnect — отменяем его
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
            }

            // Если соединение открыто — закрываем
            if (socket?.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, []);

    // =====================================================
    // 3. Локальное изменение значения
    // =====================================================
    const handleCellChange = (rowIndex, colIndex, value) => {
        const newData = tableData.map((row, r) =>
            r === rowIndex
                ? row.map((cell, c) =>
                    c === colIndex ? value : cell
                )
                : row
        );

        setTableData(newData);
    };

    // =====================================================
    // 4. Сохранение через HTTP PATCH
    // =====================================================
    const handleSaveCell = async (rowIndex, colIndex) => {
        const currentValue = tableData[rowIndex][colIndex];
        const previousValue = previousData[rowIndex]?.[colIndex];

        if (currentValue === previousValue) {
            return;
        }

        try {
            const result = await new Promise((resolve, reject) => {
                api.tableDataCellPatch(
                    {
                        row: rowIndex,
                        col: colIndex,
                        value: currentValue
                    },
                    (error, data) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(data);
                        }
                    }
                );
            });

            if (result.success) {
                toast.success(
                    `✅ Ячейка (${rowIndex + 1}, ${colIndex + 1}) сохранена`
                );

                setPreviousData(prev =>
                    prev.map((row, r) =>
                        r === rowIndex
                            ? row.map((cell, c) =>
                                c === colIndex
                                    ? currentValue
                                    : cell
                            )
                            : row
                    )
                );
            } else {
                toast.error(
                    '❌ Ошибка: ' +
                    (result.message || 'Неизвестная ошибка')
                );
            }
        } catch (error) {
            console.error('Ошибка сохранения ячейки:', error);
            toast.error('❌ Ошибка соединения с сервером');
        }
    };

    // =====================================================
    // 5. Очистка через HTTP DELETE
    // =====================================================
    const clearTable = async () => {
        try {
            const newTable = await new Promise((resolve, reject) => {
                api.tableDataDelete((error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
            });

            setTableData(newTable);
            setPreviousData(newTable);
            toast.success('🗑️ Таблица очищена');
        } catch (error) {
            console.error('Ошибка очистки:', error);
            toast.error('❌ Ошибка очистки таблицы');
        }
    };

    if (loading) {
        return (
            <div className="loading">
                Загрузка...
            </div>
        );
    }

    return (
        <div className="table-container">
            <h3>📊 Таблица 6×4</h3>

            <p className="table-hint">
                Кликните на ячейку и введите данные
            </p>

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
                                        onChange={(e) =>
                                            handleCellChange(
                                                rowIndex,
                                                colIndex,
                                                e.target.value
                                            )
                                        }
                                        onBlur={() =>
                                            handleSaveCell(
                                                rowIndex,
                                                colIndex
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSaveCell(
                                                    rowIndex,
                                                    colIndex
                                                );
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

                <button
                    onClick={clearTable}
                    className="clear-button"
                >
                    🗑️ Очистить
                </button>
            </div>
        </div>
    );
}

export default Table;