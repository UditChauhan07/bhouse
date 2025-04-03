import { useState, useEffect } from "react";
import "../styles/login.css";
import { login } from "../lib/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword"); 

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    toast.dismiss(); // Clear previous toasts
    let isValid = true;

    if (!email) {
      toast.error("⚠ Email is required.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(" Invalid email format.");
      isValid = false;
    }

    if (!password) {
      toast.error("⚠ Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      toast.error(" Password must be at least 6 characters long.");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await login(email, password);
      toast.success("✅ Login Successful!");

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      localStorage.setItem("user", JSON.stringify(res));
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error(err.message || "❌ Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar isLogin={true} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Welcome Back 👋</h2>

          <div className="input-group">
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

          <div className="input-group">
            <input
              className="password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            
              maxLength={15}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-btn">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="form_footer">
            <div className="remember-me">
              <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
              <label htmlFor="rememberMe">Remember Me</label>
            </div>

            <div className="login-options">
              <button className="forgot-password" onClick={() => navigate("/forgot-password")}>
                Forgot Password?
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <div className="login-spinner"></div> : "Login"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
