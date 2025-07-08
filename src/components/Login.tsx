import { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const USERS = [
  { username: 'companyA', password: 'passwordA' },
  { username: 'companyB', password: 'passwordB' },
  { username: 'companyC', password: 'passwordC' },
];

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
      setError('');
      onLogin(user.username);
    } else {
      setError('Username atau password salah');
    }
  };

  return (
    <div
      className="login-container min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url('/img/bg-login.png')",
      }}
    >
      <div className="login-form bg-white p-10 rounded-xl shadow-lg w-full max-w-md text-center transition-all">
        <h1 className="text-2xl font-bold mb-2 text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>GasTrax</h1>
        <p className="mb-7 text-gray-500 text-base">Silakan masuk untuk melanjutkan</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group relative mb-5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg">
              <i className="fas fa-user" />
            </span>
            <input
              type="text"
              className="input-field w-full pl-11 pr-3 py-3 border border-gray-200 rounded-lg text-base text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />
          </div>
          <div className="input-group relative mb-5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg">
              <i className="fas fa-lock" />
            </span>
            <input
              type="password"
              className="input-field w-full pl-11 pr-3 py-3 border border-gray-200 rounded-lg text-base text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Kata Sandi"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />
          </div>
          {error && (
            <div className="mb-3 text-red-600 text-sm font-medium text-center">{error}</div>
          )}
          <button
            type="submit"
            className="login-btn w-full py-3 rounded-lg bg-blue-600 text-white text-lg font-semibold transition hover:bg-blue-700 active:scale-95 mb-2"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Login
          </button>
          <a
            href="https://wa.me/6285720156766?text=hallo%2C%20tolong%20reset%20password%20untuk%20login%20GasTrax"
            target="_blank"
            rel="noopener noreferrer"
            className="forgot-password block mt-4 text-blue-600 text-sm hover:text-blue-800 hover:underline"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Lupa Kata Sandi?
          </a>
        </form>
        <p className="footer-text mt-8 text-xs text-gray-400">© GasTrax 2025 by Smartek Sistem Indonesia. Semua Hak Dilindungi.</p>
      </div>
    </div>
  );
};

export default Login; 