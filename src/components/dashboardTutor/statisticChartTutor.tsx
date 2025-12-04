import {
   ResponsiveContainer,
   ScatterChart,
   Scatter,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   LineChart,
   Line,
   Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

type DayItem = {
   date: string;
   label?: string;
   count?: number;
   total?: number;
   counts?: Record<string, number>;
   percents?: Record<string, number>;
};

type BubbleDataIn = { days: DayItem[]; range?: any };
type SessionsDataIn = { statuses: string[]; days: DayItem[]; range?: any };

export default function StatisticChartTutor(props: {
   bubble?: BubbleDataIn | null;
   sessions?: SessionsDataIn | null;
}) {
   const { bubble, sessions } = props;

   // helper to format ISO date string to local date display
   const formatLocalDate = (isoDate: string) => {
      try {
         const d = new Date(isoDate);
         // Use toLocaleDateString to respect user's local timezone
         const dateStr = d.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
         });
         return dateStr;
      } catch {
         return isoDate;
      }
   };

   // helper to build full weekday + date label in user's local timezone
   const fullLabel = (isoDate: string) => {
      try {
         const d = new Date(isoDate);
         const weekday = d.toLocaleDateString("vi-VN", { weekday: "long" });
         const dateStr = formatLocalDate(isoDate);
         return `${weekday} ${dateStr}`;
      } catch {
         return isoDate;
      }
   };

   // bubble -> transform into points
   const bubblePoints =
      bubble?.days?.map((d, i) => ({
         x: i + 1,
         y: d.count || 0,
         z: d.count || 0,
         rawDate: d.date,
         labelShort: formatLocalDate(d.date),
         labelFull: fullLabel(d.date),
      })) || [];

   // sessions line: array with local dates
   const sessionDays =
      sessions?.days?.map((d) => {
         const obj: any = { rawDate: d.date, dateLabel: fullLabel(d.date) };
         (sessions.statuses || []).forEach((s) => {
            obj[s] = d.counts?.[s] ?? 0;
         });
         return obj;
      }) || [];

   const top = 10;
   const ticks = [0, 2, 4, 6, 8, 10];

   // dark-aware colors for lines
   const linePalette = [
      "hsl(var(--primary))",
      "hsl(0 84% 60%)", // red-ish
      "hsl(25 95% 53%)", // orange
      "hsl(200 98% 39%)", // blue
   ];

   return (
      <div className="space-y-6">
         <Card className="p-6 bg-card text-card-foreground border border-border">
            <h4 className="font-medium mb-4 text-lg text-foreground">
               Sessions per day (bubble)
            </h4>
            <div style={{ width: "100%", height: 480 }}>
               <ResponsiveContainer>
                  <ScatterChart
                     margin={{ top: 24, right: 20, bottom: 110, left: 40 }}
                  >
                     <CartesianGrid stroke="hsl(var(--border))" />
                     <XAxis
                        dataKey="x"
                        name="day"
                        ticks={bubblePoints.map((p) => p.x)}
                        tickFormatter={(v) => {
                           const idx = Number(v) - 1;
                           return bubblePoints[idx]?.labelShort || String(v);
                        }}
                        type="number"
                        allowDecimals={false}
                        domain={[1, 7]}
                        tick={{ fontSize: 13, fill: "hsl(var(--foreground))" }}
                        interval={0}
                        angle={-40}
                        textAnchor="end"
                        xAxisId={0}
                        height={100}
                     />
                     <YAxis
                        ticks={ticks}
                        domain={[0, top]}
                        tick={{ fontSize: 14, fill: "hsl(var(--foreground))" }}
                        label={{
                           value: "Số lượng",
                           angle: -90,
                           position: "insideLeft",
                           offset: -10,
                           style: {
                              fontSize: 14,
                              fill: "hsl(var(--foreground))",
                           },
                        }}
                        width={70}
                     />
                     <Tooltip
                        formatter={(value: any, name: any) => [value, name]}
                        labelFormatter={(label) => {
                           const idx = Number(label) - 1;
                           return bubblePoints[idx]?.labelFull || String(label);
                        }}
                        wrapperStyle={{
                           zIndex: 1000,
                           fontSize: 13,
                           background: "hsl(var(--popover))",
                           color: "hsl(var(--popover-foreground))",
                           border: "1px solid hsl(var(--border))",
                           boxShadow: "0 8px 24px hsla(0,0%,0%,0.15)",
                        }}
                     />
                     <Scatter
                        dataKey="z"
                        data={bubblePoints}
                        fill="hsl(var(--primary))"
                     />
                  </ScatterChart>
               </ResponsiveContainer>
            </div>
         </Card>

         <Card className="p-6 bg-card text-card-foreground border border-border">
            <h4 className="font-medium mb-4 text-lg text-foreground">
               Sessions by status (line)
            </h4>
            <div style={{ width: "100%", height: 480 }}>
               <ResponsiveContainer>
                  <LineChart
                     data={sessionDays}
                     margin={{ bottom: 100, left: 40 }}
                  >
                     <CartesianGrid stroke="hsl(var(--border))" />
                     <XAxis
                        dataKey="dateLabel"
                        tick={{ fontSize: 13, fill: "hsl(var(--foreground))" }}
                        interval={0}
                        height={100}
                     />
                     <YAxis
                        ticks={ticks}
                        domain={[0, top]}
                        tick={{ fontSize: 14, fill: "hsl(var(--foreground))" }}
                        label={{
                           value: "Số lượng",
                           angle: -90,
                           position: "insideLeft",
                           offset: -10,
                           style: {
                              fontSize: 14,
                              fill: "hsl(var(--foreground))",
                           },
                        }}
                        width={70}
                     />
                     <Tooltip
                        labelFormatter={(label) => label}
                        wrapperStyle={{
                           zIndex: 1000,
                           fontSize: 13,
                           background: "hsl(var(--popover))",
                           color: "hsl(var(--popover-foreground))",
                           border: "1px solid hsl(var(--border))",
                           boxShadow: "0 8px 24px hsla(0,0%,0%,0.15)",
                        }}
                     />
                     <Legend
                        wrapperStyle={{
                           color: "hsl(var(--foreground))",
                        }}
                     />
                     {(sessions?.statuses || []).map((s, idx) => (
                        <Line
                           key={s}
                           type="monotone"
                           dataKey={s}
                           stroke={linePalette[idx % linePalette.length]}
                           strokeWidth={3}
                        />
                     ))}
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </Card>
      </div>
   );
}
