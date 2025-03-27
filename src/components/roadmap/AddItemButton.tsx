
import React from 'react';

interface AddItemButtonProps {
  onClick: () => void;
}

const AddItemButton: React.FC<AddItemButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 bg-emerald hover:bg-emerald-600 text-white rounded-full p-2 shadow-lg"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    </button>
  );
};

export default AddItemButton;
