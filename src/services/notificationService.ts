// Notification Service - Student notifications/messages
import api from '@/lib/api';

export const getStudentNotifications = async () => {
    try {
        const response = await api.get('/student/GetMessagesByReceiverID');
        return response.data;
    } catch (error) {
        console.error('Error fetching student notifications:', error);
        throw error;
    }
};

export const getNotificationDetails = async (messageId: number) => {
    try {
        const response = await api.get('/student/GetMessageDetailById', {
            params: { p1: messageId },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching notification details:', error);
        throw error;
    }
};
