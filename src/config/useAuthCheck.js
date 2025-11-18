import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login, logout } from "../pages/redux/userSlice";

// Helper function để check token expiration
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

export default function useAuthCheck() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem("token");
      const userStr = sessionStorage.getItem("user");

      if (token && userStr) {
        // Check token expiration
        if (isTokenExpired(token)) {
          // Token hết hạn → logout
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          dispatch(logout());
        } else {
          // Token còn hiệu lực → restore user state
          try {
            const user = JSON.parse(userStr);
            // Transform user object để khớp với format trong Redux (giống như trong login page)
            dispatch(
              login({
                accountID: user.userId,
                fullName: user.fullName,
                email: user.email,
                roleName: user.roles,
                phomeNumber: user.phoneNumber,
                dateOfBirth: user.dateOfBirth,
                avatarUrl: user.avatarUrl,
              })
            );
          } catch (error) {
            console.error("Error parsing user data:", error);
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            dispatch(logout());
          }
        }
      } else {
        // Không có token hoặc user → đảm bảo logout
        dispatch(logout());
      }
    };

    // Check ngay khi mount (khi reload page, sẽ restore user state nếu token còn hạn)
    checkAuth();

    // Check định kỳ mỗi phút để phát hiện token hết hạn
    const intervalId = setInterval(checkAuth, 60000); // 60 seconds

    // Khi tab bị ẩn/hiển thị lại → check lại token
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab được hiển thị lại → check token (có thể đã hết hạn)
        checkAuth();
      }
    };

    // Listen event khi token hết hạn từ API interceptor
    const handleTokenExpired = () => {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      dispatch(logout());
    };

    // Lưu ý: Không cần beforeunload để xóa sessionStorage
    // vì sessionStorage tự động bị xóa khi đóng tab
    // nhưng sẽ giữ lại khi reload page (đây là behavior mong muốn)

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("tokenExpired", handleTokenExpired);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("tokenExpired", handleTokenExpired);
    };
  }, [dispatch]);
}
