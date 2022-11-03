import './App.css';

function App() {
  console.log(process.env.REACT_APP_API_URL);
  return (
    <div className="App">
      <header className="App-header">
        <p>Footlight-admin app</p>
      </header>
    </div>
  );
}

export default App;
