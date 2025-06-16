import React from "react";
import PropTypes from "prop-types";
import "./TourModal.css";

function TourModal({
  step,
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  onAction,
}) {
  return (
    <div className="tour-modal-overlay">
      <div className="tour-modal">
        <h3 className="tour-modal-title font-codec">{step.title}</h3>
        <p className="tour-modal-message font-codec">{step.message}</p>
        {step.action && (
          <div className="mb-4">
            <button
              onClick={onAction}
              className="tour-modal-button action modern-button font-codec"
            >
              {step.action.description}
            </button>
          </div>
        )}
        <div className="tour-modal-buttons">
          <button
            onClick={onSkip}
            className="tour-modal-button skip font-codec"
          >
            Saltar guía
          </button>
          <button
            onClick={onNext}
            className="tour-modal-button next modern-button font-codec"
          >
            {currentStep === totalSteps - 1 ? "Entendido" : "Siguiente"}
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 font-codec">
          {currentStep + 1} de {totalSteps}
        </div>
      </div>
    </div>
  );
}

TourModal.propTypes = {
  step: PropTypes.shape({
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    target: PropTypes.string,
    position: PropTypes.oneOf(["top", "bottom", "left", "right", "center"]),
    action: PropTypes.shape({
      type: PropTypes.oneOf(["click", "fillForm"]),
      target: PropTypes.string,
      formData: PropTypes.object,
      description: PropTypes.string,
    }),
  }).isRequired,
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  onNext: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
};

export default TourModal;
