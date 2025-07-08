import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XMarkIcon, InformationCircleIcon, DocumentTextIcon, PauseIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';

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

const statusMap: Record<string, { label: string; color: string }> = {
  passed: { label: 'Пройден', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Провален', color: 'bg-red-100 text-red-800' },
  blocked: { label: 'Заблокирован', color: 'bg-yellow-100 text-yellow-800' },
  not_run: { label: 'Не выполнен', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'Выполняется', color: 'bg-blue-100 text-blue-800' },
};

const priorityMap: Record<string, { label: string; color: string }> = {
  high: { label: 'Высокий', color: 'bg-red-100 text-red-800' },
  medium: { label: 'Средний', color: 'bg-yellow-100 text-yellow-800' },
  low: { label: 'Низкий', color: 'bg-green-100 text-green-800' },
};

const TestRunCaseCard: React.FC<{
  result: TestResult;
  onStatusChange: (status: string) => void;
  onNotesChange: (notes: string) => void;
  timer?: string;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}> = ({ result, onStatusChange, onNotesChange, timer, onStart, onPause, onStop }) => (
  <div className="bg-white rounded-xl shadow p-6 mb-6">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{result.test_case_title}</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityMap[result.test_case_priority]?.color || 'bg-gray-100 text-gray-800'}`}>{priorityMap[result.test_case_priority]?.label || result.test_case_priority}</span>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusMap[result.status]?.color || 'bg-gray-100 text-gray-800'}`}>{statusMap[result.status]?.label || result.status}</span>
          {result.executed_by_name && (
            <span className="text-xs text-gray-500 ml-2">Выполнил: {result.executed_by_name}</span>
          )}
          {result.executed_at && (
            <span className="text-xs text-gray-500 ml-2">{new Date(result.executed_at).toLocaleString('ru-RU')}</span>
          )}
        </div>
      </div>
      <button className="text-gray-400 hover:text-gray-600" title="Скрыть детали">
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <div className="mb-2">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Описание</span>
          <div className="text-gray-700 text-sm whitespace-pre-line">{result.test_case_description || '-'}</div>
        </div>
        <div className="mb-2">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Предусловия</span>
          <div className="text-gray-700 text-sm whitespace-pre-line">{result.preconditions || '-'}</div>
        </div>
        <div className="mb-2">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Шаги</span>
          <div className="text-gray-700 text-sm whitespace-pre-line">{result.steps || '-'}</div>
        </div>
        <div className="mb-2">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Ожидаемый результат</span>
          <div className="text-gray-700 text-sm whitespace-pre-line">{result.expected_result || '-'}</div>
        </div>
      </div>
      <div>
        <div className="mb-2">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Статус</span>
          <select
            value={result.status}
            onChange={e => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="not_run">Не выполнен</option>
            <option value="in_progress">Выполняется</option>
            <option value="passed">Пройден</option>
            <option value="failed">Провален</option>
            <option value="blocked">Заблокирован</option>
          </select>
        </div>
        <div className="mb-2">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Заметки</span>
          <textarea
            value={result.notes || ''}
            onChange={e => onNotesChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Добавьте заметки о результате теста..."
          />
        </div>
        {result.status === 'in_progress' && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">Таймер:</span>
            <span className="font-mono text-base text-blue-600">{timer}</span>
            <button className="p-1 rounded hover:bg-gray-100" onClick={onPause} title="Пауза"><PauseIcon className="w-4 h-4" /></button>
            <button className="p-1 rounded hover:bg-gray-100" onClick={onStop} title="Стоп"><StopIcon className="w-4 h-4" /></button>
          </div>
        )}
        {result.status !== 'in_progress' && (
          <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center gap-1" onClick={onStart}>
            <PlayIcon className="w-4 h-4" /> Старт
          </button>
        )}
      </div>
    </div>
  </div>
);

