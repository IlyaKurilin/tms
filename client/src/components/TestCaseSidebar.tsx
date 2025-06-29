import React from 'react';

interface TestCase {
  id: number;
  title: string;
  description?: string;
  preconditions?: string;
  steps?: string;
  expectedResult?: string;
  priority: string;
  status: string;
  createdAt?: string;
}

interface TestCaseSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  testCase: TestCase | null;
  onEdit: () => void;
}

const TestCaseSidebar: React.FC<TestCaseSidebarProps> = ({ isOpen, onClose, testCase, onEdit }) => {
  if (!isOpen || !testCase) return null;

  return (
    <div className="fixed inset-0 flex z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose}></div>
      {/* Sidebar */}
      <div className="ml-auto w-full max-w-md bg-white h-full shadow-xl p-6 overflow-y-auto relative z-10">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">{testCase.title}</h2>
        <div className="mb-2 text-sm text-gray-500">
          Приоритет: <span className="font-semibold">{testCase.priority}</span>
        </div>
        <div className="mb-2 text-sm text-gray-500">
          Статус: <span className="font-semibold">{testCase.status}</span>
        </div>
        {testCase.createdAt && (
          <div className="mb-4 text-sm text-gray-400">
            Создан: {new Date(testCase.createdAt).toLocaleString()}
          </div>
        )}
        {testCase.description && (
          <div className="mb-4">
            <div className="font-semibold mb-1">Описание</div>
            <div className="text-gray-700 whitespace-pre-line">{testCase.description}</div>
          </div>
        )}
        {testCase.preconditions && (
          <div className="mb-4">
            <div className="font-semibold mb-1">Предусловия</div>
            <div className="text-gray-700 whitespace-pre-line">{testCase.preconditions}</div>
          </div>
        )}
        {testCase.steps && (
          <div className="mb-4">
            <div className="font-semibold mb-1">Шаги выполнения</div>
            <div className="text-gray-700 whitespace-pre-line">{testCase.steps}</div>
          </div>
        )}
        {testCase.expectedResult && (
          <div className="mb-4">
            <div className="font-semibold mb-1">Ожидаемый результат</div>
            <div className="text-gray-700 whitespace-pre-line">{testCase.expectedResult}</div>
          </div>
        )}
        <div className="flex justify-end mt-8">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={onEdit}
          >
            Редактировать
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCaseSidebar; 