import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const careerImportance: Record<string, string> = {
  'data scientist': 'Highly in demand with avg salary $120k+. Companies like Google, Meta, and Netflix actively hire.',
  'ai engineer': 'One of the fastest-growing roles. AI/ML engineers earn $130k-200k and shape the future of technology.',
  'full stack developer': 'Versatile role with endless opportunities. Average salary $95k-140k with high job security.',
  'frontend developer': 'Creative role building user experiences. Strong demand with $80k-130k salary range.',
  'backend developer': 'Core infrastructure role. Stable career with $90k-150k salary and growing demand.',
  'devops engineer': 'Critical for modern software delivery. High demand with $100k-160k salary range.',
  'cloud architect': 'Strategic role designing cloud solutions. Premium salary $140k-200k with cloud adoption growing.',
  'data engineer': 'Foundation of data-driven companies. High demand with $100k-160k salary range.',
  'mobile developer': 'Build apps used by billions. Strong market with $85k-140k salary range.',
  'cybersecurity analyst': 'Critical role protecting organizations. High demand with $80k-130k+ salary.',
};

const skillBenefits: Record<string, string> = {
  'python': 'Foundation for AI/ML, data science, and automation. Used by 80% of data professionals.',
  'machine learning': 'Core skill for AI careers. Enables predictive analytics and intelligent systems.',
  'deep learning': 'Powers breakthrough AI applications like GPT, image recognition, and autonomous systems.',
  'sql': 'Essential for any data role. 90% of data jobs require SQL proficiency.',
  'javascript': 'Most popular language for web development. Used by 97% of websites.',
  'react': 'Leading frontend framework. High demand with excellent job opportunities.',
  'node.js': 'Enables full-stack JavaScript development. Powers Netflix, LinkedIn, NASA.',
  'tensorflow': 'Industry-standard deep learning framework by Google. Used in production AI systems.',
  'statistics': 'Foundation for data analysis and ML. Critical for making data-driven decisions.',
  'nlp': 'Enables chatbots, translation, and text analysis. Growing field with ChatGPT revolution.',
  'data visualization': 'Critical for communicating insights. Essential for data roles.',
  'docker': 'Industry standard for containerization. Required for modern DevOps.',
  'kubernetes': 'Container orchestration at scale. High-demand skill for cloud roles.',
  'aws': 'Leading cloud platform with 32% market share. AWS certifications boost salary.',
};

function calculateTFIDF(text: string, allTexts: string[]): Record<string, number> {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const tf: Record<string, number> = {};
  words.forEach(word => { tf[word] = (tf[word] || 0) + 1 / words.length; });
  
  const idf: Record<string, number> = {};
  Object.keys(tf).forEach(word => {
    const docsWithWord = allTexts.filter(t => t.toLowerCase().includes(word)).length;
    idf[word] = Math.log((allTexts.length + 1) / (docsWithWord + 1));
  });
  
  const tfidf: Record<string, number> = {};
  Object.keys(tf).forEach(word => { tfidf[word] = tf[word] * (idf[word] || 0); });
  return tfidf;
}

