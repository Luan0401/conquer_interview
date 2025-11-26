import api from "./api";

export const loginApi = (data) => api.post("Auth/login", data);

export const updateProfileApi = (userId, profileData) => api.put(`User/${userId}`, profileData);

export const registerApi = (data) => api.post("Auth/register", data);

export const createSessionInterviewApi = (data) => api.post("Session/start", data);

export const getSessionDetailsApi = (sessionId) => api.get(`Session/${sessionId}/questions`);

/**
 * Gửi câu trả lời của người dùng cho một câu hỏi cụ thể.
 * Endpoint: POST /api/Session/answer
 * @param {object} data - Payload: {sessionId, questionId, questionText, answerText}
 */
export const sendAnswerApi = (data) => api.post("Session/answer", data);

export const updateSessionStatusApi = (sessionId, status) => {
    return api.put(`/Session/update-status`, null, {
        params: {
            sessionId: sessionId,
            status: status
        }
    });
};

/**
 * Lấy báo cáo chi tiết cho một phiên phỏng vấn cụ thể.
 * Endpoint: GET /api/Session/{sessionId}/report
 * @param {number | string} sessionId - ID của phiên phỏng vấn.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getSessionReportApi = (sessionId) => {
    // Sử dụng template literals để chèn sessionId vào URL
    // Giả định URL đầy đủ là: /api/Session/{sessionId}/report
    return api.get(`Session/${sessionId}/report`);
};

export const decrementTrialApi = () => {
    
    return api.put('User/decrement-trial');
};

export const getSessionReportHistoryApi = () => {
    return api.get('Session/report');
}

export const getSubscriptionPlansApi = () => {
    return api.get('SubscriptionPlan');
};

export const getPersonalizationHistoryApi = () => {
    return api.get('Personalization/my-history');
};