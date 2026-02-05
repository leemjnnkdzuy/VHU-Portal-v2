import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStudentEquivalentCourses, type EquivalentCourse } from '@/services/academicService';
import {
    Loader2,
    AlertCircle,
    ArrowLeftRight,
    Library,
    BookOpen,
} from 'lucide-react';

function CourseEquivalencyPage() {
    const [equivalencyData, setEquivalencyData] = useState<EquivalentCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getStudentEquivalentCourses();
                const sortedData = [...data].sort((a, b) => a.STT - b.STT);
                setEquivalencyData(sortedData);
            } catch (err) {
                console.error('Error:', err);
                setError('Không thể tải dữ liệu môn học tương đương');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full border-destructive/50">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                            <p className="text-destructive">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Học phần tương đương
                </h1>
                <p className="text-sm text-muted-foreground">
                    Danh sách các học phần tương đương trong chương trình đào tạo
                </p>
            </div>

            {/* Summary Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/20">
                            <Library className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-primary-foreground/70 text-xs">Tổng số học phần tương đương</p>
                            <p className="text-2xl font-bold">{equivalencyData.length}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Equivalency Table */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5 text-primary" />
                        Danh sách học phần tương đương
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {equivalencyData.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">Không có dữ liệu học phần tương đương</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground w-16">STT</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground" colSpan={2}>
                                                Học phần gốc
                                            </th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground w-16"></th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground" colSpan={2}>
                                                Học phần tương đương
                                            </th>
                                        </tr>
                                        <tr className="border-b border-border/50">
                                            <th></th>
                                            <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Mã HP</th>
                                            <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Tên học phần</th>
                                            <th></th>
                                            <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Mã HP</th>
                                            <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Tên học phần</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {equivalencyData.map((item) => (
                                            <tr
                                                key={item.STT}
                                                className="border-b border-border/50 transition-colors hover:bg-muted/50"
                                            >
                                                <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                                                    {item.STT}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge variant="outline" className="font-mono">
                                                        {item.MaMon}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {item.TenMon}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <ArrowLeftRight className="w-5 h-5 text-primary" />
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge variant="outline" className="font-mono bg-primary/5 border-primary/30">
                                                        {item.MaMonTuongDuong}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {item.TenMonTuongDuong}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4">
                                {equivalencyData.map((item) => (
                                    <div
                                        key={item.STT}
                                        className="p-4 rounded-xl border border-border bg-card"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-xs text-muted-foreground">#{item.STT}</span>
                                        </div>

                                        {/* Original Course */}
                                        <div className="p-3 rounded-lg bg-muted/50 mb-3">
                                            <p className="text-xs text-muted-foreground mb-1">Học phần gốc</p>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {item.MaMon}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                {item.TenMon}
                                            </p>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex items-center justify-center my-2">
                                            <div className="p-2 rounded-full bg-primary/10">
                                                <ArrowLeftRight className="w-4 h-4 text-primary" />
                                            </div>
                                        </div>

                                        {/* Equivalent Course */}
                                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                                            <p className="text-xs text-muted-foreground mb-1">Học phần tương đương</p>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="font-mono text-xs bg-primary/10 border-primary/30">
                                                    {item.MaMonTuongDuong}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                {item.TenMonTuongDuong}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default CourseEquivalencyPage;
