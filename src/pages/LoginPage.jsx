import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CustomCursor from "../components/CustomCursor";
import { saveAuth } from "../utils/auth";
import "../styles/login.css";

const API = process.env.VITE_API_URL ;

const isValidPhone = (v) => /^\d{10}$/.test(v);
const isValidOtp = (v) => /^\d{6}$/.test(v);

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Where to go after a successful login (default: home)
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/";

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: "info" | "error" | "success"
  const [loading, setLoading] = useState(false);

  const showMessage = (text, type = "info") => setMessage({ text, type });
  const showSendOtp = !otpSent;

  // ─── Send OTP ─────────────────────────────────────────────
  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (!isValidPhone(phone)) {
      showMessage("Please enter a valid 10-digit phone number.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP.");
      setOtpSent(true);
      setOtp("");
      showMessage(data.message, "info");
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── Verify OTP & Login ───────────────────────────────────
  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!isValidOtp(otp)) {
      showMessage("Please enter a valid 6-digit OTP.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        credentials: "include", // receive HTTP-only cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed.");

      // Persist token + user in localStorage (7-day login)
      saveAuth(data.token, data.user);

      showMessage("Login successful! Redirecting…", "success");
      setTimeout(() => navigate(redirectTo, { replace: true }), 800);
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-page" id="login">
      <CustomCursor />
      <div className="login-card">
        <div className="login-tag">Welcome Back</div>
        <h2 className="login-title">Login with Phone OTP</h2>
        <p className="login-sub">
          Enter your phone number to get a one-time password.
        </p>

        <form
          className="login-form"
          onSubmit={showSendOtp ? handleSendOtp : handleVerifyOtp}
        >
          <input
            className="login-input"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder="10-digit phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            disabled={otpSent || loading}
            required
          />

          {otpSent && (
            <input
              className="login-input"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
              required
            />
          )}

          {message.text && (
            <p className={`login-message login-message--${message.type}`}>
              {message.text}
            </p>
          )}

          <div className="login-actions">
            <button
              className="login-btn login-btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait…"
                : showSendOtp
                  ? "Send OTP"
                  : "Verify & Login"}
            </button>

            {otpSent && (
              <button
                className="login-btn login-btn-secondary"
                type="button"
                disabled={loading}
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setMessage({ text: "", type: "" });
                }}
              >
                Edit Phone Number
              </button>
            )}

            {otpSent && (
              <button
                className="login-btn login-btn-secondary"
                type="button"
                disabled={loading}
                onClick={handleSendOtp}
              >
                Resend OTP
              </button>
            )}

            <button
              className="login-btn login-btn-secondary"
              type="button"
              disabled={loading}
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
