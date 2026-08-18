const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiRequest = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, options);
    let data = null;

    if (response.status !== 204) {
        data = await response.json();
    }

    if (!response.ok) {
        throw new Error(data?.error || `Ошибка запроса: ${response.status}`);
    }

    return data;
};

export default apiRequest;
