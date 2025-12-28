import { useState, useEffect } from "react";

export default function NewExpenseButton({ onClick }) {
    const [isAtBottom, setIsAtBottom] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const scrolledToBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
            setIsAtBottom(scrolledToBottom);
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <button
            onClick={onClick}
            className={`fixed z-40 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/40 flex items-center justify-center text-white transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isAtBottom
                    ? "bottom-4 right-4 left-4 h-16 rounded-2xl"
                    : "bottom-6 right-6 left-[calc(100%-5rem)] h-14 rounded-[28px] hover:scale-105 active:scale-95"
                }`}
        >
            <div className={`flex items-center justify-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isAtBottom ? "max-w-[200px] opacity-100 mr-2" : "max-w-0 opacity-0 mr-0"}`}>
                <span className="font-bold text-lg whitespace-nowrap">New Expense</span>
            </div>
            <i className="ri-add-line text-3xl transition-transform duration-500"></i>
        </button>
    );
}
