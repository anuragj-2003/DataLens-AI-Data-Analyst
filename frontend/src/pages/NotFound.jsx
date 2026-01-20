import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-black text-white fade-in">
            {/* 404 Illustration Area */}
            <div className="relative mb-8 group">
                {/* Glowing Background Effect */}
                <div className="absolute inset-0 bg-yellow-500/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

                {/* Robot / 404 Visual */}
                <div className="relative z-10 flex items-center justify-center gap-4">
                    <span className="text-[12rem] font-black text-yellow-500/90 leading-none tracking-tighter drop-shadow-2xl font-mono">4</span>

                    <div className="flex flex-col items-center gap-2 animate-bounce-slow">
                        <div className="relative">
                            <Bot size={140} className="text-zinc-400 fill-zinc-900/50" />
                            {/* Animated Eyes */}
                            <div className="absolute top-[35%] left-[25%] w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <div className="absolute top-[35%] right-[25%] w-3 h-3 bg-red-500 rounded-full animate-pulse delay-75" />
                        </div>
                    </div>

                    <span className="text-[12rem] font-black text-yellow-500/90 leading-none tracking-tighter drop-shadow-2xl font-mono">4</span>
                </div>

                {/* Disconnected plugs illustration (styled with CSS/Icons) */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-200">
                Error! Website not found!
            </h2>

            <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <button
                onClick={() => navigate('/')}
                className="group flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-8 rounded-full transition-all border border-zinc-700 hover:border-zinc-500 hover:shadow-lg hover:shadow-yellow-500/10 active:scale-95"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                BACK TO HOME
            </button>
        </div>
    );
};

export default NotFound;
