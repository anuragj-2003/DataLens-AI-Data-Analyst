import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex h-screen bg-white dark:bg-black text-zinc-900 dark:text-white overflow-hidden font-sans selection:bg-blue-500/30 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-black relative transition-colors duration-300">
                {/* Subtle Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 dark:bg-blue-900/10 blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/5 dark:bg-violet-900/10 blur-[120px]" />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 z-10 relative flex flex-col h-full overflow-hidden">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
