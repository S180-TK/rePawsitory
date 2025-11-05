import { useEffect, useState } from 'react';

export const usePets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPets = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/pets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setPets(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPets();

    return () => {
      isMounted = false;
    };
  }, []);

  const addPet = async (petData = { name: 'New Pet', species: 'Dog', breed: 'Unknown', age: 0, photo: '🐾' }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/pets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(petData)
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const created = await response.json();
      setPets(prev => Array.isArray(prev) ? [...prev, created] : [created]);
      return created;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return { pets, loading, error, addPet };
};



