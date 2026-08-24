import React, { useState } from 'react';
import useTableSocket from './useTableSocket';
import './Table.css';

function Table() {
    const {
        tableData,
        loading,
        connectionStatus,
        handleCellChange,
        handleSaveCell,
        clearTable
    } = useTableSocket();

    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    const connectionStatusText = {
        connected: '🟢 Подключено',
        connecting: '🟡 Подключение...',
        disconnected: '🔴 Нет связи'
    }[connectionStatus];

    const confirmClearTable = () => {
        clearTable();
        setIsClearModalOpen(false);
    };

    return (
        <div className="table-container">
            <h3>📊 Таблица 6×4</h3>

            <p className="table-hint">
                Кликните на ячейку и введите данные
            </p>

            <div className={`connection-status ${connectionStatus}`}>
                WebSocket: {connectionStatusText}
            </div>

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
                    onClick={() => setIsClearModalOpen(true)}
                    className="clear-button"
                >
                    🗑️ Очистить
                </button>
            </div>

            {isClearModalOpen && (
                <div className="modal-overlay">
                    <div
                        className="clear-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="clear-modal-title"
                    >
                        <h4 id="clear-modal-title">Очистить таблицу?</h4>
                        <p>Все данные в ячейках будут удалены.</p>

                        <div className="modal-actions">
                            <button
                                onClick={() => setIsClearModalOpen(false)}
                                className="cancel-button"
                            >
                                Отмена
                            </button>

                            <button
                                onClick={confirmClearTable}
                                className="confirm-clear-button"
                            >
                                🗑️ Очистить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Table;
