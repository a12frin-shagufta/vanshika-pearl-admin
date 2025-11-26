import React from 'react';

const Navbar = ({ setToken }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };
  

  return (
    <nav className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Left: Logo */}
      <div className="text-xl font-semibold text-amber-700">
       <img src="./assets/images/logo1.png" alt="" className='w-20' />
      </div>

      {/* Right: Logout Button */}
      <button onClick={handleLogout}
       
        className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
