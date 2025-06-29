import React, { useState, useEffect } from 'react';

interface TestPlan {
  id: number;
  name: string;
  description?: string;
  status: string;
  project_name: string;
  test_cases_count?: number;
}

interface CreateTestRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testRun: any) => void;
}

const CreateTestRunModal: React.FC<CreateTestRunModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [formData, setFormData] = useState({
    testPlanId: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchTestPlans();
    }
  }, [isOpen]);

  const fetchTestPlans = async () => {
    try {
      const response = await fetch('/api/test-plans');
      const data = await response.json();
      // Фильтруем только активные тест-планы
      const activePlans = data.filter((plan: TestPlan) => plan.status === 'active');
      setTestPlans(activePlans);
    } catch (error) {
      console.error('Ошибка загрузки тест-планов:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/test-runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testPlanId: parseInt(formData.testPlanId),
          name: formData.name,
          description: formData.description
        }),
      });

      if (response.ok) {
        const newTestRun = await response.json();
        onSave(newTestRun);
        setFormData({
          testPlanId: '',
          name: '',
          description: ''
        });
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка создания тестового прогона');
      }
    } catch (error) {
      console.error('Ошибка создания тестового прогона:', error);
      alert('Ошибка создания тестового прогона');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Создать тестовый прогон</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тест-план *
            </label>
            <select
              value={formData.testPlanId}
              onChange={(e) => setFormData({ ...formData, testPlanId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Выберите тест-план</option>
              {testPlans.map((testPlan) => (
                <option key={testPlan.id} value={testPlan.id}>
                  {testPlan.name} ({testPlan.project_name})
                  {testPlan.test_cases_count && ` - ${testPlan.test_cases_count} тест-кейсов`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название тестового прогона"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Описание тестового прогона"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTestRunModal; 