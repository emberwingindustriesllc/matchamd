
import * as React from 'react';
declare module '@/components/ui/*' {
  const Component: React.FC<any>;
  export = Component;
}


declare module '@/components/ui/*' {
  import * as React from 'react';
  const Component: React.FC<any>;
  export = Component;
}

