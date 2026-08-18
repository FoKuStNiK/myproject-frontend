import apiRequest from './request';

const getTableData = () => {
    return apiRequest('/table-data');
};

const saveTableCell = (row, col, value) => {
    return apiRequest('/table-data/cell', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row, col, value })
    });
};

const clearTableData = () => {
    return apiRequest('/table-data', {
        method: 'DELETE'
    });
};

export { getTableData, saveTableCell, clearTableData };
