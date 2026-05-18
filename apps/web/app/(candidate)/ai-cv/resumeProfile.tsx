import { ParsedCvForm } from "@/types/cv";
import { useMemo } from "react";

function ResumeProfile({ form }: { form: ParsedCvForm }) {
    function extractSkillTags(skills?: string | string[]) {
        if (!skills) return [];

        let raw = "";

        if (Array.isArray(skills)) {
            raw = skills.join(",");
        } else {
            raw = skills;
        }

        const tags = raw
            .replace(/\n/g, ",")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .filter((item) => item.length > 1);

        return Array.from(new Set(tags)).slice(0, 8);
    }

    const skillTags = useMemo(
        () => extractSkillTags(form.skills),
        [form.skills]
    );
    return (
        <div className="rounded-2xl border border-(--gray-200) bg-white p-4">
            <p className="mb-3 text-lg font-bold text-(--gray-900)">Hồ sơ CV</p>

            <div className="mb-3 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-(--accent-purple)/15 text-lg font-black text-(--accent-purple)">
                    {(form.candidateName || "CV")
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((p) => p[0]?.toUpperCase() || "")
                        .join("") || "CV"}
                </div>
                <div>
                    <p className="font-black text-(--gray-900)">
                        {form.candidateName || "Chưa có thông tin ứng viên"}
                    </p>
                    <p className="text-sm text-(--gray-500)">
                        Vị trí gợi ý: {form.currentTitle || "Chưa xác định"}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {skillTags.length > 0 ? (
                    skillTags.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full bg-(--blue-light) px-3 py-1 text-xs font-bold text-(--primary-blue)"
                        >
                            {tag}
                        </span>
                    ))
                ) : (
                    <span className="text-sm text-(--gray-500)">Chưa có kỹ năng. Hãy upload CV và phân tích.</span>
                )}
            </div>
        </div>
    );
}

export default ResumeProfile;