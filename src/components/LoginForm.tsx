"use client";

interface EmailConfig {
  email: string;
  password: string;
  targetEmail: string;
}

interface LoginFormProps {
  emailConfig: EmailConfig;
  setEmailConfig: (config: EmailConfig) => void;
  hasSavedConfig: boolean;
  fetching: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function LoginForm({
  emailConfig,
  setEmailConfig,
  hasSavedConfig,
  fetching,
  onLogin,
  onLogout,
}: LoginFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Đăng nhập để lấy Email
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email đăng nhập
          </label>
          <input
            type="email"
            value={emailConfig.email}
            onChange={(e) =>
              setEmailConfig({ ...emailConfig, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mật khẩu
          </label>
          <input
            type="password"
            value={emailConfig.password}
            onChange={(e) =>
              setEmailConfig({ ...emailConfig, password: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="••••••••"
          />
        </div>
      </div>
      <div className="mt-4">
        {hasSavedConfig ? (
          <button
            onClick={onLogout}
            disabled={fetching}
            className="px-6 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {fetching ? "Đang lấy email..." : "Đăng xuất"}
          </button>
        ) : (
          <button
            onClick={onLogin}
            disabled={fetching}
            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {fetching ? "Đang lấy email..." : "Đăng nhập"}
          </button>
        )}
      </div>
      {hasSavedConfig && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
          ✓ Đã lưu cấu hình - Email sẽ tự động được lấy mỗi 30 giây
        </p>
      )}
    </div>
  );
}
