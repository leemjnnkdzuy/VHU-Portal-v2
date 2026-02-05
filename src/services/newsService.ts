import api from '../lib/api';

export interface NewsGroup {
    MaNhomTin: number;
    TenNhomTin: string;
}

export interface NewsItem {
    MaTin: number;
    TieuDe: string;
    UpdateDate: string;
    CreateDate: string;
    NoiDung?: string;
}

export const getNewsGroups = async (): Promise<NewsGroup[]> => {
    try {
        const response = await api.get('/guest/GetNhomTin', {
            params: { maNhomTin: -1 },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching news groups:', error);
        throw error;
    }
};

export const getNewsItems = async (
    maNhomTin: number = 0,
    nhomTin: number = 0,
    currPage: number = 1
): Promise<NewsItem[]> => {
    try {
        const response = await api.get('/guest/GetTinTucHienThi_v2', {
            params: { maNhomTin, nhomTin, currPage },
        });
        return response.data.tbTinTuc || [];
    } catch (error) {
        console.error('Error fetching news items:', error);
        throw error;
    }
};

export const getNewsById = async (newsId: number): Promise<NewsItem> => {
    try {
        const response = await api.get('/guest/GetMessageById', {
            params: { p1: newsId },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching news details:', error);
        throw error;
    }
};
