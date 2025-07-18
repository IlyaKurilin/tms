import React, { useState, useEffect } from 'react';
import CreateTestRunModal from '../components/CreateTestRunModal.tsx';
import TestRunResults from '../components/TestRunResults.tsx';
import { useNavigate } from 'react-router-dom';

interface TestRun {
  id: number;
  name: string;
  description?: string;
  status: string;
  test_plan_name: string;
  project_name: string;
  started_by_name: string;
  total_test_cases: number;
  passed_count: number;
  failed_count: number;
  blocked_count: number;
  not_run_count: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

const TestRuns: React.FC = () => {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [selectedTestRunId, setSelectedTestRunId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTestRuns();
  }, []);

  const fetchTestRuns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-runs');
      const data = await response.json();
      setTestRuns(data);
    } catch (error) {
      console.error('Ошибка загрузки тестовых прогонов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestRun = (newTestRun: TestRun) => {
    setTestRuns([newTestRun, ...testRuns]);
  };

  const handleDeleteTestRun = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот тестовый прогон?')) {
      return;
    }

    try {
      const response = await fetch(`/api/test-runs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTestRuns(testRuns.filter(run => run.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка удаления тестового прогона');
      }
    } catch (error) {
      console.error('Ошибка удаления тестового прогона:', error);
      alert('Ошибка удаления тестового прогона');
    }
  };

  const handleStartTestRun = async (id: number) => {
    try {
      const response = await fetch(`/api/test-runs/${id}/start`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedRun = await response.json();
        setTestRuns(testRuns.map(run => 
          run.id === id ? { ...run, status: updatedRun.status, started_at: updatedRun.started_at } : run
        ));
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка запуска тестового прогона');
      }
    } catch (error) {
      console.error('Ошибка запуска тестового прогона:', error);
      alert('Ошибка запуска тестового прогона');
    }
  };

  const handleCompleteTestRun = async (id: number) => {
    try {
      const response = await fetch(`/api/test-runs/${id}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedRun = await response.json();
        setTestRuns(testRuns.map(run => 
          run.id === id ? { ...run, status: updatedRun.status, completed_at: updatedRun.completed_at } : run
        ));
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка завершения тестового прогона');
      }
    } catch (error) {
      console.error('Ошибка завершения тестового прогона:', error);
      alert('Ошибка завершения тестового прогона');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned':
        return 'Запланирован';
      case 'in_progress':
        return 'Выполняется';
      case 'completed':
        return 'Завершен';
      case 'blocked':
        return 'Заблокирован';
      default:
        return status;
    }
  };

  const getProgressPercentage = (testRun: TestRun) => {
    if (testRun.total_test_cases === 0) return 0;
    const completed = testRun.passed_count + testRun.failed_count + testRun.blocked_count;
    return Math.round((completed / testRun.total_test_cases) * 100);
  };

  const handleViewResults = (testRunId: number) => {
    setSelectedTestRunId(testRunId);
    setIsResultsModalOpen(true);
  };

  const handleCloseResults = () => {
    setIsResultsModalOpen(false);
    setSelectedTestRunId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Тестовые прогоны</h1>
          <p className="text-gray-600">Выполнение тестирования</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
        >
          Запустить прогон
        </button>
      </div>

      {testRuns.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет тестовых прогонов</h3>
          <p className="text-gray-600 mb-4">Создайте первый тестовый прогон для начала тестирования</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            Запустить прогон
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {testRuns.map((testRun) => (
            <div key={testRun.id} className="card p-6 cursor-pointer hover:bg-blue-50 transition" onClick={() => navigate(`/test-runs/${testRun.id}`)}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {testRun.test_plan_name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(testRun.status)}`}>
                      {getStatusText(testRun.status)}
                    </span>
                  </div>
                  
                  {testRun.description && (
                    <p className="text-gray-600 mb-3">{testRun.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{testRun.test_plan_name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{testRun.project_name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{testRun.started_by_name}</span>
                    </div>
                  </div>

                  {/* Прогресс */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Прогресс: {getProgressPercentage(testRun)}%</span>
                      <span>{testRun.total_test_cases} тест-кейсов</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(testRun)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Статистика */}
                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-700">{testRun.passed_count} пройдено</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-red-700">{testRun.failed_count} провалено</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-700">{testRun.blocked_count} заблокировано</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-600">{testRun.not_run_count} не выполнено</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {testRun.status === 'planned' && (
                    <button
                      onClick={e => { e.stopPropagation(); handleStartTestRun(testRun.id); }}
                      className="btn-icon"
                      title="Запустить"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  
                  {testRun.status === 'in_progress' && (
                    <button
                      onClick={e => { e.stopPropagation(); handleCompleteTestRun(testRun.id); }}
                      className="btn-icon"
                      title="Завершить"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={e => { e.stopPropagation(); handleViewResults(testRun.id); }}
                    className="btn-icon"
                    title="Просмотр результатов"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteTestRun(testRun.id); }}
                    className="btn-icon"
                    title="Удалить"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateTestRunModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTestRun}
      />

      <TestRunResults
        isOpen={isResultsModalOpen}
        onClose={handleCloseResults}
        testRunId={selectedTestRunId || 0}
      />
    </div>
  );
};

export default TestRuns; 