import { useState, useEffect } from "react";

interface EmailConfig {
  email: string;
  password: string;
  targetEmail: string;
}

export function useEmailConfig() {
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    email: "",
    password: "",
    targetEmail: "",
  });
  const [hasSavedConfig, setHasSavedConfig] = useState(false);

  // Load cấu hình đã lưu từ localStorage
  const loadSavedConfig = () => {
    try {
      if (typeof window !== "undefined") {
        const savedEmail = localStorage.getItem("email_translator_email");
        const savedPassword = localStorage.getItem("email_translator_password");
        const savedTargetEmail = localStorage.getItem(
          "email_translator_targetEmail"
        );

        if (savedEmail && savedPassword) {
          setEmailConfig({
            email: savedEmail,
            password: savedPassword,
            targetEmail: savedTargetEmail || "",
          });
          setHasSavedConfig(true);
        }
      }
    } catch (error) {
      console.error("Error loading saved config:", error);
    }
  };

  // Lưu cấu hình vào localStorage
  const saveConfig = () => {
    try {
      if (typeof window !== "undefined") {
        if (emailConfig.email && emailConfig.password) {
          localStorage.setItem("email_translator_email", emailConfig.email);
          localStorage.setItem(
            "email_translator_password",
            emailConfig.password
          );
          if (emailConfig.targetEmail) {
            localStorage.setItem(
              "email_translator_targetEmail",
              emailConfig.targetEmail
            );
          }
          setHasSavedConfig(true);
        }
      }
    } catch (error) {
      console.error("Error saving config:", error);
      throw error;
    }
  };

  // Xóa cấu hình đã lưu
  const clearSavedConfig = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("email_translator_email");
        localStorage.removeItem("email_translator_password");
        localStorage.removeItem("email_translator_targetEmail");
        setEmailConfig({
          email: "",
          password: "",
          targetEmail: "",
        });
        setHasSavedConfig(false);
      }
    } catch (error) {
      console.error("Error clearing config:", error);
      throw error;
    }
  };

  // Auto-save config (dùng sau khi fetch thành công)
  const autoSaveConfig = () => {
    if (emailConfig.email && emailConfig.password) {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("email_translator_email", emailConfig.email);
          localStorage.setItem(
            "email_translator_password",
            emailConfig.password
          );
          if (emailConfig.targetEmail) {
            localStorage.setItem(
              "email_translator_targetEmail",
              emailConfig.targetEmail
            );
          }
          setHasSavedConfig(true);
        }
      } catch (error) {
        console.error("Error auto-saving config:", error);
      }
    }
  };

  useEffect(() => {
    loadSavedConfig();
  }, []);

  return {
    emailConfig,
    setEmailConfig,
    hasSavedConfig,
    saveConfig,
    clearSavedConfig,
    autoSaveConfig,
  };
}
