import api from '@/lib/api';

export interface LoginResponse {
    success: boolean;
    data?: {
        Token: string;
        Id: string;
        FullName: string;
        Role: string;
        GraduateLevel: string;
    };
    message?: string;
}

export interface User {
    id: string;
    fullName: string;
    role: string;
    graduateLevel: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await api.post('/authenticate/authpsc', {
            username,
            password,
            type: 0,
        });

        if (response.data && response.data.Token) {
            return {
                success: true,
                data: response.data,
            };
        }
        return { success: false, message: 'Đăng nhập thất bại' };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'Tên đăng nhập hoặc mật khẩu không đúng',
        };
    }
};

export const logout = (): void => {
    localStorage.removeItem('authToken');
    document.cookie = 'YIF+pxrGp0isUkYUsAWxn3rQH6pBrNY_=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};

export const setToken = (token: string): void => {
    localStorage.setItem('authToken', token);
};

export const isTokenValid = (): boolean => {
    const token = getToken();
    if (!token) return false;

    try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        return tokenData.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

export const getUserFromToken = (): User | null => {
    const token = getToken();
    if (!token) return null;

    try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        if (tokenData.exp * 1000 > Date.now()) {
            return {
                id: tokenData.Id,
                fullName: tokenData.Name,
                role: tokenData.Role,
                graduateLevel: tokenData.GraduateLevel,
            };
        }
        return null;
    } catch {
        return null;
    }
};
