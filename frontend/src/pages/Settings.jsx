import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Save, User, Sliders, Shield, Trash2, Brain, AlertTriangle, ChevronLeft } from 'lucide-react';
import api from '../api';

const Settings = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { model, setModel, temperature, setTemperature, systemPrompt, setSystemPrompt, theme, setTheme } = useSettings();

    // Local state for account actions
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt);

    // Update local state when context changes (initial load)
    React.useEffect(() => {
        setLocalSystemPrompt(systemPrompt);
    }, [systemPrompt]);

    const showMessage = (type, text) => {
        setMsg({ type, text });
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    };

    const handleSaveTheme = () => {
        // Theme is already applied via Context, this just confirms action to user
        showMessage('success', 'Theme preference saved successfully');
    };

    const handleSaveSystemPrompt = () => {
        setSystemPrompt(localSystemPrompt);
        showMessage('success', 'System prompt and behavior saved');
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            setMsg({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        // Implement API call for password change
        alert("Feature coming soon: Password Change API");
    };

    const clearMemory = async () => {
        if (confirm("Are you sure you want to delete all conversation history? This cannot be undone.")) {
            try {
                // Mock API call or implement real one
                await api.delete('/settings/memory');
                alert("History cleared!");
                window.location.reload(); // Force sidebar refresh
            } catch (err) {
                console.error(err);
            }
        }
    };

    const deleteAccount = async () => {
        if (confirm("CRITICAL: Are you sure you want to delete your account? All data will be lost forever.")) {
            await api.delete('/settings/account');
            alert("Account deleted.");
            logout();
        }
    };

    return (
        <div className="flex bg-gray-50 dark:bg-black min-h-screen text-zinc-900 dark:text-white p-6 overflow-y-auto transition-colors duration-300">
            <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">

                <header className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Back to Chat"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
                            Settings
                        </h1>
                        <p className="text-zinc-500">Manage your preferences, behavior, and account</p>
                    </div>
                </header>

                {msg.text && (
                    <div className={`p-4 rounded-xl ${msg.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                        {msg.text}
                    </div>
                )}

                {/* Appearance Settings */}
                <section className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-600/20 flex items-center justify-center text-pink-600 dark:text-pink-400">
                            <Sliders size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Appearance</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Customize the look and feel</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Theme</label>
                            <select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                            >
                                <option value="system">System Default</option>
                                <option value="dark">Dark Mode</option>
                                <option value="light">Light Mode</option>
                            </select>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveTheme}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                            >
                                <Save size={16} /> Save Theme
                            </button>
                        </div>
                    </div>
                </section>

                {/* AI Model Settings */}
                <section className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-600/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                            <Sliders size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">AI Configuration</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Customize the agent's intelligence</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Model</label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                            >
                                <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Versatile)</option>
                                <option value="llama-3.1-8b-instant">Llama 3.1 8B (Instant)</option>
                                <option value="openai/gpt-oss-120b">GPT-OSS 120B</option>
                                <option value="qwen/qwen3-32b">Qwen 3 32B</option>
                                <option value="groq/compound">Groq Compound</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Temperature: {temperature}</label>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400"
                            />
                        </div>
                    </div>
                </section>

                {/* Behavior / System Prompt */}
                <section className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Agent Behavior</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Define how the AI should act</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">System Prompt</label>
                        <textarea
                            value={localSystemPrompt}
                            onChange={(e) => setLocalSystemPrompt(e.target.value)}
                            className="w-full h-32 bg-gray-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="e.g., You are a strict coding assistant..."
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveSystemPrompt}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                <Save size={16} /> Save Settings
                            </button>
                        </div>
                    </div>
                </section>

                {/* Account Security */}
                <section className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-600/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Security</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Manage your account credentials</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="password"
                                placeholder="Current Password"
                                value={passwordData.current}
                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-violet-500 outline-none transition-colors"
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-violet-500 outline-none transition-colors"
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-violet-500 outline-none transition-colors"
                            />
                        </div>
                        <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            Update Password
                        </button>
                    </form>
                </section>

                {/* Account & Data (Formerly Danger Zone) */}
                <section className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-600/20 flex items-center justify-center text-red-600 dark:text-red-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Account & Data</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Manage your data and account deletion</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-black/40">
                            <div>
                                <h3 className="font-medium text-zinc-900 dark:text-white">Clear Conversation History</h3>
                                <p className="text-xs text-zinc-500">Deletes all saved chats and memory</p>
                            </div>
                            <button onClick={clearMemory} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
                                <Trash2 size={16} /> Delete All
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-black/40">
                            <div>
                                <h3 className="font-medium text-zinc-900 dark:text-white">Delete Account</h3>
                                <p className="text-xs text-zinc-500">Permanently delete your account and data</p>
                            </div>
                            <button onClick={deleteAccount} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
                                <Trash2 size={16} /> Delete Account
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Settings;
