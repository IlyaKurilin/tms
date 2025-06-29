import express, { Request, Response } from 'express';
import { simpleGit, SimpleGit } from 'simple-git';
import path from 'path';

const router = express.Router();

// Получить статус Git репозитория
router.get('/status', async (req: Request, res: Response) => {
  try {
    const repoPath = req.query.path as string || process.env.GIT_REPO_PATH || './git-repos';
    const git: SimpleGit = simpleGit(repoPath);
    
    const status = await git.status();
    
    res.json({
      success: true,
      data: {
        current: status.current,
        tracking: status.tracking,
        ahead: status.ahead,
        behind: status.behind,
        modified: status.modified,
        created: status.created,
        deleted: status.deleted,
        renamed: status.renamed
      }
    });
  } catch (error) {
    console.error('Git status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка получения статуса Git' 
    });
  }
});

// Клонировать репозиторий
router.post('/clone', async (req: Request, res: Response) => {
  try {
    const { url, branch = 'main' } = req.body;
    const repoPath = process.env.GIT_REPO_PATH || './git-repos';
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL репозитория обязателен' 
      });
    }

    const git: SimpleGit = simpleGit(repoPath);
    await git.clone(url, { '--branch': branch });
    
    res.json({ 
      success: true, 
      message: 'Репозиторий успешно клонирован' 
    });
    return;
  } catch (error) {
    console.error('Git clone error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка клонирования репозитория' 
    });
    return;
  }
});

// Получить список коммитов
router.get('/commits', async (req: Request, res: Response) => {
  try {
    const repoPath = req.query.path as string || process.env.GIT_REPO_PATH || './git-repos';
    const git: SimpleGit = simpleGit(repoPath);
    
    const log = await git.log({ maxCount: 10 });
    
    res.json({
      success: true,
      data: log.all
    });
  } catch (error) {
    console.error('Git commits error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка получения коммитов' 
    });
  }
});

export default router; 