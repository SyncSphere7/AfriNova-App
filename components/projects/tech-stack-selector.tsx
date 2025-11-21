'use client';

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { TechStack } from '@/types';

interface TechStackSelectorProps {
  techStack: TechStack;
  onChange: (techStack: TechStack) => void;
}

export function TechStackSelector({ techStack, onChange }: TechStackSelectorProps) {
  const handleRadioChange = (category: keyof TechStack, value: string) => {
    onChange({ ...techStack, [category]: value });
  };

  const handleCheckboxChange = (category: 'payments' | 'integrations', value: string) => {
    const currentArray = (techStack[category] || []) as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    onChange({ ...techStack, [category]: newArray });
  };

  return (
    <div className="space-y-8">
      <div>
        <Label className="font-pixel text-sm uppercase mb-4 block">Frontend</Label>
        <div className="space-y-2">
          {['React', 'Vue', 'Angular', 'Svelte', 'React Native (Expo)', 'React Native (CLI)', 'Flutter', 'Ionic'].map((option) => (
            <div key={option} className="flex items-center">
              <input
                type="radio"
                id={`frontend-${option}`}
                name="frontend"
                value={option}
                checked={techStack.frontend === option}
                onChange={(e) => handleRadioChange('frontend', e.target.value)}
                className="h-4 w-4 border-2 border-foreground"
              />
              <label htmlFor={`frontend-${option}`} className="ml-2 text-sm font-sans">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="font-pixel text-sm uppercase mb-4 block">Backend</Label>
        <div className="space-y-2">
          {['Node.js (Express)', 'Python (FastAPI)', 'Go', 'Rust'].map((option) => (
            <div key={option} className="flex items-center">
              <input
                type="radio"
                id={`backend-${option}`}
                name="backend"
                value={option}
                checked={techStack.backend === option}
                onChange={(e) => handleRadioChange('backend', e.target.value)}
                className="h-4 w-4 border-2 border-foreground"
              />
              <label htmlFor={`backend-${option}`} className="ml-2 text-sm font-sans">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="font-pixel text-sm uppercase mb-4 block">Database</Label>
        <div className="space-y-2">
          {['PostgreSQL', 'MySQL', 'MongoDB', 'Supabase'].map((option) => (
            <div key={option} className="flex items-center">
              <input
                type="radio"
                id={`database-${option}`}
                name="database"
                value={option}
                checked={techStack.database === option}
                onChange={(e) => handleRadioChange('database', e.target.value)}
                className="h-4 w-4 border-2 border-foreground"
              />
              <label htmlFor={`database-${option}`} className="ml-2 text-sm font-sans">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="font-pixel text-sm uppercase mb-4 block">Styling</Label>
        <div className="space-y-2">
          {['Tailwind CSS', 'Styled Components', 'Sass', 'CSS Modules'].map((option) => (
            <div key={option} className="flex items-center">
              <input
                type="radio"
                id={`styling-${option}`}
                name="styling"
                value={option}
                checked={techStack.styling === option}
                onChange={(e) => handleRadioChange('styling', e.target.value)}
                className="h-4 w-4 border-2 border-foreground"
              />
              <label htmlFor={`styling-${option}`} className="ml-2 text-sm font-sans">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="font-pixel text-sm uppercase mb-4 block">Payment Gateways (Select Multiple)</Label>
        <div className="space-y-2">
          {['Pesapal', 'PayPal', 'Stripe'].map((option) => (
            <div key={option} className="flex items-center">
              <Checkbox
                id={`payment-${option}`}
                checked={((techStack.payments || []) as string[]).includes(option)}
                onCheckedChange={() => handleCheckboxChange('payments', option)}
              />
              <label htmlFor={`payment-${option}`} className="ml-2 text-sm font-sans">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="font-pixel text-sm uppercase mb-4 block">Integrations (Select Multiple)</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Google Analytics',
            'Stripe Payments',
            'SendGrid Email',
            'Twilio SMS',
            'AWS S3',
            'Cloudinary',
          ].map((option) => (
            <div key={option} className="flex items-center">
              <Checkbox
                id={`integration-${option}`}
                checked={((techStack.integrations || []) as string[]).includes(option)}
                onCheckedChange={() => handleCheckboxChange('integrations', option)}
              />
              <label htmlFor={`integration-${option}`} className="ml-2 text-sm font-sans">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
