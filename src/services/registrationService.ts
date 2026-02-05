import registrationApi from '@/lib/registrationApi';

export interface StudyProgram {
    StudyProgramID: string;
    StudyProgramName: string;
    IsOpen: boolean;
}

export interface RegistSemesterQuota {
    // Add fields based on actual API response, initializing with minimal likely fields
    // User didn't provide full response for this, will infer or keep generic map for now if structure unknown
    // Based on usage context, it likely contains credits, dates etc.
    // For now we will use 'any' or basic structure until response is clarified
    [key: string]: any;
}

// Get all study programs for registration
export const getAllStudyPrograms = async (): Promise<StudyProgram[]> => {
    try {
        const response = await registrationApi.get('/Authen/GetAllStudyProgramRegist');
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching study programs:', error);
        throw error;
    }
};

// Get registration semester quota
export const getRegistSemesterQuota = async (studyProgramId: string): Promise<any> => {
    try {
        const response = await registrationApi.get('/Regist/GetRegistSemesterCreditQuota', {
            params: {
                StudyProgramID: studyProgramId
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching registration quota:', error);
        throw error;
    }
};
