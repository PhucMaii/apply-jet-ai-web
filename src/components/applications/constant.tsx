import { CheckIcon, UsersIcon } from "lucide-react";

export const SUBTITLE_RECRUITER_EMAILS = {
    "false": {
        icon: <UsersIcon className="text-blue-800 size-4" />,
        title: "Don't just apply! Connect with HR",
        description: "Many roles get filled before a recruiter ever reads every application. A brief, professional note to the right person can make yours stand out. Find the recruiting contacts for this company so you're ready to follow up.",
    },
    "true": {
        icon: <CheckIcon className="text-emerald-500 size-4" />,
        title: "You've got the contacts. Here's what to do next",
        description: "Pick the most relevant person, usually a recruiter or HR contact tied to the team you're applying to. Send a short, polite note mentioning the role you applied for and your enthusiasm for the position. Keep it brief: a few sentences is plenty. Avoid reaching out to multiple people at once."
    }
}