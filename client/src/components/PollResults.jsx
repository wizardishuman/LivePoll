import React, { useState } from 'react';
import './PollResults.css';

const PollResults = ({ poll, hasVoted, onVote }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [voting, setVoting] = useState(false);

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  const handleVote = async () => {
    if (selectedOption === null) return;
    
    setVoting(true);
    try {
      await onVote(selectedOption);
    } finally {
      setVoting(false);
    }
  };

  const getPercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="poll-results">
      <h2>{poll.question}</h2>
      
      <div className="poll-stats">
        <span className="total-votes">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
      </div>

      <div className="options-container">
        {poll.options.map((option, index) => {
          const percentage = getPercentage(option.votes);
          const isSelected = selectedOption === index;
          
          return (
            <div 
              key={index} 
              className={`option-item ${isSelected ? 'selected' : ''} ${hasVoted ? 'voted' : ''}`}
              onClick={() => !hasVoted && setSelectedOption(index)}
            >
              <div className="option-content">
                <div className="option-text">{option.text}</div>
                <div className="option-stats">
                  <span className="vote-count">{option.votes}</span>
                  <span className="vote-percentage">{percentage}%</span>
                </div>
              </div>
              <div 
                className="progress-bar" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          );
        })}
      </div>

      {!hasVoted && (
        <button 
          className="vote-btn"
          onClick={handleVote}
          disabled={selectedOption === null || voting}
        >
          {voting ? 'Voting...' : 'Vote'}
        </button>
      )}

      {hasVoted && (
        <div className="voted-indicator">
          ✓ You have voted
        </div>
      )}
    </div>
  );
};

export default PollResults;
