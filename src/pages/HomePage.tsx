import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '@/assets';
import { Button } from '@/components/ui/button';
import { getNewsGroups, getNewsItems } from '@/services/newsService';
import type { NewsGroup, NewsItem } from '@/services/newsService';
import {
    ChevronLeft, ChevronRight, Moon, Sun,
    Calendar, GraduationCap, Globe,
    MapPin, Phone, Mail, Facebook, Youtube,
    User, School, FileEdit, Award, Laptop, Users, FileBadge
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';


const ITEMS_PER_PAGE = 6;

function HomePage() {
    const navigate = useNavigate();
    const [newsGroups, setNewsGroups] = useState<NewsGroup[]>([]);
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<number>(1018);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const { theme, setTheme } = useTheme();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchNewsGroups = async () => {
            try {
                const data = await getNewsGroups();
                setNewsGroups(data);
            } catch (error) {
                console.error('Error fetching news groups:', error);
            }
        };
        fetchNewsGroups();
    }, []);

    useEffect(() => {
        const fetchNewsItems = async () => {
            setIsLoading(true);
            try {
                const data = await getNewsItems(selectedGroup);
                setNewsItems(data);
                setCurrentPage(1);
            } catch (error) {
                console.error('Error fetching news items:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNewsItems();
    }, [selectedGroup]);

    const totalPages = Math.ceil(newsItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = newsItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className="min-h-screen w-full">
            {/* Theme Toggle Button - Fixed Position */}
            <div className="fixed top-4 right-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-background/80 backdrop-blur-sm shadow-md border-primary/20 hover:bg-accent"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>

            {/* Section 1 - Hero */}
            <section className="relative min-h-screen flex bg-gradient-to-br from-primary via-primary/95 to-primary/80 overflow-hidden dark:from-background dark:via-background/90 dark:to-primary/20">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] md:w-[1000px] md:h-[1000px] lg:w-[1200px] lg:h-[1200px]">
                    <img
                        src={assets.trongDong}
                        alt="Trống Đồng"
                        className="w-full h-full object-contain opacity-20 animate-[spin_60s_linear_infinite]"
                        style={{
                            mixBlendMode: 'multiply',
                        }}
                    />
                </div>

                <div className="relative z-10 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 max-w-2xl">
                    <div className="mb-8">
                        <img
                            src={assets.imageLogo}
                            alt="VHU Logo"
                            className="w-20 h-20 md:w-24 md:h-24 object-contain"
                        />
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight dark:text-foreground">
                        VHU Portal
                    </h1>

                    <p className="text-lg md:text-xl text-white/80 mb-10 max-w-md dark:text-muted-foreground">
                        Cổng thông tin sinh viên Trường Đại học Văn Hiến
                    </p>

                    <div className="flex justify-start">
                        <Button
                            size="lg"
                            className="bg-white text-primary hover:bg-white/90 px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                            onClick={() => navigate(isAuthenticated ? '/student' : '/login')}
                        >
                            {isAuthenticated ? 'Quản lý thông tin' : 'Đăng nhập'}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Section 2 - Notifications */}
            <section className="min-h-screen flex flex-col justify-center py-16 px-4 md:px-8 lg:px-16 bg-background">
                <div className="max-w-7xl mx-auto w-full">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                        Thông báo
                    </h2>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar - News Groups */}
                        <div className="lg:w-64 shrink-0">
                            <div className="bg-card rounded-2xl border border-border p-4 sticky top-4">
                                <h3 className="font-semibold text-card-foreground mb-4 text-sm uppercase tracking-wider">
                                    Nhóm tin
                                </h3>
                                <ul className="space-y-1">
                                    {newsGroups.map((group) => (
                                        <li key={group.MaNhomTin}>
                                            <button
                                                onClick={() => setSelectedGroup(group.MaNhomTin)}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${selectedGroup === group.MaNhomTin
                                                    ? 'bg-primary text-primary-foreground font-medium'
                                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                                    }`}
                                            >
                                                {group.TenNhomTin}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Content - News List */}
                        <div className="flex-1">
                            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-border">
                                    <h3 className="font-semibold text-card-foreground">
                                        {newsGroups.find((g) => g.MaNhomTin === selectedGroup)?.TenNhomTin || 'Tin tức'}
                                    </h3>
                                    {totalPages > 1 && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft size={16} />
                                            </Button>
                                            <span className="text-sm text-muted-foreground px-2">
                                                {currentPage} / {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                <ChevronRight size={16} />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* News Items */}
                                <div className="divide-y divide-border">
                                    {isLoading ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            Đang tải...
                                        </div>
                                    ) : paginatedItems.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            Không có thông báo
                                        </div>
                                    ) : (
                                        paginatedItems.map((item) => (
                                            <div
                                                key={item.MaTin}
                                                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                                            >
                                                <h4 className="font-medium text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                    {item.TieuDe}
                                                </h4>
                                                <span className="text-sm text-muted-foreground mt-2 block">
                                                    {formatDate(item.CreateDate)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3 - Features */}
            <section className="min-h-screen flex flex-col justify-center py-16 px-4 md:px-8 lg:px-16">
                <div className="max-w-7xl mx-auto w-full">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                        Chức năng
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {[
                            { icon: GraduationCap, label: "Đại học chính quy", href: "https://vhu.edu.vn/", color: "text-blue-500", external: true },
                            { icon: User, label: "Đại học 2 giai đoạn", href: "https://dh2giaidoan.vhu.edu.vn/", color: "text-emerald-500", external: true },
                            { icon: School, label: "Sau đại học", href: "https://sdh.vhu.edu.vn/", color: "text-orange-500", external: true },
                            { icon: Calendar, label: "Lịch thi", href: "https://ttktdbcl.vhu.edu.vn/vi/lich-thi-1804", color: "text-purple-500", external: true },
                            { icon: FileEdit, label: "Đăng ký học phần", href: "https://regist.vhu.edu.vn/", color: "text-cyan-500", external: true },
                            { icon: Globe, label: "Cổng thông tin điện tử", href: "https://online.vhu.edu.vn/app/procedure", color: "text-pink-500", external: true },
                            { icon: Award, label: "Thông tin học bổng", href: "https://ts.vhu.edu.vn/chinh-sach-hoc-bong/", color: "text-indigo-500", external: true },
                            { icon: Laptop, label: "E-learning", href: "https://elearning.vhu.edu.vn/", color: "text-red-500", external: true },
                            { icon: Users, label: "Hoạt động Đoàn - Hội", href: "https://doanhoi.vhu.edu.vn/", color: "text-teal-500", external: true },
                            { icon: FileBadge, label: "Tra cứu văn bằng", href: "/degree-lookup", color: "text-yellow-500", external: false },
                        ].map((item, index) => (
                            <div
                                key={index}
                                onClick={() => window.open(item.href, item.external ? "_blank" : "_self")}
                                className="bg-card hover:bg-card/80 border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group"
                            >
                                <div className={`p-4 rounded-full bg-background mb-4 group-hover:scale-110 transition-transform duration-300 ${item.color}`}>
                                    <item.icon size={32} />
                                </div>
                                <span className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-card border-t border-border mt-auto">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <img src={assets.imageLogo} alt="VHU Logo" className="h-16 w-auto object-contain" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-xl text-foreground uppercase">Trường Đại học Văn Hiến</span>
                                    <span className="text-md text-primary font-medium">Thành Nhân - Thành Danh</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-lg text-foreground mb-4">Liên hệ</h3>
                                <div className="space-y-4 text-sm text-muted-foreground">
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-1">Trụ sở chính:</h4>
                                        <div className="flex items-start gap-2">
                                            <MapPin size={16} className="mt-1 shrink-0 text-primary" />
                                            <span>HungHau House: 613 Âu Cơ, Phường Phú Trung, Quận Tân Phú, TP.HCM</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-foreground mb-1">Các cơ sở đào tạo:</h4>
                                        <ul className="space-y-2 ml-6 list-disc">
                                            <li>Harmony Campus: 624 Âu Cơ, Phường 10, Quận Tân Bình, TP. HCM</li>
                                            <li>HungHau Campus: Đại lộ Nguyễn Văn Linh, Khu đô thị Nam Thành phố</li>
                                            <li>myU Campus: 665 - 667 - 669 Điện Biên Phủ, Phường 1, Quận 3, TP. HCM</li>
                                            <li>Số 8 - 14 Nguyễn Bá Tuyển, Phường 12, Quận Tân Bình, TP. HCM</li>
                                            <li>2A2 Quốc lộ 1A, Phường Thạnh Xuân, Quận 12, TP.HCM</li>
                                        </ul>
                                    </div>

                                    <div className="pt-2 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-primary" />
                                            <span>Hotline: 1800 1568</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-primary" />
                                            <span>Email: info@vhu.edu.vn</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-foreground mb-4">Liên kết nhanh</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                {['Trang chủ', 'Giới thiệu', 'Tin tức', 'Liên hệ'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="hover:text-primary transition-colors hover:underline">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Social Links */}
                        <div>
                            <h3 className="font-bold text-lg text-foreground mb-4">Kết nối với chúng tôi</h3>
                            <div className="flex gap-4">
                                {[
                                    { icon: Facebook, href: "https://www.facebook.com/vhu.edu.vn" },
                                    { icon: Youtube, href: "https://www.youtube.com/@VhuEduVn-daihocvanhien" }
                                ].map((item, index) => (
                                    <a
                                        key={index}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-full bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all hover:scale-110"
                                    >
                                        <item.icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
                        <p>© {new Date().getFullYear()} Trường Đại học Văn Hiến. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;
