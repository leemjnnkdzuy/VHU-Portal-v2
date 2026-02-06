import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    getYearAndTermScore,
    getCommunityServices,
    type YearTermScoreData,
    type CommunityServiceItem,
} from '@/services/conductService';
import { useGlobalNotification } from '@/hooks/useGlobalNotification';
import {
    Loader2,
    Heart,
    Calendar,
    MapPin,
    Users,
    Star,
    Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function CommunityServicePage() {
    const [yearTermData, setYearTermData] = useState<YearTermScoreData | null>(null);
    const [services, setServices] = useState<CommunityServiceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [scoreFilter, setScoreFilter] = useState('all');
    const { showError } = useGlobalNotification();

    // Fetch year and term data
    useEffect(() => {
        const fetchYearTermData = async () => {
            try {
                const data = await getYearAndTermScore();
                setYearTermData(data);
                setSelectedYear(data.CurrentYear);
                setSelectedTerm(data.CurrentTerm);
            } catch (err) {
                console.error('Error:', err);
                showError('Không thể tải dữ liệu năm học');
            }
        };
        fetchYearTermData();
    }, [showError]);

    // Fetch services when year/term changes
    useEffect(() => {
        const fetchServices = async () => {
            if (!selectedYear || !selectedTerm) return;

            setIsLoading(true);
            try {
                const data = await getCommunityServices(selectedYear, selectedTerm);
                setServices(data?.result || []);
            } catch (err) {
                console.error('Error:', err);
                showError('Không thể tải dữ liệu hoạt động công tác xã hội');
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices();
    }, [selectedYear, selectedTerm, showError]);

    // Format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Format date range
    const formatDateRange = (fromDate: string, toDate: string) => {
        if (!fromDate || !toDate) return formatDate(fromDate || toDate);

        const from = new Date(fromDate);
        const to = new Date(toDate);

        if (from.toDateString() === to.toDateString()) {
            return `${from.toLocaleDateString('vi-VN')} (${from.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
            })} - ${to.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
            })})`;
        }

        return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
    };

    // Filter services
    const filteredServices = services.filter((service) => {
        const matchesSearch = service.Details.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesScore = scoreFilter === 'all' || Number(service.MarkConverted) === Number(scoreFilter);
        return matchesSearch && matchesScore;
    });

    // Get unique scores for filter
    const uniqueScores = [...new Set(services.map((s) => s.MarkConverted))].sort((a, b) => a - b);

    // Calculate total score
    const totalScore = filteredServices.reduce((sum, s) => sum + (Number(s.MarkConverted) || 0), 0);

    if (!yearTermData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Hoạt động công tác xã hội
                </h1>
                <p className="text-sm text-muted-foreground">
                    Xem các hoạt động tình nguyện và công tác xã hội
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Năm học
                    </label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Chọn năm học" />
                        </SelectTrigger>
                        <SelectContent>
                            {yearTermData.YearStudy.map((year) => (
                                <SelectItem key={year} value={year}>
                                    Năm học {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Học kỳ
                    </label>
                    <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Chọn học kỳ" />
                        </SelectTrigger>
                        <SelectContent>
                            {yearTermData.Terms.map((term) => (
                                <SelectItem key={term.TermID} value={term.TermID}>
                                    {term.TermName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Search and Score Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm hoạt động..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Lọc điểm" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả điểm</SelectItem>
                        {uniqueScores.map((score) => (
                            <SelectItem key={score} value={String(score)}>
                                {score} điểm
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Card */}
            {filteredServices.length > 0 && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500/10 to-rose-500/10">
                    <CardContent className="py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="p-3 rounded-full bg-pink-500/20 shrink-0">
                                    <Heart className="w-6 h-6 text-pink-600" />
                                </div>
                                <div className="flex-1 sm:flex-initial">
                                    <p className="text-sm text-muted-foreground">
                                        Tổng số hoạt động đã tham gia
                                    </p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {filteredServices.length} hoạt động
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:block w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 sm:text-right">
                                <p className="text-sm text-muted-foreground">Tổng điểm CTXH</p>
                                <p className="text-3xl font-bold text-pink-600">{totalScore}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Services List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filteredServices.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {searchQuery || scoreFilter !== 'all'
                                    ? 'Không tìm thấy hoạt động phù hợp'
                                    : 'Chưa có hoạt động công tác xã hội trong học kỳ này'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredServices.map((service) => (
                        <Card key={service.ActivityID} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex md:items-start gap-4">
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-3 mb-3">
                                            <h3 className="font-semibold text-foreground text-sm md:text-base leading-snug">
                                                {service.Details}
                                            </h3>
                                            <Badge className={cn(
                                                "md:hidden shrink-0 flex items-center gap-1 min-w-[3.5rem] justify-center py-1",
                                                service.MarkConverted >= 5 ? "bg-gradient-to-r from-yellow-400 to-amber-500" :
                                                    service.MarkConverted >= 4 ? "bg-gradient-to-r from-green-400 to-emerald-500" :
                                                        "bg-gradient-to-r from-blue-400 to-cyan-500"
                                            )}>
                                                <span className="text-sm font-bold">{service.MarkConverted}</span>
                                                <span className="text-[10px] opacity-80 font-normal">đ</span>
                                            </Badge>
                                        </div>

                                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 shrink-0 text-primary/70" />
                                                <span className="line-clamp-1">
                                                    {service.ExcutionTime
                                                        ? formatDateRange(service.FromTime, service.ToTime)
                                                        : formatDate(service.FromTime)}
                                                </span>
                                            </div>
                                            {service.Location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 shrink-0 text-primary/70" />
                                                    <span className="line-clamp-1">{service.Location}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 shrink-0 text-primary/70" />
                                                <span>{service.NumRegisted} lượt tham gia</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Score */}
                                    <div className="hidden md:flex flex-col items-center gap-1 shrink-0 min-w-[80px]">
                                        <Badge className={cn(
                                            "text-lg px-4 py-2 gap-1",
                                            service.MarkConverted >= 5 ? "bg-gradient-to-r from-yellow-400 to-amber-500" :
                                                service.MarkConverted >= 4 ? "bg-gradient-to-r from-green-400 to-emerald-500" :
                                                    "bg-gradient-to-r from-blue-400 to-cyan-500"
                                        )}>
                                            <Star className="w-4 h-4" />
                                            {service.MarkConverted}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">điểm</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CommunityServicePage;
