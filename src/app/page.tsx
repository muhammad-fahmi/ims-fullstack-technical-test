import LoanCalculator from '@/components/LoanCalculator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            IMS Finance
          </h1>
          <p className="text-lg text-gray-600">
            Kalkulator Simulasi Kredit Mobil Terbaik
          </p>
        </div>
        
        <LoanCalculator />
      </div>
    </main>
  );
}
