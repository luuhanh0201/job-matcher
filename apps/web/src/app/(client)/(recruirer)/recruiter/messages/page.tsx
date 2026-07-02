import { SendHorizonal } from "lucide-react";

const chats = [
  { name: "Nguyễn Hoàng Minh", preview: "Em đã cập nhật portfolio theo góp ý của anh/chị." },
  { name: "Lê Thảo Vy", preview: "Khung giờ 14:30 ngày mai em tham gia được ạ." },
  { name: "Phạm Quốc Bảo", preview: "Anh/chị cho em hỏi vòng test có yêu cầu camera không?" },
];

export default function RecruiterMessagesPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-foreground">Tin nhắn</h1>
        <p className="mt-1 text-sm text-muted-foreground">Trao đổi nhanh với ứng viên về lịch phỏng vấn và tiến trình tuyển dụng.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-border bg-card p-3 shadow-sm">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cuộc trò chuyện</p>
          <div className="space-y-1">
            {chats.map((chat) => (
              <button key={chat.name} className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted">
                <p className="text-sm font-bold text-foreground">{chat.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{chat.preview}</p>
              </button>
            ))}
          </div>
        </aside>

        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Chọn một cuộc trò chuyện để bắt đầu</p>
          <div className="mt-4 rounded-xl border border-dashed border-border p-3">
            <textarea
              placeholder="Nhập tin nhắn..."
              className="h-36 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-3 flex justify-end">
              <button className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90">
                <SendHorizonal className="h-4 w-4" />
                Gửi tin nhắn
              </button>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
