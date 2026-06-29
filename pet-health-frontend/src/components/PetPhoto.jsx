import React, { useEffect, useState } from 'react';
import { getFileUrl } from '../config';

const PetPhoto = ({ photoUrl, name, imageClassName, placeholderClassName }) => {
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
    <div className={`${placeholderClassName} flex h-full w-full items-center justify-center bg-gray-50 text-center font-semibold text-gray-500`}>
      Image Preview
    </div>
  );
};

export default PetPhoto;
