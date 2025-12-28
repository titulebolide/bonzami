import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function Header() {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [title, setTitle] = useState("Bonzami"); // Default title
    const [showBack, setShowBack] = useState(false);
    const [showStats, setShowStats] = useState(false);

    // Fetch group name if we have a guid and we are on the list page (root of group)
    // Or maybe always fetch it to show it?
    // Logic: 
    // - List: Title = Group Name. Back = Hidden.
    // - Details: Title = "Expense Details". Back = Visible.
    // - Editor: Title = "Edit Expense" / "New Expense". Back = Visible.

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
            setShowStats(false);
        } else if (params.guid) {
            // List page
            setShowBack(false);
            setShowStats(true);
            fetchGroup();
        } else {
            // Root or unknown
            setTitle("Bonzami");
            setShowBack(false);
            setShowStats(false);
        }
    }, [location.pathname, params.guid, params.expenseid]);

    return (
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
            <div className="max-w-[600px] mx-auto px-4 h-16 relative flex items-center justify-between">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                        {title}
                    </h1>
                </div>

                <div className="flex items-center z-10">
                    {showBack && (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100/80 text-gray-600 transition-colors"
                        >
                            <i className="ri-arrow-left-line text-xl"></i>
                        </button>
                    )}
                </div>

                {/* Placeholder for right-side actions if needed */}
                <div className="w-8 flex justify-end">
                    {showStats && (
                        <button
                            onClick={() => navigate(`/g/${params.guid}/stats`)}
                            className="p-2 -mr-2 rounded-full hover:bg-gray-100/80 text-gray-600 transition-colors"
                        >
                            <i className="ri-bar-chart-fill text-xl"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
