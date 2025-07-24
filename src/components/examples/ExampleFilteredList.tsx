import { WithAccessFilter } from '@/components/WithAccessFilter';
import { useFilteredApi } from '@/hooks/useFilteredApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Example component showing how to use WithAccessFilter
const ExampleFilteredList = () => {
  // Option 1: Using useFilteredApi hook for automatic filtering
  const { data: apiData, loading, error, filterInfo, isFiltered } = useFilteredApi({
    path: '/api/cases',
    method: 'GET'
  });

  // Option 2: Manual data with WithAccessFilter component
  const mockCases = [
    {
      id: 1,
      title: "Community Health Issue",
      status: "Open",
      region: "Greater Accra",
      district: "Accra Metropolitan", 
      subdistrict: "Osu Klottey",
      community_name: "Osu"
    },
    {
      id: 2,
      title: "District-wide Vaccination",
      status: "In Progress", 
      region: "Ashanti",
      district: "Kumasi Metropolitan",
      subdistrict: "Manhyia",
      community_name: "Adum"
    },
    {
      id: 3,
      title: "Regional Health Survey",
      status: "Completed",
      region: "Western",
      district: "Sekondi-Takoradi Metropolitan",
      subdistrict: "Sekondi",
      community_name: "Market Circle"
    }
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Example 1: Using useFilteredApi hook */}
      <Card>
        <CardHeader>
          <CardTitle>API Data with Auto-Filtering</CardTitle>
          {isFiltered && (
            <div className="text-sm text-muted-foreground">
              Data filtered by {filterInfo.scope} level access at {filterInfo.location}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {apiData?.map((item: any) => (
              <div key={item.id} className="p-2 border rounded">
                <div className="font-medium">{item.title || item.name}</div>
                <div className="text-sm text-muted-foreground">
                  {item.region} → {item.district}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Example 2: Using WithAccessFilter component with showFilterInfo */}
      <Card>
        <CardHeader>
          <CardTitle>Mock Data with WithAccessFilter</CardTitle>
        </CardHeader>
        <CardContent>
          <WithAccessFilter 
            data={mockCases}
            showFilterInfo={true}
          >
            {(filteredData) => (
              <div className="space-y-4">
                {/* Filtered data display */}
                <div className="grid gap-3">
                  {filteredData.map((case_: any) => (
                    <div key={case_.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{case_.title}</h3>
                        <Badge 
                          variant={case_.status === 'Open' ? 'destructive' : 
                                 case_.status === 'In Progress' ? 'default' : 'secondary'}
                        >
                          {case_.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        📍 {case_.community_name}, {case_.subdistrict}, {case_.district}, {case_.region}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-lg mb-2">🔒</div>
                    <div>No cases accessible at your current access level</div>
                    <div className="text-sm mt-1">
                      Contact your administrator for access to additional data
                    </div>
                  </div>
                )}
              </div>
            )}
          </WithAccessFilter>
        </CardContent>
      </Card>

      {/* Example 3: Simple filtered list */}
      <Card>
        <CardHeader>
          <CardTitle>Simple List Example</CardTitle>
        </CardHeader>
        <CardContent>
          <WithAccessFilter data={mockCases}>
            {(filteredData) => (
              <ul className="space-y-2">
                {filteredData.map((case_: any) => (
                  <li key={case_.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>{case_.title}</span>
                    <span className="text-sm text-muted-foreground">
                      ({case_.district})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </WithAccessFilter>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExampleFilteredList;
