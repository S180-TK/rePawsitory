import React, { useEffect, useState } from 'react';
import { getFileUrl } from '../config';

const ResolvedPetPhoto = ({ src, name, imageClassName, placeholderClassName }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [retried, setRetried] = useState(false);

  useEffect(() => {
    if (!imageFailed || retried) return;
    // One retry can recover from a transient stream/connection failure.
    const timer = setTimeout(() => {
      setRetried(true);
      setImageFailed(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [imageFailed, retried]);

  if (src && !imageFailed) {
    return <img src={src} alt={name} className={imageClassName} onError={() => setImageFailed(true)} />;
  }
  return (
    <div className={`${placeholderClassName || ''} flex h-full w-full items-center justify-center bg-gray-50 text-center font-semibold text-gray-500`}>
      Image Preview
    </div>
  );
};

const PetPhoto = ({ photoUrl, ...props }) => {
  const src = getFileUrl(photoUrl);
  return <ResolvedPetPhoto key={src} src={src} {...props} />;
};

export default PetPhoto;
