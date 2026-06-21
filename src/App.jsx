import { RouterProvider } from "react-router-dom";
import { router } from "./routers/router";
import { useState } from "react";
import UserContext from "./contexts/UserContext";

function getUserFromStorage() {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (err) {
    localStorage.removeItem("user");
    return null;
  }
}

function App() {
  const [user, setUser] = useState(getUserFromStorage());

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  );
}

export default App;