// src/components/DateSeparator.jsx
export default function DateSeparator({ label }) {
  return (
    <div className="flex items-center my-4">
      <div className="flex-1 h-px bg-gray-700" />
      <span className="px-3 text-xs text-gray-400 font-medium">{label}</span>
      <div className="flex-1 h-px bg-gray-700" />
    </div>
  );
}