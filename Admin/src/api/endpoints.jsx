/**
 * API Endpoint Constants
 * All API endpoints defined in one place for easy maintenance.
 */

const V1 = "/api/v1";

export const ENDPOINTS = {
    AUTH: {
        COMPANY_LOGIN:   `${V1}/auth/company/login`,
        EMPLOYEE_LOGIN:  `${V1}/auth/employee/login`,
        ME:              `${V1}/auth/me`,
        LOGOUT:          `${V1}/auth/logout`,
        OTP_SEND:        `${V1}/auth/otp/send`,
        OTP_VERIFY:      `${V1}/auth/otp/verify`,
        PASSWORD_RESET:  `${V1}/auth/password/reset`,
        VERIFY_SESSION:  `${V1}/auth/verify-session`,
    },

    COMPANIES: {
        BASE:  `${V1}/companies`,
        ME:    `${V1}/companies/getCompanyDetails`,
        BY_ID: (id) => `${V1}/companies/${id}`,
    },

    DEPARTMENTS: {
        BASE:   `${V1}/departments`,
        BY_ID:  (id) => `${V1}/departments/${id}`,
        SEARCH: `${V1}/departments/search`,
    },

    EMPLOYEES: {
        BASE:           `${V1}/employees`,
        BY_ID:          (id) => `${V1}/employees/${id}`,
        SEARCH:         `${V1}/employees/search`,
        RESET_PASSWORD: (id) => `${V1}/employees/${id}/reset-password`,
    },

    COUNTRIES: {
        BASE:   `${V1}/countries`,
        BY_ID:  (id) => `${V1}/countries/${id}`,
        SEARCH: `${V1}/countries/search`,
        STATES: (countryId) => `${V1}/countries/${countryId}/states`,
    },

    STATES: {
        BASE:   `${V1}/states`,
        BY_ID:  (id) => `${V1}/states/${id}`,
        SEARCH: `${V1}/states/search`,
        CITIES: (stateId) => `${V1}/states/${stateId}/cities`,
    },

    CITIES: {
        BASE:   `${V1}/cities`,
        BY_ID:  (id) => `${V1}/cities/${id}`,
        SEARCH: `${V1}/cities/search`,
    },

    LOCATIONS: {
        BASE: `${V1}/locations`,
    },

    MENU_GROUPS: {
        BASE:   `${V1}/menu-groups`,
        BY_ID:  (id) => `${V1}/menu-groups/${id}`,
        SEARCH: `${V1}/menu-groups/search`,
    },

    MENUS: {
        BASE:      `${V1}/menus`,
        BY_ID:     (id) => `${V1}/menus/${id}`,
        SEARCH:    `${V1}/menus/search`,
        BY_GROUPS: `${V1}/menus/by-groups`,
    },

    ROLES: {
        BASE:   `${V1}/roles`,
        BY_ID:  (id) => `${V1}/roles/${id}`,
        SEARCH: `${V1}/roles/search`,
    },

    EMAIL_SETUPS: {
        BASE:   `${V1}/email-setups`,
        BY_ID:  (id) => `${V1}/email-setups/${id}`,
        SEARCH: `${V1}/email-setups/search`,
    },

    EMAIL_FOR: {
        BASE:   `${V1}/email-for`,
        BY_ID:  (id) => `${V1}/email-for/${id}`,
        SEARCH: `${V1}/email-for/search`,
    },

    EMAIL_TEMPLATES: {
        BASE:             `${V1}/email-templates`,
        BY_ID:            (id) => `${V1}/email-templates/${id}`,
        SEARCH:           `${V1}/email-templates/search`,
        UPLOAD_SIGNATURE: `${V1}/email-templates/upload-signature`,
    },

    EMPLOYEE_ROLES: {
        BASE:  `${V1}/employee-roles`,
        BY_ID: (id) => `${V1}/employee-roles/${id}`,
    },

    MASTER_DATA: {
        BASE:    `${V1}/master-data`,
        BY_ID:   (id) => `${V1}/master-data/${id}`,
        GROUPED: `${V1}/master-data/grouped`,
        REORDER: `${V1}/master-data/reorder`,
    },

    ANALYTICS: {
        DASHBOARD:             `${V1}/analytics/dashboard`,
        REPORT_FEE_COLLECTION: `${V1}/analytics/reports/fee-collection`,
        // TODO Phase 1: Add recruitment analytics endpoints:
        // REPORT_APPLICATIONS: `${V1}/analytics/reports/applications`,
        // REPORT_CANDIDATES:   `${V1}/analytics/reports/candidates`,
        // REPORT_CALL_LETTERS: `${V1}/analytics/reports/call-letters`,
    },

    WHATSAPP: {
        CONFIG:          `${V1}/whatsapp/config`,
        CONFIG_TEST:     `${V1}/whatsapp/config/test`,
        MESSAGES_SEARCH: `${V1}/whatsapp/messages/search`,
        MESSAGES_STATS:  `${V1}/whatsapp/messages/stats`,
        SEND:            `${V1}/whatsapp/send`,
        BROADCAST:       `${V1}/whatsapp/broadcast`,
        RETRY:           `${V1}/whatsapp/retry`,
    },

    // ── Recruitment Portal ────────────────────────────────────────────────────
    ADVERTISEMENTS: {
        BASE:       `${V1}/advertisements`,
        BY_ID:      (id) => `${V1}/advertisements/${id}`,
        SEARCH:     `${V1}/advertisements/search`,
        PUBLISH:    (id) => `${V1}/advertisements/${id}/publish`,
        CLOSE:      (id) => `${V1}/advertisements/${id}/close`,
        ARCHIVE:    (id) => `${V1}/advertisements/${id}/archive`,
        UPLOAD_PDF: (id) => `${V1}/advertisements/${id}/pdf`,
        BULK_ZIP:   `${V1}/advertisements/bulk-export/zip`,
    },

    CANDIDATES: {
        SEARCH: `${V1}/candidates/search`,
        BY_ID:  (id) => `${V1}/candidates/${id}`,
        STATUS: (id) => `${V1}/candidates/${id}/status`,
        EXPORT: `${V1}/candidates/export`,
    },

    APPLICATIONS: {
        SEARCH: `${V1}/applications/search`,
        BY_ID:  (id) => `${V1}/applications/${id}`,
        STATUS: (id) => `${V1}/applications/${id}/status`,
    },

    FEE_PAYMENTS: {
        SEARCH:         `${V1}/fee-payments/search`,
        BY_ID:          (id) => `${V1}/fee-payments/${id}`,
        RECONCILIATION: `${V1}/fee-payments/reconciliation`,
        VERIFY:         (id) => `${V1}/fee-payments/${id}/verify`,
    },

    CALL_LETTERS: {
        SEARCH:       `${V1}/call-letters/search`,
        BY_ID:        (id) => `${V1}/call-letters/${id}`,
        UPDATE:       (id) => `${V1}/call-letters/${id}`,
        ROLL_NUMBERS: (advtNo) => `${V1}/call-letters/${advtNo}/roll-numbers`,
    },

    NOTICES: {
        BASE:       `${V1}/notices`,
        BY_ID:      (id) => `${V1}/notices/${id}`,
        SEARCH:     `${V1}/notices/search`,
        PUBLISH:    (id) => `${V1}/notices/${id}/publish`,
        UPLOAD_PDF: (id) => `${V1}/notices/${id}/pdf`,
    },

    HELP_QUERIES: {
        SEARCH: `${V1}/help/queries/search`,
        STATUS: (id) => `${V1}/help/queries/${id}/status`,
    },

    CONFIG: {
        BY_KEY: (key) => `${V1}/config/${key}`,
    },

    EMPLOYEES_2FA: {
        SETUP:  `${V1}/auth/2fa/setup`,
        ENABLE: `${V1}/auth/2fa/enable`,
    },
};

export default ENDPOINTS;
