import React from 'react';

const PageContainer = ({ children, className = '' }) => {
  return (
    <main
      style={{
        flex: 1,
        width: '100%',
        paddingTop: '2rem',
        paddingBottom: '4rem',
      }}
      className={className}
    >
      <div className="container">
        {children}
      </div>
    </main>
  );
};

export default PageContainer;
