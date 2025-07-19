'use client';

import { useState } from "react";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import Modal from '@/components/Modal';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg("");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      setResetMsg(err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-8 bg-white rounded shadow">
      {/* 中英文網站說明 */}
      <div className="mb-6 text-center">
        <h1 className="text-5xl font-sacramento leading-tight">Plan B</h1>
        <h2 className="text-2xl font-inter font-semibold text-gray-800 mt-1 tracking-wide">Portfolio Manager</h2>
        <span className="block font-wenkai font-bold text-xl mt-2">投資組合管理平台</span>
        <div className="border-b border-gray-200 my-4 w-2/3 mx-auto"></div>
        <p className="text-gray-700 font-wenkai text-base mt-2">
          <span className="font-bold font-wenkai">登入後可管理你的投資組合、追蹤績效、分析市場情緒</span><br />
          <span className="text-sm text-gray-500 font-inter italic">Manage your portfolio, track performance, and analyze market sentiment after login.</span>
        </p>
        <button
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-transform text-sm font-inter tracking-wide"
          onClick={() => setShowGuide(true)}
        >
          <span className="font-wenkai">使用說明</span> / <span className="font-inter">User Guide</span>
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-4">{isRegister ? "Register" : "Login"}</h2>
      {!showForgot ? (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border p-2 rounded"
              required
            />
            {error && <div className="text-red-500">{error}</div>}
            <button type="submit" className="bg-gray-900 text-white py-2 rounded">
              {isRegister ? "Register" : "Login"}
            </button>
          </form>
          <div className="flex flex-col gap-2 mt-4">
            <button
              className="text-sm text-gray-600 underline"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Already have an account? Login" : "No account? Register"}
            </button>
            <button
              className="text-sm text-gray-600 underline"
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button type="submit" className="bg-gray-900 text-white py-2 rounded">Send Reset Email</button>
          {resetMsg && <div className="text-gray-700 text-sm">{resetMsg}</div>}
          <button
            type="button"
            className="text-sm text-gray-600 underline"
            onClick={() => setShowForgot(false)}
          >
            Back to Login
          </button>
        </form>
      )}
      <Modal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        title={
          <div className="text-center">
            <h1 className="text-5xl font-sacramento leading-tight">Plan B</h1>
            <h2 className="text-2xl font-inter font-semibold text-gray-800 mt-1 tracking-wide">Portfolio Manager</h2>
            <span className="block font-wenkai font-bold text-xl mt-2">投資組合管理平台</span>
            <div className="border-b border-gray-200 my-4 w-2/3 mx-auto"></div>
          </div>
        }
      >
        <div className="mb-4 text-center p-8">
          <p className="font-wenkai text-base mt-2">
            <span className="font-bold font-wenkai">本網站提供投資組合管理、績效追蹤、市場情緒分析等功能。</span>
          </p>
          <p className="text-sm text-gray-500 font-inter italic mt-1">
            This site provides portfolio management, performance tracking, and market sentiment analysis.
          </p>
          <div className="flex items-center gap-3 mb-2 mt-6">
            <div className="w-2 h-6 bg-blue-400 rounded"></div>
            <h3 className="font-inter font-semibold text-xl text-blue-700 tracking-wide font-wenkai">訊號解讀 / <span className="font-playfair">Signal Interpretation</span></h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs mb-4 font-sans min-w-[600px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 font-wenkai">模式<br/><span className='font-inter text-gray-500 font-normal'>Mode</span></th>
                  <th className="border px-4 py-2 font-wenkai">NYMO</th>
                  <th className="border px-4 py-2 font-wenkai">Plan B index (signal)</th>
                  <th className="border px-4 py-2 font-inter font-semibold text-gray-500 font-normal">Action/Advice</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2 font-wenkai">🔴 進攻模式<br /><span className="text-gray-500 font-inter font-semibold">Aggressive Mode</span></td>
                  <td className="border px-4 py-2 font-wenkai">&lt; -60</td>
                  <td className="border px-4 py-2 font-wenkai">&lt; 15</td>
                  <td className="border px-4 py-2 font-inter">
                    <span className="font-bold">每天加倉10%：5% SPY槓桿 + 5% QQQ槓桿</span><br />
                    <span className="text-gray-500 font-inter font-semibold">Add 10% position daily: 5% SPY leverage + 5% QQQ leverage</span>
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-wenkai">🟡 正常模式<br /><span className="text-gray-500 font-inter font-semibold">Normal Mode</span></td>
                  <td className="border px-4 py-2 font-wenkai"><span className="whitespace-nowrap">-60 ~ 30</span></td>
                  <td className="border px-4 py-2 font-wenkai"><span className="whitespace-nowrap">15 ~ 50</span></td>
                  <td className="border px-4 py-2 font-inter">
                    <span className="font-bold">維持現有倉位，不做調整</span><br />
                    <span className="text-gray-500 font-inter font-semibold">Hold current positions, no adjustment</span>
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-wenkai">🟠 減倉模式<br /><span className="text-gray-500 font-inter font-semibold">Reduce Mode</span></td>
                  <td className="border px-4 py-2 font-wenkai"><span className="whitespace-nowrap">30 ~ 60</span></td>
                  <td className="border px-4 py-2 font-wenkai"><span className="whitespace-nowrap">50 ~ 70</span></td>
                  <td className="border px-4 py-2 font-inter">
                    <span className="font-bold">清空所有槓桿部位，轉為現金</span><br />
                    <span className="text-gray-500 font-inter font-semibold">Clear all leverage, switch to cash</span>
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-wenkai">🟣 防禦模式<br /><span className="text-gray-500 font-inter font-semibold">Defensive Mode</span></td>
                  <td className="border px-4 py-2 font-wenkai"><span className="whitespace-nowrap">&gt; 60</span></td>
                  <td className="border px-4 py-2 font-wenkai"><span className="whitespace-nowrap">&gt; 70</span></td>
                  <td className="border px-4 py-2 font-inter">
                    <span className="font-bold">將總倉位降到50%，其餘轉為現金<br />優先清空槓桿部位，必要時減少基本部位</span><br />
                    <span className="text-gray-500 font-inter font-semibold">Reduce total position to 50%, rest to cash. Clear leverage first, reduce base if needed.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 font-inter font-wenkai mt-4">Plan B index (signal) 為本網站自製指標 / Plan B index (signal) is the custom indicator of this site.</p>
          <p className="text-xs text-gray-400 mt-2 font-inter">本網站所有內容僅供學術與交流參考，非投資建議，投資盈虧請自負。<br/><span>All content on this site is for academic and communication purposes only. This is not investment advice. Invest at your own risk.</span></p>
        </div>
      </Modal>
    </div>
  );
} 