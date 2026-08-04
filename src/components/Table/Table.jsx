import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DefaultApi from '../../api-js/src/api/DefaultApi';
import './Table.css';
// Это комментарий — он не влияет на работу кода
const api = new DefaultApi();

function Table() {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previousData, setPreviousData] = useState([]);

    // 1. Загрузка данных (одна функция)
    useEffect(() => {
        const loadTableData = async () => {
            setLoading(true);
            try {
                const data = await new Promise((resolve, reject) => {
                    api.tableDataGet((error, data) => {
                        if (error) reject(error);
                        else resolve(data);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const handleSaveCell = async (rowIndex, colIndex) => {
        const currentValue = tableData[rowIndex][colIndex];
        const previousValue = previousData[rowIndex]?.[colIndex];

        if (currentValue === previousValue) return;

        try {
            const result = await new Promise((resolve, reject) => {
                api.tableDataCellPatch(
                    { row: rowIndex, col: colIndex, value: currentValue },
                    (error, data) => {
                        if (error) reject(error);
                        else resolve(data);
                    }
                );
            });

            if (result.success) {
                toast.success(`✅ Ячейка (${rowIndex + 1}, ${colIndex + 1}) сохранена`);
                setPreviousData(prev => {
                    const newData = [...prev];
                    if (!newData[rowIndex]) newData[rowIndex] = [];
                    newData[rowIndex][colIndex] = currentValue;
                    return newData;
                });
            } else {
                toast.error('❌ Ошибка: ' + (result.message || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Ошибка сохранения ячейки:', error);
            toast.error('❌ Ошибка соединения с сервером');
        }
    };

    // 4. Очистка таблицы (одна функция)
    const clearTable = async () => {
        try {
            const newTable = await new Promise((resolve, reject) => {
                api.tableDataDelete((error, data) => {
                    if (error) reject(error);
                    else resolve(data);
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