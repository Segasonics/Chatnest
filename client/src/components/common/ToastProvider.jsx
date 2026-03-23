import { Toaster } from 'react-hot-toast';

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#11172a',
            color: '#e6ebff',
            border: '1px solid rgba(120,140,255,.3)'
          }
        }}
      />
    </>
  );
}
