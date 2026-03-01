const DAY_IN_MS = 24 * 60 * 60 * 1000

export function getComplianceDueState(record, now = new Date()) {
  if (!record?.due_date || !record?.last_submitted_at) {
    return 'info'
  }

  const dueDate = new Date(record.due_date)

  if (Number.isNaN(dueDate.getTime())) {
    return 'info'
  }

  const timeUntilDue = dueDate.getTime() - now.getTime()

  if (timeUntilDue < 0) {
    return 'critical'
  }

  if (timeUntilDue <= 7 * DAY_IN_MS) {
    return 'warning'
  }

  return 'clear'
}

export function computeComplianceSummary(records, now = new Date()) {
  return records.reduce(
    (summary, record) => {
      const dueState = getComplianceDueState(record, now)
      summary[dueState] += 1
      return summary
    },
    {
      critical: 0,
      warning: 0,
      clear: 0,
      info: 0,
    }
  )
}
