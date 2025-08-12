import React from "react";

// Simple heatmap using a grid of divs. For real use, replace with a chart lib like visx or nivo.
// Props: data = array of { day: string, hours: number[] } where hours[i] is intensity for hour i
// hoursLabels = array of hour labels (e.g. ["6am", "7am", ...])
export function HeatMapChart({ data, hoursLabels, title, description }: {
  data: { day: string, hours: number[] }[];
  hoursLabels: string[];
  title?: string;
  description?: string;
}) {
  // Find max value for color scaling
  const max = Math.max(...data.flatMap(d => d.hours));
  return (
    <div className="p-4">
      {title && <div className="font-bold text-lg mb-1">{title}</div>}
      {description && <div className="text-sm text-muted-foreground mb-2">{description}</div>}
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="text-xs text-left pr-2 py-1"></th>
              {hoursLabels.map((h, i) => (
                <th key={i} className="text-xs font-normal px-1 py-1 text-center text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.day}>
                <td className="text-xs pr-2 py-1 text-gray-600 font-medium">{row.day}</td>
                {row.hours.map((val, j) => {
                  // Color: interpolate from light gray to blue
                  const percent = max ? val / max : 0;
                  const bg = `rgba(37, 99, 235, ${0.1 + percent * 0.7})`;
                  return (
                    <td
                      key={j}
                      className="w-6 h-6 text-center text-xs rounded transition-colors"
                      style={{ background: bg }}
                      title={`Bookings: ${val}`}
                    >
                      {val > 0 ? val : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
