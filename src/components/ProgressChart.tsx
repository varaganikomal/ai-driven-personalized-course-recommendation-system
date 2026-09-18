import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, BarChart3 } from 'lucide-react';

interface Enrollment {
  id: string;
  progress: number;
  course: {
    name: string;
    domain: string;
    level: string;
  };
}

interface ProgressChartProps {
  enrollments: Enrollment[];
}

const COLORS = [
  'hsl(168, 76%, 36%)',
  'hsl(38, 92%, 55%)',
  'hsl(199, 89%, 48%)',
  'hsl(142, 76%, 36%)',
  'hsl(0, 72%, 51%)',
  'hsl(280, 65%, 55%)',
];

export function ProgressPieChart({ enrollments }: ProgressChartProps) {
  const completed = enrollments.filter(e => e.progress === 100).length;
  const inProgress = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
  const notStarted = enrollments.filter(e => e.progress === 0).length;

  const data = [
    { name: 'Completed', value: completed, color: 'hsl(142, 76%, 36%)' },
    { name: 'In Progress', value: inProgress, color: 'hsl(38, 92%, 55%)' },
    { name: 'Not Started', value: notStarted, color: 'hsl(215, 25%, 88%)' },
  ].filter(d => d.value > 0);

  if (enrollments.length === 0) return null;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-primary" />
          Course Completion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
          {data.map(d => (
            <div key={d.name} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
              {d.name}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CourseProgressBarChart({ enrollments }: ProgressChartProps) {
  const data = enrollments.slice(0, 8).map(e => ({
    name: e.course.name.length > 18 ? e.course.name.slice(0, 18) + '…' : e.course.name,
    progress: e.progress,
    domain: e.course.domain,
  }));

  if (data.length === 0) return null;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Course Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(215, 25%, 88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Progress']}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(215, 25%, 88%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="progress" radius={[4, 4, 0, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
