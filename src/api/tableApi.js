const API_URL =
    process.env.REACT_APP_API_URL ||
    `http://${window.location.hostname}:5000/api`;

const request = async (url, options = {}) => {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Ошибка сервера');
    }

    return data;
};

export const getTableData = () => {
    return request(`${API_URL}/table-data`);
};

export const saveTableCell = (row, col, value) => {
    return request(`${API_URL}/table-data/cell`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ row, col, value })
    });
};

export const clearTableData = () => {
    return request(`${API_URL}/table-data`, {
        method: 'DELETE'
    });
};
