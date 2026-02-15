import { useState } from 'react';

interface AddColumnButtonProps {
  onAdd: (name: string) => void;
}

export const AddColumnButton: React.FC<AddColumnButtonProps> = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [columnName, setColumnName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (columnName.trim()) {
      onAdd(columnName.trim());
      setColumnName('');
      setIsAdding(false);
    }
  };

  if (isAdding) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 w-80 flex-shrink-0">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            placeholder="Enter column name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setColumnName('');
                setIsAdding(false);
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!columnName.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Column
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 w-80 flex-shrink-0 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors border-2 border-dashed border-gray-300"
    >
      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add Column
    </button>
  );
};