import PdfPreview from "@/components/PdfPreview";
import { ParsedCvForm } from "@/types/cv";

function ResumeProfile({ form }: { form: ParsedCvForm }) {

  return (
    <div className="border border-border bg-card p-4 rounded-2xl">
      <p className="mb-3 text-lg font-bold text-foreground">
        Hồ sơ CV
      </p>

      {
        form.fileUrl ? (
          <PdfPreview pdfUrl={form.fileUrl} />
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Không có hồ sơ CV nào được tải lên.
          </p>
        )
      }
    </div>
  );
}

export default ResumeProfile;