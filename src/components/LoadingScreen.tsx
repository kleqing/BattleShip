import React from "react";
import "./LoadingScreen.css";

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <h2 className="loading-text">Preparing your fleet...</h2>
      <h3 className="loading-subtext">Please wait while we set things up.</h3>
      <h4 className="loading-subsubtext">This won't take long!</h4>

      <h6 className="loading-tips">If you see the progress taking too long, please refresh the page.<br/>Otherwise, make sure the back-end is running in localhost!</h6>
    </div>
  );
};

export default LoadingScreen;
