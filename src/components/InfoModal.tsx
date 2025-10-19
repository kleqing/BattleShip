import React from "react";
import "./GameModal.css"; 
import './InfoModal.css';

interface InfoModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, title = "Attention", message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <button className="modal-button" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default InfoModal;
