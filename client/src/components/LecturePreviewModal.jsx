import React, { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

function LecturePreviewModal({ previewLecture, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!previewLecture) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 dark:bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-200 rounded-2xl shadow-2xl max-w-2xl w-full relative overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        <div className="flex justify-between items-center bg-emerald-700 p-4">
          <h3 className="text-lg font-bold text-white text-center w-full">{previewLecture.lectureTitle}</h3>
          <button
            className="text-white hover:text-emerald-200 transition-colors text-2xl absolute top-3 right-4"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>
        <div className="p-6">
          {previewLecture.videoUrl ? (
            <video
              src={previewLecture.videoUrl}
              controls
              className="w-full rounded-lg bg-black"
            />
          ) : (
            <p className="text-gray-600 dark:text-neutral-400 text-center py-8">No video available for this lecture.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LecturePreviewModal;