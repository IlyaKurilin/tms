import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRightIcon, ChevronDownIcon, PlayIcon, PauseIcon, StopIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface TestRun {
  id: number;
  name: string;
  description?: string;
  status: string;
  test_plan_id: number;
  test_plan_name: string;
  project_id: number;
  project_name: string;
}

interface Section {
  id: number;
  parent_id: number | null;
  name: string;
  order_index: number;
}

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
  section_id?: number;
  steps?: string;
  expected_result?: string;
  preconditions?: string;
}

const TestRunDetail: React.FC = () => {
  const { id } = useParams();
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [activeTimers, setActiveTimers] = useState<{ [key: number]: { running: boolean; seconds: number; paused: boolean } }>({});
  const [modalCase, setModalCase] = useState<TestResult | null>(null);
  const [modalStatus, setModalStatus] = useState('passed');
  const [modalComment, setModalComment] = useState('');
  const [modalTime, setModalTime] = useState('');
  const [sidebarCase, setSidebarCase] = useState<TestResult | null>(null);

  useEffect(() => {
    if (id) {
      fetchData(Number(id));
    }
  }, [id]);

  // Таймеры
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          if (next[+id].running && !next[+id].paused) {
            next[+id].seconds += 1;
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Формат времени
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const fetchData = async (testRunId: number) => {
    setLoading(true);
    try {
      // Получаем инфо о прогоне
      const runRes = await fetch(`/api/test-runs/${testRunId}`);
      const runData = await runRes.json();
      setTestRun(runData);

      // Получаем дерево разделов проекта
      if (runData && runData.test_plan_id) {
        // Получаем id проекта через тест-план
        const planRes = await fetch(`/api/test-plans/${runData.test_plan_id}`);
        const planData = await planRes.json();
        const projectId = planData.project_id;
        if (projectId) {
          const sectionsRes = await fetch(`/api/test-case-sections/project/${projectId}`);
          setSections(await sectionsRes.json());
        }
      }

      // Получаем результаты кейсов прогона
      const resultsRes = await fetch(`/api/test-runs/${testRunId}/results`);
      setResults(await resultsRes.json());
    } catch (e) {
      // TODO: обработка ошибок
    } finally {
      setLoading(false);
    }
  };

  // Получить подразделы
  const getChildSections = (parentId: number | null) =>
    sections.filter(s => s.parent_id === parentId);

  // Получить кейсы раздела
  const getSectionResults = (sectionId: number | null) =>
    results.filter(r => r.section_id === sectionId);

  // Рекурсивный рендер раздела
  const renderSection = (section: Section, level: number = 0) => {
    const isExpanded = expandedSections.has(section.id);
    const childSections = getChildSections(section.id);
    const sectionResults = getSectionResults(section.id);
    return (
      <div key={section.id} style={{ marginLeft: level * 16 }}>
        <div className="flex items-center font-semibold text-gray-800 py-1 cursor-pointer" style={{ fontSize: 14 }}
          onClick={() => {
            setExpandedSections(prev => {
              const next = new Set(prev);
              if (next.has(section.id)) next.delete(section.id); else next.add(section.id);
              return next;
            });
          }}
        >
          {(childSections.length > 0 || sectionResults.length > 0) && (
            isExpanded ? <ChevronDownIcon className="w-4 h-4 mr-1" /> : <ChevronRightIcon className="w-4 h-4 mr-1" />
          )}
          {section.name}
        </div>
        {isExpanded && (
          <div>
            {childSections.map(child => renderSection(child, level + 1))}
            {sectionResults.map(result => renderTestCase(result, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Управление кейсом
  const handleStart = (id: number) => {
    setActiveTimers(prev => ({ ...prev, [id]: { running: true, seconds: prev[id]?.seconds || 0, paused: false } }));
    updateCaseStatus(id, 'in_progress');
  };
  const handlePause = (id: number) => {
    setActiveTimers(prev => ({ ...prev, [id]: { ...prev[id], paused: !prev[id].paused } }));
  };
  const handleStop = (result: TestResult) => {
    setModalCase(result);
    setModalStatus('passed');
    setModalComment('');
    setModalTime(activeTimers[result.id]?.seconds ? formatTime(activeTimers[result.id].seconds) : '');
  };
  const handleModalSave = async () => {
    if (!modalCase) return;
    await updateCaseStatus(modalCase.id, modalStatus, modalComment, modalTime);
    setModalCase(null);
    setActiveTimers(prev => ({ ...prev, [modalCase.id]: { running: false, seconds: 0, paused: false } }));
  };

  // Обновление статуса кейса
  const updateCaseStatus = async (resultId: number, status: string, notes?: string, durationStr?: string) => {
    const duration = durationStr ? parseInt(durationStr.split(':')[0]) * 60 + parseInt(durationStr.split(':')[1]) : undefined;
    try {
      await fetch(`/api/test-runs/${testRun?.id}/results/${resultId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes, duration })
      });
      // Обновить локально
      setResults(results => results.map(r => r.id === resultId ? { ...r, status, notes, duration } : r));
    } catch {}
  };

  // Рендер тест-кейса
  const renderTestCase = (result: TestResult, level: number) => {
    const timer = activeTimers[result.id] || { running: false, seconds: 0, paused: false };
    return (
      <div key={result.id} style={{ marginLeft: level * 16 }} className="flex items-center py-1 text-sm cursor-pointer hover:bg-blue-50 rounded"
        onClick={() => setSidebarCase(result)}>
        <span className="w-2 h-2 rounded-full mr-2" style={{ background: result.status === 'passed' ? '#22c55e' : result.status === 'failed' ? '#ef4444' : result.status === 'in_progress' ? '#3b82f6' : '#a3a3a3' }}></span>
        <span className="flex-1">{result.test_case_title}</span>
        <span className="ml-2 text-xs text-gray-500">{getStatusText(result.status)}</span>
        {/* Управление и таймер */}
        {result.status === 'not_run' && (
          <button className="ml-2 p-1 text-blue-600 hover:bg-blue-100 rounded btn-icon-sm" title="Начать кейс" onClick={e => { e.stopPropagation(); handleStart(result.id); }}>
            <PlayIcon className="w-4 h-4" />
          </button>
        )}
        {result.status === 'in_progress' && (
          <>
            <span className="ml-2 text-xs font-mono">{formatTime(timer.seconds)}</span>
            <button className="ml-2 p-1 text-yellow-600 hover:bg-yellow-100 rounded btn-icon-sm" title="Пауза" onClick={e => { e.stopPropagation(); handlePause(result.id); }}>
              {timer.paused ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
            </button>
            <button className="ml-2 p-1 text-red-600 hover:bg-red-100 rounded btn-icon-sm" title="Стоп" onClick={e => { e.stopPropagation(); handleStop(result); }}>
              <StopIcon className="w-4 h-4" />
            </button>
          </>
        )}
        {(result.status === 'passed' || result.status === 'failed') && (
          <>
            <span className="ml-2 text-xs text-green-600">{result.duration ? formatTime(result.duration) : ''}</span>
            <button className="ml-2 p-1 text-gray-500 hover:bg-gray-200 rounded btn-icon-sm" title="Редактировать результат" onClick={e => { e.stopPropagation(); handleEditResult(result); }}>
              <PencilIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  };

  // Добавляю функцию handleEditResult
  const handleEditResult = (result: TestResult) => {
    setModalCase(result);
    setModalStatus(result.status);
    setModalComment(result.notes || '');
    setModalTime(result.duration ? formatTime(result.duration) : '');
  };

  // Кейсы без раздела
  const unassignedResults = getSectionResults(null);

  // Модалка завершения кейса
  const renderModal = () => modalCase && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Завершение тест-кейса</h2>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Статус</label>
          <select value={modalStatus} onChange={e => setModalStatus(e.target.value)} className="w-full border rounded px-2 py-1">
            <option value="passed">Выполнен</option>
            <option value="failed">Ошибка</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Комментарий</label>
          <textarea value={modalComment} onChange={e => setModalComment(e.target.value)} className="w-full border rounded px-2 py-1" rows={2} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Время выполнения (мм:сс)</label>
          <input type="text" value={modalTime} onChange={e => setModalTime(e.target.value)} className="w-full border rounded px-2 py-1 font-mono" placeholder="0:00" />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setModalCase(null)} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Отмена</button>
          <button onClick={handleModalSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Сохранить</button>
        </div>
      </div>
    </div>
  );

  // Сайдбар подробностей по кейсу
  const renderSidebar = () => sidebarCase && (
    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 border-l flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="font-semibold text-lg">Тест-кейс</div>
        <button onClick={() => setSidebarCase(null)} className="btn-icon-sm" style={{marginRight: '-0.5em'}}>
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <div className="font-semibold mb-1">{sidebarCase.test_case_title}</div>
          <div className="text-xs text-gray-500 mb-2">ID: {sidebarCase.test_case_id}</div>
          {sidebarCase.test_case_description && <div className="text-sm mb-2">{sidebarCase.test_case_description}</div>}
          {sidebarCase.preconditions && <div className="text-xs mb-2"><span className="font-semibold">Предусловия:</span><br/>{sidebarCase.preconditions}</div>}
          {sidebarCase.steps && <div className="text-xs mb-2"><span className="font-semibold">Шаги:</span><br/>{sidebarCase.steps}</div>}
          {sidebarCase.expected_result && <div className="text-xs mb-2"><span className="font-semibold">ОР:</span><br/>{sidebarCase.expected_result}</div>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded bg-gray-100">{getStatusText(sidebarCase.status)}</span>
          {sidebarCase.duration && <span className="text-xs text-green-600">{formatTime(sidebarCase.duration)}</span>}
        </div>
        {/* Управление и таймер */}
        <div className="flex items-center gap-2 mt-2">
          {sidebarCase.status === 'not_run' && (
            <button className="btn-icon-sm" onClick={() => { handleStart(sidebarCase.id); }}>
              <PlayIcon className="w-4 h-4" />
            </button>
          )}
          {sidebarCase.status === 'in_progress' && (
            <>
              <span className="font-mono text-sm">{formatTime(activeTimers[sidebarCase.id]?.seconds || 0)}</span>
              <button className="btn-icon-sm" onClick={() => { handlePause(sidebarCase.id); }}>
                {activeTimers[sidebarCase.id]?.paused ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
              </button>
              <button className="btn-icon-sm" onClick={() => { handleStop(sidebarCase); }}>
                <StopIcon className="w-4 h-4" />
              </button>
            </>
          )}
          {(sidebarCase.status === 'passed' || sidebarCase.status === 'failed') && (
            <button className="btn-icon-sm" onClick={() => { handleEditResult(sidebarCase); }}>
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        {/* Комментарий и история */}
        {sidebarCase.notes && (
          <div className="mt-4">
            <div className="font-semibold text-xs text-gray-500 mb-1">Комментарий</div>
            <div className="text-sm bg-gray-50 rounded p-2">{sidebarCase.notes}</div>
          </div>
        )}
      </div>
    </div>
  );

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_run': return 'Не пройдено';
      case 'in_progress': return 'Выполняется';
      case 'passed': return 'Выполнен';
      case 'failed': return 'Ошибка';
      default: return status;
    }
  };

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  if (!testRun) return <div className="p-8 text-center text-red-500">Прогон не найден</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Тестовый прогон: {testRun?.test_plan_name}</h1>
      <div className="text-gray-600 mb-4">{testRun?.description}</div>
      <div>
        {sections.filter(s => s.parent_id === null).map(section => renderSection(section))}
        {getSectionResults(null).length > 0 && (
          <div className="mt-2">
            <div className="font-semibold text-gray-700" style={{ fontSize: 14 }}>Без раздела</div>
            {getSectionResults(null).map(result => renderTestCase(result, 1))}
          </div>
        )}
      </div>
      {renderModal()}
      {renderSidebar()}
    </div>
  );
};

export default TestRunDetail; 