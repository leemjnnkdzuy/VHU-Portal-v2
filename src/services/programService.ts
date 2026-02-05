// Program Service - Educational programs and study programs
import api from '@/lib/api';

export interface StudyProgram {
    StudyProgramID: string;
    StudyProgramName: string;
}

export interface StudyProgramCourse {
    CurriculumID: string;
    TenHP: string;
    STC: number;
    BatBuoc: string;
    HPHocTruoc: string;
    Khoa: string;
    SemesterName: string;
}

export interface StudyProgramDetail {
    tbStudyPrograms: StudyProgramCourse[];
}

export const getStudyPrograms = async (): Promise<StudyProgram[]> => {
    try {
        const response = await api.get('/student/getstudyprogram');
        return response.data;
    } catch (error) {
        console.error('Error fetching study programs:', error);
        throw error;
    }
};

export const getStudyProgramDetail = async (studyProgramId: string): Promise<StudyProgramDetail> => {
    try {
        const response = await api.get(`/student/studyProgram?StudyProgramID=${studyProgramId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching study program detail:', error);
        throw error;
    }
};

export const getStudyProgramResults = async (studyProgramId: number) => {
    try {
        const response = await api.get('/student/marks', {
            params: { ctdt: studyProgramId, loai: 'SV' },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching study program results:', error);
        throw error;
    }
};
