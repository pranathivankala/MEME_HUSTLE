import React from 'react';
import PropTypes from 'prop-types';
import MemeCard from './MemeCard';

const MemeGrid = ({ memes, onUpvote, onDownvote, onBid, isLeaderboardOpen }) => {
  return (
    <div className="meme-grid">
      {memes.map((meme) => (
        <div key={meme.id} className="relative z-10">
          <MemeCard
            meme={meme}
            onUpvote={onUpvote}
            onDownvote={onDownvote}
            onBid={onBid}
          />
        </div>
      ))}

      {memes.length === 0 && !isLeaderboardOpen && (
        <div className="no-memes-box text-center py-8">
          <p className="text-neon-pink text-xl mb-2">
            No memes in the grid
          </p>
          <p className="text-neon-blue text-lg">
            Be the first to upload a cyberpunk meme!
          </p>
        </div>
      )}
    </div>
  );
};

MemeGrid.propTypes = {
  memes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      image_url: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string).isRequired,
      upvotes: PropTypes.number.isRequired,
      ai_caption: PropTypes.string,
      ai_vibe: PropTypes.string,
      current_bid: PropTypes.number.isRequired,
      owner_id: PropTypes.string.isRequired,
    })
  ).isRequired,
  onUpvote: PropTypes.func.isRequired,
  onDownvote: PropTypes.func.isRequired,
  onBid: PropTypes.func.isRequired,
  isLeaderboardOpen: PropTypes.bool.isRequired,
};

export default MemeGrid;
