import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface SkillGapChartProps {
  acquiredSkills: string[];
  requiredSkills: string[];
  title?: string;
}

export function SkillGapChart({ acquiredSkills, requiredSkills, title = 'Skill Gap Analysis' }: SkillGapChartProps) {
  const data = requiredSkills.slice(0, 10).map(skill => ({
    skill: skill.length > 12 ? skill.slice(0, 12) + '…' : skill,
    fullSkill: skill,
    status: acquiredSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase()) ? 100 : 25,
    acquired: acquiredSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase()),
  }));

  if (data.length === 0) return null;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(215, 25%, 88%)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="skill" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  props.payload.acquired ? 'Acquired ✓' : 'Gap — needs learning',
                  props.payload.fullSkill,
                ]}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(215, 25%, 88%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="status" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.acquired ? 'hsl(142, 76%, 36%)' : 'hsl(38, 92%, 55%)'}
                    opacity={entry.acquired ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(142, 76%, 36%)' }} />
            Acquired
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(38, 92%, 55%)' }} />
            Skill Gap
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