const TestRunSidebar: React.FC<{
  result: TestResult | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onNotesChange: (notes: string) => void;
  timer?: string;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}> = ({ result, isOpen, onClose, onStatusChange, onNotesChange, timer, onStart, onPause, onStop }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
        <div>
          <h2 className="text-lg font-bold leading-tight">{result?.test_case_title}</h2>
          <div className="flex items-center gap-2 text-xs mt-1">
            <span className="opacity-80">ID: {result?.test_case_id}</span>
          </div>
        </div>
        <button className="text-white hover:text-gray-200" onClick={onClose}><XMarkIcon className="w-6 h-6" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Описание</span>
          </div>
          <div className="text-gray-700 text-sm whitespace-pre-line">{result?.test_case_description || '-'}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <InformationCircleIcon className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-gray-700">Предусловия</span>
          </div>
          <div className="text-gray-700 text-sm whitespace-pre-line">{result?.preconditions || '-'}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <DocumentTextIcon className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-gray-700">Шаги выполнения</span>
          </div>
          <div className="text-gray-700 text-sm whitespace-pre-line">{result?.steps || '-'}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-gray-700">Ожидаемый результат</span>
          </div>
          <div className="text-gray-700 text-sm whitespace-pre-line">{result?.expected_result || '-'}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="mb-2">
            <span className="block text-xs font-semibold text-gray-500 mb-1">Статус</span>
            <select
              value={result?.status}
              onChange={e => onStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="not_run">Не выполнен</option>
              <option value="in_progress">Выполняется</option>
              <option value="passed">Пройден</option>
              <option value="failed">Провален</option>
              <option value="blocked">Заблокирован</option>
            </select>
          </div>
          <div className="mb-2">
            <span className="block text-xs font-semibold text-gray-500 mb-1">Заметки</span>
            <textarea
              value={result?.notes || ''}
              onChange={e => onNotesChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Добавьте заметки о результате теста..."
            />
          </div>
          {result?.status === 'in_progress' && timer && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">Таймер:</span>
              <span className="font-mono text-base text-blue-600">{timer}</span>
              <button className="p-1 rounded hover:bg-gray-100" onClick={onPause} title="Пауза"><PauseIcon className="w-4 h-4" /></button>
              <button className="p-1 rounded hover:bg-gray-100" onClick={onStop} title="Стоп"><StopIcon className="w-4 h-4" /></button>
            </div>
          )}
          {result?.status !== 'in_progress' && (
            <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center gap-1" onClick={onStart}>
              <PlayIcon className="w-4 h-4" /> Старт
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TestRunResults: React.FC<TestRunResultsProps> = ({ testRunId, isOpen, onClose }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState<{ [key: number]: number }>({});
  const [timerIntervals, setTimerIntervals] = useState<{ [key: number]: NodeJS.Timeout }>({});
  const [sidebarResult, setSidebarResult] = useState<TestResult | null>(null);

  useEffect(() => {
    if (isOpen && testRunId) {
      fetchResults();
    } else {
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
      // Таймеры для in_progress
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
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Таймеры для in_progress
  useEffect(() => {
    Object.values(timerIntervals).forEach(clearInterval);
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
    console.log('PUT /api/test-runs/' + testRunId + '/results/' + testCaseId, { status, notes });
    try {
      const response = await fetch(`/api/test-runs/${testRunId}/results/${testCaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: notes || '' }),
      });
      if (response.ok) {
        const updatedResult = await response.json();
        setResults(results.map(result => result.test_case_id === testCaseId ? { ...result, ...updatedResult } : result));
      }
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-xl relative">
        <div className="sticky top-0 z-10 bg-white rounded-t-2xl border-b px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Тестовые прогоны</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        <div className="px-8 py-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {results.length === 0 && <div className="text-gray-500 text-center py-12">Нет результатов для этого прогона</div>}
              {results.map(result => (
                <div key={result.id} onClick={() => setSidebarResult(result)} className="cursor-pointer">
                  <TestRunCaseCard
                    result={result}
                    timer={timers[result.test_case_id] !== undefined ? formatTime(timers[result.test_case_id]) : undefined}
                    onStatusChange={status => updateTestResult(result.test_case_id, status, result.notes)}
                    onNotesChange={notes => updateTestResult(result.test_case_id, result.status, notes)}
                    onStart={() => updateTestResult(result.test_case_id, 'in_progress', result.notes)}
                    onPause={() => updateTestResult(result.test_case_id, 'not_run', result.notes)}
                    onStop={() => updateTestResult(result.test_case_id, 'not_run', result.notes)}
                  />
                </div>
              ))}
            </>
          )}
        </div>
        <TestRunSidebar
          result={sidebarResult}
          isOpen={!!sidebarResult}
          onClose={() => setSidebarResult(null)}
          onStatusChange={status => sidebarResult && updateTestResult(sidebarResult.test_case_id, status, sidebarResult.notes)}
          onNotesChange={notes => sidebarResult && updateTestResult(sidebarResult.test_case_id, sidebarResult.status, notes)}
          timer={sidebarResult && timers[sidebarResult.test_case_id] !== undefined ? formatTime(timers[sidebarResult.test_case_id]) : undefined}
          onStart={() => sidebarResult && updateTestResult(sidebarResult.test_case_id, 'in_progress', sidebarResult.notes)}
          onPause={() => sidebarResult && updateTestResult(sidebarResult.test_case_id, 'not_run', sidebarResult.notes)}
          onStop={() => sidebarResult && updateTestResult(sidebarResult.test_case_id, 'not_run', sidebarResult.notes)}
        />
      </div>
    </div>
  );
};

export default TestRunResults; 