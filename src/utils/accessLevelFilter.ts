import { useAccessLevelFilter } from '@/hooks/useAccessLevelFilter';

/**
 * Utility function for manually filtering data arrays based on user access level
 * Use this when you need to apply filtering outside of hooks or components
 */
export const createAccessLevelFilter = (user: {
  access_level: number;
  region?: string;
  district?: string;
  subdistrict?: string;
  community_name?: string;
}) => {
  return <T extends {
    region?: string;
    district?: string;
    subdistrict?: string;
    community_name?: string;
    Region?: string;
    District?: string;
    Subdistrict?: string;
    Community?: string;
  }>(data: T[]): T[] => {
    if (!Array.isArray(data)) return data || [];

    const { access_level, region, district, subdistrict, community_name } = user;

    switch (access_level) {
      case 0: // Community
        return data.filter(item => 
          item.community_name === community_name ||
          item.Community === community_name
        );

      case 1: // Subdistrict
        return data.filter(item => 
          item.subdistrict === subdistrict ||
          item.Subdistrict === subdistrict ||
          (item.community_name && item.subdistrict === subdistrict) ||
          (item.Community && item.Subdistrict === subdistrict)
        );

      case 2: // District
        return data.filter(item => 
          item.district === district ||
          item.District === district ||
          (item.subdistrict && item.district === district) ||
          (item.Subdistrict && item.District === district) ||
          (item.community_name && item.district === district) ||
          (item.Community && item.District === district)
        );

      case 3: // Region
        return data.filter(item => 
          item.region === region ||
          item.Region === region ||
          (item.district && item.region === region) ||
          (item.District && item.Region === region) ||
          (item.subdistrict && item.region === region) ||
          (item.Subdistrict && item.Region === region) ||
          (item.community_name && item.region === region) ||
          (item.Community && item.Region === region)
        );

      case 4: // National
        return data; // No filtering

      default:
        return []; // No access
    }
  };
};

/**
 * React hook for easy access to the filter utility
 */
export const useDataFilter = () => {
  const { filterByAccessLevel } = useAccessLevelFilter();
  return { filterData: filterByAccessLevel };
};
