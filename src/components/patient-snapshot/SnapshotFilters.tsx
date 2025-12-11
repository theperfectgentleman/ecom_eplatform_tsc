import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface SnapshotFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  ancStatusFilter: string;
  onAncStatusFilterChange: (value: string) => void;
  autoOverdue: boolean;
  onAutoOverdueChange: (checked: boolean) => void;
  onClearFilters: () => void;
  totalPatients: number;
  filteredPatients: number;
}

const SnapshotFilters: React.FC<SnapshotFiltersProps> = ({
  searchTerm,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  ancStatusFilter,
  onAncStatusFilterChange,
  autoOverdue,
  onAutoOverdueChange,
  onClearFilters,
  totalPatients,
  filteredPatients
}) => {
  const hasActiveFilters = searchTerm || priorityFilter !== 'all' || ancStatusFilter !== 'all';

  const priorityOptions = [
    { value: 'all', label: 'All Priorities', icon: null },
    { value: 'overdue', label: 'Overdue', icon: <AlertTriangle className="h-4 w-4" /> },
    { value: 'due_soon', label: 'Due Soon', icon: <Clock className="h-4 w-4" /> },
    { value: 'on_track', label: 'On Track', icon: <CheckCircle className="h-4 w-4" /> }
  ];

  const ancStatusOptions = [
    { value: 'all', label: 'All Patients' },
    { value: 'registered', label: 'ANC Registered' },
    { value: 'not_registered', label: 'Not Registered' }
  ];

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, ID, or phone number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Priority Filter */}
        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Priority Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* ANC Status Filter */}
        <Select value={ancStatusFilter} onValueChange={onAncStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="ANC Status" />
          </SelectTrigger>
          <SelectContent>
            {ancStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Auto Overdue Toggle */}
        <div className="flex items-center" title="Auto Overdue Filter">
          <Switch
            checked={autoOverdue}
            onCheckedChange={onAutoOverdueChange}
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={onClearFilters}
            className="whitespace-nowrap"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Summary and Active Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {hasActiveFilters ? (
            <span>
              Showing {filteredPatients} of {totalPatients} patients
            </span>
          ) : (
            <span>
              {totalPatients} patients total
            </span>
          )}
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: "{searchTerm}"
              </Badge>
            )}
            
            {priorityFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Priority: {priorityOptions.find(p => p.value === priorityFilter)?.label}
              </Badge>
            )}
            
            {ancStatusFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                ANC: {ancStatusOptions.find(a => a.value === ancStatusFilter)?.label}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SnapshotFilters;
