import React, { useState, useEffect } from 'react';
import { client, getSessionToken, clearSession } from './lib/ub';
import Auth from './pages/Auth';
import BoardList from './pages/BoardList';
import BoardDetail from './pages/BoardDetail';
import Sidebar from './components/Layout/Sidebar';
import TopNav from './components/Layout/TopNav';
import { Search } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = getSessionToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const me = await client.auth.me(token);
      setUser(me);
    } catch (err) {
      console.error('Session invalid', err);
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await client.auth.logout(getSessionToken());
    } finally {
      clearSession();
      setUser(null);
      setCurrentBoardId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-[4px] border-black border-t-transparent animate-spin"></div>
        <p className="font-black tracking-[0.3em] text-xs uppercase">Initializing...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={checkUser} />;
  }

  return (
    <div className="flex h-screen w-full bg-white text-black overflow-hidden font-sans">
      <Sidebar onNavigate={() => {
        setCurrentBoardId(null);
        setSearchQuery('');
      }} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav user={user} onLogout={handleLogout}>
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black" />
            <input 
              type="text" 
              placeholder={currentBoardId ? "FIND AN ISSUE..." : "SEARCH PROJECTS..."}
              className="w-full bg-transparent border-[2px] border-black py-2 pl-9 pr-4 text-xs font-black tracking-widest text-black focus:outline-none focus:bg-black focus:text-white transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </TopNav>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative overscroll-none">
          {currentBoardId ? (
            <BoardDetail boardId={currentBoardId} searchQuery={searchQuery} onBack={() => {
              setCurrentBoardId(null);
              setSearchQuery('');
            }} />
          ) : (
            <div className="p-10">
                <BoardList onSelectBoard={setCurrentBoardId} searchQuery={searchQuery} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
