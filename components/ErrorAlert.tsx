export default function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-800">{message}</p>
    </div>
  );
}
