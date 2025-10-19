import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, Volume2, BarChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Reports = () => {
  const navigate = useNavigate();

  const reportSections = [
    {
      title: "FieldWork",
      description: "Track data capture performance, contributor activity, and regional coverage metrics",
      icon: Briefcase,
      route: "/reports/fieldwork",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      title: "Messaging",
      description: "Monitor voice SMS delivery, scheduled messages, and communication analytics",
      icon: Volume2,
      route: "/reports/messaging",
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart className="h-4 w-4" />
          <span>Reporting Hub</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Access comprehensive reporting tools to monitor fieldwork activities and messaging campaigns across your regions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reportSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.route}
              className={`${section.color} hover:shadow-lg transition-all duration-200 cursor-pointer`}
              onClick={() => navigate(section.route)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-white ${section.iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription className="mt-3 text-base">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(section.route);
                  }}
                >
                  View {section.title} Reports
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reporting Features</CardTitle>
          <CardDescription>What you can do with our reporting tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">FieldWork Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor data capture activities, track contributor performance, and analyze regional coverage
                  patterns. Download CSV exports for deeper analysis.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Volume2 className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Messaging Insights</h4>
                <p className="text-sm text-muted-foreground">
                  View scheduled voice messages, listen to audio content, and track delivery success rates
                  with interactive charts and analytics.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
