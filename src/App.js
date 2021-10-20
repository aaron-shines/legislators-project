import { Route } from "react-router-dom";

// Components
import Header from "./components/Header/Header";
import LegislatorsPage from "./pages/LegislatorsPage/LegislatorsPage";

// Scss
import "./App.scss";

function App() {
  return (
    <div className="App">
      <Route path="/" component={(props) => <Header {...props} />} />
      <Route path="/" component={(props) => <LegislatorsPage {...props} />} />
    </div>
  );
}

export default App;
