// C:\Users\Admin\Desktop\sexp\app\components\SessionProvider.js
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export default function SessionProvider({ children }) {
    return (
        <NextAuthSessionProvider>
            {children}
        </NextAuthSessionProvider>
    );
}