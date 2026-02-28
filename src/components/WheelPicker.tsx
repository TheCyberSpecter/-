import React from 'react';

export function WheelPicker({
  value,
  onChange,
  max,
  label,
}: {
  value: number;
  onChange: (val: number) => void;
  max: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="appearance-none w-24 py-3 px-4 text-center text-xl font-medium bg-transparent focus:outline-none"
        >
          {Array.from({ length: max + 1 }).map((_, i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <span className="text-gray-600 font-medium">{label}</span>
    </div>
  );
}
