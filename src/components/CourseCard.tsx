import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, TrendingUp, Star, ChevronRight, Lightbulb, Target, Briefcase, GraduationCap, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBestVideoSource } from '@/lib/videoSources';

interface CourseCardProps {
  id: string;
  name: string;
  description: string;
  domain: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  skills_covered: string[];
  image_url?: string | null;
  instructor?: string | null;
  institution?: string | null;
  source_platform?: string | null;
  source_url?: string | null;
  external_rating?: number | null;
  rating?: number;
  matchScore?: number;
  matchReason?: string;
  whyEnroll?: string;
  importance?: string;
  usefulness?: string;
  onEnroll?: () => void;
  isEnrolled?: boolean;
  showDetailedReason?: boolean;
}

const levelStyles = {
  beginner: 'level-beginner',
  intermediate: 'level-intermediate',
  advanced: 'level-advanced',
};

const platformColors: Record<string, string> = {
  'Coursera': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'YouTube': 'bg-red-500/10 text-red-600 border-red-500/20',
  'NPTEL/YouTube': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Udemy': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'edX': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'AWS Training': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Microsoft Learn': 'bg-sky-500/10 text-sky-600 border-sky-500/20',
};

export function CourseCard({
  id,
  name,
  description,
  domain,
  level,
  duration_hours,
  skills_covered,
  image_url,
  instructor,
  institution,
  source_platform,
  source_url,
  external_rating,
  rating,
  matchScore,
  matchReason,
  whyEnroll,
  importance,
  usefulness,
  onEnroll,
  isEnrolled,
  showDetailedReason = false,
}: CourseCardProps) {
  const videoSource = getBestVideoSource({
    name,
    domain,
    skills_covered,
    source_platform,
    source_url,
    external_rating,
  });

  return (
    <Card className="group overflow-hidden card-hover bg-card border-border/50">
      {/* Image Header */}
      <div className="relative h-40 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-primary/30" />
          </div>
        )}

        {/* Match Score Badge */}
        {matchScore !== undefined && (
          <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">{Math.round(matchScore * 100)}% Match</span>
          </div>
        )}

        {/* Level Badge */}
        <div className="absolute top-3 left-3">
          <span className={cn('level-badge', levelStyles[level])}>{level}</span>
        </div>

        {/* Platform Badge */}
        {source_platform && (
          <div className="absolute bottom-3 left-3">
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', platformColors[source_platform] || 'bg-muted text-muted-foreground border-border')}>
              {source_platform}
            </span>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge variant="secondary" className="mb-2 text-xs">
              {domain}
            </Badge>
            <h3 className="font-display font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {name}
            </h3>
          </div>
        </div>

        {/* Institution & Instructor */}
        {institution && (
          <div className="flex items-center gap-1.5 mt-1">
            <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-xs font-medium text-primary truncate">{institution}</p>
          </div>
        )}
        {instructor && (
          <p className="text-sm text-muted-foreground mt-0.5">by {instructor}</p>
        )}
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>

        {/* Match Reason */}
        {matchReason && !showDetailedReason && (
          <div className="bg-primary/5 rounded-lg p-2 mb-3 border border-primary/10 space-y-1">
            {matchReason.split('\n').map((line, i) => (
              <p key={i} className="text-xs text-primary">{line}</p>
            ))}
          </div>
        )}

        {/* Detailed AI Explanation */}
        {showDetailedReason && (whyEnroll || importance || usefulness) && (
          <div className="space-y-2 mb-3">
            {whyEnroll && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-success/5 border border-success/20">
                <Lightbulb className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-success">Why Enroll</p>
                  <p className="text-xs text-muted-foreground">{whyEnroll}</p>
                </div>
              </div>
            )}
            {importance && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-warning/5 border border-warning/20">
                <Target className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-warning">Importance</p>
                  <p className="text-xs text-muted-foreground">{importance}</p>
                </div>
              </div>
            )}
            {usefulness && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-info/5 border border-info/20">
                <Briefcase className="h-4 w-4 text-info mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-info">How It Helps</p>
                  <p className="text-xs text-muted-foreground">{usefulness}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {skills_covered.slice(0, 3).map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
            </span>
          ))}
          {skills_covered.length > 3 && (
            <span className="text-xs text-muted-foreground self-center">
              +{skills_covered.length - 3} more
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration_hours}h</span>
          </div>
          {(external_rating || rating) && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span>{(external_rating || rating || 0).toFixed(1)}</span>
            </div>
          )}
          {videoSource.url && (
            <a
              href={videoSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="text-xs">{videoSource.label}</span>
            </a>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <div className="grid w-full gap-2">
          {onEnroll && (
            <Button
              onClick={onEnroll}
              className={cn(
                'w-full',
                isEnrolled ? 'bg-success hover:bg-success/90' : 'gradient-primary'
              )}
              disabled={isEnrolled}
            >
              {isEnrolled ? 'Enrolled' : 'Enroll Now'}
            </Button>
          )}
          <div className="grid w-full grid-cols-2 gap-2">
            <Button asChild variant="outline" className="w-full group/btn">
              <Link to={`/courses/${id}`}>
                View Course
                <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <a href={videoSource.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Video
              </a>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
