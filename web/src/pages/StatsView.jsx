import { useLoaderData, useNavigate } from "react-router-dom";
import { useLayoutEffect, useState, useEffect } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export async function statsLoader({ params }) {
    const [statsRes, groupRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/groups/${params.guid}/stats/`),
        fetch(`http://127.0.0.1:8000/api/groups/${params.guid}/`)
    ]);

    const stats = await statsRes.json();
    const group = await groupRes.json();

    return { initialStats: stats, group, groupId: params.guid };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function StatsView() {
    const { initialStats, group, groupId } = useLoaderData();
    const navigate = useNavigate();

    // State for dynamic stats
    const [stats, setStats] = useState(initialStats);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loadingTimeline, setLoadingTimeline] = useState(false);



    // Handle category filter change
    useEffect(() => {
        // Skip first render if it matches initial
        if (selectedCategory === "all" && stats === initialStats) return;

        async function fetchFilteredStats() {
            setLoadingTimeline(true);
            try {
                const url = new URL(`http://127.0.0.1:8000/api/groups/${groupId}/stats/`);
                if (selectedCategory !== "all") {
                    url.searchParams.append("category", selectedCategory);
                }
                const res = await fetch(url);
                const newStats = await res.json();

                // We only really need to update the timeline, but the API returns everything.
                // It's cleaner to update the whole stats object to keep it consistent.
                setStats(newStats);
            } catch (err) {
                console.error("Failed to fetch filtered stats", err);
            } finally {
                setLoadingTimeline(false);
            }
        }

        fetchFilteredStats();
    }, [selectedCategory, groupId]);


    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Extract data for charts
    const { total_expense, category_breakdown, timeline } = stats;

    return (
        <div className="pb-24 space-y-8 animate-in fade-in duration-500">

            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
                    <div className="text-blue-100 text-sm font-medium mb-1">Total Expenses</div>
                    <div className="text-3xl font-bold">
                        {total_expense.toFixed(2)}€
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium mb-1">Categories</div>
                    <div className="text-3xl font-bold text-gray-800">
                        {category_breakdown.length}
                    </div>
                </div>
            </div>


            {/* Expense Accumulation Graph */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-gray-800">Spending Trend</h3>
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            disabled={loadingTimeline}
                            className="appearance-none data-[active=true]:border-blue-500 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-8 py-2 font-medium cursor-pointer transition-colors disabled:opacity-50"
                            data-active={selectedCategory !== "all"}
                        >
                            <option value="all">All Categories</option>
                            {/* We use initialStats for the dropdown options so they don't disappear if we were to return filtered breakdowns */}
                            {initialStats.category_breakdown.map(cat => (
                                <option key={cat.name} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            {loadingTimeline ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-arrow-down-s-line"></i>}
                        </div>
                    </div>
                </div>
                <div className="h-[250px] w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeline}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `${val}€`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Expenses by Category</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={category_breakdown} // Always show full breakdown even if timeline is filtered? Yes, usually better context.
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {category_breakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => `${value.toFixed(2)}€`}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>


        </div>
    );
}
