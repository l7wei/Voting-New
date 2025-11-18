import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backLink?: string;
  backText?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  backLink, 
  backText = '返回首頁',
  actions 
}: PageHeaderProps) {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            {actions}
            {backLink && (
              <Link
                href={backLink}
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                {backText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
