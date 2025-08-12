import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface TimeSlot {
  date: string;
  operatingHours?: {
    open: string;
    close: string;
  };
  isAvailable: boolean;
  reason?: string;
}

interface ApiResponse {
  courtId: string;
  venueName: string;
  status: string;
  maintenanceNotes?: string;
  availability: TimeSlot[];
  regularHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  blackoutDates: string[];
  overrides: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
}

export const useTimeSlots = (courtId?: string) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!courtId) return;

    const fetchTimeSlots = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/courts/${courtId}/time-slots`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch time slots: ${response.statusText}`
          );
        }
        const data = await response.json();
        setData(data);
      } catch (error: any) {
        setError(error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [courtId, toast]);

  const updateTimeSlots = async (updates: {
    operatingHours?: {
      [key: string]: {
        open: string;
        close: string;
      };
    };
    blackoutDates?: string[];
    availabilityOverrides?: {
      [key: string]: {
        open: string;
        close: string;
      };
    };
    status?: 'active' | 'maintenance' | 'inactive';
    maintenanceNotes?: string;
  }) => {
    if (!courtId) return;

    try {
      const response = await fetch(`/api/courts/${courtId}/time-slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courtId,
          slots: updates,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update time slots: ${response.statusText}`);
      }

      const updatedData = await response.json();
      setData(updatedData);

      toast({
        title: "Success",
        description: "Time slots updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const setOperatingHours = async (hours: {
    [key: string]: { open: string; close: string };
  }) => {
    return updateTimeSlots({ operatingHours: hours });
  };

  const setBlackoutDates = async (dates: string[]) => {
    return updateTimeSlots({ blackoutDates: dates });
  };

  const addOverride = async (date: string, hours: { open: string; close: string }) => {
    const currentOverrides = data?.overrides || {};
    return updateTimeSlots({
      availabilityOverrides: {
        ...currentOverrides,
        [date]: hours,
      },
    });
  };

  const setMaintenanceStatus = async (maintenanceNotes?: string) => {
    return updateTimeSlots({
      status: 'maintenance',
      maintenanceNotes,
    });
  };

  const setActiveStatus = async () => {
    return updateTimeSlots({ status: 'active' });
  };

  return {
    timeSlots: data,
    isLoading,
    error,
    setOperatingHours,
    setBlackoutDates,
    addOverride,
    setMaintenanceStatus,
    setActiveStatus,
  };
};
