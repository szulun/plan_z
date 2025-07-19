import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import { Parisienne } from 'next/font/google';

const parisienne = Parisienne({
  subsets: ['latin'],
  variable: '--font-parisienne',
  weight: ['400'],
  display: 'swap',
});

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Email</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
} 