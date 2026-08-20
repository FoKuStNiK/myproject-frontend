import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import './Table.css';

const updateTableCell = (table, rowToUpdate, colToUpdate, value) => {
    return table.map((row, rowIndex) =>
        rowIndex === rowToUpdate
            ? row.map((cell, colIndex) =>
                colIndex === colToUpdate ? value : cell
            )
            : row
    );
};

function Table() {
    const [tableData, setTableData] = useState([]);
    const [previousData, setPreviousData] = useState([]);
    const [loading, setLoading] = useState(true);

    const socketRef = useRef(null);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const socketUrl =
            process.env.REACT_APP_WS_URL ||
            `${protocol}://${window.location.hostname}:5000`;

        let reconnectTimer = null;
        let closedByReact = false;
        let hasConnectedOnce = false;
        let connectionToastId = null;

        const connectSocket = () => {
            if (closedByReact) {
                return;
            }

            console.log('🔄 Подключение к WebSocket...');

            const socket = new WebSocket(socketUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                if (closedByReact) {
                    socket.close();
                    return;
                }

                console.log('✅ WebSocket подключён');

                if (connectionToastId !== null) {
                    toast.dismiss(connectionToastId);
                    connectionToastId = null;
                    toast.success('✅ Связь восстановлена');
                }

                hasConnectedOnce = true;

                socket.send(JSON.stringify({
                    type: 'table:get'
                }));
            };

            socket.onmessage = event => {
                if (closedByReact) {
                    return;
                }

                try {
                    const message = JSON.parse(event.data);

                    // Прикладной ping от backend.
                    // Отвечаем обычным WebSocket сообщением pong,
                    // чтобы ping/pong были видны в F12 → Network → WS → Messages.
                    if (message.type === 'ping') {
                        if (socket.readyState === WebSocket.OPEN) {
                            socket.send(JSON.stringify({
                                type: 'pong',
                                timestamp: message.timestamp
                            }));
                        }
                        return;
                    }

                    // Получение всей таблицы
                    if (message.type === 'table:data') {
                        setTableData(message.data);
                        setPreviousData(message.data);
                        setLoading(false);
                    }

                    // Изменение одной ячейки
                    if (message.type === 'cell:updated') {
                        setTableData(previousTable =>
                            updateTableCell(
                                previousTable,
                                message.row,
                                message.col,
                                message.value
                            )
                        );

                        setPreviousData(previousTable =>
                            updateTableCell(
                                previousTable,
                                message.row,
                                message.col,
                                message.value
                            )
                        );
                    }

                    // Результат сохранения ячейки
                    if (message.type === 'cell:saved') {
                        if (message.success) {
                            toast.success(
                                `✅ Ячейка (${message.row + 1}, ${message.col + 1}) сохранена`
                            );
                        } else {
                            toast.error(
                                '❌ Ошибка: ' +
                                (message.message || 'Неизвестная ошибка')
                            );
                        }
                    }

                    // Получение очищенной таблицы
                    if (message.type === 'table:cleared') {
                        setTableData(message.data);
                        setPreviousData(message.data);
                    }

                    // Результат команды очистки
                    if (
                        message.type === 'table:clear:result' &&
                        message.success
                    ) {
                        toast.success('🗑️ Таблица очищена');
                    }

                    // Ошибка, присланная backend
                    if (message.type === 'error') {
                        console.error('Ошибка от backend:', message.message);
                        toast.error(`❌ ${message.message}`);
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
                if (socketRef.current === socket) {
                    socketRef.current = null;
                }

                if (closedByReact) {
                    return;
                }

                console.log('⚠️ WebSocket отключён');
                console.log('🔄 Переподключение через 3 секунды...');

                // Показываем одно постоянное уведомление и не дублируем его
                // при каждой неудачной попытке переподключения.
                if (connectionToastId === null) {
                    connectionToastId = toast.error(
                        hasConnectedOnce
                            ? '⚠️ Связь потеряна'
                            : '❌ Нет связи с сервером',
                        { duration: Infinity }
                    );
                }

                reconnectTimer = setTimeout(() => {
                    connectSocket();
                }, 3000);
            };
        };

        // Первое подключение
        connectSocket();

        return () => {
            closedByReact = true;

            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
            }

            if (connectionToastId !== null) {
                toast.dismiss(connectionToastId);
            }

            const socket = socketRef.current;
            socketRef.current = null;

            if (!socket) {
                return;
            }

            socket.onmessage = null;
            socket.onerror = null;
            socket.onclose = null;

            if (socket.readyState === WebSocket.CONNECTING) {
                socket.onopen = () => socket.close();
            } else if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, []);

    // Изменение ячейки только на экране
    const handleCellChange = (rowIndex, colIndex, value) => {
        setTableData(previousTable =>
            updateTableCell(previousTable, rowIndex, colIndex, value)
        );
    };

    // Отправка изменённой ячейки backend
    const handleSaveCell = (rowIndex, colIndex) => {
        const currentValue = tableData[rowIndex][colIndex];
        const previousValue = previousData[rowIndex]?.[colIndex];

        if (currentValue === previousValue) {
            return;
        }

        if (
            !socketRef.current ||
            socketRef.current.readyState !== WebSocket.OPEN
        ) {
            toast.error('❌ Ошибка соединения с сервером');
            return;
        }

        socketRef.current.send(JSON.stringify({
            type: 'cell:update',
            row: rowIndex,
            col: colIndex,
            value: currentValue
        }));
    };

    // Отправка команды очистки
    const clearTable = () => {
        if (
            !socketRef.current ||
            socketRef.current.readyState !== WebSocket.OPEN
        ) {
            toast.error('❌ Ошибка очистки таблицы');
            return;
        }

        socketRef.current.send(JSON.stringify({
            type: 'table:clear'
        }));
    };

    if (loading) {
        return <div className="loading">Загрузка...</div>;
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
                                        onChange={event =>
                                            handleCellChange(
                                                rowIndex,
                                                colIndex,
                                                event.target.value
                                            )
                                        }
                                        onBlur={() =>
                                            handleSaveCell(rowIndex, colIndex)
                                        }
                                        onKeyDown={event => {
                                            if (event.key === 'Enter') {
                                                event.currentTarget.blur();
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