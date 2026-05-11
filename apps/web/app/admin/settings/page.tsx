"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Lock, Bell, Database } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-(--gray-900)">Cài đặt</h1>
                <p className="text-sm text-(--gray-600)">Quản lý cài đặt hệ thống</p>
            </div>

            {/* General Settings */}
            <Card className="border border-(--gray-200) bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-(--gray-900)">Cài đặt chung</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-(--gray-900)">Tên hệ thống</label>
                        <input
                            type="text"
                            defaultValue="Job Matcher"
                            className="mt-1 h-9 w-full rounded-lg border border-(--gray-200) bg-white px-3 text-sm outline-none placeholder:text-(--gray-500) focus:border-(--primary-blue) focus:ring-2 focus:ring-(--primary-blue)/20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-(--gray-900)">URL hệ thống</label>
                        <input
                            type="text"
                            defaultValue="https://jobmatcher.com"
                            className="mt-1 h-9 w-full rounded-lg border border-(--gray-200) bg-white px-3 text-sm outline-none placeholder:text-(--gray-500) focus:border-(--primary-blue) focus:ring-2 focus:ring-(--primary-blue)/20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-(--gray-900)">Email hỗ trợ</label>
                        <input
                            type="email"
                            defaultValue="support@jobmatcher.com"
                            className="mt-1 h-9 w-full rounded-lg border border-(--gray-200) bg-white px-3 text-sm outline-none placeholder:text-(--gray-500) focus:border-(--primary-blue) focus:ring-2 focus:ring-(--primary-blue)/20"
                        />
                    </div>
                    <Button className="gap-2 bg-(--primary-blue) text-white hover:bg-(--blue-dark)">
                        <Save className="h-4 w-4" />
                        Lưu thay đổi
                    </Button>
                </div>
            </Card>

            {/* Security Settings */}
            <Card className="border border-(--gray-200) bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-(--gray-900)">
                    <Lock className="h-5 w-5" />
                    Bảo mật
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-(--gray-200) p-4">
                        <div>
                            <p className="font-medium text-(--gray-900)">Xác thực hai yếu tố</p>
                            <p className="text-sm text-(--gray-600)">Bảo vệ tài khoản admin bằng xác thực 2FA</p>
                        </div>
                        <input type="checkbox" className="h-5 w-5" />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-(--gray-200) p-4">
                        <div>
                            <p className="font-medium text-(--gray-900)">Giới hạn đăng nhập</p>
                            <p className="text-sm text-(--gray-600)">Giới hạn số lần đăng nhập thất bại</p>
                        </div>
                        <input type="checkbox" className="h-5 w-5" defaultChecked />
                    </div>
                </div>
            </Card>

            {/* Notification Settings */}
            <Card className="border border-(--gray-200) bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-(--gray-900)">
                    <Bell className="h-5 w-5" />
                    Thông báo
                </h3>
                <div className="space-y-3">
                    {[
                        { label: "Thông báo email hàng ngày", checked: true },
                        { label: "Cảnh báo hệ thống", checked: true },
                        { label: "Báo cáo hàng tuần", checked: false },
                        { label: "Thông báo bảo mật", checked: true },
                    ].map(({ label, checked }) => (
                        <div key={label} className="flex items-center gap-3">
                            <input type="checkbox" className="h-4 w-4" defaultChecked={checked} />
                            <label className="text-sm text-(--gray-700)">{label}</label>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Database Settings */}
            <Card className="border border-(--gray-200) bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-(--gray-900)">
                    <Database className="h-5 w-5" />
                    Cơ sở dữ liệu
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-(--gray-200) p-4">
                        <div>
                            <p className="font-medium text-(--gray-900)">Sao lưu tự động</p>
                            <p className="text-sm text-(--gray-600)">Sao lưu hàng ngày lúc 2:00 AM</p>
                        </div>
                        <input type="checkbox" className="h-5 w-5" defaultChecked />
                    </div>
                    <Button variant="outline" className="w-full">
                        Sao lưu ngay
                    </Button>
                    <Button variant="outline" className="w-full">
                        Khôi phục sao lưu
                    </Button>
                </div>
            </Card>
        </div>
    );
}
