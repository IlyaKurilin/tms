import React from 'react';

const TestRuns: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Тестовые прогоны</h1>
          <p className="text-gray-600">Выполнение тестирования</p>
        </div>
        <button className="btn btn-primary">
          Запустить прогон
        </button>
      </div>

      <div className="card p-6">
        <p className="text-gray-600">Список тестовых прогонов будет отображаться здесь</p>
      </div>
    </div>
  );
};

export default TestRuns; 