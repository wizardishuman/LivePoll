import React from 'react';
import CreatePoll from '../components/CreatePoll';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="header">
        <h1>LivePoll</h1>
        <p>Create real-time polls and get instant feedback</p>
      </div>
      <CreatePoll />
    </div>
  );
};

export default HomePage;
