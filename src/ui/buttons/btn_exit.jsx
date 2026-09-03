// src/ui/buttons/btn_exit.jsx
import React from "react";
import exitIcon from "../../assets/icons/btn_exit.png";

const BtnExit = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md border-2 border-red-400 bg-white text-secondary font-inter text-sm flex items-center gap-2 ${className}`}
    >
      <img 
        src={exitIcon} 
        alt="Exit" 
        className="w-4 h-4 object-contain"
      />
      Exit
    </button>
  );
};

export default BtnExit;