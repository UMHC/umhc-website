export default function QRLoading() {
  return (
    <div className="min-h-screen bg-whellow flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-umhc-green mx-auto mb-4"></div>
        <p className="text-slate-grey font-sans">Redirecting to WhatsApp group...</p>
      </div>
    </div>
  );
}