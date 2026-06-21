import { RouterProvider } from "react-router-dom";
import { router } from "./routers/router";
import { useEffect, useState } from "react";
import UserContext from "./contexts/UserContext";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (err) {
        console.log("Invalid localStorage user");
        localStorage.removeItem("user");
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  );
}

export default App;