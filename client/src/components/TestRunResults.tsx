import React, { useState, useEffect } from 'react';

interface TestResult {
  id: number;
  test_case_id: number;
  test_case_title: string;
  test_case_description?: string;
  test_case_priority: string;
  status: string;
  notes?: string;
  duration?: number;
  executed_by_name?: string;
  executed_at?: string;
}

interface TestRunResultsProps {
  testRunId: number;
  isOpen: boolean;
  onClose: () => void;
}

const TestRunResults: React.FC<TestRunResultsProps> = ({
  testRunId,
  isOpen,
  onClose
}) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && testRunId) {
      fetchResults();
    }
  }, [isOpen, testRunId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/test-runs/${testRunId}/results`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Ошибка загрузки результатов:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTestResult = async (testCaseId: number, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/test-runs/${testRunId}/results/${testCaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes: notes || ''
        }),
      });

      if (response.ok) {
        const updatedResult = await response.json();
        setResults(results.map(result => 
          result.test_case_id === testCaseId ? { ...result, ...updatedResult } : result
        ));
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка обновления результата');
      }
    } catch (error) {
      console.error('Ошибка обновления результата:', error);
      alert('Ошибка обновления результата');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'blocked':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_run':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed':
        return 'Пройден';
      case 'failed':
        return 'Провален';
      case 'blocked':
        return 'Заблокирован';
      case 'not_run':
        return 'Не выполнен';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
      default:
        return priority;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Результаты тестового прогона</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {result.test_case_title}
                      </h3>
                      {result.test_case_description && (
                        <p className="text-gray-600 text-sm mb-2">{result.test_case_description}</p>
                      )}
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(result.test_case_priority)}`}>
                          {getPriorityText(result.test_case_priority)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(result.status)}`}>
                          {getStatusText(result.status)}
                        </span>
                        {result.executed_by_name && (
                          <span className="text-sm text-gray-500">
                            Выполнил: {result.executed_by_name}
                          </span>
                        )}
                        {result.executed_at && (
                          <span className="text-sm text-gray-500">
                            {new Date(result.executed_at).toLocaleString('ru-RU')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Статус
                      </label>
                      <select
                        value={result.status}
                        onChange={(e) => updateTestResult(result.test_case_id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="not_run">Не выполнен</option>
                        <option value="passed">Пройден</option>
                        <option value="failed">Провален</option>
                        <option value="blocked">Заблокирован</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Заметки
                      </label>
                      <textarea
                        value={result.notes || ''}
                        onChange={(e) => updateTestResult(result.test_case_id, result.status, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Добавьте заметки о результате теста..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestRunResults; 