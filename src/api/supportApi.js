import apiRequest from './request';

const getSupport = () => {
    return apiRequest('/support');
};

export { getSupport };
