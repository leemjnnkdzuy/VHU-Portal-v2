import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    getYearAndTerm,
    getRetakeList,
    type YearTermData,
    type RetakeListData,
} from '@/services/retakeService';
import { useGlobalNotification } from '@/hooks/useGlobalNotification';
import {
    Loader2,
    CalendarCheck,
    BookOpen,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function RetakePage() {
    const [yearTermData, setYearTermData] = useState<YearTermData | null>(null);
    const [retakeData, setRetakeData] = useState<RetakeListData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const { showError } = useGlobalNotification();

    // Fetch year and term data
    useEffect(() => {
        const fetchYearTermData = async () => {
            try {
                const data = await getYearAndTerm();
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

    // Fetch retake data when year/term changes
    useEffect(() => {
        const fetchRetakeData = async () => {
            if (!selectedYear || !selectedTerm) return;

            setIsLoading(true);
            try {
                const data = await getRetakeList(selectedYear, selectedTerm);
                setRetakeData(data);
            } catch (err) {
                console.error('Error:', err);
                showError('Không thể tải dữ liệu đăng ký thi lại');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRetakeData();
    }, [selectedYear, selectedTerm, showError]);

    const getStatusConfig = (daDuyet: boolean) => {
        if (daDuyet) {
            return {
                color: 'bg-green-500/20 text-green-600 border-green-500/30',
                icon: CheckCircle2,
                text: 'Đã duyệt',
            };
        }
        return {
            color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
            icon: Clock,
            text: 'Chờ duyệt',
        };
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

    const totalRegistered = retakeData?.dtDSDK?.length || 0;
    const totalResults = retakeData?.dtDSKQ?.length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Đăng ký thi lại
                </h1>
                <p className="text-sm text-muted-foreground">
                    Xem danh sách đăng ký và kết quả thi lại
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Registered Count */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Đã đăng ký thi lại
                                </p>
                                <p className="text-4xl font-bold mt-1 text-foreground">
                                    {totalRegistered}
                                </p>
                                <p className="text-muted-foreground text-sm mt-1">
                                    môn học
                                </p>
                            </div>
                            <div className="p-4 bg-blue-500/20 rounded-full">
                                <CalendarCheck className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Count */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500/10 to-amber-500/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Kết quả thi lại
                                </p>
                                <p className="text-4xl font-bold mt-1 text-foreground">
                                    {totalResults}
                                </p>
                                <p className="text-muted-foreground text-sm mt-1">
                                    môn học
                                </p>
                            </div>
                            <div className="p-4 bg-orange-500/20 rounded-full">
                                <FileText className="w-8 h-8 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Registered List Section */}
            <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                    Danh sách đăng ký thi lại
                </h2>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : !retakeData?.dtDSDK || retakeData.dtDSDK.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="py-12">
                            <div className="text-center">
                                <CalendarCheck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Chưa có đăng ký thi lại trong học kỳ này
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Mã môn</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Tên môn học</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Mã lớp</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Ghi chú</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {retakeData.dtDSDK.map((item, index) => {
                                        const statusConfig = getStatusConfig(item.DaDuyet);
                                        const StatusIcon = statusConfig.icon;
                                        return (
                                            <tr
                                                key={`${item.CurriculumID}-${index}`}
                                                className="border-b border-border/50 transition-colors hover:bg-muted/50"
                                            >
                                                <td className="py-4 px-4 text-sm font-mono font-medium text-foreground">
                                                    {item.CurriculumID}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-foreground">
                                                    {item.CurriculumName}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground font-mono">
                                                    {item.ScheduleStudyUnitID}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground">
                                                    {item.Note || '—'}
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <Badge className={cn(
                                                        "inline-flex items-center gap-1.5",
                                                        statusConfig.color
                                                    )}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusConfig.text}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {retakeData.dtDSDK.map((item, index) => {
                                const statusConfig = getStatusConfig(item.DaDuyet);
                                const StatusIcon = statusConfig.icon;
                                return (
                                    <Card key={`${item.CurriculumID}-${index}`} className="border-0 shadow-lg">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {item.CurriculumName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground font-mono">
                                                        {item.CurriculumID}
                                                    </p>
                                                </div>
                                                <Badge className={cn(
                                                    "shrink-0 flex items-center gap-1",
                                                    statusConfig.color
                                                )}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusConfig.text}
                                                </Badge>
                                            </div>
                                            <div className="pt-3 border-t border-border/50 space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <BookOpen className="w-4 h-4 text-primary/70" />
                                                    <span className="text-muted-foreground">Mã lớp:</span>
                                                    <span className="font-mono">{item.ScheduleStudyUnitID}</span>
                                                </div>
                                                {item.Note && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <AlertCircle className="w-4 h-4 text-primary/70" />
                                                        <span className="text-muted-foreground">{item.Note}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Results List Section */}
            <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    Kết quả thi lại
                </h2>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : !retakeData?.dtDSKQ || retakeData.dtDSKQ.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="py-12">
                            <div className="text-center">
                                <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Chưa có kết quả thi lại trong học kỳ này
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Mã môn</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Tên môn học</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Mã lớp</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Ghi chú</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {retakeData.dtDSKQ.map((item, index) => {
                                        const statusConfig = getStatusConfig(item.DaDuyet);
                                        const StatusIcon = statusConfig.icon;
                                        return (
                                            <tr
                                                key={`result-${item.CurriculumID}-${index}`}
                                                className="border-b border-border/50 transition-colors hover:bg-muted/50"
                                            >
                                                <td className="py-4 px-4 text-sm font-mono font-medium text-foreground">
                                                    {item.CurriculumID}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-foreground">
                                                    {item.CurriculumName}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground font-mono">
                                                    {item.ScheduleStudyUnitID}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground">
                                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
                                                        {item.Note || '—'}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <Badge className={cn(
                                                        "inline-flex items-center gap-1.5",
                                                        statusConfig.color
                                                    )}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusConfig.text}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {retakeData.dtDSKQ.map((item, index) => {
                                const statusConfig = getStatusConfig(item.DaDuyet);
                                const StatusIcon = statusConfig.icon;
                                return (
                                    <Card key={`result-${item.CurriculumID}-${index}`} className="border-0 shadow-lg">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {item.CurriculumName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground font-mono">
                                                        {item.CurriculumID}
                                                    </p>
                                                </div>
                                                <Badge className={cn(
                                                    "shrink-0 flex items-center gap-1",
                                                    statusConfig.color
                                                )}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusConfig.text}
                                                </Badge>
                                            </div>
                                            <div className="pt-3 border-t border-border/50 space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <BookOpen className="w-4 h-4 text-primary/70" />
                                                    <span className="text-muted-foreground">Mã lớp:</span>
                                                    <span className="font-mono">{item.ScheduleStudyUnitID}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
                                                        {item.Note}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default RetakePage;
