import apiRequest from './request';

const getNews = () => {
    return apiRequest('/news');
};

export { getNews };
