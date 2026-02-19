import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { isAdmin } from "../../firebase/admin.service";

// Optional: if you already have a toast system, you can replace the alerts.
// import toast from "react-hot-toast";  // only if you already use it

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("admin@scentbase.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const from = useMemo(() => location.state?.from?.pathname || "/admin", [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const ok = await isAdmin(cred.user.uid);

      if (!ok) {
        await signOut(auth);
        setErr("Access denied. This account is not an admin.");
        setLoading(false);
        return;
      }

      navigate(from, { replace: true });
    } catch (error) {
      setErr("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sbAdminLogin">
      {/* Background layer (matches premium vibe) */}
      <div className="sbAdminBG">
        <div className="sbGlow sbGlow1" />
        <div className="sbGlow sbGlow2" />
        <div className="sbNoise" />
      </div>

      {/* Main */}
      <div className="sbAdminWrap">
        <div className="sbAdminCard">
          <div className="sbAdminTop">
            <div className="sbAdminBadge">ScentBase • Admin</div>
            <h1 className="sbAdminTitle">Welcome back</h1>
            <p className="sbAdminSub">
              Login to manage <b>orders</b>, <b>products</b> and <b>deals</b>.
            </p>
          </div>

          {err ? (
            <div className="sbAdminAlert">
              <span className="sbAdminAlertDot" />
              <p>{err}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="sbAdminForm">
            <div className="sbField">
              <label>Email</label>
              <div className="sbInputWrap">
                <span className="sbIcon">✉</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@scentbase.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="sbField">
              <label>Password</label>
              <div className="sbInputWrap">
                <span className="sbIcon">🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button className="sbAdminBtn" disabled={loading}>
              {loading ? (
                <span className="sbBtnLoader" />
              ) : (
                <span className="sbBtnDot" />
              )}
              {loading ? "Signing in..." : "Login"}
            </button>

            <div className="sbAdminHint">
              Only UIDs inside <b>Firestore → admins</b> can access admin pages.
            </div>
          </form>
        </div>

        {/* Right side (optional) - modern branding panel */}
        <div className="sbAdminSide">
          <div className="sbSideCard">
            <h3>Secure Access</h3>
            <p>
              Admin routes are protected by Firebase Auth + Firestore allowlist.
              Any non-admin account is blocked automatically.
            </p>
            <div className="sbSideStats">
              <div className="sbStat">
                <span className="sbStatNum">1</span>
                <span className="sbStatTxt">Admin Allowlist</span>
              </div>
              <div className="sbStat">
                <span className="sbStatNum">3</span>
                <span className="sbStatTxt">Protected Modules</span>
              </div>
              <div className="sbStat">
                <span className="sbStatNum">✓</span>
                <span className="sbStatTxt">Firestore Rules</span>
              </div>
            </div>
          </div>

          <div className="sbSideFooter">
            <span>© {new Date().getFullYear()} ScentBase</span>
            <span className="sbDotSep">•</span>
            <span>Admin Panel</span>
          </div>
        </div>
      </div>

      {/* CSS inside component so you can paste fast (later we can move to AdminLogin.css) */}
      <style>{`
        .sbAdminLogin{
          min-height:100vh;
          position:relative;
          overflow:hidden;
          background:#050814;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:24px;
        }
        .sbAdminBG{position:absolute; inset:0; pointer-events:none;}
        .sbGlow{
          position:absolute;
          width:520px; height:520px;
          filter: blur(70px);
          opacity:.55;
          border-radius:999px;
        }
        .sbGlow1{left:-120px; top:-120px; background: radial-gradient(circle at 30% 30%, #ff4d6d, transparent 60%);}
        .sbGlow2{right:-160px; bottom:-160px; background: radial-gradient(circle at 30% 30%, #7c4dff, transparent 60%);}
        .sbNoise{
          position:absolute; inset:0;
          opacity:.06;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='80' height='80' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
        }

        .sbAdminWrap{
          width:100%;
          max-width:1120px;
          display:grid;
          grid-template-columns: 1.1fr .9fr;
          gap:18px;
          position:relative;
          z-index:2;
        }

        .sbAdminCard{
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 18px;
          padding: 26px;
          box-shadow: 0 25px 70px rgba(0,0,0,0.45);
          backdrop-filter: blur(14px);
          animation: sbPop .35s ease both;
        }

        @keyframes sbPop{
          from{transform: translateY(14px); opacity:0;}
          to{transform: translateY(0); opacity:1;}
        }

        .sbAdminTop{margin-bottom:16px;}
        .sbAdminBadge{
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:7px 12px;
          border-radius:999px;
          font-size:12px;
          letter-spacing:.3px;
          color: rgba(255,255,255,0.85);
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.10);
          margin-bottom:10px;
        }
        .sbAdminTitle{
          margin:0;
          font-size:34px;
          line-height:1.12;
          color:#fff;
          letter-spacing:.2px;
        }
        .sbAdminSub{
          margin:10px 0 0;
          color: rgba(255,255,255,0.78);
          font-size:14px;
          line-height:1.55;
        }

        .sbAdminAlert{
          display:flex;
          gap:10px;
          align-items:flex-start;
          padding:12px 14px;
          border-radius:14px;
          background: rgba(255,77,109,0.12);
          border: 1px solid rgba(255,77,109,0.35);
          margin: 12px 0 14px;
        }
        .sbAdminAlertDot{
          width:10px;height:10px;border-radius:50%;
          background:#ff4d6d;
          margin-top:4px;
          box-shadow: 0 0 0 6px rgba(255,77,109,0.18);
        }
        .sbAdminAlert p{margin:0; color:rgba(255,255,255,0.9); font-size:13px; line-height:1.4;}

        .sbAdminForm{display:flex; flex-direction:column; gap:14px;}
        .sbField label{
          display:block;
          font-size:12px;
          color: rgba(255,255,255,0.82);
          margin-bottom:8px;
          letter-spacing:.2px;
        }
        .sbInputWrap{
          display:flex;
          align-items:center;
          gap:10px;
          padding: 12px 14px;
          border-radius:14px;
          background: rgba(0,0,0,0.28);
          border: 1px solid rgba(255,255,255,0.12);
          transition: .2s ease;
        }
        .sbInputWrap:focus-within{
          border-color: rgba(255,77,109,0.55);
          box-shadow: 0 0 0 4px rgba(255,77,109,0.12);
        }
        .sbIcon{
          width:30px;height:30px;border-radius:10px;
          display:grid; place-items:center;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          color:#fff;
          font-size:14px;
        }
        .sbInputWrap input{
          width:100%;
          border:none;
          outline:none;
          background:transparent;
          color:#fff;
          font-size:14px;
        }
        .sbInputWrap input::placeholder{color: rgba(255,255,255,0.45);}

        .sbAdminBtn{
          margin-top:6px;
          width:100%;
          border:none;
          outline:none;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          padding: 13px 14px;
          border-radius:14px;
          font-weight:700;
          color:#0b0b0f;
          background: linear-gradient(90deg, #ff4d6d, #ff7a59);
          box-shadow: 0 18px 45px rgba(255,77,109,0.25);
          transition:.2s ease;
        }
        .sbAdminBtn:hover{transform: translateY(-1px);}
        .sbAdminBtn:disabled{opacity:.7; cursor:not-allowed; transform:none;}

        .sbBtnDot{
          width:10px;height:10px;border-radius:50%;
          background:#0b0b0f;
          box-shadow: 0 0 0 6px rgba(0,0,0,0.10);
        }
        .sbBtnLoader{
          width:16px;height:16px;border-radius:50%;
          border: 2px solid rgba(0,0,0,0.25);
          border-top: 2px solid rgba(0,0,0,0.85);
          animation: sbSpin .8s linear infinite;
        }
        @keyframes sbSpin{to{transform: rotate(360deg);}}

        .sbAdminHint{
          margin-top:2px;
          font-size:12px;
          color: rgba(255,255,255,0.68);
          line-height:1.4;
        }

        .sbAdminSide{
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          gap:14px;
        }
        .sbSideCard{
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 22px;
          backdrop-filter: blur(10px);
          box-shadow: 0 25px 70px rgba(0,0,0,0.35);
          animation: sbPop .42s ease both;
        }
        .sbSideCard h3{
          margin:0 0 8px;
          color:#fff;
          font-size:18px;
        }
        .sbSideCard p{
          margin:0;
          color: rgba(255,255,255,0.75);
          font-size:13px;
          line-height:1.55;
        }

        .sbSideStats{
          display:grid;
          grid-template-columns: repeat(3, 1fr);
          gap:10px;
          margin-top:14px;
        }
        .sbStat{
          border-radius:14px;
          padding:12px;
          background: rgba(0,0,0,0.22);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .sbStatNum{
          display:block;
          font-weight:800;
          color:#fff;
          font-size:16px;
          margin-bottom:6px;
        }
        .sbStatTxt{
          display:block;
          color: rgba(255,255,255,0.68);
          font-size:12px;
          line-height:1.2;
        }

        .sbSideFooter{
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          color: rgba(255,255,255,0.55);
          font-size:12px;
          padding: 10px 0;
        }
        .sbDotSep{opacity:.55}

        @media (max-width: 900px){
          .sbAdminWrap{grid-template-columns: 1fr; max-width:560px;}
          .sbAdminSide{display:none;}
        }
      `}</style>
    </div>
  );
}
