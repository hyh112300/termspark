import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export default function LoginDialog() {
  const [isRegister, setIsRegister] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regInviteCode, setRegInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast.error("请输入用户名和密码");
      return;
    }
    setIsLoading(true);
    try {
      await login(loginUsername, loginPassword);
      toast.success("登录成功");
    } catch (error: any) {
      toast.error(error.message || "登录失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regPassword || !regInviteCode) {
      toast.error("请填写所有字段");
      return;
    }
    setIsLoading(true);
    try {
      await register(regUsername, regPassword, regInviteCode);
      toast.success("注册成功");
    } catch (error: any) {
      toast.error(error.message || "注册失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-dialog">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Sparkles className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <h1 className="login-logo-text">TermSpark</h1>
          <p className="login-logo-sub">你的设计灵感手帐</p>
        </div>

        {/* Toggle Switch */}
        <label className="login-switch">
          <input
            type="checkbox"
            className="login-toggle"
            checked={isRegister}
            onChange={(e) => setIsRegister(e.target.checked)}
          />
          <span className="login-slider" />
          <span className="login-card-side" />
        </label>

        {/* Flip Card */}
        <div
          className={`login-flip-inner ${isRegister ? "login-flipped" : ""}`}
        >
          {/* Front — Login */}
          <div className="login-flip-front">
            <div className="login-title">登录</div>
            <form className="login-flip-form" onSubmit={handleLogin}>
              <input
                className="login-flip-input"
                placeholder="用户名"
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                autoComplete="username"
                disabled={isLoading}
              />
              <input
                className="login-flip-input"
                placeholder="密码"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                className="login-flip-btn"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "..." : "登录"}
              </button>
            </form>
          </div>

          {/* Back — Register */}
          <div className="login-flip-back">
            <div className="login-title">注册</div>
            <form className="login-flip-form" onSubmit={handleRegister}>
              <input
                className="login-flip-input"
                placeholder="用户名"
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                autoComplete="username"
                disabled={isLoading}
              />
              <input
                className="login-flip-input"
                placeholder="密码"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <input
                className="login-flip-input"
                placeholder="邀请码"
                type="text"
                value={regInviteCode}
                onChange={(e) => setRegInviteCode(e.target.value)}
                disabled={isLoading}
              />
              <button
                className="login-flip-btn"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "..." : "注册"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
