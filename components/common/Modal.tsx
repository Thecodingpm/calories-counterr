import React, { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="bg-base-100 rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all duration-300 animate-scaleIn" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-base-300 pb-3 mb-4">
                    <h3 id="modal-title" className="text-xl font-bold text-base-content">{title}</h3>
                    <button onClick={onClose} className="text-neutral/50 hover:text-neutral rounded-full p-1 transition-colors" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;