/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Montserrat", "sans-serif"],
            },
            colors: {
                // primary: "#fb7e50",
                primary: "#FF8D47",
                text: "#35485c",
            },
            container: {
                center: true,
                screens: {
                    xs: "475px",
                    sm: "600px",
                    md: "728px",
                    lg: "984px",
                    xl: "1240px",
                },
            },
        },
    },
    plugins: [
        require('tailwind-scrollbar-hide'),
    ],
};
