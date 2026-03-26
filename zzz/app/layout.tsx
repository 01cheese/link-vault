import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    display: "swap",
})

export const metadata: Metadata = {
    title: "LinkVault",
    description: "Save and organize your links",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={montserrat.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
        </ThemeProvider>
        </body>
        </html>
    )
}
