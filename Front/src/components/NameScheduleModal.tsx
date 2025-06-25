// components/NameScheduleModal.tsx
import React, { useState } from "react";
import toast from 'react-hot-toast';

interface NameScheduleModalProps {
  onSave: (name: string) => void;
  onClose: () => void;
}

export const NameScheduleModal: React.FC<NameScheduleModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
       toast.error("יש להזין שם חוקי למערכת");
      return;
    }
    onSave(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">הזן שם למערכת</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="שם המערכת..."
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
            שמור
          </button>
        </div>
      </div>
    </div>
  );
};
