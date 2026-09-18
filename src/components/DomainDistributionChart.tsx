import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';

interface DomainDistributionChartProps {
  enrollments: { course: { domain: string } }[];
}

const COLORS = [
  'hsl(168, 76%, 36%)',
  'hsl(38, 92%, 55%)',
  'hsl(199, 89%, 48%)',
  'hsl(142, 76%, 36%)',
  'hsl(0, 72%, 51%)',
  'hsl(280, 65%, 55%)',
  'hsl(330, 70%, 50%)',
];

export function DomainDistributionChart({ enrollments }: DomainDistributionChartProps) {
  const domainCounts: Record<string, number> = {};
  enrollments.forEach(e => {
    domainCounts[e.course.domain] = (domainCounts[e.course.domain] || 0) + 1;
  });

  const data = Object.entries(domainCounts).map(([name, value]) => ({ name, value }));

  if (data.length === 0) return null;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-primary" />
          Learning Domains
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
