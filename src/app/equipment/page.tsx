import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UMHC | Equipment',
  description: 'Essential hiking equipment and gear recommendations for University of Manchester Hiking Club members.',
};

export default function EquipmentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Equipment</h1>
      <p className="text-lg">Equipment page coming soon...</p>
    </div>
  );
}