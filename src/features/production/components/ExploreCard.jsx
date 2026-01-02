import React from 'react';

/**
 * ExploreCard Component
 * @param {string} title - The title of the card
 * @param {function} onOpen - Callback for when the open button is clicked
 */
const ExploreCard = ({ title, onOpen }) => {
    return (
        <div className="explore-card">
            <div className="card-header">
                <div className="card-header-overlay" />
            </div>
            <div className="card-body">
                <h3 className="card-title">{title}</h3>
                <button className="card-button" onClick={onOpen}>
                    Open
                </button>
            </div>
        </div>
    );
};

export default ExploreCard;
