import DefaultApi from '../api-js/src/api/DefaultApi';

const api = new DefaultApi();

export const getTableData = () => {
    return new Promise((resolve, reject) => {
        api.getTableData((error, data) => {
            if (error) reject(error);
            else resolve(data);
        });
    });
};

export const saveTableCell = (row, col, value) => {
    return new Promise((resolve, reject) => {
        api.updateTableCell({ row, col, value }, (error, data) => {
            if (error) reject(error);
            else resolve(data);
        });
    });
};
