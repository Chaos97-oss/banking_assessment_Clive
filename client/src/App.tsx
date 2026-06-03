import { AccountList } from "./components/AccountList";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Clive Banking Dashboard</h1>
      </header>
      <main className="main">
        <AccountList />
      </main>
    </div>
  );
}

export default App;
