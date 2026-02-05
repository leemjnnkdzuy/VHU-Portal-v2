import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    getYearAndTermScore,
    getBehaviorScore,
    type YearTermScoreData,
    type BehaviorData,
    type BehaviorDetailItem,
} from '@/services/conductService';
import { useGlobalNotification } from '@/hooks/useGlobalNotification';
import {
    Loader2,
    ClipboardCheck,
    Award,
    ChevronRight,
    Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Group behavior items by group
interface BehaviorGroup {
    name: string;
    maxScore: number;
    items: BehaviorDetailItem[];
    totalScore: number;
}

function ConductAssessmentPage() {
    const [yearTermData, setYearTermData] = useState<YearTermScoreData | null>(null);
    const [behaviorData, setBehaviorData] = useState<BehaviorData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const { showError } = useGlobalNotification();
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

    // Fetch behavior data when year/term changes
    useEffect(() => {
        const fetchBehaviorData = async () => {
            if (!selectedYear || !selectedTerm) return;

            setIsLoading(true);
            try {
                const data = await getBehaviorScore(selectedYear, selectedTerm);
                setBehaviorData(data);
            } catch (err) {
                console.error('Error:', err);
                showError('Không thể tải dữ liệu đánh giá điểm rèn luyện');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBehaviorData();
    }, [selectedYear, selectedTerm, showError]);

    // Group behavior items by BehaviorGroupID
    const getGroupedData = (): Record<string, BehaviorGroup> => {
        if (!behaviorData?.ResultDataBangDanhGia) return {};

        return behaviorData.ResultDataBangDanhGia.reduce((acc, item) => {
            if (!acc[item.BehaviorGroupID]) {
                acc[item.BehaviorGroupID] = {
                    name: item.BehaviorGroupName,
                    maxScore: item.MaxScoreGroup,
                    items: [],
                    totalScore: 0,
                };
            }
            acc[item.BehaviorGroupID].items.push(item);
            acc[item.BehaviorGroupID].totalScore += Number(item.DiemCuoiSV) || 0;
            return acc;
        }, {} as Record<string, BehaviorGroup>);
    };

    const scrollToSection = (groupId: string) => {
        sectionRefs.current[groupId]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    const getRankColor = (rank: string) => {
        switch (rank) {
            case 'Xuất sắc':
                return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
            case 'Tốt':
                return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white';
            case 'Khá':
                return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white';
            case 'Trung bình':
                return 'bg-gradient-to-r from-gray-400 to-slate-500 text-white';
            case 'Yếu':
                return 'bg-gradient-to-r from-orange-400 to-red-500 text-white';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

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

    const groupedData = getGroupedData();
    const finalResult = behaviorData?.KetQuaDanhGia?.[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Đánh giá điểm rèn luyện
                </h1>
                <p className="text-sm text-muted-foreground">
                    Xem chi tiết điểm rèn luyện theo từng học kỳ
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

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {/* Final Result Card */}
                    {finalResult && (
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Award className="h-5 w-5 text-primary" />
                                    Kết quả đánh giá
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Score breakdown - clickable to scroll */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                                    {Object.entries(groupedData).map(([groupId, group]) => (
                                        <button
                                            key={groupId}
                                            onClick={() => scrollToSection(groupId)}
                                            className="p-3 rounded-lg bg-background/80 hover:bg-background transition-colors text-left group"
                                        >
                                            <p className="text-xs text-muted-foreground truncate mb-1 group-hover:text-primary transition-colors">
                                                {group.name}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className={cn(
                                                    "font-bold text-lg",
                                                    group.totalScore > 0 ? "text-green-600" : group.totalScore < 0 ? "text-red-600" : "text-foreground"
                                                )}>
                                                    {group.totalScore}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Total Score */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-background">
                                    <div className="flex items-center gap-3">
                                        <Star className="w-8 h-8 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tổng điểm rèn luyện</p>
                                            <Badge className={cn('mt-1', getRankColor(finalResult.BehaviorScoreRank))}>
                                                {finalResult.BehaviorScoreRank}
                                            </Badge>
                                        </div>
                                    </div>
                                    <span className="text-4xl font-bold text-primary">
                                        {finalResult.Scores}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Score Groups */}
                    {Object.entries(groupedData).map(([groupId, group]) => (
                        <Card
                            key={groupId}
                            ref={(el) => { sectionRefs.current[groupId] = el; }}
                            id={`section-${groupId}`}
                            className="border-0 shadow-lg scroll-mt-4"
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <ClipboardCheck className="h-5 w-5 text-primary" />
                                        {group.name}
                                    </CardTitle>
                                    <Badge variant="outline" className="font-mono">
                                        Tối đa: {group.maxScore}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                                                    Nội dung đánh giá
                                                </th>
                                                <th className="text-center py-3 px-2 font-medium text-muted-foreground w-24">
                                                    Điểm tối đa
                                                </th>
                                                <th className="text-center py-3 px-2 font-medium text-muted-foreground w-32">
                                                    Điểm SV tự đánh giá
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.items.map((item) => (
                                                <tr key={item.BehaviorDetailID} className="border-b border-border/50 hover:bg-muted/30">
                                                    <td className="py-3 px-2 text-foreground">
                                                        {item.BehaviorDetailName}
                                                    </td>
                                                    <td className="py-3 px-2 text-center text-muted-foreground">
                                                        {item.MaxScore}
                                                    </td>
                                                    <td className="py-3 px-2 text-center">
                                                        <span className={cn(
                                                            "font-medium",
                                                            (item.DiemCuoiSV ?? 0) > 0 ? "text-green-600" :
                                                                (item.DiemCuoiSV ?? 0) < 0 ? "text-red-600" : "text-foreground"
                                                        )}>
                                                            {item.DiemCuoiSV ?? '-'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden space-y-3">
                                    {group.items.map((item) => (
                                        <div
                                            key={item.BehaviorDetailID}
                                            className="p-3 rounded-lg bg-muted/30"
                                        >
                                            <p className="text-sm text-foreground mb-2">
                                                {item.BehaviorDetailName}
                                            </p>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">
                                                    Tối đa: <span className="font-medium">{item.MaxScore}</span>
                                                </span>
                                                <span className={cn(
                                                    "font-semibold",
                                                    (item.DiemCuoiSV ?? 0) > 0 ? "text-green-600" :
                                                        (item.DiemCuoiSV ?? 0) < 0 ? "text-red-600" : "text-foreground"
                                                )}>
                                                    Điểm: {item.DiemCuoiSV ?? '-'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Group Total */}
                                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                                    <span className="font-medium text-muted-foreground">Tổng điểm nhóm:</span>
                                    <span className={cn(
                                        "text-xl font-bold",
                                        group.totalScore > 0 ? "text-green-600" :
                                            group.totalScore < 0 ? "text-red-600" : "text-foreground"
                                    )}>
                                        {group.totalScore}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Empty State */}
                    {Object.keys(groupedData).length === 0 && !isLoading && (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <ClipboardCheck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        Chưa có dữ liệu đánh giá điểm rèn luyện cho học kỳ này
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

export default ConductAssessmentPage;
