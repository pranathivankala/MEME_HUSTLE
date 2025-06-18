import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BidComponent from './BidComponent';
import socketService from '../services/socketService';

const MemeCard = ({ meme }) => {
  const memeId = meme._id;
  const [currentBid, setCurrentBid] = useState(meme.current_bid || 0);
  const [voteCount, setVoteCount] = useState(meme.upvotes || 0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribeBids = socketService.subscribeToBids(memeId, (bidData) => {
      if (bidData.memeId === memeId) {
        setCurrentBid(bidData.credits);
        triggerGlitch();
      }
    });

    const unsubscribeVotes = socketService.subscribeToVotes(memeId, (voteData) => {
      if (voteData.memeId === memeId) {
        setVoteCount(voteData.voteCount);
        triggerGlitch();
      }
    });

    const unsubscribeBidErrors = socketService.subscribeToBidErrors((error) => {
      setBidError(error.message);
    });

    const unsubscribeBidAccepted = socketService.subscribeToBidAccepted((data) => {
      if (data.memeId === memeId) {
        setBidError(null);
      }
    });

    return () => {
      unsubscribeBids();
      unsubscribeVotes();
      unsubscribeBidErrors();
      unsubscribeBidAccepted();
    };
  }, [memeId]);

  const handleVote = async (type) => {
    if (isVoting) return;
    setIsVoting(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/memes/${memeId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: type })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to vote');
      }

      const data = await response.json();
      setVoteCount(data.voteCount);
      triggerGlitch();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsVoting(false);
    }
  };

  const triggerGlitch = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 500);
  };

  const handleBidSubmit = async (bidData) => {
    try {
      setBidError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/memes/${memeId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: bidData.userId,
          credits: bidData.credits
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place bid');
      }

      const data = await response.json();
      setCurrentBid(data.amount);
      triggerGlitch();
    } catch (error) {
      setBidError(error.message);
      throw error;
    }
  };

  return (
    <div className={`meme-card ${isGlitching ? 'glitch' : ''}`}>
      <div className="meme-image-container">
        <img src={meme.image_url} alt={meme.title} className="meme-image" />
      </div>

      <div className="meme-content">
        <h3 className="meme-title">{meme.title}</h3>

        <div className="meme-ai-box">
          <p className="meme-caption">{meme.ai_caption || 'AI is thinking...'}</p>
          <p className="meme-vibe">{meme.ai_vibe || 'Analyzing vibes...'}</p>
        </div>

        <div className="vote-section">
          <button onClick={() => handleVote('up')} disabled={isVoting} className="neon-button">⬆️ Upvote</button>
          <span className="vote-count">{voteCount}</span>
          <button onClick={() => handleVote('down')} disabled={isVoting} className="neon-button">⬇️ Downvote</button>
        </div>
        {error && <div className="vote-error">{error}</div>}

        <div className="tag-list">
          {meme.tags.map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>

        <div className="creator">Created by: <span className="creator-name">{meme.owner_id}</span></div>

        <div className="bid-box">
          <p className="bid-amount">Current Bid: {currentBid} credits</p>
          <BidComponent
            memeId={memeId}
            initialBid={currentBid}
            onBidSubmit={handleBidSubmit}
            error={bidError}
          />
        </div>
      </div>
    </div>
  );
};

MemeCard.propTypes = {
  meme: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    image_url: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    ai_caption: PropTypes.string,
    ai_vibe: PropTypes.string,
    current_bid: PropTypes.number,
    owner_id: PropTypes.string.isRequired,
    upvotes: PropTypes.number
  }).isRequired,
};

export default MemeCard;
