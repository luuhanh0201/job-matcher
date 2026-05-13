import { ParsedCvForm } from "@/types/cv";

function AiResultCard({ form }: { form: ParsedCvForm }) {

    const summaryText =
        form.currentTitle || form.skills || form.workExperience
            ? `Bạn có nền tảng ${form.currentTitle || "đang phát triển"}. Hãy rà soát kỹ kỹ năng và kinh nghiệm để hệ thống match việc làm chính xác hơn.`
            : "Tải CV lên để AI phân tích kỹ năng, kinh nghiệm và gợi ý công việc phù hợp.";
    return (
        <div className="rounded-2xl border border-(--gray-200) bg-white p-4">
            <p className="mb-2 text-lg font-bold text-(--gray-900)">Tóm tắt AI</p>
            <p className="text-sm text-(--gray-500)">{summaryText}</p>

            <div className="mt-3 flex flex-wrap gap-2">
                {form.skills ? (
                    <span className="rounded-full bg-(--accent-green)/15 px-3 py-1 text-xs font-bold text-(--accent-green)">
                        Đã trích xuất kỹ năng
                    </span>
                ) : null}
                {form.workExperience ? (
                    <span className="rounded-full bg-(--accent-green)/15 px-3 py-1 text-xs font-bold text-(--accent-green)">
                        Có kinh nghiệm
                    </span>
                ) : null}
                {!form.totalExperienceYears ? (
                    <span className="rounded-full bg-(--accent-orange)/15 px-3 py-1 text-xs font-bold text-(--accent-orange)">
                        Thiếu tổng số năm kinh nghiệm
                    </span>
                ) : null}
            </div>
        </div>
    );
}

export default AiResultCard;