import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'warning' | 'success';
  customContent?: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  customContent,
  className = ''
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleBackdropClick}
      tabIndex={-1}
      aria-labelledby="modalTitle"
      aria-hidden="true"
    >
      <div className={`modal-dialog modal-dialog-centered ${className}`}>
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold" id="modalTitle">
              <i className={`bi bi-exclamation-triangle text-${confirmVariant} me-2`}></i>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body pt-0">
            {customContent ? (
              customContent
            ) : (
              <p className="text-muted mb-0 modal-message">{message}</p>
            )}
          </div>
          {!customContent && (
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
              >
                <i className="bi bi-x-circle me-1"></i>
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn btn-${confirmVariant}`}
                onClick={handleConfirm}
              >
                <i className="bi bi-check-circle me-1"></i>
                {confirmText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal; 