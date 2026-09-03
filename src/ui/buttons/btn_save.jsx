// src/ui/buttons/btn_save.jsx
import React from "react";
import saveIcon from "../../assets/icons/btn_save.png";

const BtnSave = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md border-2 border-greenColor bg-white text-secondary font-inter text-sm flex items-center gap-2 ${className}`}
    >
      <img 
        src={saveIcon} 
        alt="Save" 
        className="w-4 h-4 object-contain"
      />
      Save
    </button>
  );
};

export default BtnSave;