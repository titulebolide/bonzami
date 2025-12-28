import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function Header() {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [title, setTitle] = useState("Bonzami"); // Default title
    const [showBack, setShowBack] = useState(false);
    const [showTabs, setShowTabs] = useState(false);

    // Fetch group name if we have a guid and we are on the list page (root of group)
    useEffect(() => {
        async function fetchGroup() {
            if (params.guid) {
                try {
                    const res = await fetch("http://127.0.0.1:8000/api/groups/" + params.guid + "/");
                    if (res.ok) {
                        const data = await res.json();
                        setTitle(data.name);
                    }
                } catch (e) {
                    console.error("Failed to fetch header info", e);
                }
            }
        }

        // Determine state based on path
        if (location.pathname.endsWith("/edit") || location.pathname.endsWith("/new")) {
            setTitle(params.expenseid ? "Edit Expense" : "New Expense");
            setShowBack(true);
            setShowTabs(false);
        } else if (params.guid) {
            // Main Group Views (List, Stats, Settle Up)
            setShowBack(false);
            setShowTabs(true);
            fetchGroup();
        } else {
            // Root or unknown
            setTitle("Bonzami");
            setShowBack(false);
            setShowTabs(false);
        }
    }, [location.pathname, params.guid, params.expenseid]);


    const isTabActive = (path) => {
        if (path === "") return location.pathname === `/g/${params.guid}`;
        return location.pathname.includes(path);
    }

    return (
        <>
            {/* Main Header Bar */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
                <div className="max-w-[600px] mx-auto px-4 h-16 relative flex items-center justify-between">

                    {/* Back Button (Left) */}
                    <div className="flex items-center z-10 w-10">
                        {showBack && (
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 -ml-2 rounded-full hover:bg-gray-100/80 text-gray-600 transition-colors"
                            >
                                <i className="ri-arrow-left-line text-xl"></i>
                            </button>
                        )}
                    </div>

                    {/* Title (Center) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none max-w-[60%]">
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight truncate">
                            {title}
                        </h1>
                    </div>

                    {/* Right Placeholder */}
                    <div className="w-10"></div>
                </div>
            </div>

            {/* Tabs (Floating Underneath) */}
            {showTabs && params.guid && (
                <div className="sticky top-[4.5rem] z-40 max-w-[600px] mx-auto px-4 mt-2">
                    <div className="flex bg-gray-100/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-200/50">
                        <button
                            onClick={() => navigate(`/g/${params.guid}`)}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${isTabActive("") && !isTabActive("stats") && !isTabActive("settle-up") ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => navigate(`/g/${params.guid}/settle-up`)}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${isTabActive("settle-up") ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}
                        >
                            Settle Up
                        </button>
                        <button
                            onClick={() => navigate(`/g/${params.guid}/stats`)}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${isTabActive("stats") ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}
                        >
                            Stats
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
