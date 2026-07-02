import { Button } from "@/components/ui/button";
import { type AnalyzerResult, type ParsedCvForm } from "@/types/cv";
import { CircleDashed, Sparkles, Star, ThumbsDown, ThumbsUp } from "lucide-react";

type AiResultCardProps = {
    form: ParsedCvForm;
    hasParsedData: boolean;
    analyzerResult: AnalyzerResult | null;
    onAnalyze: () => void;
    loading: boolean;
};

function AiResultCard({ form, hasParsedData, analyzerResult, onAnalyze, loading }: AiResultCardProps) {
    const scoreColor = (score: number) => {
        if (score >= 8) return "text-success";
        if (score >= 6) return "text-primary";
        if (score >= 4) return "text-warning";
        return "text-red-500";
    };

    const scoreLabel = (score: number) => {
        if (score >= 8) return "Xuất sắc";
        if (score >= 6) return "Tốt";
        if (score >= 4) return "Trung bình";
        return "Cần cải thiện";
    };

    if (!analyzerResult) {
        const summaryText =
            form.currentTitle || form.skills || form.workExperience
                ? `Bạn có nền tảng ${form.currentTitle || "đang phát triển"}. Hãy rà soát kỹ kỹ năng và kinh nghiệm để hệ thống match việc làm chính xác hơn.`
                : "Tải CV lên để AI phân tích kỹ năng, kinh nghiệm và gợi ý công việc phù hợp.";
        return (
            <div className="rounded-2xl border border-border bg-card p-4">
                <p className="mb-2 text-lg font-bold text-foreground">Tóm tắt AI</p>
                <p className="text-sm text-muted-foreground">{summaryText}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                    {hasParsedData ? (
                        <Button
                            onClick={onAnalyze}
                            disabled={loading}
                            className="w-full cursor-pointer rounded-full bg-accent px-5 text-accent-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                        >
                            {loading ? (
                                <>
                                    <CircleDashed className="mr-1.5 h-4 w-4 animate-spin" /> Đang phân tích...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-1.5 h-4 w-4" /> Phân tích CV
                                </>
                            )}
                        </Button>
                    ) : null}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-foreground">Kết quả phân tích AI</p>
                <div className="flex items-center gap-2">
                    <Star className={`h-5 w-5 ${scoreColor(analyzerResult.overall_score)}`} />
                    <span className={`text-2xl font-black ${scoreColor(analyzerResult.overall_score)}`}>
                        {analyzerResult.overall_score}/10
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {scoreLabel(analyzerResult.overall_score)}
                    </span>
                </div>
            </div>

            <div className="rounded-xl bg-muted p-3">
                <p className="text-sm text-foreground leading-relaxed">{analyzerResult.summary}</p>
            </div>

            <div className="space-y-3">
                {analyzerResult.strengths.length > 0 && (
                    <div>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-success">
                            <ThumbsUp className="h-4 w-4" /> Điểm mạnh
                        </h4>
                        <ul className="space-y-1">
                            {analyzerResult.strengths.map((item, i) => (
                                <li key={i} className="text-sm text-foreground before:mr-2 before:content-['•']">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {analyzerResult.weaknesses.length > 0 && (
                    <div>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-warning">
                            <ThumbsDown className="h-4 w-4" /> Điểm cần cải thiện
                        </h4>
                        <ul className="space-y-1">
                            {analyzerResult.weaknesses.map((item, i) => (
                                <li key={i} className="text-sm text-foreground before:mr-2 before:content-['•']">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {analyzerResult.recommended_roles.length > 0 && (
                <div>
                    <h4 className="mb-2 text-sm font-bold text-foreground">Vị trí phù hợp</h4>
                    <div className="space-y-2">
                        {analyzerResult.recommended_roles.map((role, i) => (
                            <div key={i} className="rounded-xl border border-border p-3">
                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-foreground">{role.role}</p>
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                        {role.level}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{role.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AiResultCard;
