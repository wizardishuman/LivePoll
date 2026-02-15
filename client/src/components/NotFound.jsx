import React from 'react';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-card">
        <h1>404</h1>
        <h2>Poll Not Found</h2>
        <p>The poll you're looking for doesn't exist or has been removed.</p>
        <a href="/" className="home-btn">Create New Poll</a>
      </div>
    </div>
  );
};

export default NotFound;
