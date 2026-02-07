// Retake Exam Registration Service
import api from '@/lib/api';

// Year and Term types
export interface YearTermData {
    YearStudy: string[];
    Terms: { TermID: string; TermName: string }[];
    CurrentYear: string;
    CurrentTerm: string;
}

// Get year and term data
export const getYearAndTerm = async (): Promise<YearTermData> => {
    try {
        const response = await api.get('/student/yearandterm');
        return response.data;
    } catch (error) {
        console.error('Error fetching year and term:', error);
        throw error;
    }
};

// Types for registered retake exams
export interface RetakeRegistration {
    CurriculumID: string;
    CurriculumName: string;
    ScheduleStudyUnitID: string;
    Note: string;
    DaDuyet: boolean;
}

// Types for available retake courses
export interface RetakeResult {
    CurriculumID: string;
    CurriculumName: string;
    ScheduleStudyUnitID: string;
    Note: string;
    DaDuyet: boolean;
}

// Response from the API
export interface RetakeListData {
    dtDSDK: RetakeRegistration[];
    dtDSKQ: RetakeResult[];
}

// Get list of retake registrations
export const getRetakeList = async (yearStudy: string, termId: string): Promise<RetakeListData> => {
    try {
        const response = await api.post('/student/DanhSachDangKyThiLai', {
            YearStudy: yearStudy,
            TermId: termId,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching retake list:', error);
        throw error;
    }
};
