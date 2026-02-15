import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPoll, vote } from '../utils/api';
import { useSocket } from '../hooks/useSocket';
import PollResults from '../components/PollResults';
import Loading from '../components/Loading';
import NotFound from '../components/NotFound';
import './PollPage.css';

const PollPage = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  
  const socket = useSocket();

  useEffect(() => {
    fetchPoll();
  }, [pollId]);

  useEffect(() => {
    if (socket && pollId) {
      socket.emit('joinPoll', pollId);
      
      socket.on('voteUpdate', (data) => {
        if (data.pollId === pollId) {
          setPoll(prev => ({
            ...prev,
            options: data.options
          }));
        }
      });

      return () => {
        socket.emit('leavePoll', pollId);
        socket.off('voteUpdate');
      };
    }
  }, [socket, pollId]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const data = await getPoll(pollId);
      setPoll(data);
      
      const votedKey = `voted_${pollId}`;
      const hasVotedBefore = localStorage.getItem(votedKey);
      if (hasVotedBefore) {
        setHasVoted(true);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('not_found');
      } else {
        setError('Failed to load poll');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionIndex) => {
    if (hasVoted || voting) return;

    setVoting(true);
    try {
      await vote(pollId, optionIndex);
      setHasVoted(true);
      localStorage.setItem(`voted_${pollId}`, 'true');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error === 'not_found') {
    return <NotFound />;
  }

  if (error) {
    return (
      <div className="poll-page error">
        <div className="error-card">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  if (!poll) {
    return <NotFound />;
  }

  return (
    <div className="poll-page">
      <div className="poll-card">
        <PollResults 
          poll={poll} 
          hasVoted={hasVoted}
          onVote={handleVote}
        />
        
        <div className="share-section">
          <p>Share this poll:</p>
          <button 
            className="copy-link-btn"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }}
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollPage;
