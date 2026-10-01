export default function DashboardLoading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#f6f6f4] px-4"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-center text-lg font-semibold text-umhc-green">
        Redirecting you to authentication...
      </p>
    </main>
  );
}