const DEVICE_ID_KEY = 'job-matcher-device-id';

export function getOrCreateDeviceId(): string {
    if (typeof window === 'undefined') {
        return 'server-device';
    }

    const existing = window.localStorage.getItem(DEVICE_ID_KEY);
    if (existing && existing.trim().length > 0) {
        return existing;
    }

    const generated =
        typeof window.crypto?.randomUUID === 'function'
            ? window.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    window.localStorage.setItem(DEVICE_ID_KEY, generated);
    return generated;
}
