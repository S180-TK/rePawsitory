import React from 'react';

const LandingPage = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="text-center px-6 max-w-4xl">
        {/* Logo and Title */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Use existing logo */}
          <img 
            src="/logo.png" 
            alt="rePawsitory Logo" 
            className="w-20 h-20"
          />
          
          {/* Title with blue gradient */}
          <h1 className="text-7xl font-black bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent tracking-tight">
            rePawsitory
          </h1>
        </div>
        
        {/* Tagline */}
        <p className="text-2xl text-gray-700 font-medium mb-12 leading-relaxed">
          All your pet's health records, in one place.
        </p>
        
        {/* Login Button */}
        <button
          onClick={onLogin}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-12 py-4 text-lg font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Get Started
        </button>
        
        {/* Feature highlights with descriptions */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-600">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-800 mb-2">Digital Records</p>
            <p className="text-sm text-gray-500 px-4">Store vaccination history, lab results, and vet notes all in one secure place</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-800 mb-2">Easy Sharing</p>
            <p className="text-sm text-gray-500 px-4">Grant veterinarians instant access to your pet's complete medical history</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-800 mb-2">Secure Access</p>
            <p className="text-sm text-gray-500 px-4">Your pet's information is protected with enterprise-grade encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
