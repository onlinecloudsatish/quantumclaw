/**
 * Digital Humans - Background autonomous agents
 */

export interface DigitalHuman {
  id: string;
  name: string;
  role: string;
  enabled: boolean;
  lastActive: number;
  tasksCompleted: number;
}

export interface BackgroundTask {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  humanId: string;
  createdAt: number;
  completedAt?: number;
}

export class DigitalHumanManager {
  private humans: Map<string, DigitalHuman> = new Map();
  private tasks: BackgroundTask[] = [];
  private maxHumans = 10;
  private maxTasks = 1000;

  createHuman(name: string, role: string): DigitalHuman {
    if (this.humans.size >= this.maxHumans) throw new Error('Too many humans');
    const human: DigitalHuman = {
      id: `human-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      name, role, enabled: true, lastActive: Date.now(), tasksCompleted: 0
    };
    this.humans.set(human.id, human);
    return human;
  }

  assignTask(humanId: string, type: string, description: string): BackgroundTask {
    if (this.tasks.length >= this.maxTasks) {
      this.tasks = this.tasks.slice(-500);
    }
    const task: BackgroundTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      type, description, status: 'pending', humanId, createdAt: Date.now()
    };
    this.tasks.push(task);
    return task;
  }

  completeTask(taskId: string): boolean {
    const t = this.tasks.find(t => t.id === taskId);
    if (t) {
      t.status = 'completed';
      t.completedAt = Date.now();
      const h = this.humans.get(t.humanId);
      if (h) { h.tasksCompleted++; h.lastActive = Date.now(); }
      return true;
    }
    return false;
  }

  getStats() {
    return {
      humans: this.humans.size,
      tasks: this.tasks.length,
      completed: this.tasks.filter(t => t.status === 'completed').length,
      pending: this.tasks.filter(t => t.status === 'pending').length
    };
  }

  destroy(): void {
    this.humans.clear();
    this.tasks = [];
  }
}

export const humans = new DigitalHumanManager();
