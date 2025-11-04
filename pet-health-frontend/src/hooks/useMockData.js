export const useMockData = () => {
  

  const recentRecords = [
    { id: 1, petName: 'Max', type: 'Vaccination', title: 'Rabies Vaccine', date: '2025-09-15' },
    { id: 2, petName: 'Luna', type: 'Checkup', title: 'Annual Checkup', date: '2025-09-20' },
    { id: 3, petName: 'Charlie', type: 'Medication', title: 'Flea Treatment', date: '2025-09-25' }
  ];

  return {
    recentRecords
  };
};
