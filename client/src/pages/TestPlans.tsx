import React from 'react';

const TestPlans: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Тест-планы</h1>
          <p className="text-gray-600">Планирование тестирования</p>
        </div>
        <button className="btn btn-primary">
          Создать тест-план
        </button>
      </div>

      <div className="card p-6">
        <p className="text-gray-600">Список тест-планов будет отображаться здесь</p>
      </div>
    </div>
  );
};

export default TestPlans; 