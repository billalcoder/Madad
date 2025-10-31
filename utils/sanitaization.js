import xss from "xss";

export function sanitizeObject(obj) {
    const cleanObj = {};
    for (const key in obj) {
        const value = obj[key];
        cleanObj[key] = typeof value === "string" ? xss(value) : value;
    }
    return cleanObj;
}