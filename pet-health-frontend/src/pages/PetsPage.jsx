import React from 'react';
import { PlusCircle, Search } from 'lucide-react';

const PetsPage = ({ pets, petsLoading, petsError, addPet }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">My Pets</h1>
        <button onClick={() => addPet()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <PlusCircle size={20} />
          Add New Pet
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search pets by name or breed..."
          className="flex-1 outline-none text-gray-700"
        />
      </div>

      {petsLoading ? (
        <div className="text-center p-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your pets...</p>
        </div>
      ) : petsError ? (
        <div className="text-center p-12 bg-red-50 rounded-lg">
          <p className="text-red-600 mb-2">Failed to load pets</p>
          <p className="text-gray-600 text-sm">Please try refreshing the page</p>
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">No pets found</p>
          <p className="text-gray-500 text-sm">Add your first pet to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map(pet => (
          <div key={pet.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-32 flex items-center justify-center text-6xl">
              {pet.photo}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{pet.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-semibold">Species:</span> {pet.species}</p>
                <p><span className="font-semibold">Breed:</span> {pet.breed}</p>
                <p><span className="font-semibold">Age:</span> {pet.age} years</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold">
                  View Details
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default PetsPage;
