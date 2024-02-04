import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProfileBuilder from "./ProfileBuilder";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfileBuilder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
