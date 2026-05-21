/**
 * Detect sections in job description text and assign weights.
 */
import { SECTION_PATTERNS, DEFAULT_SECTION_WEIGHT } from "@/lib/skill-extractor/constants";
function getLines(text: string) {
    return text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
}

interface Section {
    title: string;
    weight: number;
    startIndex: number;
    endIndex: number;
    contentLines: string[];
}
/**
 * Detect sections by matching line prefixes to known heading patterns.
 */
export function detectSections(text: string) {
    const lines = getLines(text);
    const sections = [];
    let current: Section | null = null;
    function pushSection() {
        if (!current)
            return;
        sections.push({
            title: current.title,
            weight: current.weight,
            startIndex: current.startIndex,
            endIndex: current.startIndex + current.contentLines.length,
            content: current.contentLines.join(" ")
        });
        current = null;
    }
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let isHeading = false;
        for (const { pattern, weight } of SECTION_PATTERNS) {
            const clean = line.replace(/^#+\s*|\s*:+\s*$/g, "").trim();
            if (clean.length < 80 && pattern.test(clean)) {
                pushSection();
                current = { title: clean, weight, startIndex: i, endIndex: i, contentLines: [] };
                isHeading = true;
                break;
            }
        }
        if (!isHeading) {
            if (!current) {
                current = { title: "", weight: DEFAULT_SECTION_WEIGHT, startIndex: i, endIndex: i, contentLines: [] };
            }
            current.contentLines.push(line as string);
        }
    }
    pushSection();
    if (sections.length === 0 && text.trim()) {
        sections.push({
            title: "",
            weight: DEFAULT_SECTION_WEIGHT,
            startIndex: 0,
            endIndex: 0,
            content: text.trim()
        });
    }
    return sections;
}