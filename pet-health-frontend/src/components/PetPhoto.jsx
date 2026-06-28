import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

const getPetIcon = (species) => {
  const normalizedSpecies = species?.toLowerCase();
  if (normalizedSpecies === 'dog') return '🐕';
  if (normalizedSpecies === 'cat') return '🐱';
  return '🐾';
};

const getFileUrl = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
};

const PetPhoto = ({ photoUrl, name, species, imageClassName, placeholderClassName }) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  if (photoUrl && !imageFailed) {
    return (
      <img
        src={getFileUrl(photoUrl)}
        alt={name}
        className={imageClassName}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span className={placeholderClassName}>
      {getPetIcon(species)}
    </span>
  );
};

export default PetPhoto;
