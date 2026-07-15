import { RouterProvider } from "react-router-dom";
import { router } from "./routers/router";
import { useState } from "react";
import UserContext from "./contexts/UserContext";
import { getUser } from "./infrastructure/storage/authStorage";

function App() {
  const [user, setUser] = useState(() => getUser());

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  );
}

export default App;
