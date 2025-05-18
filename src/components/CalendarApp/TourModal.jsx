import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

function TourModal({
  step,
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  onAction,
}) {
  const [positionStyles, setPositionStyles] = useState({});

  useEffect(() => {
    if (step.target) {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const modalWidth = 300;
        const modalHeight = 200;
        const padding = 10;

        let styles = {};
        switch (step.position) {
          case "bottom":
            styles = {
              top: `${rect.bottom + padding}px`,
              left: `${rect.left + rect.width / 2 - modalWidth / 2}px`,
            };
            break;
          case "right":
            styles = {
              top: `${rect.top + rect.height / 2 - modalHeight / 2}px`,
              left: `${rect.right + padding}px`,
            };
            break;
          case "center":
            styles = {
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            };
            break;
          default:
            styles = {
              top: `${rect.top - modalHeight - padding}px`,
              left: `${rect.left + rect.width / 2 - modalWidth / 2}px`,
            };
        }
        setPositionStyles(styles);
      } else {
        setPositionStyles({
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        });
      }
    } else {
      setPositionStyles({
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
    }
  }, [step]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center">
      <div
        className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full transform transition-all duration-300 ease-out scale-95 animate-fadeIn"
        style={positionStyles}
      >
        <h3 className="text-lg font-bold text-gray-800 font-codec mb-2">
          {step.title}
        </h3>
        <p className="text-gray-600 font-codec mb-4">{step.message}</p>
        {step.action && (
          <div className="mb-4">
            <button
              onClick={onAction}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 font-codec"
            >
              {step.action.description}
            </button>
          </div>
        )}
        <div className="flex justify-between items-center">
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 font-codec"
          >
            Saltar guía
          </button>
          <button
            onClick={onNext}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 font-codec"
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
      type: PropTypes.oneOf(["doubleClick", "scroll", "fillForm"]),
      target: PropTypes.string,
      scrollTo: PropTypes.string,
      highlight: PropTypes.bool,
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
