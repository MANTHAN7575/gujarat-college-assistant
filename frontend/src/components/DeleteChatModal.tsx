import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteChatModalProps {
  isOpen: boolean;
  queryText: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteChatModal: React.FC<DeleteChatModalProps> = ({
  isOpen,
  queryText,
  onClose,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-2xl backdrop-blur-2xl rounded-3xl p-6 max-w-md w-full text-slate-900 dark:text-white"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center justify-center text-xl shrink-0 font-bold">
                🗑️
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  Delete Conversation?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  This item will be removed from your chat history.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 my-4">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 italic line-clamp-2">
                "{queryText}"
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 mt-5 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 transition-all"
              >
                Delete Log
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteChatModal;
