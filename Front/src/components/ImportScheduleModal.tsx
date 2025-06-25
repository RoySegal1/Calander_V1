// components/ImportScheduleModal.tsx
import React, { useState } from "react";
import toast from 'react-hot-toast';

interface ImportScheduleModalProps {
  onImport: (code: string) => void;
  onClose: () => void;
}

export const ImportScheduleModal: React.FC<ImportScheduleModalProps> = ({ onImport, onClose }) => {
  const [code, setCode] = useState("");

  const handleSubmit = () => {
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("הוזן מזהה לא חוקי");
      return;
    }
    onImport(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">הכנס מזהה מערכת</h2>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="מזהה..."
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            ביטול
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            אישור
          </button>
        </div>
      </div>
    </div>
  );
};
