import {getToken} from "./authService";

const CONFIG = {
	// Dùng proxy để tránh CORS khi dev
	portal_api: "/api-portal",
	regist_api: "/api-regist",
	apiKey: "pscRBF0zT2Mqo6vMw69YMOH43IrB2RtXBS0EHit2kzvL2auxaFJBvw==",
	clientId: "vhu",
};

/**
 * Bước 1: Lấy Refresh Token từ Portal API
 */
export const getRefreshToken = async (portalToken: string): Promise<string> => {
	const response = await fetch(
		`${CONFIG.portal_api}/Authenticate/GetRefreshToken`,
		{
			method: "GET",
			headers: {
				accept: "application/json, text/plain, */*",
				apikey: CONFIG.apiKey,
				authorization: `Bearer ${portalToken}`,
				clientid: CONFIG.clientId,
			},
		},
	);

	if (!response.ok) {
		throw new Error(`GetRefreshToken failed: ${response.status}`);
	}

	const refreshToken = await response.text();
	console.log("✅ Bước 1: Lấy Refresh Token thành công");
	return refreshToken.replace(/"/g, ""); // Remove quotes if present
};

/**
 * Bước 2: Lấy Token cho Regist System từ AuthenticatePortal API
 */
export const authenticatePortal = async (refreshToken: string) => {
	const response = await fetch(
		`${CONFIG.regist_api}/Authen/AuthenticatePortal`,
		{
			method: "POST",
			headers: {
				accept: "application/json, text/plain, */*",
				"content-type": "application/json",
				apikey: CONFIG.apiKey,
				clientid: CONFIG.clientId,
			},
			body: JSON.stringify({Token: refreshToken}),
		},
	);

	if (!response.ok) {
		throw new Error(`AuthenticatePortal failed: ${response.status}`);
	}

	const authData = await response.json();
	console.log("✅ Bước 2: Lấy Token cho Regist System thành công");
	return authData;
};

/**
 * Flow hoàn chỉnh: Từ Portal Token → Regist Token
 * Chỉ tạo mới registToken khi chưa tồn tại, hết hạn, hoặc authToken thay đổi
 */
export const initializeRegistrationSession = async () => {
	try {
		const portalToken = getToken();
		if (!portalToken) {
			throw new Error("Không tìm thấy token portal");
		}

		// Kiểm tra xem token đã tồn tại và còn hạn không
		const existingRegistToken = localStorage.getItem("registToken");
		const lastAuthToken = localStorage.getItem("registToken_authSource");

		if (existingRegistToken && lastAuthToken === portalToken) {
			// Kiểm tra token còn hạn không
			try {
				const tokenData = JSON.parse(
					atob(existingRegistToken.split(".")[1]),
				);
				// Token còn hạn ít nhất 30 giây
				if (tokenData.exp * 1000 > Date.now() + 30000) {
					console.log("✅ Sử dụng registToken hiện tại (còn hạn)");
					return existingRegistToken;
				}
			} catch {
				// Token không hợp lệ, tiếp tục tạo mới
			}
		}

		console.log("🔄 Bắt đầu flow authentication đăng ký học phần...\n");

		// Bước 1: Lấy Refresh Token
		const refreshToken = await getRefreshToken(portalToken);

		// Bước 2: Authenticate với Regist API
		const authData = await authenticatePortal(refreshToken);

		if (authData?.Token) {
			// Lưu token đăng ký vào localStorage
			localStorage.setItem("registToken", authData.Token);
			// Lưu authToken gốc để theo dõi thay đổi
			localStorage.setItem("registToken_authSource", portalToken);
			console.log("✅ Flow hoàn tất! Token đã được lưu.");
			return authData.Token;
		}

		throw new Error("Không nhận được token từ hệ thống đăng ký");
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown error";
		console.error("❌ Lỗi flow đăng ký:", message);
		throw error;
	}
};

export const getRegistToken = (): string | null => {
	return localStorage.getItem("registToken");
};
