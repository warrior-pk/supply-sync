import ThemeSwitcher from './ThemeSwitcher';
import LogoutButton from '@/components/auth/LogoutButton';
import BrandName from './BrandName';

export function Header() {
    return (
        <header className="mx-auto mt-6 max-w-6xl rounded-lg border bg-card/50 backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between h-14 px-4">
                <BrandName size="default" />
                <div className="flex items-center gap-4">
                    <ThemeSwitcher />
                    <LogoutButton />
                </div>
            </div>
        </header>
    );
}