export const handleResponse = (res, status, message, data = {}) => {
    return res.status(status).json({ message, ...data });
};
