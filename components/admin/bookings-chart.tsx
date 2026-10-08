"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export function BookingsChart({ data }: { data: { day: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">لا توجد بيانات كافية</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <XAxis dataKey="day" fontSize={10} />
        <YAxis allowDecimals={false} fontSize={10} />
        <Tooltip />
        <Bar dataKey="count" fill="hsl(199 89% 36%)" radius={[4, 4, 0, 0]} name="الحجوزات" />
      </BarChart>
    </ResponsiveContainer>
  );
}
