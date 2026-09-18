interface VideoSourceCourse {
  name: string;
  domain?: string | null;
  skills_covered?: string[] | null;
  source_platform?: string | null;
  source_url?: string | null;
  external_rating?: number | null;
}

const platformSearchTemplates: Record<string, (query: string) => string> = {
  YouTube: (query) => `https://www.youtube.com/results?search_query=${query}`,
  "NPTEL/YouTube": (query) => `https://www.youtube.com/results?search_query=${query}%20nptel`,
  Coursera: (query) => `https://www.coursera.org/search?query=${query}`,
  Udemy: (query) => `https://www.udemy.com/courses/search/?q=${query}`,
  edX: (query) => `https://www.edx.org/search?q=${query}`,
  "AWS Training": (query) => `https://www.aws.training/Search?searchTerm=${query}`,
  "Microsoft Learn": (query) => `https://learn.microsoft.com/en-us/search/?terms=${query}`,
};

function buildSearchQuery(course: VideoSourceCourse) {
  const parts = [
    course.name,
    course.domain,
    ...(course.skills_covered || []).slice(0, 2),
  ].filter(Boolean);

  return encodeURIComponent(parts.join(" "));
}

export function getBestVideoSource(course: VideoSourceCourse) {
  const query = buildSearchQuery(course);
  const rating = Number(course.external_rating || 0);
  const normalizedPlatform = course.source_platform?.trim() || "";

  if (course.source_url && rating >= 4) {
    return {
      url: course.source_url,
      label: rating >= 4.5 ? "Top Rated Video" : "Video Source",
    };
  }

  if (normalizedPlatform && platformSearchTemplates[normalizedPlatform]) {
    return {
      url: platformSearchTemplates[normalizedPlatform](query),
      label: rating >= 4.5 ? `${normalizedPlatform} Video` : "Related Videos",
    };
  }

  if (course.source_url) {
    return {
      url: course.source_url,
      label: "Course Source",
    };
  }

  return {
    url: `https://www.youtube.com/results?search_query=${query}%20full%20course`,
    label: rating >= 4.5 ? "Top Rated Videos" : "Learn With Videos",
  };
}
