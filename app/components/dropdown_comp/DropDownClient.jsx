// app/components/NavDropdown.jsx - FIXED VERSION
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DropDownClient({ dispatchData }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle dropdown (NOT hover-based)
  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="nav-dropdown" ref={dropdownRef}>
      <button 
        className="nav-dropdown-button"
        onClick={toggleDropdown}
        type="button"
        aria-expanded={isOpen}
      >
        FDRA Areas
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          {dispatchData.length === 0 ? (
            <div className="no-data">No data available</div>
          ) : (
            dispatchData.map((dispatch) => (
              <div key={`dispatch-${dispatch.id}`} className="dispatch-group">
                {/* Dispatch header - NOT clickable */}
                <div className="dispatch-header">
                  {dispatch.name}
                </div>
                
                {/* FDRA links - CLICKABLE */}
                <div className="fdra-links">
                  {dispatch.fdrAs.length === 0 ? (
                    <div className="no-fdra">No FDRAs in this area</div>
                  ) : (
                    dispatch.fdrAs.map((fdra) => (
                      <Link
                        key={`fdra-${fdra.id}`}
                        href={`/data/fdra/${fdra.id}`} // Changed path to /data/fdra/[id]
                        className="fdra-link"
                        onClick={() => setIsOpen(false)} // Close on click
                      >
                        {fdra.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}