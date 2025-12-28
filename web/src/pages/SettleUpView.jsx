import { useLoaderData, useNavigate } from "react-router-dom";
import { useLayoutEffect } from "react";

export async function settleUpLoader({ params }) {
    const balanceRes = await fetch(`http://127.0.0.1:8000/api/groups/${params.guid}/balance/`);
    const balanceData = await balanceRes.json();
    return { balance: balanceData.data };
}

function calculateDebts(balanceData) {
    let debtors = [];
    let creditors = [];

    Object.entries(balanceData).forEach(([uid, data]) => {
        const bal = data.balance;
        if (bal > 0.01) {
            debtors.push({ uid, name: data.uname, amount: bal });
        } else if (bal < -0.01) {
            creditors.push({ uid, name: data.uname, amount: -bal });
        }
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const debts = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];
        let amount = Math.min(debtor.amount, creditor.amount);

        if (amount < 0.01) {
            if (debtor.amount < 0.01) i++;
            if (creditor.amount < 0.01) j++;
            continue;
        }

        debts.push({ from: debtor.name, to: creditor.name, amount: amount });
        debtor.amount -= amount;
        creditor.amount -= amount;

        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return debts;
}

export default function SettleUpView() {
    const { balance } = useLoaderData();
    const navigate = useNavigate();

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const debts = calculateDebts(balance);

    return (
        <div className="pb-24 space-y-8 animate-in fade-in duration-500">
            {/* Reimbursement Plan */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-50">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <i className="ri-exchange-funds-line text-blue-500"></i>
                        How to Settle Up
                    </h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {debts.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 italic">
                            All settled up! No debts found.
                        </div>
                    ) : (
                        debts.map((debt, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-gray-700">{debt.from}</div>
                                    <div className="text-gray-400 text-xs">pays</div>
                                    <div className="font-bold text-gray-700">{debt.to}</div>
                                </div>
                                <div className="font-mono font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                                    {debt.amount.toFixed(2)}€
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}
