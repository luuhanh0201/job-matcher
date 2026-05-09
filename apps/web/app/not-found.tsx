import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-(--gray-100) p-4">
      <div className="w-full max-w-md rounded-2xl border border-(--gray-200) bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-(--gray-500)">404</p>
        <h1 className="mt-2 text-2xl font-black text-(--gray-900)">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm text-(--gray-500)">
          Đường dẫn bạn vừa truy cập không tồn tại hoặc đã được thay đổi.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-(--primary-blue) px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-(--blue-dark)"
        >
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
