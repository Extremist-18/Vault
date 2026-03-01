import {Link, useLocation, useNavigate} from "react-router-dom"

export default function Navbar(){
    const navigate = useNavigate();
    const location = useLocation();

    const isActive =(path) => location.pathname ===path
    ? "text-cyan-400 font-semibold" 
    : "text-gray-300 hover:text-cyan-400 transition";

    const handleLogout = ()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        // if(setExpense)  setExpense([]);
        navigate("/login");
    };

    return (
        <nav className="backdrop-blur-md bg-gray-800/30 border-b border-gray-700/40 shadow-lg sticky top-0 z-50 w-9/12">
            <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-4 space-y-3">
                <h1 className="text-3xl font-extrabold text-cyan-400 tracking-wide drop-shadow-[0_0_6px_rgba(6,182,212,0.6)] hover:scale-105 transition-transform duration-300"
                onClick={()=>navigate("/")}>
                    Vault
                </h1>
                <div className="flex flex-wrap justify-center gap-8 text-lg font-medium items-center">
                    <Link to="/" className={isActive("/")}> Dashboard</Link>
                    <Link to="/add" className ={isActive("/add")}> Add Expense</Link>
                    <Link to="/analytics" className={isActive("/analytics")}>Analytics</Link>
                    {/* <Link to="/settings" className={isActive("/settings")}>Settings</Link> */}
                    <button
                        onClick={handleLogout}
                        className="bg-red-400 hover:bg-red-600 text-white px-3 py-1 rounded-md">
                        Logout
                    </button>
                </div>   
            </div>
        </nav>
        
    );
}