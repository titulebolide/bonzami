import React, { useState } from 'react';
import { useLoaderData, useParams, useNavigate } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';

export async function groupSettingsLoader({ params }) {
    const groupRes = await fetch(`http://127.0.0.1:8000/api/groups/${params.guid}/`);
    const usersRes = await fetch(`http://127.0.0.1:8000/api/users/?group=${params.guid}`);
    const categoriesRes = await fetch(`http://127.0.0.1:8000/api/categories/?group=${params.guid}`);

    if (!groupRes.ok || !usersRes.ok || !categoriesRes.ok) {
        throw new Error("Failed to load group data");
    }

    const group = await groupRes.json();
    const users = await usersRes.json();
    const categories = await categoriesRes.json();

    return { group, users, categories };
}

export default function GroupSettings() {
    const { group: initialGroup, users: initialUsers, categories: initialCategories } = useLoaderData();
    const { guid } = useParams();
    const navigate = useNavigate();

    const [groupName, setGroupName] = useState(initialGroup.name);
    const [users, setUsers] = useState(initialUsers);
    const [categories, setCategories] = useState(initialCategories);
    const [activeEmojiPicker, setActiveEmojiPicker] = useState(null); // stores category ID or null

    const [savedGroupName, setSavedGroupName] = useState(false);
    const [savedParticipants, setSavedParticipants] = useState(false);
    const [savedCategories, setSavedCategories] = useState(false);

    const handleGroupNameSave = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/groups/${guid}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: groupName })
            });
            if (res.ok) {
                setSavedGroupName(true);
                setTimeout(() => {
                    navigate(0); // Refresh to update header
                }, 1000);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to update group name");
        }
    };

    const handleUserChange = (id, newName) => {
        setUsers(users.map(u => u.id === id ? { ...u, name: newName } : u));
    };

    const handleParticipantsSave = async () => {
        try {
            await Promise.all(users.map(user =>
                fetch(`http://127.0.0.1:8000/api/users/${user.id}/`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: user.name })
                })
            ));
            setSavedParticipants(true);
            setTimeout(() => setSavedParticipants(false), 2000);
        } catch (e) {
            console.error(e);
            alert("Failed to update participants");
        }
    };

    const handleCategoryChange = (id, field, value) => {
        setCategories(categories.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const handleCategoriesSave = async () => {
        try {
            await Promise.all(categories.map(cat =>
                fetch(`http://127.0.0.1:8000/api/categories/${cat.id}/`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: cat.name, emoji: cat.emoji })
                })
            ));
            setSavedCategories(true);
            setTimeout(() => setSavedCategories(false), 2000);
        } catch (e) {
            console.error(e);
            alert("Failed to update categories");
        }
    };

    return (
        <div className="pb-32 pt-6 px-4 max-w-[600px] mx-auto space-y-8">
            {/* Group Name Section */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="ri-settings-3-line text-blue-500"></i>
                    Group Name
                </h2>
                <div className="space-y-3">
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-800"
                    />
                    <div className="flex justify-end pt-2 items-center gap-3">
                        {savedGroupName && (
                            <span className="text-green-600 font-medium flex items-center gap-1 text-sm animate-in fade-in slide-in-from-right-2 duration-300">
                                Saved <i className="ri-checkbox-circle-line"></i>
                            </span>
                        )}
                        <button
                            onClick={handleGroupNameSave}
                            className="px-4 py-2 border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-colors active:scale-95 duration-200"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </section>

            {/* Participants Section */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="ri-user-smile-line text-green-500"></i>
                    Participants
                </h2>
                <div className="space-y-3">
                    {users.map(user => (
                        <div key={user.id} className="flex gap-2 items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 border border-gray-200/50">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <input
                                type="text"
                                value={user.name}
                                onChange={(e) => handleUserChange(user.id, e.target.value)}
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-gray-800"
                            />
                        </div>
                    ))}
                    <div className="flex justify-end pt-2 items-center gap-3">
                        {savedParticipants && (
                            <span className="text-green-600 font-medium flex items-center gap-1 text-sm animate-in fade-in slide-in-from-right-2 duration-300">
                                <i className="ri-checkbox-circle-line"></i> Saved !
                            </span>
                        )}
                        <button
                            onClick={handleParticipantsSave}
                            className="px-4 py-2 border border-green-500 text-green-600 hover:bg-green-50 rounded-xl font-medium transition-colors active:scale-95 duration-200"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="ri-price-tag-3-line text-purple-500"></i>
                    Categories
                </h2>
                <div className="space-y-3">
                    {categories.map(cat => (
                        <div key={cat.id} className="flex gap-2 relative">
                            <button
                                onClick={() => setActiveEmojiPicker(activeEmojiPicker === cat.id ? null : cat.id)}
                                className="w-14 h-[42px] flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-xl"
                            >
                                {cat.emoji}
                            </button>

                            {activeEmojiPicker === cat.id && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setActiveEmojiPicker(null)}
                                    />
                                    <div className="absolute top-12 left-0 z-50 shadow-xl rounded-2xl">
                                        <EmojiPicker
                                            onEmojiClick={(emojiData) => {
                                                handleCategoryChange(cat.id, 'emoji', emojiData.emoji);
                                                setActiveEmojiPicker(null);
                                            }}
                                            width={300}
                                            height={400}
                                        />
                                    </div>
                                </>
                            )}

                            <input
                                type="text"
                                value={cat.name}
                                onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)}
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-gray-800"
                                placeholder="Category Name"
                            />
                        </div>
                    ))}
                    <div className="flex justify-end pt-2 items-center gap-3">
                        {savedCategories && (
                            <span className="text-green-600 font-medium flex items-center gap-1 text-sm animate-in fade-in slide-in-from-right-2 duration-300">
                                Saved <i className="ri-checkbox-circle-line"></i>
                            </span>
                        )}
                        <button
                            onClick={handleCategoriesSave}
                            className="px-4 py-2 border border-purple-500 text-purple-600 hover:bg-purple-50 rounded-xl font-medium transition-colors active:scale-95 duration-200"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
