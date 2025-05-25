import React from 'react';
import './FavoriteButton.css';

const FavoriteButton = ({ isFavorite, onClick }) => {
  return (
    <button
      className={`favorite-button ${isFavorite ? 'active' : ''}`}
      onClick={onClick}
      aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      ★
    </button>
  );
};

export default FavoriteButton; 