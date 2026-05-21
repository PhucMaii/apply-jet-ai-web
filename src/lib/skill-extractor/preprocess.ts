/**
 * Preprocess job description text: normalize whitespace, preserve technical tokens.
 */
/** Tokens to preserve as single units (no space strip inside). */
const PRESERVE_PATTERNS = [
    /\bC\+\+/gi,
    /\bC#/g,
    /\.NET\b/gi,
    /\bNode\.js\b/gi,
    /\bNext\.js\b/gi,
    /\bReact\.js\b/gi,
    /\bCI\/CD\b/gi,
    /\bNoSQL\b/gi,
    /\bGraphQL\b/gi,
    /\bREST\b/gi,
    /\bAPI\b/gi,
    /\bAPIs\b/gi,
    /\bK8s\b/gi,
    /\bSaaS\b/gi,
    /\bE2E\b/gi,
    /\bPostgreSQL\b/gi,
    /\bTypeScript\b/gi,
    /\bJavaScript\b/gi,
    /\bGitHub\b/gi,
    /\bend-to-end\b/gi,
    /\bproblem-solving\b/gi,
    /\bcross-functional\b/gi
];
const PLACEHOLDER = "\uFFFF";
const placeholders: string[] = [];
function replacePreserve(text: string) {
    let out = text;
    placeholders.length = 0;
    for (const re of PRESERVE_PATTERNS) {
        out = out.replace(re, (match: string) => {
            placeholders.push(match);
            return PLACEHOLDER.repeat(placeholders.length);
        });
    }
    return out;
}
function restorePreserve(text: string) {
    let out = text;
    for (let i = placeholders.length - 1; i >= 0; i--) {
        out = out.replace(PLACEHOLDER.repeat(i + 1), placeholders[i]);
    }
    return out;
}
/**
 * Clean and normalize job description text for extraction.
 * Preserves technical terms (C++, Node.js, etc.) and normalizes whitespace.
 */
export function preprocessJobDescription(text: string) {
    if (!text || typeof text !== "string")
        return "";
    let out = replacePreserve(text);
    out = out.replace(/\s+/g, " ");
    out = out.replace(/\s*([.,;:!?])\s*/g, "$1 ");
    out = out.trim();
    return restorePreserve(out);
}