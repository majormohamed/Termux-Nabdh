"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

type Request = {
  id: string;
  status: string;
  rejectReason: string | null;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    phone: string | null;
    gender: string | null;
    birthDate: string | null;
    address: string | null;
  };
};

export function AccountRequestsTable({ requests }: { requests: Request[] }) {
  const router = useRouter();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<Request | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function approve(id: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/account-requests/${id}/approve`, { method: "POST" });
    const json = await res.json();
    setLoading(false);
    if (res.ok) toast.success(json.message); else toast.error(json.error);
    router.refresh();
  }

  async function reject() {
    if (!rejectId) return;
    setLoading(true);
    const res = await fetch(`/api/admin/account-requests/${rejectId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) toast.success(json.message); else toast.error(json.error);
    setRejectId(null);
    setReason("");
    router.refresh();
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  لا توجد طلبات
                </TableCell>
              </TableRow>
            )}
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.user.fullName}</TableCell>
                <TableCell dir="ltr">{r.user.email}</TableCell>
                <TableCell dir="ltr">{r.user.phone}</TableCell>
                <TableCell>{formatDate(r.createdAt)}</TableCell>
                <TableCell><StatusBadge value={r.status} /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setViewItem(r)} title="عرض">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {r.status === "PENDING" && (
                      <>
                        <Button size="icon" variant="ghost" className="text-emerald-600" disabled={loading} onClick={() => approve(r.id)} title="موافقة">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" disabled={loading} onClick={() => setRejectId(r.id)} title="رفض">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* عرض التفاصيل */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">الاسم: </span>{viewItem.user.fullName}</div>
              <div><span className="text-muted-foreground">البريد: </span><span dir="ltr">{viewItem.user.email}</span></div>
              <div><span className="text-muted-foreground">الهاتف: </span><span dir="ltr">{viewItem.user.phone}</span></div>
              <div><span className="text-muted-foreground">الجنس: </span>{viewItem.user.gender === "MALE" ? "ذكر" : "أنثى"}</div>
              <div><span className="text-muted-foreground">تاريخ الميلاد: </span>{formatDate(viewItem.user.birthDate)}</div>
              <div><span className="text-muted-foreground">العنوان: </span>{viewItem.user.address}</div>
              {viewItem.rejectReason && (
                <div className="col-span-2"><span className="text-muted-foreground">سبب الرفض: </span>{viewItem.rejectReason}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* رفض */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض الطلب</DialogTitle>
          </DialogHeader>
          <Textarea placeholder="سبب الرفض (سيصل للمستخدم)..." value={reason} onChange={(e) => setReason(e.target.value)} />
          <DialogFooter>
            <Button variant="destructive" onClick={reject} disabled={loading || reason.length < 3}>
              تأكيد الرفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
