import React, { useState } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { register } from '../services/db';

interface RegisterFormProps {
  onRegister: (user: any, token: string) => void;
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('密码不匹配');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('密码至少需要6个字符');
      setLoading(false);
      return;
    }

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender
      };

      // Use the register function from db.ts
      const data = await register(registerData);

      if (data.userId) {
        // Registration successful - redirect to login
        setError('注册成功！请登录。');
        // Switch to login mode after a short delay
        setTimeout(() => {
          onSwitchToLogin();
        }, 1500);
      } else {
        throw new Error('无效的注册响应');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-md flex flex-col h-full justify-start max-h-screen overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={onSwitchToLogin}
          className="mb-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-2">
            SoulMatch AI
          </h1>
          <p className="text-gray-600">加入我们，找到真爱</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">创建账号</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                placeholder="请输入邮箱"
                required
                disabled={loading}
              />
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                姓名
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                placeholder="请输入姓名"
                required
                disabled={loading}
              />
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                年龄
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                placeholder="请输入年龄"
                min="18"
                max="100"
                required
                disabled={loading}
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                性别
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                required
                disabled={loading}
              >
                <option value="">请选择性别</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                placeholder="请输入密码（至少6位）"
                required
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                确认密码
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                placeholder="请再次输入密码"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className={`text-sm text-center py-2 px-3 rounded-lg ${
                error.includes('成功') ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '创建中...' : '创建账号'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              已有账户？
              <button
                onClick={onSwitchToLogin}
                className="text-rose-500 font-medium hover:text-rose-600 ml-2"
              >
                登录
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
