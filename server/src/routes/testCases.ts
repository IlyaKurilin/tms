import express, { Request, Response } from 'express';
import { query } from '../config/database';
const router = express.Router();

// Получить все тест-кейсы
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM test_cases ORDER BY id DESC');
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения тест-кейсов' });
  }
});

// Получить тест-кейсы раздела
router.get('/section/:sectionId', async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;
    const result = await query(
      'SELECT * FROM test_cases WHERE section_id = $1 ORDER BY id DESC',
      [sectionId]
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения тест-кейсов раздела' });
  }
});

// Получить тест-кейсы проекта
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const result = await query(
      'SELECT * FROM test_cases WHERE project_id = $1 ORDER BY id DESC',
      [projectId]
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения тест-кейсов проекта' });
  }
});

// Получить тест-кейс по ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM test_cases WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тест-кейс не найден' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения тест-кейса' });
  }
});

// Создать тест-кейс
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      projectId, 
      testPlanId, 
      sectionId,
      title, 
      description, 
      preconditions, 
      steps, 
      expectedResult, 
      priority, 
      status 
    } = req.body;
    
    if (!projectId || !title) {
      return res.status(400).json({ error: 'ID проекта и заголовок обязательны' });
    }
    
    const result = await query(
      `INSERT INTO test_cases (
        project_id, test_plan_id, section_id, title, description, preconditions, 
        steps, expected_result, priority, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *`,
      [projectId, testPlanId, sectionId, title, description, preconditions, steps, expectedResult, priority || 'medium', status || 'draft']
    );
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка создания тест-кейса' });
  }
});

// Обновить тест-кейс
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      preconditions, 
      steps, 
      expectedResult, 
      priority, 
      status, 
      sectionId,
      section_id
    } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Заголовок обязателен' });
    }
    
    const sectionIdToUse = section_id !== undefined ? section_id : sectionId;
    
    const result = await query(
      `UPDATE test_cases SET 
        title = $1, description = $2, preconditions = $3, steps = $4, 
        expected_result = $5, priority = $6, status = $7, section_id = $8, updated_at = NOW() 
       WHERE id = $9 RETURNING *`,
      [title, description, preconditions, steps, expectedResult, priority, status, sectionIdToUse, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тест-кейс не найден' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка обновления тест-кейса' });
  }
});

// Удалить тест-кейс
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM test_cases WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тест-кейс не найден' });
    }
    return res.json({ message: 'Тест-кейс успешно удален' });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка удаления тест-кейса' });
  }
});

export default router; 