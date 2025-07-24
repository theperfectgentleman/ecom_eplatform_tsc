import { useAuth } from '@/contexts/AuthContext';
import { AccessLevel } from '@/types';

interface FilterableData {
  region?: string;
  district?: string;
  subdistrict?: string;
  community_name?: string;
  // Add other location fields that might exist in your data
  location?: string;
  area?: string;
  Region?: string; // Capitalized versions for API compatibility
  District?: string;
  Subdistrict?: string;
  Community?: string;
}

export const useAccessLevelFilter = () => {
  const { user } = useAuth();

  const filterByAccessLevel = <T extends FilterableData>(data: T[]): T[] => {
    if (!user || !Array.isArray(data)) return data || [];

    const { access_level, region, district, subdistrict, community_name } = user;

    switch (access_level) {
      case AccessLevel.COMMUNITY:
        return data.filter(item => 
          item.community_name === community_name ||
          item.Community === community_name ||
          item.location === community_name
        );

      case AccessLevel.SUBDISTRICT:
        return data.filter(item => 
          item.subdistrict === subdistrict ||
          item.Subdistrict === subdistrict ||
          // Include all communities within this subdistrict
          (item.community_name && item.subdistrict === subdistrict) ||
          (item.Community && item.Subdistrict === subdistrict)
        );

      case AccessLevel.DISTRICT:
        return data.filter(item => 
          item.district === district ||
          item.District === district ||
          // Include all subdistricts and communities within this district
          (item.subdistrict && item.district === district) ||
          (item.Subdistrict && item.District === district) ||
          (item.community_name && item.district === district) ||
          (item.Community && item.District === district)
        );

      case AccessLevel.REGION:
        return data.filter(item => 
          item.region === region ||
          item.Region === region ||
          // Include all districts, subdistricts, and communities within this region
          (item.district && item.region === region) ||
          (item.District && item.Region === region) ||
          (item.subdistrict && item.region === region) ||
          (item.Subdistrict && item.Region === region) ||
          (item.community_name && item.region === region) ||
          (item.Community && item.Region === region)
        );

      case AccessLevel.NATIONAL:
        return data; // No filtering - see everything

      default:
        return []; // No access if unknown level
    }
  };

  const getAccessLevelInfo = () => {
    if (!user) return { label: 'No Access', scope: 'none', location: '' };

    switch (user.access_level) {
      case AccessLevel.COMMUNITY:
        return { 
          label: `Community: ${user.community_name}`, 
          scope: 'community',
          location: user.community_name || 'Unknown Community'
        };
      case AccessLevel.SUBDISTRICT:
        return { 
          label: `Subdistrict: ${user.subdistrict}`, 
          scope: 'subdistrict',
          location: user.subdistrict || 'Unknown Subdistrict'
        };
      case AccessLevel.DISTRICT:
        return { 
          label: `District: ${user.district}`, 
          scope: 'district',
          location: user.district || 'Unknown District'
        };
      case AccessLevel.REGION:
        return { 
          label: `Region: ${user.region}`, 
          scope: 'region',
          location: user.region || 'Unknown Region'
        };
      case AccessLevel.NATIONAL:
        return { 
          label: 'National Access', 
          scope: 'national',
          location: 'All Locations'
        };
      default:
        return { 
          label: 'Unknown Access Level', 
          scope: 'none',
          location: 'No Access'
        };
    }
  };

  const canAccessLocation = (item: FilterableData): boolean => {
    if (!user) return false;
    
    const { access_level, region, district, subdistrict, community_name } = user;

    switch (access_level) {
      case AccessLevel.COMMUNITY:
        return !!(item.community_name === community_name || 
               item.Community === community_name ||
               item.location === community_name);

      case AccessLevel.SUBDISTRICT:
        return !!(item.subdistrict === subdistrict ||
               item.Subdistrict === subdistrict ||
               (item.community_name && item.subdistrict === subdistrict) ||
               (item.Community && item.Subdistrict === subdistrict));

      case AccessLevel.DISTRICT:
        return !!(item.district === district ||
               item.District === district ||
               (item.subdistrict && item.district === district) ||
               (item.Subdistrict && item.District === district));

      case AccessLevel.REGION:
        return !!(item.region === region ||
               item.Region === region ||
               (item.district && item.region === region) ||
               (item.District && item.Region === region));

      case AccessLevel.NATIONAL:
        return true;

      default:
        return false;
    }
  };

  return {
    filterByAccessLevel,
    getAccessLevelInfo,
    canAccessLocation,
    userAccessLevel: user?.access_level,
    userLocation: {
      region: user?.region,
      district: user?.district,
      subdistrict: user?.subdistrict,
      community_name: user?.community_name,
    },
    isNationalAccess: user?.access_level === AccessLevel.NATIONAL
  };
};
