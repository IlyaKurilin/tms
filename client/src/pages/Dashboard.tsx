import React from 'react';
import { BarChart3, FileText, Play, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    { name: 'Всего проектов', value: '12', icon: BarChart3, color: 'text-blue-600' },
    { name: 'Тест-кейсов', value: '156', icon: FileText, color: 'text-green-600' },
    { name: 'Активных прогонов', value: '8', icon: Play, color: 'text-purple-600' },
    { name: 'Пройденных тестов', value: '89', icon: CheckCircle, color: 'text-emerald-600' },
    { name: 'Проваленных тестов', value: '23', icon: AlertCircle, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-600">Обзор системы управления тестированием</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Последние активности */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Последние тестовые прогоны</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Тестирование API v2.1</p>
                <p className="text-sm text-gray-600">Проект: Web Application</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Завершен
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">UI Regression Tests</p>
                <p className="text-sm text-gray-600">Проект: Mobile App</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                В процессе
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Недавние тест-кейсы</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">TC-001: Авторизация пользователя</p>
                <p className="text-sm text-gray-600">Создан: 2 часа назад</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                Черновик
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">TC-002: Создание проекта</p>
                <p className="text-sm text-gray-600">Создан: 4 часа назад</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Готов
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 