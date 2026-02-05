import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    getOpenScholarships,
    getRegisteredScholarships,
    registerScholarship,
    type Scholarship,
} from '@/services/scholarshipService';
import { getYearAndTermScore, type YearTermScoreData } from '@/services/conductService';
import { useGlobalNotification } from '@/hooks/useGlobalNotification';
import {
    Loader2,
    Gift,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Award,
    GraduationCap,
} from 'lucide-react';

function ScholarshipPage() {
    const [yearTermData, setYearTermData] = useState<YearTermScoreData | null>(null);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [openScholarships, setOpenScholarships] = useState<Scholarship[]>([]);
    const [registeredScholarships, setRegisteredScholarships] = useState<Scholarship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
    const { showSuccess, showError } = useGlobalNotification();

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

    // Fetch scholarship data
    const fetchScholarshipData = async () => {
        if (!selectedYear || !selectedTerm) return;

        setIsLoading(true);
        try {
            const [openData, registeredData] = await Promise.all([
                getOpenScholarships(selectedYear, selectedTerm),
                getRegisteredScholarships(selectedYear, selectedTerm),
            ]);
            setOpenScholarships(openData);
            setRegisteredScholarships(registeredData);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchScholarshipData();
    }, [selectedYear, selectedTerm]);

    // Handle registration
    const handleRegister = async () => {
        if (!selectedScholarship) return;

        setIsRegistering(true);
        try {
            await registerScholarship(selectedScholarship.id);
            showSuccess(`Đăng ký học bổng "${selectedScholarship.name}" thành công!`);
            fetchScholarshipData(); // Refresh list
        } catch (err) {
            console.error('Error:', err);
            showError('Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setIsRegistering(false);
            setSelectedScholarship(null);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Học bổng sinh viên
                </h1>
                <p className="text-sm text-muted-foreground">
                    Quản lý học bổng đang mở và đã đăng ký
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

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/20">
                                <GraduationCap className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Tổng học bổng</p>
                                <p className="text-xl font-bold text-foreground">
                                    {openScholarships.length + registeredScholarships.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/20">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Đang mở</p>
                                <p className="text-xl font-bold text-orange-600">
                                    {openScholarships.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/5 to-green-500/10">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Đã đăng ký</p>
                                <p className="text-xl font-bold text-green-600">
                                    {registeredScholarships.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : openScholarships.length === 0 && registeredScholarships.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="py-12">
                        <div className="text-center">
                            <AlertTriangle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                Bạn không thuộc đối tượng sinh viên nhận học bổng trong học kỳ này
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* Open Scholarships */}
                    {openScholarships.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-500" />
                                Học bổng đang mở ({openScholarships.length})
                            </h2>
                            <div className="grid gap-4">
                                {openScholarships.map((scholarship, index) => (
                                    <Card key={scholarship.id || index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg bg-orange-500/20">
                                                        <Gift className="w-5 h-5 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">
                                                            {scholarship.name || `Học bổng ${index + 1}`}
                                                        </h3>
                                                        {scholarship.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {scholarship.description}
                                                            </p>
                                                        )}
                                                        {scholarship.amount && (
                                                            <p className="text-sm font-medium text-primary mt-2">
                                                                <Award className="w-4 h-4 inline mr-1" />
                                                                {scholarship.amount.toLocaleString('vi-VN')} VNĐ
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 self-end md:self-start">
                                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
                                                        Đang mở
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setSelectedScholarship(scholarship)}
                                                    >
                                                        Đăng ký
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Registered Scholarships */}
                    {registeredScholarships.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Học bổng đã đăng ký ({registeredScholarships.length})
                            </h2>
                            <div className="grid gap-4">
                                {registeredScholarships.map((scholarship, index) => (
                                    <Card key={scholarship.id || index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg bg-green-500/20">
                                                        <Gift className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">
                                                            {scholarship.name || `Học bổng ${index + 1}`}
                                                        </h3>
                                                        {scholarship.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {scholarship.description}
                                                            </p>
                                                        )}
                                                        {scholarship.amount && (
                                                            <p className="text-sm font-medium text-primary mt-2">
                                                                <Award className="w-4 h-4 inline mr-1" />
                                                                {scholarship.amount.toLocaleString('vi-VN')} VNĐ
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <Badge className="bg-green-500/20 text-green-600 border-green-500/30 shrink-0">
                                                    Đã đăng ký
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Confirm Registration Dialog */}
            <AlertDialog open={!!selectedScholarship} onOpenChange={(open: boolean) => !open && !isRegistering && setSelectedScholarship(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận đăng ký học bổng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn đăng ký học bổng <span className="font-medium text-foreground">{selectedScholarship?.name}</span> không?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRegistering}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={(e: React.MouseEvent) => { e.preventDefault(); handleRegister(); }} disabled={isRegistering}>
                            {isRegistering ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Đăng ký ngay"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default ScholarshipPage;