function cosineSimilarity(a: Record<string, number>, b: Record<string, number>): number {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dotProduct = 0, magA = 0, magB = 0;
  allKeys.forEach(key => {
    const aVal = a[key] || 0, bVal = b[key] || 0;
    dotProduct += aVal * bVal;
    magA += aVal * aVal;
    magB += bVal * bVal;
  });
  return magA && magB ? dotProduct / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

function getUsefulnessText(skill: string): string {
  const usefulnessMap: Record<string, string> = {
    'python': 'write automation scripts, build data pipelines, and create ML models',
    'machine learning': 'build predictive models, automate decisions, and extract insights from data',
    'deep learning': 'create neural networks for image recognition, NLP, and complex pattern detection',
    'sql': 'query databases efficiently, analyze data, and create reports',
    'javascript': 'build interactive websites, web apps, and full-stack applications',
    'react': 'create modern, responsive user interfaces for web applications',
    'tensorflow': 'build and deploy production-ready deep learning models',
    'statistics': 'make data-driven decisions and understand ML algorithms deeply',
    'nlp': 'build chatbots, analyze text, and create language models',
    'data visualization': 'create compelling charts and dashboards to communicate insights',
  };
  return usefulnessMap[skill?.toLowerCase()] || 'apply new skills in real-world projects';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) throw new Error('Unauthorized');

    const { limit = 6 } = await req.json().catch(() => ({}));

    const [{ data: profile }, { data: courses }, { data: enrollments }, { data: careerRoles }] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('courses').select('*').eq('is_active', true),
      supabase.from('enrollments').select('course_id').eq('user_id', user.id),
      supabase.from('career_roles').select('*'),
    ]);

    if (!courses?.length) {
      return new Response(JSON.stringify({ recommendations: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const enrolledIds = new Set(enrollments?.map(e => e.course_id) || []);
    const availableCourses = courses.filter(c => !enrolledIds.has(c.id));

    const targetCareer = profile?.target_career_role?.toLowerCase() || '';
    const careerRole = careerRoles?.find(r => r.name.toLowerCase() === targetCareer);
    const careerRequiredSkills = Array.isArray(careerRole?.required_skills)
      ? (careerRole.required_skills as string[]).map((s: string) => s.toLowerCase())
      : [];

    const userText = [
      ...(profile?.skills || []),
      ...(profile?.interests || []),
      profile?.career_goals || '',
      profile?.target_career_role || '',
      profile?.learning_style || '',
      profile?.education || '',
    ].join(' ');

    const roleRelevantCourses = targetCareer
      ? availableCourses.filter(c =>
          (c.career_relevance || []).some((r: string) => r.toLowerCase().includes(targetCareer)) ||
          c.skills_covered.some((s: string) => careerRequiredSkills.includes(s.toLowerCase()))
        )
      : availableCourses;

    const coursesToRecommend = roleRelevantCourses.length >= 3 ? roleRelevantCourses : availableCourses;

    const courseTexts = coursesToRecommend.map(c =>
      `${c.name} ${c.description} ${c.skills_covered.join(' ')} ${c.domain} ${(c.career_relevance || []).join(' ')} ${c.institution || ''} ${c.source_platform || ''}`
    );
    const allTexts = [userText, ...courseTexts];

    const userTfidf = calculateTFIDF(userText, allTexts);
    const recommendations = coursesToRecommend.map((course, i) => {
      const courseTfidf = calculateTFIDF(courseTexts[i], allTexts);
      const contentScore = cosineSimilarity(userTfidf, courseTfidf);

      const matchingSkills = course.skills_covered.filter((s: string) =>
        (profile?.skills || []).some((us: string) => us.toLowerCase().includes(s.toLowerCase())) ||
        (profile?.interests || []).some((ui: string) => ui.toLowerCase().includes(s.toLowerCase()))
      );

      const careerAlignedSkills = course.skills_covered.filter((s: string) =>
        careerRequiredSkills.includes(s.toLowerCase())
      );

      // Credibility boost: higher-rated courses from reputed institutions rank higher
      const ratingBoost = (course.external_rating || 0) >= 4.7 ? 0.1 : (course.external_rating || 0) >= 4.5 ? 0.05 : 0;
      const institutionBoost = course.institution?.toLowerCase().includes('iit') ||
        course.institution?.toLowerCase().includes('stanford') ||
        course.institution?.toLowerCase().includes('mit') ||
        course.institution?.toLowerCase().includes('google') ||
        course.institution?.toLowerCase().includes('meta') ? 0.08 : 0;

      const score = Math.min(
        contentScore * 2 + 0.3 + (careerAlignedSkills.length * 0.1) + ratingBoost + institutionBoost,
        1
      );

      // Build explanation
      const explanationParts: string[] = [];
      if (matchingSkills.length > 0) {
        explanationParts.push(`✓ Builds on your ${matchingSkills.slice(0, 2).join(' & ')} knowledge`);
      }
      if (careerAlignedSkills.length > 0 && profile?.target_career_role) {
        explanationParts.push(`✓ Essential for ${profile.target_career_role} role`);
      }
      if (course.institution) {
        explanationParts.push(`🏛️ From ${course.institution}${course.external_rating ? ` (${course.external_rating}★)` : ''}`);
      }
      const primarySkill = course.skills_covered[0]?.toLowerCase();
      const skillBenefit = skillBenefits[primarySkill];
      if (skillBenefit) {
        explanationParts.push(`★ ${skillBenefit}`);
      }

      const careerImp = careerImportance[targetCareer];
      if (careerImp && careerAlignedSkills.length > 0) {
        explanationParts.push(`💼 Career: ${careerImp.split('.')[0]}`);
      }

      const levelBenefit = {
        'beginner': 'Foundation course - start your learning journey here',
        'intermediate': 'Level up your skills with hands-on projects',
        'advanced': 'Master-level content for career advancement'
      } as Record<string, string>;
      explanationParts.push(`📚 ${levelBenefit[course.level as string] || 'Comprehensive learning material'}`);

      const explanation = explanationParts.slice(0, 5).join('\n');

      const whyEnrollText = course.institution
        ? `Recommended by ${course.institution} on ${course.source_platform || 'online'}. ${matchingSkills.length > 0 ? `Matches your interests in ${matchingSkills.join(', ')}` : 'Introduces essential skills for your career goals'}`
        : matchingSkills.length > 0
          ? `Perfectly matches your interests in ${matchingSkills.join(', ')}`
          : `Introduces essential skills for your career goals`;

      return {
        course,
        score,
        explanation,
        whyEnroll: whyEnrollText,
        importance: careerAlignedSkills.length > 0
          ? `Critical skill for ${profile?.target_career_role || 'your career'} - ${careerAlignedSkills.join(', ')}${course.external_rating && course.external_rating >= 4.7 ? '. Top-rated course globally' : ''}`
          : `Valuable addition to your skill portfolio${course.external_rating && course.external_rating >= 4.7 ? '. Top-rated by learners worldwide' : ''}`,
        usefulness: `After completing this course, you'll be able to ${getUsefulnessText(course.skills_covered[0])}`
      };
    });

    recommendations.sort((a, b) => b.score - a.score);

    return new Response(
      JSON.stringify({ recommendations: recommendations.slice(0, limit) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Recommendation error:', err);
    return new Response(
      JSON.stringify({ error: err.message, recommendations: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
