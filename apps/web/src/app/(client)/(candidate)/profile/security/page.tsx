"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { changePassword } from "@/services/auth.service";
import { useAuth } from "@/context/auth-context";

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="h-11 w-full rounded-xl border border-border bg-muted/50 px-4 pr-11 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ProfileSecurityPage() {
  const { user } = useAuth();
  const isSocialOnly = !!user?.provider && !user?.provider.includes("local");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = isSocialOnly
        ? { newPassword }
        : { currentPassword, newPassword };

      const result = await changePassword(payload);
      toast.success(result.message ?? "Đổi mật khẩu thành công");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đổi mật khẩu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Bảo mật</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cài đặt bảo mật tài khoản
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-black text-foreground">
          <KeyRound className="h-5 w-5 text-primary" />
          {isSocialOnly ? "Đặt mật khẩu" : "Đổi mật khẩu"}
        </h2>
        {isSocialOnly && (
          <p className="mt-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm text-primary">
            Tài khoản của bạn đăng nhập qua {user?.provider}. Bạn có thể đặt mật khẩu để đăng nhập bằng email trong tương lai.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4 max-w-md">
          {!isSocialOnly && (
            <PasswordField
              id="current-password"
              label="Mật khẩu hiện tại"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Nhập mật khẩu hiện tại"
              disabled={isSubmitting}
            />
          )}
          <PasswordField
            id="new-password"
            label="Mật khẩu mới"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Ít nhất 6 ký tự"
            disabled={isSubmitting}
          />
          <PasswordField
            id="confirm-password"
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Nhập lại mật khẩu mới"
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 w-full rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90 sm:w-auto sm:px-8"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSocialOnly ? (
              "Đặt mật khẩu"
            ) : (
              "Đổi mật khẩu"
            )}
          </Button>
        </form>
      </section>
    </div>
  );
}
