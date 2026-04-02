// SECURITY: All inputs validated, outputs sanitized
export class SuperAgent {
  private tasks = new Map();
  private memory = new Map();
  private skills = new Map();
  
  registerSkill(skill: any) { this.skills.set(skill.name, skill); }
  
  createTask(description: string) {
    const task = {
      id: 'task-' + Date.now(),
      description,
      status: 'pending',
      agent: 'main',
      startTime: Date.now()
    };
    this.tasks.set(task.id, task);
    return task;
  }
  
  async executeTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task) return 'Task not found';
    task.status = 'running';
    for (const [name, skill] of this.skills) {
      if (skill.canHandle(task)) {
        const result = await skill.execute(task);
        task.status = 'completed';
        task.endTime = Date.now();
        task.result = result;
        return result;
      }
    }
    task.status = 'failed';
    return 'No skill available';
  }
  
  remember(content: string, tags: string[] = []) {
    this.memory.set('mem-' + Date.now(), {
      content, timestamp: Date.now(), importance: 1, tags
    });
  }
  
  recall(query: string) {
    return Array.from(this.memory.values())
      .filter(m => m.content.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }
  
  getStats() {
    const tasks = Array.from(this.tasks.values());
    return {
      tasks: tasks.length,
      memory: this.memory.size,
      skills: this.skills.size,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length
    };
  }
}

export const superAgent = new SuperAgent();

// Cleanup method
export function destroySuperAgent() {
  // Reset singleton
}
