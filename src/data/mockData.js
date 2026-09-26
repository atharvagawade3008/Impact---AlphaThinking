import { repositories } from './repositories'
import { changeScenarios } from './changeScenarios'

export { repositories, changeScenarios }

export const summaryMetrics = [
  { label: 'Analyses run', value: '128', delta: '+18.4%', detail: 'vs. last month', tone: 'cyan' },
  { label: 'High risk changes', value: '12', delta: '-8.2%', detail: 'vs. last month', tone: 'red' },
  { label: 'Files affected', value: '846', delta: '+24.6%', detail: 'across all analyses', tone: 'amber' },
  { label: 'Tests recommended', value: '294', delta: '+12.1%', detail: 'ready to validate', tone: 'green' },
]

export const recentAnalyses = [
  { id: 1, change: 'Replace JWT authentication with OAuth 2.0', repo: 'ShopFlow', files: 14, risk: 'High', status: 'Review needed', date: 'Today, 10:42 AM' },
  { id: 2, change: 'Add role-based authorization', repo: 'ShopFlow', files: 11, risk: 'High', status: 'Review needed', date: 'Yesterday' },
  { id: 3, change: 'Change inventory reservation during checkout', repo: 'ShopFlow', files: 10, risk: 'Medium', status: 'Ready to ship', date: 'Sep 22, 2026' },
  { id: 4, change: 'Extend refunds to support partial amounts', repo: 'ShopFlow', files: 11, risk: 'Medium', status: 'Review needed', date: 'Sep 21, 2026' },
]

export const activity = [
  { title: 'Analysis completed', detail: 'Replace JWT authentication with OAuth 2.0', time: '14 min ago', icon: 'scan' },
  { title: 'Review requested', detail: 'Add role-based authorization', time: '2 hr ago', icon: 'alert' },
  { title: 'Analysis started', detail: 'Extend refunds to support partial amounts', time: 'Yesterday', icon: 'scan' },
  { title: 'Analysis completed', detail: 'Change inventory reservation during checkout', time: 'Sep 22', icon: 'check' },
]

export const settingsItems = [
  { title: 'Repository configuration', detail: 'Manage repositories, branches, and technology stacks' },
  { title: 'Analysis preferences', detail: 'Set risk thresholds and default test coverage rules' },
  { title: 'Notifications', detail: 'Choose when IMPACT sends review updates' },
  { title: 'IBM Bob integration', detail: 'Configure the future analysis provider connection' },
  { title: 'Theme', detail: 'Dark theme is active for this workspace' },
]

export const pipelineStages = [
  'Analyzing repository structure...',
  'Tracing service & code dependencies...',
  'Evaluating affected components & risk surface...',
  'Identifying recommended test coverage...',
  'Generating release readiness report...',
]
