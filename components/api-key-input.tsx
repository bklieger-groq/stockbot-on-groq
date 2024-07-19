import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';

export function ApiKeyInput() {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="mx-auto w-full">
      <div className="space-y-1">
    <div className="flex justify-between items-center">
      <Label htmlFor="apiKey">Enter your Groq API Key:</Label>
      <Label htmlFor="apiKey">
        <a 
          href="https://console.groq.com/keys" 
          className="text-[#F55036] text-xs hover:underline"
        >
          Get a Groq API Key
        </a>
      </Label>
    </div>
        <div className="flex space-x-2">
          <Input
            id="apiKey"
            type={isVisible ? 'text' : 'password'}
            placeholder="gsk_yA..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-grow"
          />
          <Button variant="outline" size="icon" onClick={toggleVisibility}>
            {isVisible ? (
              <EyeNoneIcon className="h-4 w-4" />
            ) : (
              <EyeOpenIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}