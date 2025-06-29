import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateTestCaseModal from '../components/CreateTestCaseModal.tsx';
import TestCaseTree from '../components/TestCaseTree.tsx';
import TestCaseSidebar from '../components/TestCaseSidebar.tsx';
import EditTestCaseModal from '../components/EditTestCaseModal.tsx';

interface TestCase {
  id: number;
  project_id: number;
  test_plan_id: number | null;
  section_id: number | null;
  title: string;
  description: string;
  preconditions: string;
  steps: string;
  expected_result: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  git_repository: string;
  created_at: string;
  updated_at: string;
}

const TestCases: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    } else {
      fetchProjects();
    }
  }, [projectId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки проекта:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestCase = async (testCaseData: any) => {
    try {
      const response = await fetch('/api/test-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCaseData),
      });
      if (response.ok) {
        const newTestCase = await response.json();
        setShowCreateModal(false);
        // Принудительно обновляем дерево
        setRefreshTrigger(prev => prev + 1);
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка создания тест-кейса');
      }
    } catch (error) {
      alert('Ошибка создания тест-кейса');
    }
  };

  const handleTestCaseEdit = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setShowEditModal(true);
  };

  const handleTestCaseSelect = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
  };

  const handleEditTestCase = async (updatedTestCase: any) => {
    try {
      const response = await fetch(`/api/test-cases/${updatedTestCase.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updatedTestCase.title,
          description: updatedTestCase.description,
          preconditions: updatedTestCase.preconditions,
          steps: updatedTestCase.steps,
          expectedResult: updatedTestCase.expected_result || updatedTestCase.expectedResult,
          priority: updatedTestCase.priority,
          status: updatedTestCase.status,
          sectionId: undefined,
          section_id: typeof updatedTestCase.section_id === 'number' ? updatedTestCase.section_id : null
        }),
      });
      if (response.ok) {
        const newTestCase = await response.json();
        setSelectedTestCase(newTestCase);
        setShowEditModal(false);
        // Принудительно обновляем дерево
        setRefreshTrigger(prev => prev + 1);
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка обновления тест-кейса');
      }
    } catch (error) {
      alert('Ошибка обновления тест-кейса');
    }
  };

  // Если нет projectId, показываем список проектов
  if (!projectId) {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка проектов...</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Тест-кейсы</h1>
            <p className="text-gray-600">Выберите проект для просмотра тест-кейсов</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}/test-cases`)}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
              {project.description && (
                <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              )}
              <div className="text-xs text-gray-500">
                Создан: {new Date(project.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium mb-2">Нет проектов</h3>
            <p className="text-sm text-gray-500 mb-4">Создайте проект, чтобы начать работу с тест-кейсами</p>
            <button
              onClick={() => navigate('/projects')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Перейти к проектам
            </button>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка проекта...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Проект не найден</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Левая панель с деревом тест-кейсов */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Заголовок */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Тест-кейсы</h1>
              <p className="text-sm text-gray-600">{project.name}</p>
            </div>
          </div>
        </div>

        {/* Дерево тест-кейсов */}
        <div className="flex-1 overflow-y-auto p-4">
          <TestCaseTree
            projectId={project.id}
            onTestCaseSelect={handleTestCaseSelect}
            onTestCaseCreate={() => setShowCreateModal(true)}
            onTestCaseEdit={handleTestCaseEdit}
            selectedTestCaseId={selectedTestCase?.id}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      {/* Центральная панель с деталями тест-кейса */}
      <div className="flex-1 flex flex-col">
        {selectedTestCase ? (
          <TestCaseSidebar
            isOpen={true}
            testCase={selectedTestCase}
            onClose={() => setSelectedTestCase(null)}
            onEdit={() => setShowEditModal(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2">Выберите тест-кейс</h3>
              <p className="text-sm">Выберите тест-кейс из списка слева для просмотра деталей</p>
            </div>
          </div>
        )}
      </div>

      {/* Модалка создания тест-кейса */}
      <CreateTestCaseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projectId={project.id}
        onSave={handleCreateTestCase}
      />

      {/* Модалка редактирования тест-кейса */}
      {showEditModal && selectedTestCase && (
        <EditTestCaseModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          testCase={selectedTestCase}
          onSave={handleEditTestCase}
        />
      )}
    </div>
  );
};

export default TestCases; 