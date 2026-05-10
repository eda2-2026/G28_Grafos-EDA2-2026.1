import React from 'react';

interface PopUpProps {
  isOpen: boolean;
  title?: string; 
  description?: string; 
}

const PopUp: React.FC<PopUpProps> = ({ isOpen, title, description}) => {
  return (
    <div
      className={`
        fixed top-6 left-1/2 transform -translate-x-1/2
        transition-all duration-300 ease-in-out z-50
        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'}
      `}
    >
      <div className="bg-white w-[500px] max-w-full flex rounded-2xl shadow-2xl overflow-hidden p-6">
        <img
          src="/logo/popup_background.png"
          alt="Jacaré Popup"
          className="w-24 h-24 mr-4 object-contain"
        />
        <div className="flex flex-col justify-center">
          <h2 className="text-xl font-bold text-indigo-900 mb-2">{title}</h2>
          <p className="text-gray-700">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default PopUp;
