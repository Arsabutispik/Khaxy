// tailwind.config.ts
import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"
import tailwindcssAnimate from "tailwindcss-animate" // ✅ FIX 1: Use import instead of require

const config: Config = {
    darkMode: "class",
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                // ✅ FIX 2: Add 'as string[]' to tell TypeScript the correct type
                sans: ["var(--font-sans)", ...(defaultTheme.fontFamily.sans)],
                mono: ["var(--font-mono)", ...(defaultTheme.fontFamily.mono)],
            },
            // ... (other shadcn/ui settings like colors, keyframes, etc.)
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [tailwindcssAnimate], // ✅ FIX 1: Use the imported module here
}

export default config