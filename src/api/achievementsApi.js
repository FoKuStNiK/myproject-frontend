import apiRequest from './request';

const getAchievements = () => {
    return apiRequest('/achievements');
};

export { getAchievements };
