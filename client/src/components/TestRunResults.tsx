import React, { useState, useEffect } from 'react';
import { PlayIcon, PauseIcon, StopIcon, InformationCircleIcon, CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { TestCaseSidebarView } from './TestCaseSidebar.tsx';

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
  preconditions?: string;
  steps?: string;
  expected_result?: string;
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
  const [timers, setTimers] = useState<{ [key: number]: number }>({}); // test_case_id: seconds
  const [timerIntervals, setTimerIntervals] = useState<{ [key: number]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (isOpen && testRunId) {
      fetchResults();
    } else {
      // Очищаем таймеры при закрытии модального окна
      Object.values(timerIntervals).forEach(clearInterval);
      setTimerIntervals({});
      setTimers({});
    }
  }, [isOpen, testRunId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/test-runs/${testRunId}/results`);
      const data = await response.json();
      setResults(data);
      
      // Инициализация таймеров для in_progress
      const timersInit: { [key: number]: number } = {};
      data.forEach((result: any) => {
        if (result.status === 'in_progress' && result.executed_at) {
          const started = new Date(result.executed_at).getTime();
          const elapsedSeconds = Math.floor((Date.now() - started) / 1000);
          timersInit[result.test_case_id] = Math.max(0, elapsedSeconds);
        }
      });
      setTimers(timersInit);
    } catch (error) {
      console.error('Ошибка загрузки результатов:', error);
    } finally {
      setLoading(false);
    }
  };

  // Таймеры для in_progress
  useEffect(() => {
    // Очищаем старые интервалы
    Object.values(timerIntervals).forEach(clearInterval);
    
    // Создаем новые интервалы для активных таймеров
    const newIntervals: { [key: number]: NodeJS.Timeout } = {};
    Object.entries(timers).forEach(([testCaseId, seconds]) => {
      const interval = setInterval(() => {
        setTimers(prev => ({ ...prev, [testCaseId]: prev[testCaseId] + 1 }));
      }, 1000);
      newIntervals[testCaseId] = interval;
    });
    
    setTimerIntervals(newIntervals);
    
    return () => {
      Object.values(newIntervals).forEach(clearInterval);
    };
  }, [timers]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
        
        // Обработка таймеров при изменении статуса
        if (status === 'in_progress') {
          // Запускаем таймер для нового in_progress
          if (!timers[testCaseId]) {
            setTimers(prev => ({ ...prev, [testCaseId]: 0 }));
          }
        } else {
          // Останавливаем таймер для других статусов
          if (timers[testCaseId] !== undefined) {
            setTimers(prev => {
              const newTimers = { ...prev };
              delete newTimers[testCaseId];
              return newTimers;
            });
            
            // Очищаем интервал
            if (timerIntervals[testCaseId]) {
              clearInterval(timerIntervals[testCaseId]);
              setTimerIntervals(prev => {
                const newIntervals = { ...prev };
                delete newIntervals[testCaseId];
                return newIntervals;
              });
            }
          }
        }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <CheckCircleIcon className="w-5 h-5 text-red-500" />;
      case 'blocked':
        return <InformationCircleIcon className="w-5 h-5 text-yellow-500" />;
      case 'not_run':
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
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
            <div className="p-6 space-y-6">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-6 bg-gray-50 shadow-sm">
                  {/* Заголовок и статус */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{result.test_case_title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(result.test_case_priority)}`}>{getPriorityText(result.test_case_priority)}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(result.status)}`}>{getStatusText(result.status)}</span>
                        {result.executed_by_name && (
                          <span className="text-xs text-gray-500 ml-2">Выполнил: {result.executed_by_name}</span>
                        )}
                        {result.executed_at && (
                          <span className="text-xs text-gray-500 ml-2">{new Date(result.executed_at).toLocaleString('ru-RU')}</span>
                        )}
                      </div>
                    </div>
                    {/* Таймер */}
                    {result.status === 'in_progress' && (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 mb-1">Таймер</span>
                        <span className="font-mono text-lg text-blue-600">{formatTime(timers[result.test_case_id] || 0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Детали тест-кейса */}
                  <TestCaseSidebarView
                    testCase={{
                      id: result.test_case_id,
                      title: result.test_case_title,
                      description: result.test_case_description,
                      preconditions: result.preconditions,
                      steps: result.steps,
                      expectedResult: result.expected_result,
                      priority: result.test_case_priority,
                      status: result.status,
                      createdAt: result.executed_at,
                    }}
                    getPriorityColor={getPriorityColor}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                  />

                  {/* Статус и заметки */}
                  <div className="pt-4 mt-4 border-t">
                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Статус</label>
                      <select
                        value={result.status}
                        onChange={(e) => updateTestResult(result.test_case_id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="not_run">Не выполнен</option>
                        <option value="passed">Пройден</option>
                        <option value="failed">Провален</option>
                        <option value="blocked">Заблокирован</option>
                        <option value="in_progress">В процессе</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Заметки</label>
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