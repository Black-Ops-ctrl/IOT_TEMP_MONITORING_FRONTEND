import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {children}
    </div>
  );
};

export default AuthLayout;