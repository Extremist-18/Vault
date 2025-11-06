export default function ExpenseCard({expense}){
    return (
        <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-2xl shadow-lg hover:scale-[1.05] transtition-transform">
            <h3 className="text-lg font-semibold text-cyan-400">{expense.description}</h3>
            <p className="text-gray-300 mt-2">{expense.amount}</p>
            <p className="text-sm text-gray-500 mt-1">{expense.category}</p>
            <p className="text-xs text-gray-600 mt-2">
                {new Date(expense.date).toLocaleDateString()}
            </p>
        </div>
    );
}