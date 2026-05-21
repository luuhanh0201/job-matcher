"use client";

import { Suspense } from "react";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import VerifyEmailContent from "./verify-email-content";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-(--gray-100) flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md rounded-[28px] border border-(--gray-200) bg-(--white) shadow-2xl">
        <CardContent className="p-8 sm:p-10">
          <Suspense
            fallback={
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-(--primary-blue)/10">
                  <Loader2 className="h-10 w-10 animate-spin text-(--primary-blue)" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">Đang tải...</h1>
              </div>
            }
          >
            <VerifyEmailContent />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
