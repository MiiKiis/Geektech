type VariantInput = {
    label?: unknown;
    value?: unknown;
    extraTitle?: unknown;
    extra_title?: unknown;
};

function sanitizeVariantValue(value: unknown) {
    return String(value ?? '').trim();
}

export function normalizeVariantsPayload(raw: unknown) {
    if (typeof raw !== 'string' || raw.trim().length === 0) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as VariantInput[];
        if (!Array.isArray(parsed)) {
            return null;
        }

        const normalized = parsed
            .map((variant) => ({
                label: sanitizeVariantValue(variant?.label),
                value: sanitizeVariantValue(variant?.value),
                extraTitle: sanitizeVariantValue(variant?.extraTitle ?? variant?.extra_title),
            }))
            .filter((variant) => variant.label.length > 0 && variant.value.length > 0);

        return normalized.length > 0
            ? JSON.stringify(normalized.map((variant) => ({
                label: variant.label,
                value: variant.value,
                ...(variant.extraTitle.length > 0 ? { extraTitle: variant.extraTitle } : {}),
            })))
            : null;
    } catch {
        return null;
    }
}

export function normalizeImagesPayload(raw: unknown) {
    if (!Array.isArray(raw)) {
        return '[]';
    }

    const normalized = raw
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

    return JSON.stringify(normalized);
}

export function normalizeNumericPrice(raw: unknown) {
    if (raw === null || raw === undefined || raw === '') {
        return null;
    }

    const parsed = Number.parseFloat(String(raw).trim());
    return Number.isNaN(parsed) ? null : parsed;
}

export function normalizePosition(raw: unknown) {
    const parsed = Number.parseInt(String(raw ?? ''), 10);
    return Number.isNaN(parsed) ? null : parsed;
}