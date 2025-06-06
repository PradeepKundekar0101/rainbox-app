import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
// import { Geist } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { OnboardingProvider } from "@/context/onboardingContext";
import { AuthProvider } from "@/context/authContext";
import { MailsProvider } from "@/context/mailsContext";
import { FoldersProvider } from "@/context/foldersContext";
import { SendersProvider } from "@/context/sendersContext";
import { SidebarProvider } from "@/context/sidebarContext";
import { ModeProvider } from "@/context/modeContext";
import Notification from "@/components/notifications/Notification";
import { GmailProvider } from "@/context/gmailContext";
import { SidebarLayoutProvider } from "@/context/sidebarLayoutContext";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Rainbox",
  description: "The fastest way to build apps with Next.js and Supabase",
  favicon: "/favicon.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Notification />
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col items-center">
              <FoldersProvider>
                <SendersProvider>
                  <MailsProvider>
                    <SidebarLayoutProvider>
                      <GmailProvider>
                        <AuthProvider>
                          <OnboardingProvider>
                            <SidebarProvider>
                              <ModeProvider>{children}</ModeProvider>
                            </SidebarProvider>
                          </OnboardingProvider>
                        </AuthProvider>
                      </GmailProvider>
                    </SidebarLayoutProvider>
                  </MailsProvider>
                </SendersProvider>
              </FoldersProvider>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
