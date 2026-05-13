import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveParsedCv } from "@/services/cv.service";
import { EducationItem, WorkExperienceItem } from "@/types/ai-cv";
import { ParsedCvForm } from "@/types/cv";
import { CircleDashed } from "lucide-react";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

type FormConfirmCvComponentProps = {
    cvId: string;
    form: ParsedCvForm;
    setForm: Dispatch<SetStateAction<ParsedCvForm>>;
};

export const DEFAULT_FORM: ParsedCvForm = {
    candidateName: "",
    email: "",
    phone: "",
    totalExperienceYears: "",
    currentTitle: "",
    skills: "",
    education: "",
    workExperience: "",
    certifications: "",
    languages: "",
};

function FormConfirmCvComponent({ cvId, form, setForm }: FormConfirmCvComponentProps) {
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const canSave = useMemo(() => Boolean(cvId.trim()), [cvId]);
    const setField = (key: keyof ParsedCvForm, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };
    const upsertEducationItem = (
        index: number,
        key: keyof EducationItem,
        value: string,
    ) => {
        const next = [...educationItems];
        const current = next[index] ?? { school: "", degree: "", major: "", time: "" };
        next[index] = { ...current, [key]: value };
        setField("education", toEducationText(next));
    };

    function parseEducationText(value?: string): EducationItem[] {
        if (!value?.trim()) {
            return [];
        }

        return value
            .split("\n")
            .map((line) => line.split("|").map((part) => part.trim()))
            .map(([school = "", degree = "", major = "", time = ""]) => ({
                school,
                degree,
                major,
                time,
            }))
            .filter((item) => item.school || item.degree || item.major || item.time);
    }

    function parseWorkExperienceText(value?: string): WorkExperienceItem[] {
        if (!value?.trim()) {
            return [];
        }

        return value
            .split("\n")
            .map((line) => line.split("|").map((part) => part.trim()))
            .map(([company = "", position = "", time = "", description = ""]) => ({
                company,
                position,
                time,
                description,
            }))
            .filter((item) => item.company || item.position || item.time || item.description);
    }

    const educationItems = useMemo(() => parseEducationText(form.education), [form.education]);
    const workExperienceItems = useMemo(
        () => parseWorkExperienceText(form.workExperience),
        [form.workExperience],
    );
    const handleSave = async () => {
        if (!cvId) {
            setError("Không tìm thấy Cv của bạn, vui lòng tải lại trang và thử lại.");
            return;
        }

        setSaveLoading(true);
        setError("");

        try {
            await saveParsedCv({ cvId, ...form });
            setMessage("Lưu dữ liệu CV đã chỉnh sửa thành công.");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Không thể lưu dữ liệu CV đã chỉnh sửa.",
            );
        } finally {
            setSaveLoading(false);
        }
    };
    const addEducationItem = () => {
        setField(
            "education",
            toEducationText([...educationItems, { school: "", degree: "", major: "", time: "" }]),
        );
    };

    const removeEducationItem = (index: number) => {
        const next = educationItems.filter((_, itemIndex) => itemIndex !== index);
        setField("education", toEducationText(next));
    };

    const upsertWorkExperienceItem = (
        index: number,
        key: keyof WorkExperienceItem,
        value: string,
    ) => {
        const next = [...workExperienceItems];
        const current = next[index] ?? {
            company: "",
            position: "",
            time: "",
            description: "",
        };
        next[index] = { ...current, [key]: value };
        setField("workExperience", toWorkExperienceText(next));
    };

    const removeWorkExperienceItem = (index: number) => {
        const next = workExperienceItems.filter((_, itemIndex) => itemIndex !== index);
        setField("workExperience", toWorkExperienceText(next));
    };

    const addWorkExperienceItem = () => {
        setField(
            "workExperience",
            toWorkExperienceText([
                ...workExperienceItems,
                { company: "", position: "", time: "", description: "" },
            ]),
        );
    };

    function toEducationText(items: EducationItem[]) {
        return items
            .map((item) => [item.school, item.degree, item.major, item.time].map((part) => part.trim()).join(" | "))
            .filter((line) => line.replace(/\|/g, "").trim().length > 0)
            .join("\n");
    }

    function toWorkExperienceText(items: WorkExperienceItem[]) {
        return items
            .map((item) => [item.company, item.position, item.time, item.description].map((part) => part.trim()).join(" | "))
            .filter((line) => line.replace(/\|/g, "").trim().length > 0)
            .join("\n");
    }

    return (
        <Card className="border border-(--gray-200) bg-white/95">
            <CardHeader>
                <CardTitle className="text-(--gray-900)">Xác nhận lại thông tin</CardTitle>
                <CardDescription>
                    Vui lòng kiểm tra và chỉnh sửa lại thông tin nếu có sai sót.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div className="grid gap-2">
                    <Label htmlFor="candidateName">Tên ứng viên</Label>
                    <Input
                        id="candidateName"
                        value={form.candidateName ?? ""}
                        onChange={(e) => setField("candidateName", e.target.value)}
                    />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={form.email ?? ""}
                            onChange={(e) => setField("email", e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                            id="phone"
                            value={form.phone ?? ""}
                            onChange={(e) => setField("phone", e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="currentTitle">Vị trí</Label>
                        <Input
                            id="currentTitle"
                            value={form.currentTitle ?? ""}
                            onChange={(e) => setField("currentTitle", e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="totalExperienceYears">Tổng số năm kinh nghiệm</Label>
                        <Input
                            id="totalExperienceYears"
                            value={form.totalExperienceYears ?? ""}
                            onChange={(e) => setField("totalExperienceYears", e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="skills">Kỹ năng</Label>
                    <textarea
                        id="skills"
                        className="min-h-22 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        value={form.skills ?? ""}
                        onChange={(e) => setField("skills", e.target.value)}
                    />
                </div>

                <div className="grid gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Label>Học vấn</Label>
                        <Button type="button" variant="outline" onClick={addEducationItem} className="w-full sm:w-auto">
                            Thêm
                        </Button>
                    </div>
                    {educationItems.length === 0 ? (
                        <p className="text-sm text-(--gray-500)">Chưa có dữ liệu học vấn.</p>
                    ) : (
                        educationItems.map((item, index) => (
                            <div key={`education-${index}`} className="grid gap-2 rounded-xl border border-(--gray-200) p-3">
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <Input
                                        placeholder="School"
                                        value={item.school}
                                        onChange={(e) => upsertEducationItem(index, "school", e.target.value)}
                                    />
                                    <Input
                                        placeholder="Degree"
                                        value={item.degree}
                                        onChange={(e) => upsertEducationItem(index, "degree", e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <Input
                                        placeholder="Major"
                                        value={item.major}
                                        onChange={(e) => upsertEducationItem(index, "major", e.target.value)}
                                    />
                                    <Input
                                        placeholder="Time"
                                        value={item.time}
                                        onChange={(e) => upsertEducationItem(index, "time", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Button type="button" variant="outline" onClick={() => removeEducationItem(index)} className="w-full sm:w-auto">
                                        Xóa
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="grid gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Label>Kinh nghiệm làm việc</Label>
                        <Button type="button" variant="outline" onClick={addWorkExperienceItem} className="w-full sm:w-auto">
                            Thêm
                        </Button>
                    </div>
                    {workExperienceItems.length === 0 ? (
                        <p className="text-sm text-(--gray-500)">Chưa có dữ liệu.</p>
                    ) : (
                        workExperienceItems.map((item, index) => (
                            <div key={`work-${index}`} className="grid gap-2 rounded-xl border border-(--gray-200) p-3">
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <Input
                                        placeholder="Company"
                                        value={item.company}
                                        onChange={(e) => upsertWorkExperienceItem(index, "company", e.target.value)}
                                    />
                                    <Input
                                        placeholder="Position"
                                        value={item.position}
                                        onChange={(e) => upsertWorkExperienceItem(index, "position", e.target.value)}
                                    />
                                </div>
                                <Input
                                    placeholder="Time"
                                    value={item.time}
                                    onChange={(e) => upsertWorkExperienceItem(index, "time", e.target.value)}
                                />
                                <div>
                                    <Button type="button" variant="outline" onClick={() => removeWorkExperienceItem(index)} className="w-full sm:w-auto">
                                        Xóa
                                    </Button>
                                </div>
                                <textarea
                                    className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => upsertWorkExperienceItem(index, "description", e.target.value)}
                                />
                            </div>
                        ))
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="certifications">Chứng chỉ</Label>
                    <textarea
                        id="certifications"
                        className="min-h-22 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        value={form.certifications ?? ""}
                        onChange={(e) => setField("certifications", e.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="languages">Ngôn ngữ</Label>
                    <textarea
                        id="languages"
                        className="min-h-22 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        value={form.languages ?? ""}
                        onChange={(e) => setField("languages", e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button
                        onClick={handleSave}
                        disabled={!canSave || saveLoading}
                        className="w-full cursor-pointer rounded-full bg-(--primary-blue) px-5 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--blue-dark) active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                    >
                        {saveLoading ? (
                            <>
                                <CircleDashed className="mr-1.5 h-4 w-4 animate-spin" /> Đang lưu...
                            </>
                        ) : (
                            "Xác nhận và lưu"
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setForm(DEFAULT_FORM)}
                        disabled={saveLoading}
                        className="w-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                    >
                        Đặt lại form
                    </Button>
                </div>

                {message ? (
                    <div className="rounded-xl border border-(--accent-green)/30 bg-(--accent-green)/10 px-3 py-2 text-sm text-(--gray-900)">
                        {message}
                    </div>
                ) : null}

                {error ? (
                    <div className="rounded-xl border border-(--accent-orange)/30 bg-(--accent-orange)/10 px-3 py-2 text-sm text-(--gray-900)">
                        {error}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}

export default FormConfirmCvComponent;