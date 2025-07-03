'use client';

import TextButton from './components/TextButton';
import Button from './components/Button';

export default function Home() {
  return (
    <div className="bg-whellow min-h-screen flex items-center justify-center">
      <main className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-deep-black">
          UMHC Home Page
        </h1>
        
        <div className="space-y-4">
          <Button onClick={() => alert('Button clicked!')}>
            Become a Member
          </Button>
          
          <Button variant="secondary" onClick={() => alert('Secondary clicked!')}>
            View Schedule
          </Button>
          
          <div className="flex gap-4 justify-center">
            <Button size="small">Small Button</Button>
            <Button size="large">Large Button</Button>
          </div>
          
          <Button fullWidth onClick={() => alert('Full width!')}>
            Full Width Button
          </Button>
        </div>
      </main>
    </div>
  );
}
