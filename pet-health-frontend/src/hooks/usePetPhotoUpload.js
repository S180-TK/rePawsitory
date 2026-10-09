import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL, getFileUrl } from '../config';

export const usePetPhotoUpload = (isOpen, initialUrl = '', petId = '') => {
  const { token, sessionId } = useAuth();
  const [photoUrl, setPhotoUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const pending = useRef(null);
  const cancel = useCallback(() => {
    pending.current?.abort();
    pending.current = null;
  }, []);
  const reset = useCallback((url = '') => {
    cancel();
    setUploading(false);
    setUploadError('');
    setPhotoUrl(url);
  }, [cancel]);

  useEffect(() => {
    reset(isOpen ? initialUrl : '');
    return cancel;
  }, [isOpen, initialUrl, petId, token, sessionId, reset, cancel]);

  const handleImageChange = async event => {
    const file = event.target.files[0];
    event.target.value = ''; // Allow selecting the same file after a failure.
    if (!file) return;
    cancel();
    setUploading(false);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setUploading(true);
    setUploadError('');
    try {
      const body = new FormData();
      body.append('image', file);
      const response = await fetch(`${API_BASE_URL}/api/upload/pet-image`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
        body, signal: controller.signal
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      if (!getFileUrl(data.imageUrl)) throw new Error('Upload returned no usable URL');
      if (pending.current === controller && !controller.signal.aborted) setPhotoUrl(data.imageUrl);
    } catch (error) {
      if (pending.current === controller && !controller.signal.aborted) {
        setUploadError('Failed to upload image. Please try again or remove the photo.');
      }
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setUploading(false);
      }
    }
  };

  // Previews use the persisted server URL; no temporary object URLs to leak.
  return {
    photoUrl, imagePreview: getFileUrl(photoUrl), uploading, uploadError,
    handleImageChange, handleRemoveImage: () => reset(), reset,
    canSubmit: () => !pending.current && !uploadError
  };
};
