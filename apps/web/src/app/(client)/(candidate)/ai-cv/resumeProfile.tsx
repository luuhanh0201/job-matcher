import PdfPreview from "@/components/PdfPreview";
import { FileText } from "lucide-react";
import { ParsedCvForm, CvRecord } from "@/types/cv";

function formatUploadTime(iso?: string) {
  if (!iso) return "Không rõ thời gian";
  return new Date(iso).toLocaleString("vi-VN");
}

function ResumeProfile({
  form,
  cvs,
  selectedCvId,
  onSelectCv,
}: {
  form: ParsedCvForm;
  cvs: CvRecord[];
  selectedCvId: string;
  onSelectCv: (cv: CvRecord) => void;
}) {
  const selectedCv =
    cvs.find((cv) => cv.id === selectedCvId) ?? cvs.find((cv) => cv.fileUrl);
  const previewUrl = form.fileUrl || selectedCv?.fileUrl;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-bold text-foreground">Hồ sơ CV</p>
        {cvs.length > 0 ? (
          <p className="text-xs font-medium text-muted-foreground">
            {cvs.length} CV đã upload
          </p>
        ) : null}
      </div>

      {cvs.length > 0 ? (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {cvs.map((cv) => {
            const isSelected = cv.id === selectedCv?.id;

            return (
              <button
                key={cv.id}
                type="button"
                onClick={() => onSelectCv(cv)}
                className={`min-w-56 rounded-xl border px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {cv.fileName ?? "CV đã upload"}
                    </p>
                    <p className="text-xs">{formatUploadTime(cv.createdAt)}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {previewUrl ? (
        <PdfPreview pdfUrl={previewUrl} />
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Không có hồ sơ CV nào được tải lên.
        </p>
      )}
    </div>
  );
}

export default ResumeProfile;
