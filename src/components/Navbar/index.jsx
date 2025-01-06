import React, { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io'; // Importing the arrow icon
import logo2 from "@assets/epharmacynavbar.png";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-primary-default text-white py-4 px-8">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold">
          <img src={logo2} alt="Logo" className="h-16" />
        </div>

        {/* Navbar links */}
        <div className="flex space-x-8">
          <a href="/" className="hover:text-gray-300">Home</a>
          <a href="/pharmacies" className="hover:text-gray-300">Pharmacies</a>
          
          {/* Medicines Dropdown */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 hover:text-gray-300"
              onClick={toggleDropdown}
            >
              <span>Medicines</span>
              <IoIosArrowDown />
            </button>
            {isDropdownOpen && (
              <div className="absolute bg-white text-black py-2 mt-1 w-40 rounded-lg shadow-lg top-full left-0">
                <a href="/medicines/category1" className="block px-4 py-2">Category 1</a>
                <a href="/medicines/category2" className="block px-4 py-2">Category 2</a>
                <a href="/medicines/category3" className="block px-4 py-2">Category 3</a>
              </div>
            )}
          </div>

          <a href="/maps" className="hover:text-gray-300">Maps</a>
        </div>

        {/* Get Started Button */}
        <div>
          <a href="/get-started" className="bg-primary-t2 text-black py-2 px-6 rounded-lg hover:bg-yellow-400">
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
