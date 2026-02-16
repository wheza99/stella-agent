// CSV Exporter for LinkedIn Profiles
import { LinkedInProfile } from '@/type/interface/linkedin';

const CSV_HEADERS = [
  'First Name',
  'Last Name',
  'Full Name',
  'Title',
  'Company',
  'Location',
  'LinkedIn URL',
  'Open Profile',
  'Premium',
  'Summary',
];

/**
 * Escape a value for CSV format
 */
function escapeCSV(value: string | null | undefined): string {
  if (!value) return '';
  
  // Escape quotes by doubling them
  const escaped = value.replace(/"/g, '""');
  
  // Wrap in quotes if contains comma, quote, or newline
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
    return `"${escaped}"`;
  }
  
  return escaped;
}

/**
 * Generate CSV content from LinkedIn profiles
 */
export function generateCSV(profiles: LinkedInProfile[]): string {
  const rows = profiles.map((profile) => {
    const position = profile.current_positions?.[0];
    const fullName = `${profile.first_name} ${profile.last_name}`.trim();
    
    return [
      escapeCSV(profile.first_name),
      escapeCSV(profile.last_name),
      escapeCSV(fullName),
      escapeCSV(position?.title),
      escapeCSV(position?.company_name),
      escapeCSV(profile.location),
      escapeCSV(profile.linkedin_url),
      profile.open_profile ? 'Yes' : 'No',
      profile.premium ? 'Yes' : 'No',
      escapeCSV(profile.summary),
    ].join(',');
  });

  return [CSV_HEADERS.join(','), ...rows].join('\n');
}

/**
 * Generate a filename for CSV export
 */
export function generateCSVFilename(searchId: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const shortId = searchId.slice(0, 8);
  return `linkedin-search-${shortId}-${timestamp}.csv`;
}

/**
 * Generate CSV with custom columns
 */
export function generateCSVWithCustomColumns(
  profiles: LinkedInProfile[],
  columns: Array<{ key: string; header: string }>
): string {
  const headers = columns.map((c) => c.header);
  
  const rows = profiles.map((profile) => {
    return columns.map((col) => {
      const value = getFieldValue(profile, col.key);
      return escapeCSV(value);
    }).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Get field value from profile by key path
 */
function getFieldValue(profile: LinkedInProfile, key: string): string {
  const position = profile.current_positions?.[0];
  
  const fieldMap: Record<string, string | undefined | null> = {
    'first_name': profile.first_name,
    'last_name': profile.last_name,
    'full_name': `${profile.first_name} ${profile.last_name}`.trim(),
    'title': position?.title,
    'company': position?.company_name,
    'location': profile.location,
    'linkedin_url': profile.linkedin_url,
    'open_profile': profile.open_profile ? 'Yes' : 'No',
    'premium': profile.premium ? 'Yes' : 'No',
    'summary': profile.summary,
  };

  return fieldMap[key] ?? '';
}
