"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Eye, FilePenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

type Doc = { id: string; kind: string; fileUrl: string; fileName: string | null };
type Req = {
  id: string;
  status: string;
  rejectReason: string | null;
  changeRequestNote: string | null;
  contactName: string | null;
  contactJobTitle: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactNationalId: string | null;
  createdAt: string;
  documents: Doc[];
  hospital: Record<string, string | null> & { name: string };
};

const docKindLabels: Record<string, string> = {
  LICENSE: "مستند الترخيص",
  COMMERCIAL_RECORD: "السجل التجاري",
  ACCREDITATION: "مستند اعتماد",
  OTHER: "أخرى",
};

export function HospitalRequestsTable({ requests }: { requests: Req[] }) {
  const router = useRouter();
  const [viewItem, setViewItem] = useState<Req | null>(null);
  const [action, setAction] = useState<{ id: string; kind: "reject" | "changes" } | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function call(url: string, body?: object) {
    setLoading(true);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) toast.success(json.message); else toast.error(json.error);
    router.refresh();
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المستشفى</TableHead>
              <TableHead>المدينة</TableHead>
              <TableHead>المسؤول</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">لا توجد طلبات</TableCell>
              </TableRow>
            )}
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.hospital.name}</TableCell>
                <TableCell>{r.hospital.city}</TableCell>
                <TableCell>{r.contactName}</TableCell>
                <TableCell>{formatDate(r.createdAt)}</TableCell>
                <TableCell><StatusBadge value={r.status} /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setViewItem(r)} title="عرض">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {r.status !== "APPROVED" && (
                      <>
                        <Button size="icon" variant="ghost" className="text-emerald-600" disabled={loading}
                          onClick={() => call(`/api/admin/hospital-requests/${r.id}/approve`)} title="موافقة">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" disabled={loading}
                          onClick={() => { setText(""); setAction({ id: r.id, kind: "reject" }); }} title="رفض">
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-amber-600" disabled={loading}
                          onClick={() => { setText(""); setAction({ id: r.id, kind: "changes" }); }} title="طلب تعديل">
                          <FilePenLine className="h-4 w-4" />
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

      {/* عرض */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewItem?.hospital.name}</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">الاسم التجاري: </span>{viewItem.hospital.tradeName ?? "—"}</div>
                <div><span className="text-muted-foreground">النوع: </span><StatusBadge value={viewItem.hospital.type ?? ""} /></div>
                <div><span className="text-muted-foreground">رقم الترخيص: </span>{viewItem.hospital.licenseNumber ?? "—"}</div>
                <div><span className="text-muted-foreground">المدينة: </span>{viewItem.hospital.city}، {viewItem.hospital.country}</div>
                <div className="col-span-2"><span className="text-muted-foreground">العنوان: </span>{viewItem.hospital.address}</div>
                <div><span className="text-muted-foreground">الهاتف: </span><span dir="ltr">{viewItem.hospital.phone}</span></div>
                <div><span className="text-muted-foreground">البريد: </span>{viewItem.hospital.email}</div>
                {viewItem.hospital.description && (
                  <div className="col-span-2"><span className="text-muted-foreground">الوصف: </span>{viewItem.hospital.description}</div>
                )}
              </div>
              <div className="border-t pt-3">
                <h4 className="mb-2 font-semibold">المسؤول</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">الاسم: </span>{viewItem.contactName}</div>
                  <div><span className="text-muted-foreground">الوظيفة: </span>{viewItem.contactJobTitle}</div>
                  <div><span className="text-muted-foreground">الهاتف: </span><span dir="ltr">{viewItem.contactPhone}</span></div>
                  <div><span className="text-muted-foreground">البريد: </span>{viewItem.contactEmail}</div>
                  <div><span className="text-muted-foreground">الهوية: </span><span dir="ltr">{viewItem.contactNationalId}</span></div>
                </div>
              </div>
              <div className="border-t pt-3">
                <h4 className="mb-2 font-semibold">المستندات</h4>
                {viewItem.documents.length === 0 ? (
                  <p className="text-muted-foreground">لا توجد مستندات</p>
                ) : (
                  <ul className="list-inside list-disc">
                    {viewItem.documents.map((d) => (
                      <li key={d.id}>
                        <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                          {d.fileName ?? docKindLabels[d.kind] ?? d.kind}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {viewItem.changeRequestNote && (
                <div className="rounded bg-amber-50 p-2 text-amber-800">ملاحظات التعديل: {viewItem.changeRequestNote}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* رفض / طلب تعديل */}
      <Dialog open={!!action} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action?.kind === "reject" ? "رفض الطلب" : "طلب تعديل البيانات"}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={action?.kind === "reject" ? "سبب الرفض..." : "ما المطلوب تعديله؟"}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant={action?.kind === "reject" ? "destructive" : "default"}
              disabled={loading || text.length < 3}
              onClick={async () => {
                if (!action) return;
                const url =
                  action.kind === "reject"
                    ? `/api/admin/hospital-requests/${action.id}/reject`
                    : `/api/admin/hospital-requests/${action.id}/request-changes`;
                await call(url, action.kind === "reject" ? { reason: text } : { note: text });
                setAction(null);
              }}
            >
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
