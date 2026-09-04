import { parseJwt } from '@/core/plugins/parseJwt';

export const ALERT_SEVERITY = {
  CRITICAL: 'Critical',
  WARNING: 'Warning',
  INFO: 'Info',
};

export const ALERT_SEVERITIES = [
  ALERT_SEVERITY.CRITICAL,
  ALERT_SEVERITY.WARNING,
  ALERT_SEVERITY.INFO,
];

// Severities prominent enough to interrupt the user with the banner.
export const BANNER_SEVERITIES = [ALERT_SEVERITY.CRITICAL, ALERT_SEVERITY.WARNING];

const ALERT_ALLOWED_ROLES = ['Super Admin', 'Nurse'];
const ALERT_ALLOWED_DEPARTMENTS = ['Administrator', 'Medical Practitioners'];

/**
 * Read the current user from the stored token without throwing when
 * the token is absent or malformed. Alert surfaces render globally,
 * so they must degrade quietly rather than break the page.
 *
 * @returns {object|null} the decoded token payload, or null
 */
export function getCurrentUser() {
  const token = localStorage.getItem('user_token');
  if (!token) return null;

  try {
    return parseJwt(token);
  } catch (error) {
    return null;
  }
}

/**
 * Whether a user may create patient alerts.
 *
 * Nurses/admins are matched on role, clinicians on department, mirroring
 * the existing nurseAllowedTabs/doctorAllowedTabs gates. Department is used
 * for clinicians because that group holds ~20 specialty roles, and any new
 * specialty should inherit the permission automatically.
 *
 * @param user decoded token payload
 * @returns {boolean}
 */
export function canCreateAlerts(user = getCurrentUser()) {
  if (!user) return false;

  return (
    ALERT_ALLOWED_ROLES.includes(user.role) || ALERT_ALLOWED_DEPARTMENTS.includes(user.department)
  );
}

/**
 * Highest severity present in a list of alerts.
 *
 * @param alerts
 * @returns {string|null}
 */
export function highestSeverity(alerts = []) {
  return (
    ALERT_SEVERITIES.find((severity) => alerts.some((alert) => alert.severity === severity)) || null
  );
}
