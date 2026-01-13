export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600">Loading plant data...</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function NoDataState() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="text-gray-400 text-5xl mb-4">📊</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        No Data Available
      </h3>
      <p className="text-gray-600">
        Waiting for ESP32 to send data...
      </p>
    </div>
  );
}
