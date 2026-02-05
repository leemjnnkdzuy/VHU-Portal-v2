// Scholarship Service - Student scholarships
import api from '@/lib/api';

export interface Scholarship {
    id: string;
    name: string;
    description?: string;
    amount?: number;
    deadline?: string;
    requirements?: string;
    status?: string;
}

export const getOpenScholarships = async (yearStudy: string, termId: string): Promise<Scholarship[]> => {
    try {
        const response = await api.get('/student/HocBongDangMo', {
            params: {
                namhoc: yearStudy,
                hocky: termId,
            },
        });
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching open scholarships:', error);
        throw error;
    }
};

export const getRegisteredScholarships = async (yearStudy: string, termId: string): Promise<Scholarship[]> => {
    try {
        const response = await api.get('/student/HocBongDaDangKy', {
            params: {
                namhoc: yearStudy,
                hocky: termId,
            },
        });
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching registered scholarships:', error);
        throw error;
    }
};

export const registerScholarship = async (scholarshipId: string): Promise<any> => {
    try {
        const response = await api.post('/student/DangKyHocBong', {
            IdHocBong: scholarshipId
        });
        return response.data;
    } catch (error) {
        console.error('Error registering scholarship:', error);
        throw error;
    }
};

