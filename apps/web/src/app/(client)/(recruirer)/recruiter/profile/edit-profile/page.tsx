"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { getProfileRecruiter, updateProfileRecruiter } from "@/services/user.service";
import { toast } from "sonner";

type FormState = {
	fullName: string;
	contactEmail: string;
	contactPhone: string;
};

export default function RecruiterEditProfilePage() {
	const { refreshProfile,user } = useAuth();
	const [form, setForm] = useState<FormState>({
		fullName: "",
		contactEmail: "",
		contactPhone: "",
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		async function fetchRecruiterProfile() {
			try {
				const profile = await getProfileRecruiter();
				setForm({
					fullName: profile.fullName ?? "",
					contactEmail: profile.contactEmail ?? "",
					contactPhone: profile.contactPhone ?? "",
				});
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Không thể tải thông tin hiện tại");
			} finally {
				setIsLoading(false);
			}
		}

		fetchRecruiterProfile();
	}, []);

	const handleChange = (field: keyof FormState, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!form.fullName.trim() || !form.contactEmail.trim() || !form.contactPhone.trim()) {
			toast.error("Vui lòng nhập đầy đủ Họ và tên, email và số điện thoại");
			return;
		}

		setIsSubmitting(true);

		try {
			await updateProfileRecruiter({
				fullName: form.fullName.trim(),
				contactEmail: form.contactEmail.trim(),
				contactPhone: form.contactPhone.trim(),
			});
			await refreshProfile().catch(() => null);
			toast.success("Đã cập nhật thông tin cá nhân thành công");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Cập nhật thông tin thất bại");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="space-y-5">
			<header className="flex items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-black text-foreground">Cài đặt thông tin cá nhân</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Chỉnh sửa thông tin liên hệ chính để nhà tuyển dụng và ứng viên kết nối dễ hơn.
					</p>
				</div>
				<Link href="/recruiter/profile">
					<Button type="button" variant="outline" className="gap-2">
						<ArrowLeft className="h-4 w-4" /> Quay lại
					</Button>
				</Link>
			</header>

			<section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
				{isLoading ? (
					<p className="text-sm font-medium text-muted-foreground">Đang tải dữ liệu...</p>
				) : (
					<form className="space-y-5" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<Label htmlFor="fullName" className="font-bold">
								Họ và tên
							</Label>
							<Input
								id="fullName"
								name="fullName"
								value={form.fullName}
								onChange={(event) => handleChange("fullName", event.target.value)}
								placeholder="VD: Lưu Đình Hạnh"
								className="h-12 rounded-2xl border-border bg-muted/60"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="contactEmail" className="font-bold">
								Email tuyển dụng
							</Label>
							<Input
								id="contactEmail"
								name="contactEmail"
								type="email"
								value={form.contactEmail}
								onChange={(event) => handleChange("contactEmail", event.target.value)}
								placeholder="contact@example.com"
								className="h-12 rounded-2xl border-border bg-muted/60"
							/>
						</div>

                        <div className="space-y-2">
							<Label htmlFor="personalEmail" className="font-bold">
								Email cá nhân
                                <p className="text-xs text-muted-foreground">
                                    Email này sẽ không hiển thị công khai, chỉ dùng để nhận thông báo quan trọng.
                                </p>
							</Label>
							<Input
								id="personalEmail"
								name="personalEmail"
								type="email"
								value={user?.email || ""}
								className="h-12 rounded-2xl border-border bg-muted/60"
                                disabled
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="contactPhone" className="font-bold">
								Số điện thoại
							</Label>
							<Input
								id="contactPhone"
								name="contactPhone"
								value={form.contactPhone}
								onChange={(event) => handleChange("contactPhone", event.target.value)}
								placeholder="VD: 0901234567"
								className="h-12 rounded-2xl border-border bg-muted/60"
							/>
						</div>

						<div className="flex justify-end">
							<Button
								type="submit"
								className="h-11 gap-2 rounded-xl bg-primary px-5 font-bold text-primary-foreground hover:bg-primary/90"
								disabled={isSubmitting}
							>
								<Save className="h-4 w-4" />
								{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
							</Button>
						</div>
					</form>
				)}
			</section>
		</main>
	);
}
