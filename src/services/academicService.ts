// Academic Service - Study programs, grades, conduct score, course registration, graduation
import api from '@/lib/api';

export interface StudyProgram {
    StudyProgramID: number;
    StudyProgramName: string;
}

export interface GradeNote {
    DiemChu: string;
    TenDiem: string;
    GhiChu?: string;
}

export interface CourseGrade {
    CourseID: string;
    CourseName: string;
    Credits: number;
    DiemQT: number | null;
    DiemThi: number | null;
    DiemHP: number | null;
    DiemChu: string | null;
    TB_HK?: number;
    TB_TL_HK4?: number;
    Dat_TL_HK?: number;
}

export interface AcademicYear {
    NamHoc: string;
    DanhSachCTDT?: Semester[];
}

export interface Semester {
    HocKy: string;
    DanhSachDiemHocPhan?: CourseGroup[];
}

export interface CourseGroup {
    DanhSachDiemChiTiet?: CourseGrade[];
}

export interface RegistrationResult {
    Status: number;
    TinhTrang: string;
    IsAccepted: number;
    ScheduleStudyUnitID: string;
    ScheduleStudyUnitAlias: string;
    StudyUnitID: string;
    StudyUnitAlias: string;
    CurriculumID: string;
    CurriculumName: string;
    CreditInfos: string;
    Credits: number;
    ProfessorName: string;
    ProfessorID: string;
    ClassStudentID: string;
    YearStudy: string;
    TermID: string;
    BeginDate: string;
    EndDate: string;
    StudyUnitTypeID: number;
    StudentID: string;
    UpdateDate: string;
    RegistDate: string;
    ListOfWeekSchedules: string;
    RegistType: string;
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

export const getStudyProgramResultsByCurriculum = async (studyProgramId: number) => {
    try {
        const response = await api.get('/student/marks', {
            params: { ctdt: studyProgramId, loai: 'CTDT' },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching study program results by curriculum:', error);
        throw error;
    }
};

export const getGradeNotes = async (): Promise<GradeNote[]> => {
    try {
        const response = await api.get('/student/GetGhiChuDiem');
        return response.data;
    } catch (error) {
        console.error('Error fetching grade notes:', error);
        throw error;
    }
};

export const getStudentConductScore = async () => {
    try {
        const response = await api.get('/student/behaviorscoretotal');
        return response.data;
    } catch (error) {
        console.error('Error fetching student conduct score:', error);
        throw error;
    }
};

export const getCourseRegistrationResults = async (yearStudy: string, termId: string) => {
    try {
        const response = await api.get('/student/XemKetQuaDangKyHP', {
            params: { namhoc: yearStudy, hocky: termId },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching course registration results:', error);
        throw error;
    }
};

export interface EquivalentCourse {
    STT: number;
    MaMon: string;
    TenMon: string;
    MaMonTuongDuong: string;
    TenMonTuongDuong: string;
}

export const getStudentEquivalentCourses = async (): Promise<EquivalentCourse[]> => {
    try {
        const response = await api.get('/student/equivalentcourse');
        return response.data;
    } catch (error) {
        console.error('Error fetching equivalent courses:', error);
        throw error;
    }
};

export interface GraduationLevel {
    GraduateLevelID: string;
    GraduateLevelName: string;
    GraduateLevelEngName?: string;
    StudyUnitCode?: string;
    GhiChu?: string | null;
    NoiDungThongBao?: string | null;
    ThongBaoNopChungChi?: string | null;
}

export interface GraduationPeriod {
    GraduationCourseID: string;
    GraduationCourseName: string;
    BeginDate: string;
    EndDate: string;
}

export interface GraduationResult {
    Result: number;
    UpdateDate: string;
    TenDot: string;
}

export interface GraduationCoursesData {
    objdata: GraduationPeriod[];
    objkq: GraduationResult[];
    objtb: GraduationLevel[];
}

export const getGraduationConsiderationResults = async () => {
    try {
        const response = await api.get('/student/Graduation_KetQuaXetTotNghiep');
        return response.data;
    } catch (error) {
        console.error('Error fetching graduation consideration results:', error);
        throw error;
    }
};

export const getGraduationCourses = async (studyProgramId: string): Promise<GraduationCoursesData> => {
    try {
        const response = await api.get('/student/LoadGraduationCourses', {
            params: { StudyProgramID: studyProgramId },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching graduation courses:', error);
        throw error;
    }
};

export interface SaveGraduationResponse {
    Message: string;
}

export const saveGraduationCourses = async (
    graduationCourseId: string,
    studyProgramId: string,
    note: string = ''
): Promise<SaveGraduationResponse> => {
    try {
        const response = await api.post('/student/SaveGraduationCourses', {
            p1: graduationCourseId,
            p2: studyProgramId,
            p3: note,
        });
        return response.data;
    } catch (error) {
        console.error('Error saving graduation courses:', error);
        throw error;
    }
};

export const deleteGraduationCourses = async (
    graduationCourseId: string,
    studyProgramId: string
): Promise<SaveGraduationResponse> => {
    try {
        const response = await api.post('/student/DeleteGraduationCourses', {
            p1: graduationCourseId,
            p2: studyProgramId,
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting graduation courses:', error);
        throw error;
    }
};
