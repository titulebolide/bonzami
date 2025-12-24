import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import EmojiPicker from 'emoji-picker-react';

export async function expenseEditorLoader({ params }) {
  const groupReq = fetch("http://127.0.0.1:8000/api/groups/" + params.guid + "/")
  const categoriesReq = fetch("http://127.0.0.1:8000/api/categories/?group=" + params.guid)

  let expenseData = null
  if (params.expenseid) {
    const expenseReq = fetch("http://127.0.0.1:8000/api/expenses/" + params.expenseid + "/")
    const [groupRes, categoriesRes, expenseRes] = await Promise.all([groupReq, categoriesReq, expenseReq])
    const group = await groupRes.json()
    const categories = await categoriesRes.json()
    const expense = await expenseRes.json()
    return { group, categories, expense }
  } else {
    const [groupRes, categoriesRes] = await Promise.all([groupReq, categoriesReq])
    const group = await groupRes.json()
    const categories = await categoriesRes.json()
    return { group, categories, expense: null }
  }
}

export default function ExpenseEditor() {
  const { group, categories: initialCategories, expense } = useLoaderData();
  const navigate = useNavigate();
  const params = useParams();

  // Initialize state
  const [name, setName] = useState(expense ? expense.name : "");
  // Amount string to handle decimals easily input-wise
  const [amount, setAmount] = useState(expense ? expense.amount.toString() : "");

  // Payer ID. If new, default to first user or empty? Default to first user ID to be safe.
  const userIds = Object.keys(group.uids);
  const [payer, setPayer] = useState(expense ? expense.by : (userIds.length > 0 ? userIds[0] : ""));

  // Category State
  // expense.categ is an object {id, name, emoji} or null/undefined
  // We want to store the ID but display name/emoji.
  // Or keep the whole object? Best to keep ID for submission, but need object for UI.
  // Let's keep ID in state.
  const [categories, setCategories] = useState(initialCategories || []);
  const [categoryId, setCategoryId] = useState(expense && expense.categ ? expense.categ.id : (initialCategories && initialCategories.length > 0 ? initialCategories[0].id : null));
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("🍆");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [isPredicting, setIsPredicting] = useState(false);

  const fetchPredictions = async () => {
    if (!name.trim()) return;
    setIsPredicting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/predict-category/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: name, group: group.id })
      });
      if (res.ok) {
        const predictions = await res.json();
        // Match IDs with full category objects
        const resolvedCats = predictions
          .map(p => categories.find(c => c.id === p.id))
          .filter(Boolean);
        setSuggestedCategories(resolvedCats);
      }
    } catch (e) {
      console.error("Prediction failed", e);
    } finally {
      setIsPredicting(false);
    }
  };

  // Shares: map of uid -> share value. 
  // Initial shares from expense, or all 1 for new?
  // If expense exists, it has shares list: [{uid:..., share:...}]
  const initialShares = {};
  if (expense) {
    expense.shares.forEach(s => {
      initialShares[s.uid] = s.share;
    });
    // Ensure all group users are in map (default 0 or 1? Old app says 1 if not present? Or check logic)
    // The UI shows 1 by default for everyone in view_file.
    userIds.forEach(uid => {
      if (!(uid in initialShares)) initialShares[uid] = 1;
    });
  } else {
    userIds.forEach(uid => initialShares[uid] = 1);
  }
  const [shares, setShares] = useState(initialShares);

  const handleShareChange = (uid, val) => {
    setShares({
      ...shares,
      [uid]: parseFloat(val) || 0
    });
  };

  const handleSave = async () => {
    // Construct payload
    const sharesInput = Object.entries(shares).map(([uid, share]) => ({
      uid: parseInt(uid),
      share: share
    }));

    const payload = {
      name: name,
      amount: parseFloat(amount),
      by: parseInt(payer),
      group: group.id,
      date: expense ? expense.date : new Date().toISOString(), // Preserve date on edit, new date on create
      shares_input: sharesInput,
      category_id: categoryId
    };

    let url = "http://127.0.0.1:8000/api/expenses/";
    let method = "POST";
    if (expense) {
      url += expense.id + "/";
      method = "PATCH";
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        navigate(-1); // Go back
      } else {
        alert("Error saving expense");
        console.error(await res.text());
      }
    } catch (e) {
      console.error(e);
      alert("Error saving expense");
    }
  }

  const handleSaveCategory = async () => {
    if (!newCategoryName) return;

    const payload = {
      name: newCategoryName,
      emoji: newCategoryEmoji,
      group: group.id
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/categories/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const newCat = await res.json()
        setCategories([...categories, newCat])
        setCategoryId(newCat.id)
        setIsCategoryModalOpen(false)
        setNewCategoryName("")
        setNewCategoryEmoji("🍆")
      } else {
        console.error(await res.text())
        alert("Failed to create category")
      }
    } catch (e) {
      console.error(e)
      alert("Failed to create category")
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24 font-sans">
      <div className="space-y-6">
        {/* Name Input */}
        <div className="group">
          <label className="block text-sm font-medium text-gray-500 mb-1 transition-colors group-focus-within:text-blue-600">
            Description
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <i className="ri-shopping-bag-3-fill"></i>
            </div>
            <input
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
              type="text"
              placeholder="What is this for?"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => fetchPredictions()}
              autoFocus={!expense}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Amount Input */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-500 mb-1 transition-colors group-focus-within:text-blue-600">
              Amount
            </label>
            <div className="relative">
              <input
                className="block w-full pl-3 pr-8 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-bold text-lg"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 font-bold">
                €
              </div>
            </div>
          </div>

          {/* Payer Input */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-500 mb-1 transition-colors group-focus-within:text-blue-600">
              Paid By
            </label>
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none font-medium cursor-pointer"
                value={payer}
                onChange={e => setPayer(e.target.value)}
              >
                {
                  Object.entries(group.uids).map(([uid, name]) => (
                    <option key={uid} value={uid}>{name}</option>
                  ))
                }
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <i className="ri-arrow-down-s-line"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Category Input */}
        <div className="group">
          <label className="block text-sm font-medium text-gray-500 mb-1 transition-colors group-focus-within:text-blue-600">
            Category
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none font-medium cursor-pointer"
                value={categoryId || ""}
                onChange={e => setCategoryId(parseInt(e.target.value))}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji}{"\u00A0\u00A0\u00A0"}{cat.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <i className="ri-arrow-down-s-line"></i>
              </div>
            </div>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex-none aspect-square h-[50px] border border-gray-200 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <i className="ri-add-line text-xl"></i>
            </button>
          </div>
          {isPredicting && (
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          )}
          {suggestedCategories.length > 0 && !isPredicting && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
              {suggestedCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryId(cat.id)
                  }}
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors whitespace-nowrap"
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          )}
          {!isPredicting && suggestedCategories.length === 0 && (
            <div className="mt-2 text-sm text-gray-400 italic pl-1">
              Enter a description to get suggestions
            </div>
          )}
        </div>

        {/* Category Creation Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">New Category</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center text-5xl hover:bg-gray-100 hover:border-gray-400 transition-all"
                    >
                      {newCategoryEmoji}
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 shadow-2xl rounded-2xl">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            setNewCategoryEmoji(emojiData.emoji);
                            setShowEmojiPicker(false);
                          }}
                          width={300}
                          height={400}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                  <input
                    type="text"
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Category Name"
                  />
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex gap-2 rounded-b-2xl">
                <button onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-200">Cancel</button>
                <button onClick={handleSaveCategory} className="flex-1 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30">Create</button>
              </div>
            </div>
          </div>
        )}

        {/* Shares Section */}
        <div className="pt-4">
          <label className="block text-sm font-bold text-gray-800 mb-4 px-1">
            Split Details
          </label>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {
              Object.entries(group.uids).map(([uid, name], i) => (
                <div key={uid} className={`flex items-center p-4 hover:bg-gray-50 transition-colors duration-150 ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
                  {/* Avatar Placeholder */}
                  <div className="flex-none w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-4 shadow-inner">
                    {name.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 font-medium text-gray-700 capitalize">
                    {name}
                  </div>

                  <div className="flex-none w-24">
                    <div className="relative">
                      <input
                        className="w-full text-right bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 transition-colors font-mono text-gray-800"
                        type="number"
                        value={shares[uid]}
                        onChange={e => handleShareChange(uid, e.target.value)}
                      />
                      <span className="absolute right-0 -bottom-4 text-[10px] text-gray-400">parts</span>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 flex justify-center z-50">
        <div className="w-full max-w-2xl flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 px-6 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <i className="ri-check-line text-xl"></i>
            Save Expense
          </button>
        </div>
      </div>
    </div>
  )
}
