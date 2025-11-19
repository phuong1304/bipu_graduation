import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Thiệp mời Lễ Tốt Nghiệp của Bipu',
    description: 'Trân trọng kính mời bạn đến tham dự lễ tốt nghiệp của Vũ Thị Bích Phương',
    openGraph: {
        title: 'Thiệp mời Lễ Tốt Nghiệp của Bipu',
        description: 'Trân trọng kính mời bạn đến tham dự lễ tốt nghiệp của Vũ Thị Bích Phương',
        images: [
            {
                url: '/assets/icon/login-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Bipu Graduation Invitation',
            },
        ],
        type: 'website',
    },
    icons: {
        icon: '/assets/icon/graduation-cap.svg',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <body>{children}</body>
        </html>
    );
}
