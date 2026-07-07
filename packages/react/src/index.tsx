import React, { useEffect } from 'react';
import { Client } from '@your-org/core';

export const CoreContext = React.createContext<Client | null>(null);

export const CoreProvider: React.FC<{ client: Client, children: React.ReactNode }> = ({ client, children }) => {
  return <CoreContext.Provider value={client}>{children}</CoreContext.Provider>;
};

export function useClient() {
  const context = React.useContext(CoreContext);
  if (!context) {
    throw new Error('useClient must be used within CoreProvider');
  }
  return context;
}

export function useSocketEvent(event: string, callback: (data: any) => void) {
  const client = useClient();
  
  useEffect(() => {
    // Ensure socket is connected
    client.connectSocket();
    
    // Subscribe to event
    const unsubscribe = client.on(event, callback);
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [client, event, callback]);
}
