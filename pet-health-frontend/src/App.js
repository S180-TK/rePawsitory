import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import PetHealthApp from "./pages/PetHealthApp";

function App() {
  return <AuthProvider><PetHealthApp /></AuthProvider>;
}

export default App;
