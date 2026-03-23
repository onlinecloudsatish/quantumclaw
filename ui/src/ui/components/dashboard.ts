/* QuantumClaw Dashboard Redesign */

export function renderDashboard(stats: {
  messagesToday: number;
  activeChats: number;
  automations: number;
  uptime: string;
}) {
  return `
    <div class="qc-dashboard">
      <header class="qc-header">
        <div class="qc-header-left">
          <h1>🦞 QuantumClaw</h1>
          <span class="qc-status qc-status-online">● Online</span>
        </div>
      </header>

      <section class="qc-stats-grid">
        <div class="qc-stat-card">
          <div class="qc-stat-icon">💬</div>
          <div class="qc-stat-info">
            <span class="qc-stat-value">${stats.messagesToday}</span>
            <span class="qc-stat-label">Messages Today</span>
          </div>
        </div>
        
        <div class="qc-stat-card">
          <div class="qc-stat-icon">👥</div>
          <div class="qc-stat-info">
            <span class="qc-stat-value">${stats.activeChats}</span>
            <span class="qc-stat-label">Active Chats</span>
          </div>
        </div>
        
        <div class="qc-stat-card">
          <div class="qc-stat-icon">⚡</div>
          <div class="qc-stat-info">
            <span class="qc-stat-value">${stats.automations}</span>
            <span class="qc-stat-label">Automations</span>
          </div>
        </div>
        
        <div class="qc-stat-card">
          <div class="qc-stat-icon">⏱️</div>
          <div class="qc-stat-info">
            <span class="qc-stat-value">${stats.uptime}</span>
            <span class="qc-stat-label">Uptime</span>
          </div>
        </div>
      </section>

      <section class="qc-quick-actions">
        <h2>Quick Actions</h2>
        <div class="qc-actions-grid">
          <button class="qc-action-btn" data-action="new-chat">
            <span>💬</span><span>New Chat</span>
          </button>
          <button class="qc-action-btn" data-action="send-message">
            <span>📤</span><span>Send Message</span>
          </button>
          <button class="qc-action-btn" data-action="create-automation">
            <span>🔧</span><span>Create Automation</span>
          </button>
          <button class="qc-action-btn" data-action="view-logs">
            <span>📋</span><span>View Logs</span>
          </button>
        </div>
      </section>
    </div>
  `;
}

export function renderCommandPalette() {
  return `
    <div class="qc-command-palette" id="qc-command-palette">
      <input type="text" class="qc-command-input" placeholder="Type a command or search..." autofocus />
      <div class="qc-command-results">
        <div class="qc-command-group">
          <span class="qc-group-label">Commands</span>
          <button class="qc-command-item"><span>🤖</span><span>New Agent Session</span><kbd>Ctrl+N</kbd></button>
          <button class="qc-command-item"><span>💬</span><span>Send Message</span><kbd>Ctrl+M</kbd></button>
          <button class="qc-command-item"><span>⚙️</span><span>Settings</span><kbd>Ctrl+,</kbd></button>
        </div>
      </div>
    </div>
  `;
}