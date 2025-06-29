import React, { useState } from 'react';
import CreateTestCaseModal from '../components/CreateTestCaseModal.tsx';

const TestCases: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Тест-кейсы</h1>
          <p className="text-gray-600">Управление тестовыми сценариями</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          Создать тест-кейс
        </button>
      </div>

      <div className="card p-6">
        <p className="text-gray-600">Список тест-кейсов будет отображаться здесь</p>
      </div>

      <CreateTestCaseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projectId={0}
        onSave={() => {}}
      />
    </div>
  );
};

export default TestCases; 