import bobData from '../../docs/bob-change-impact-analysis.json'

/**
 * IBM Bob Analysis Provider & Adapter
 *
 * Transforms the raw IBM Bob change impact analysis artifact (docs/bob-change-impact-analysis.json)
 * into the canonical analysis result format consumed by IMPACT UI components.
 */

/**
 * Maps raw IBM Bob JSON to the canonical analysis result structure.
 *
 * @param {Object} input - Analysis request parameters
 * @returns {Object} Canonical analysis result object
 */
export function transformBobAnalysis(input = {}) {
  const repoName = input.repository || 'ShopFlow'
  const branch = input.branch || 'main'

  const analyzedAt = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const directlyAffected = (bobData.impact?.directlyAffectedFiles || []).map((f) => ({
    path: f.path.replace(/^shopflow-demo\//, ''),
    fullPath: f.path,
    type: 'Directly Affected',
    impact: 'High',
    reason: f.reason,
  }))

  const indirectlyAffected = (bobData.impact?.indirectlyAffectedFiles || []).map((f) => ({
    path: f.path.replace(/^shopflow-demo\//, ''),
    fullPath: f.path,
    type: 'Indirectly Affected',
    impact: f.path.includes('tests/') ? 'High' : 'Medium',
    reason: f.reason,
  }))

  const affectedModules = (bobData.impact?.affectedModules || []).map((m) => ({
    name: m.name,
    impact: m.impact,
    reason: m.reason,
  }))

  const affectedAPIs = (bobData.impact?.affectedAPIs || []).map((a) => ({
    method: a.method,
    path: a.path,
    impact: a.impact,
    reason: a.reason,
  }))

  const directCount = directlyAffected.length
  const indirectCount = indirectlyAffected.length
  const totalCount = directCount + indirectCount

  const directModulesCount = affectedModules.filter((m) => m.impact === 'DIRECT').length
  const indirectModulesCount = affectedModules.filter((m) => m.impact === 'INDIRECT').length

  const directAPIsCount = affectedAPIs.filter((a) => a.impact === 'DIRECT').length
  const indirectAPIsCount = affectedAPIs.filter((a) => a.impact === 'INDIRECT').length

  // Flattened files list for table components: [file, type, impact, reason]
  const filesList = [
    ...directlyAffected.map((f) => [f.path, 'Directly Affected', 'High', f.reason]),
    ...indirectlyAffected.map((f) => [f.path, 'Indirectly Affected', f.impact, f.reason]),
  ]

  // Risks transformation
  const risks = (bobData.risks || []).map((r) => {
    const isHigh = r.severity === 'HIGH'
    const isMedium = r.severity === 'MEDIUM'
    return {
      id: r.id,
      title: r.title,
      severity: isHigh ? 'High' : isMedium ? 'Medium' : 'Low',
      status: isHigh ? 'High' : isMedium ? 'Medium' : 'Low',
      score: isHigh ? 88 : isMedium ? 65 : 45,
      tone: isHigh ? 'red' : isMedium ? 'amber' : 'blue',
      area: r.area,
      affectedArea: r.area,
      description: r.description,
      mitigation: r.mitigation,
    }
  })

  // Recommended tests transformation
  const tests = (bobData.recommendedTests || []).map((t, idx) => ({
    id: `test-${idx + 1}`,
    name: t.name,
    type: t.testFile.includes('integration')
      ? 'Integration Test'
      : t.testFile.includes('auth')
      ? 'Unit / Integration Test'
      : t.testFile.includes('products')
      ? 'Regression Test'
      : 'E2E Test',
    priority: t.priority === 'HIGH' ? 'P0' : 'P1',
    component: t.testFile,
    affectedArea: t.testFile,
    status: 'Not verified',
    reason: t.reason,
    testFile: t.testFile,
  }))

  const readiness = bobData.releaseReadiness || {}

  const canonicalResult = {
    id: `bob-impact-shopflow-${bobData.change?.id?.toLowerCase() || 'scn-001'}`,
    repository: repoName,
    repositoryId: 'shopflow',
    branch,
    technology: ['Node.js', 'Express', 'JavaScript', 'SQLite'],
    analysisSource: 'IBM Bob',
    generatedBy: bobData.generatedBy || 'IBM Bob',
    note: bobData.note,

    changeDescription: bobData.change?.description || input.changeDescription,
    changeSummary: bobData.change?.description || input.changeDescription,
    changeTitle: bobData.change?.title || 'Replace JWT authentication with OAuth 2.0',
    change: bobData.change?.description || input.changeDescription,
    scenarioId: bobData.change?.id || 'SCN-001',
    scenarioTitle: bobData.change?.title || 'Replace JWT authentication with OAuth 2.0',

    timestamp: analyzedAt,
    overallRisk: 'High',
    readinessStatus: readiness.status === 'REVIEW_NEEDED' ? 'REVIEW NEEDED' : readiness.status || 'REVIEW NEEDED',
    verificationStatus: `0/${tests.length} verified (Not yet executed)`,

    summary: [
      ['Directly Affected Files', `${directCount}`, 'Code rewrite / replacement required'],
      ['Indirectly Affected Files', `${indirectCount}`, 'Downstream routes, models, schema & tests'],
      ['Affected Modules', `${affectedModules.filter((m) => m.impact !== 'NONE').length}`, `${directModulesCount} Direct, ${indirectModulesCount} Indirect`],
      ['Affected API Endpoints', `${affectedAPIs.filter((a) => a.impact !== 'NONE').length}`, `${directAPIsCount} Direct, ${indirectAPIsCount} Indirect`],
      ['Tests Recommended', `${tests.length}`, '12 High priority, 1 Medium priority'],
    ],

    impact: {
      level: 'High',
      summary: [
        ['Directly Affected Files', `${directCount}`, 'Code rewrite / replacement required'],
        ['Indirectly Affected Files', `${indirectCount}`, 'Downstream routes, models, schema & tests'],
        ['Affected Modules', `${affectedModules.filter((m) => m.impact !== 'NONE').length}`, `${directModulesCount} Direct, ${indirectModulesCount} Indirect`],
        ['Affected API Endpoints', `${affectedAPIs.filter((a) => a.impact !== 'NONE').length}`, `${directAPIsCount} Direct, ${indirectAPIsCount} Indirect`],
        ['Tests Recommended', `${tests.length}`, '12 High priority, 1 Medium priority'],
      ],
      directlyAffectedFiles: directlyAffected,
      indirectlyAffectedFiles: indirectlyAffected,
      affectedModules,
      affectedAPIs,
      nodes: [
        { label: 'Proposed Change', value: bobData.change?.title || 'OAuth 2.0 Migration', tone: 'cyan', category: 'change' },
        { label: 'Direct Code Rewrite', value: `${directCount} Auth Files`, tone: 'blue', category: 'direct' },
        { label: 'Affected Modules', value: `${affectedModules.filter((m) => m.impact !== 'NONE').map((m) => m.name).join(' · ')}`, tone: 'amber', category: 'module' },
        { label: 'Downstream Protected APIs', value: `${indirectAPIsCount} Protected Endpoints`, tone: 'amber', category: 'api' },
        { label: 'Recommended Test Suites', value: `${tests.length} Tests across test harness`, tone: 'green', last: true, category: 'test' },
      ],
      dependencyLayers: [
        {
          level: 'Level 1',
          badgeTone: 'cyan',
          title: 'Directly Affected Authentication Files',
          subtitle: `${directCount} files containing JWT logic, route endpoints & env config requiring complete rewrite`,
          items: directlyAffected.map((f) => ({
            name: f.path,
            detail: f.reason,
            impact: 'DIRECT',
          })),
        },
        {
          level: 'Level 2',
          badgeTone: 'blue',
          title: 'Affected Domain Modules & Database Schema',
          subtitle: `${affectedModules.filter((m) => m.impact !== 'NONE').length} application modules impacted by auth identity contract changes`,
          items: affectedModules.map((m) => ({
            name: m.name,
            detail: m.reason,
            impact: m.impact,
          })),
        },
        {
          level: 'Level 3',
          badgeTone: 'amber',
          title: 'Indirectly Affected Downstream Files & Protected APIs',
          subtitle: `${indirectCount} files & ${indirectAPIsCount} API endpoints relying on request.user identity contract`,
          items: indirectlyAffected.map((f) => ({
            name: f.path,
            detail: f.reason,
            impact: 'INDIRECT',
          })),
        },
        {
          level: 'Level 4',
          badgeTone: 'green',
          title: 'Recommended Test Suite Validation',
          subtitle: `${tests.length} recommended test cases to validate auth transition without regressions`,
          items: tests.map((t) => ({
            name: t.name,
            detail: `${t.priority === 'P0' ? 'HIGH Priority' : 'MEDIUM Priority'} (${t.testFile}): ${t.reason}`,
            impact: t.priority,
          })),
        },
      ],
    },

    files: filesList,
    risks,
    tests,

    releaseReadiness: {
      status: readiness.status === 'REVIEW_NEEDED' ? 'REVIEW NEEDED' : readiness.status || 'REVIEW NEEDED',
      summary: readiness.reason,
      summaryText: readiness.reason,
      executionStatus: 'Not yet verified',
      verifiedCount: 0,
      totalTestsCount: tests.length,
      blockers: readiness.blockers || [],
      recommendedActions: readiness.recommendedActions || [],
    },

    metadata: {
      analyzedAt,
      analysisSource: 'IBM Bob',
      generatedBy: bobData.generatedBy,
      note: bobData.note,
      duration: '0.4s (IBM Bob Analysis Artifact)',
      pullRequest: input.pullRequest || undefined,
      commit: input.commit || undefined,
      context: input.context || undefined,
    },
  }

  return canonicalResult
}

/**
 * Async provider function for IBM Bob analysis
 * @param {Object} input
 * @returns {Promise<Object>}
 */
export async function generateBobAnalysis(input = {}) {
  // Simulate network dispatch (~0.5s for crisp response)
  await new Promise((resolve) => setTimeout(resolve, 500))
  return transformBobAnalysis(input)
}
