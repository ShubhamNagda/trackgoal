import React from "react";

const ProgressBar = ({ label, completed, total, percent, color = "bg-primary-600" }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-700">{label}</h3>
        <span className="text-sm text-gray-500">
          {completed}/{total} done
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-right text-xs text-gray-500 mt-1">{percent}%</p>
    </div>
  );
};

export default ProgressBar;
