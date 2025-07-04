import express, { Request, Response } from 'express';
import { query } from '../config/database';
const router = express.Router();

// Получить все тестовые прогоны
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        tr.*,
        tp.name as test_plan_name,
        p.name as project_name,
        u.username as started_by_name,
        COUNT(tr2.id) as total_test_cases,
        COUNT(CASE WHEN tr2.status = 'passed' THEN 1 END) as passed_count,
        COUNT(CASE WHEN tr2.status = 'failed' THEN 1 END) as failed_count,
        COUNT(CASE WHEN tr2.status = 'blocked' THEN 1 END) as blocked_count,
        COUNT(CASE WHEN tr2.status = 'not_run' THEN 1 END) as not_run_count
      FROM test_runs tr
      LEFT JOIN test_plans tp ON tr.test_plan_id = tp.id
      LEFT JOIN projects p ON tp.project_id = p.id
      LEFT JOIN users u ON tr.started_by = u.id
      LEFT JOIN test_results tr2 ON tr.id = tr2.test_run_id
      GROUP BY tr.id, tp.name, p.name, u.username
      ORDER BY tr.created_at DESC
    `);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения тестовых прогонов' });
  }
});

// Получить тестовые прогоны тест-плана
router.get('/test-plan/:testPlanId', async (req: Request, res: Response) => {
  try {
    const { testPlanId } = req.params;
    const result = await query(`
      SELECT 
        tr.*,
        u.username as started_by_name,
        COUNT(tr2.id) as total_test_cases,
        COUNT(CASE WHEN tr2.status = 'passed' THEN 1 END) as passed_count,
        COUNT(CASE WHEN tr2.status = 'failed' THEN 1 END) as failed_count,
        COUNT(CASE WHEN tr2.status = 'blocked' THEN 1 END) as blocked_count,
        COUNT(CASE WHEN tr2.status = 'not_run' THEN 1 END) as not_run_count
      FROM test_runs tr
      LEFT JOIN users u ON tr.started_by = u.id
      LEFT JOIN test_results tr2 ON tr.id = tr2.test_run_id
      WHERE tr.test_plan_id = $1
      GROUP BY tr.id, u.username
      ORDER BY tr.created_at DESC
    `, [testPlanId]);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения тестовых прогонов плана' });
  }
});

// Получить тестовый прогон по ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT 
        tr.*,
        tp.name as test_plan_name,
        p.name as project_name,
        u.username as started_by_name
      FROM test_runs tr
      LEFT JOIN test_plans tp ON tr.test_plan_id = tp.id
      LEFT JOIN projects p ON tp.project_id = p.id
      LEFT JOIN users u ON tr.started_by = u.id
      WHERE tr.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тестовый прогон не найден' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения тестового прогона' });
  }
});

// Создать тестовый прогон
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      testPlanId, 
      name, 
      description 
    } = req.body;
    
    if (!testPlanId || !name) {
      return res.status(400).json({ error: 'ID тест-плана и название обязательны' });
    }
    
    // Создаем тестовый прогон
    const result = await query(
      `INSERT INTO test_runs (
        test_plan_id, name, description, status, started_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [testPlanId, name, description, 'planned', 1] // TODO: использовать реального пользователя
    );
    
    const testRun = result.rows[0];
    
    // Получаем все тест-кейсы тест-плана
    const testCasesResult = await query(
      'SELECT id FROM test_cases WHERE test_plan_id = $1',
      [testPlanId]
    );
    
    // Создаем записи результатов для каждого тест-кейса
    for (const testCase of testCasesResult.rows) {
      await query(
        `INSERT INTO test_results (
          test_run_id, test_case_id, status, created_at
        ) VALUES ($1, $2, $3, NOW())`,
        [testRun.id, testCase.id, 'not_run']
      );
    }
    
    return res.status(201).json(testRun);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка создания тестового прогона' });
  }
});

// Обновить тестовый прогон
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      status 
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Название обязательно' });
    }
    
    const result = await query(
      `UPDATE test_runs 
       SET name = $1, description = $2, status = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [name, description, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тестовый прогон не найден' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка обновления тестового прогона' });
  }
});

// Удалить тестовый прогон
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM test_runs WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тестовый прогон не найден' });
    }
    
    return res.json({ message: 'Тестовый прогон успешно удален' });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка удаления тестового прогона' });
  }
});

// Получить результаты тестов прогона
router.get('/:id/results', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT 
        tr.*,
        tc.title as test_case_title,
        tc.description as test_case_description,
        tc.priority as test_case_priority,
        u.username as executed_by_name
      FROM test_results tr
      LEFT JOIN test_cases tc ON tr.test_case_id = tc.id
      LEFT JOIN users u ON tr.executed_by = u.id
      WHERE tr.test_run_id = $1
      ORDER BY tc.id
    `, [id]);
    
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения результатов тестов' });
  }
});

// Обновить результат теста
router.put('/:id/results/:testCaseId', async (req: Request, res: Response) => {
  try {
    const { id, testCaseId } = req.params;
    const { 
      status, 
      notes, 
      duration 
    } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Статус обязателен' });
    }
    
    const result = await query(
      `UPDATE test_results 
       SET status = $1, notes = $2, duration = $3, executed_by = $4, executed_at = NOW()
       WHERE test_run_id = $5 AND test_case_id = $6 RETURNING *`,
      [status, notes, duration, 1, id, testCaseId] // TODO: использовать реального пользователя
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Результат теста не найден' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка обновления результата теста' });
  }
});

// Запустить тестовый прогон
router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE test_runs 
       SET status = 'in_progress', started_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тестовый прогон не найден' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка запуска тестового прогона' });
  }
});

// Завершить тестовый прогон
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE test_runs 
       SET status = 'completed', completed_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тестовый прогон не найден' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка завершения тестового прогона' });
  }
});

export default router; 