import PdfPreview from "@/components/PdfPreview";
import { ParsedCvForm } from "@/types/cv";

function ResumeProfile({ form }: { form: ParsedCvForm }) {

  return (
    <div className="border border-(--gray-200) bg-white p-4 rounded-2xl">
      <p className="mb-3 text-lg font-bold text-(--gray-900)">
        Hồ sơ CV
      </p>

      {
        form.fileUrl ? (
          <PdfPreview pdfUrl={form.fileUrl} />
        ) : (
          <p className="text-center text-sm text-(--gray-500)">
            Không có hồ sơ CV nào được tải lên.
          </p>
        )
      }
    </div>
  );
}

export default ResumeProfile;