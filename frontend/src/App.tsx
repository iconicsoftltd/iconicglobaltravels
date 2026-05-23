import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import "../src/assets/fonts/style.css";
import "./App.css";
import routers from "./components/routers/router";
import { loadUserFromToken } from "./utils/helper/loadUserFromToken";
import HomeLoader from "./components/loader/HomeLoader";
function App() {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    // Load user data from token
    loadUserFromToken(dispatch);
  }, [dispatch]); // Get the entire user object

  if (loading) {
    return <HomeLoader />;
  }

  return (
    <div>
      <RouterProvider router={routers} />
    </div>
  );
}

export default App;
