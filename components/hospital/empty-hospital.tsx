import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyHospital() {
  return (
    <Card>
      <CardContent className="py-16 text-center text-muted-foreground">
        حسابك غير مرتبط بأي مستشفى.{" "}
        <Link href="/hospital/register" className="text-primary underline">سجّل مستشفى</Link>{" "}
        أو تواصل مع الإدارة.
      </CardContent>
    </Card>
  );
}
