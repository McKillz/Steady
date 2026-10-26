import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-7xl font-light text-slate-300">404</h1>
        <h2 className="text-2xl font-medium text-slate-800">Page not found</h2>
        <p className="text-slate-600">That page doesn’t exist in Steady.</p>
        <Link
          to="/"
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
