import { useState, useEffect } from 'react';
import { useMeme } from '../context/MemeContext';
import CreateMemeForm from '../components/CreateMemeForm';
import MemeGrid from '../components/MemeGrid';
import Leaderboard from '../components/Leaderboard';

const Home = () => {
  const { memes, createMeme, loading, error } = useMeme();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-cyber-black">
      <div style={{ padding: '20px', borderBottom: '2px solid #4a9eff' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#ff69b4', fontSize: '2rem' }}>MemeHustle</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="neon-button"
            >
              Leaderboard
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="neon-button"
            >
              Create Meme
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {loading ? (
          <div className="text-neon-blue text-center">Loading memes...</div>
        ) : (
          <MemeGrid memes={memes} isLeaderboardOpen={showLeaderboard} />
        )}
      </div>

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} isMobile={isMobile} />
      )}


      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CreateMemeForm
              onSubmit={async (formData) => {
                await createMeme(formData);
                setShowCreateForm(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
