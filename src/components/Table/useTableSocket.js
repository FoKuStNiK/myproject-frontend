import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getTableData, saveTableCell } from '../../api/tableApi';

const updateTableCell = (table, rowToUpdate, colToUpdate, value) => {
    return table.map((row, rowIndex) =>
        rowIndex === rowToUpdate
            ? row.map((cell, colIndex) =>
                colIndex === colToUpdate ? value : cell
            )
            : row
    );
};

function useTableSocket() {
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
            };

            socket.onmessage = event => {
                if (closedByReact) {
                    return;
                }

                try {
                    const message = JSON.parse(event.data);

                    if (message.type === 'PING') {
                        if (socket.readyState === WebSocket.OPEN) {
                            socket.send(JSON.stringify({
                                type: 'PONG',
                                timestamp: message.timestamp
                            }));
                        }
                        return;
                    }

                    if (message.type === 'CELL_UPDATED') {
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

                    if (message.type === 'TABLE_CLEARED') {
                        setTableData(message.data);
                        setPreviousData(message.data);
                    }

                    if (
                        message.type === 'TABLE_CLEAR_RESULT' &&
                        message.success
                    ) {
                        toast.success('🗑️ Таблица очищена');
                    }

                    if (message.type === 'ERROR') {
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
                console.log('🔄 Повторная загрузка и подключение через 3 секунды...');

                if (connectionToastId === null) {
                    connectionToastId = toast.error(
                        hasConnectedOnce
                            ? '⚠️ Связь потеряна'
                            : '❌ Нет связи с сервером',
                        { duration: Infinity }
                    );
                }

                reconnectTimer = setTimeout(() => {
                    loadTableAndConnect(false);
                }, 3000);
            };
        };

        const loadTableAndConnect = async (showLoading = true) => {
            if (closedByReact) {
                return;
            }

            if (showLoading) {
                setLoading(true);
            }

            try {
                const data = await getTableData();

                if (closedByReact) {
                    return;
                }

                setTableData(data);
                setPreviousData(data);
                setLoading(false);

                connectSocket();
            } catch (error) {
                if (closedByReact) {
                    return;
                }

                console.error('Ошибка загрузки таблицы:', error);
                setLoading(false);

                if (connectionToastId === null) {
                    connectionToastId = toast.error(
                        '❌ Ошибка загрузки таблицы',
                        { duration: Infinity }
                    );
                }

                reconnectTimer = setTimeout(() => {
                    loadTableAndConnect(false);
                }, 3000);
            }
        };

        loadTableAndConnect();

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

    const handleCellChange = (rowIndex, colIndex, value) => {
        setTableData(previousTable =>
            updateTableCell(previousTable, rowIndex, colIndex, value)
        );
    };

    const handleSaveCell = async (rowIndex, colIndex) => {
        const currentValue = tableData[rowIndex][colIndex];
        const previousValue = previousData[rowIndex]?.[colIndex];

        if (currentValue === previousValue) {
            return;
        }

        try {
            await saveTableCell(rowIndex, colIndex, currentValue);

            setPreviousData(previousTable =>
                updateTableCell(
                    previousTable,
                    rowIndex,
                    colIndex,
                    currentValue
                )
            );

            toast.success(
                `✅ Ячейка (${rowIndex + 1}, ${colIndex + 1}) сохранена`
            );
        } catch (error) {
            console.error('Ошибка сохранения ячейки:', error);
            toast.error(`❌ ${error.message}`);
        }
    };

    const clearTable = () => {
        if (
            !socketRef.current ||
            socketRef.current.readyState !== WebSocket.OPEN
        ) {
            toast.error('❌ Ошибка очистки таблицы');
            return;
        }

        socketRef.current.send(JSON.stringify({
            type: 'TABLE_CLEAR'
        }));
    };

    return {
        tableData,
        loading,
        handleCellChange,
        handleSaveCell,
        clearTable
    };
}

export default useTableSocket;
