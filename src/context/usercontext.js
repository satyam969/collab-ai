// import { useContext, useState } from "react";

// const [user,setUser]=useState();

// const AuthContext = React.createContext();

// export const AuthProvider = ({ children }) => {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);

//     const login = (username, password) => {
//         // Simulate authentication logic
//         if (username === "admin" && password === "password") {
//             setIsAuthenticated(true);
//             setUser({ username });
//         }
//     };
    
//     const logout = () => {
//         setIsAuthenticated(false);
//         setUser(null);
//     };

//     return (
//         <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     return useContext(AuthContext);
// };