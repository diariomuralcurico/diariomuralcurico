// src/components/CalendarApp/TourModal.jsx
import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import "./TourModal.css";

const TourModal = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  onAction,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const modalRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleDragStart = (e) => {
    e.preventDefault();
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    dragStart.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    let newX = clientX - dragStart.current.x;
    let newY = clientY - dragStart.current.y;

    // Optional: Keep modal within viewport bounds
    const modalRect = modalRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - modalRect.width;
    const maxY = window.innerHeight - modalRect.height;
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="tour-modal"
      ref={modalRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      role="dialog"
      aria-labelledby="tour-modal-title"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <div
        className="tour-modal-header"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        aria-grabbed={isDragging}
      >
        <h2 id="tour-modal-title" className="tour-modal-title">
          {step.title}
        </h2>
      </div>
      <p className="tour-modal-message">{step.message}</p>
      {step.action && step.action.description && (
        <p className="tour-modal-message">{step.action.description}</p>
      )}
      <div className="tour-modal-buttons">
        {currentStep < totalSteps - 1 && (
          <button
            className="tour-modal-button next"
            onClick={onNext}
            aria-label="Next step"
          >
            Siguiente
          </button>
        )}
        {currentStep === totalSteps - 1 && (
          <button
            className="tour-modal-button next"
            onClick={onNext}
            aria-label="Finish tour"
          >
            Finalizar
          </button>
        )}
        <button
          className="tour-modal-button skip"
          onClick={onSkip}
          aria-label="Skip tour"
        >
          Omitir
        </button>
      </div>
    </div>
  );
};

TourModal.propTypes = {
  step: PropTypes.shape({
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    target: PropTypes.string,
    action: PropTypes.shape({
      type: PropTypes.string,
      target: PropTypes.string,
      description: PropTypes.string,
      formData: PropTypes.object,
    }),
  }).isRequired,
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  onNext: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
};

export default TourModal;
