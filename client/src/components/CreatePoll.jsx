import React, { useState } from 'react';
import { createPoll } from '../utils/api';
import './CreatePoll.css';

const CreatePoll = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [pollData, setPollData] = useState(null);
  const [error, setError] = useState('');

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const validOptions = options.filter(opt => opt.trim().length > 0);
      if (validOptions.length < 2) {
        setError('Please provide at least 2 valid options');
        setLoading(false);
        return;
      }

      const response = await createPoll({ question, options: validOptions });
      setPollData(response);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(pollData.shareLink);
    alert('Link copied to clipboard!');
  };

  if (pollData) {
    return (
      <div className="create-poll success">
        <div className="success-card">
          <h2>🎉 Poll Created Successfully!</h2>
          <p>Your poll is ready to share:</p>
          <div className="share-link">
            <input 
              type="text" 
              value={pollData.shareLink} 
              readOnly 
            />
            <button onClick={copyShareLink}>Copy Link</button>
          </div>
          <button 
            className="new-poll-btn" 
            onClick={() => {
              setPollData(null);
              setQuestion('');
              setOptions(['', '']);
            }}
          >
            Create Another Poll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-poll">
      <div className="create-poll-card">
        <h1>Create a New Poll</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What do you want to ask?"
              required
            />
          </div>

          <div className="form-group">
            <label>Options</label>
            {options.map((option, index) => (
              <div key={index} className="option-input">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required={index < 2}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="add-option-btn"
              >
                + Add Option
              </button>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;
